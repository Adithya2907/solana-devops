import type { Build } from '@prisma/client';

import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';

import { BuildStatus, BuildConclusion } from '@prisma/client';

// import AWS from 'aws-sdk';
import * as AWS from '@aws-sdk/client-s3';

import extract from 'extract-zip';

import app from '$lib/stores/app.server';
import db from '$lib/db/client';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_REPO_PATH } from '$env/static/public';

type BuildResult = {
    status: boolean;
    log: string;
};

function readStream(stream: stream.Readable): string {
    stream.pause();

    let chunk: string;
    let data = '';

    while ((chunk = stream.read()) !== null) {
        data += chunk;
    }

    stream.resume();

    return data;
}

export async function build(owner: string, repo: string, commit: string, installation: number, repoBuild: Build): Promise<BuildResult> {
    const outputStream = new stream.PassThrough({
        encoding: "utf-8",
    });

    const instance = await get(app).octokit?.getInstallationOctokit(installation);

    const buildResult: BuildResult = {
        status: false,
        log: ""
    };

    outputStream.push("Starting download\n");

    const result = await instance?.rest.repos.downloadZipballArchive({
        owner,
        repo,
        ref: commit
    });

    outputStream.push("Finished download\n");

    const zipped = result?.data as ArrayBuffer;
    const download = path.parse(path.join(PUBLIC_REPO_PATH, "download.zip"));
    const name = path.join(PUBLIC_REPO_PATH, `${owner}-${repo}-${commit.substring(0, 7)}`);
    const extracted = path.join(PUBLIC_REPO_PATH, 'repo');
    const platform = path.resolve('src', 'lib', 'platform');

    fs.mkdirSync(download.dir, { recursive: true });
    fs.writeFileSync(path.format(download), Buffer.from(zipped));

    outputStream.push("Downloaded file to " + path.format(download));

    await extract(path.format(download), {
        dir: path.resolve(PUBLIC_REPO_PATH),
    });

    if (fs.existsSync(extracted))
        fs.rmSync(extracted, { recursive: true });
    fs.renameSync(name, extracted);

    outputStream.push("\nExtracted repo to " + extracted);

    process.env['_BUILD_REPO_PATH'] = path.resolve(PUBLIC_REPO_PATH);

    console.log(path.join(platform, 'version.sh'));
    const versions = childProcess.execSync(`. ${path.join(platform, "version.sh")}`).toString();

    outputStream.push("\n" + versions);

    process.env['_BUILD_RUST_VERSION'] = versions.split('Found rust version: ')[1].split('\n')[0].trim();
    process.env['_BUILD_ANCHOR_VERSION'] = versions.split('Found anchor version: ')[1].split('\n')[0].trim();

    outputStream.push(`found versions ${process.env['_BUILD_RUST_VERSION']} ${process.env['_BUILD_ANCHOR_VERSION']}`);

    console.log("Building repo using ", path.join(platform, "build.sh"));

    const buildProcess = childProcess.execSync(`. ${path.join(platform, 'build.sh')}`).toString("utf-8");
    outputStream.push("\n" + buildProcess);

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    const idls = fs.readdirSync(path.join(PUBLIC_REPO_PATH, "repo", "target", "idl"));
    const idlkeys: Array<string> = [];
    idls
        .map(idl =>
            path.join(PUBLIC_REPO_PATH, "repo", "target", "idl", idl))
        .forEach(async (idl) => {
            try {
                const key = Date.now() + "_" + path.basename(idl);
                
                console.log(key);
                idlkeys.push(key);
                console.log(idlkeys);
                
                await s3.putObject({
                    Bucket: 'idl-files',
                    Body: fs.createReadStream(idl),
                    Key: key,
                });
            } catch (err) {
                outputStream.push("ERROR: Could not upload IDL to S3");
                outputStream.push("DESCRIPTION: " + err.message);

                buildResult.status = false;
            }
        });

    let logupload: string;

    buildResult.log = readStream(outputStream);

    try {
        const key = Date.now() + "_" + commit + '_build';

        await s3.putObject({
            Bucket: 'idl-files',
            Body: buildResult.log,
            Key: key
        });

        logupload = key;
    } catch (err) {
        outputStream.push("ERROR: Could not upload build logs to S3");
        outputStream.push("DESCRIPTION: " + err.message);

        buildResult.status = false;
    }

    buildResult.status = true;

    console.log(idls, idlkeys);

    const idlresult = await db.iDL.createMany({
        data: idlkeys.map((key, index) => ({
            program: idls[index].split('.')[0],
            key,
            buildId: repoBuild.id
        }))
    });

    console.log(idlresult);

    await db.build.update({
        where: {
            id: repoBuild.id
        },
        data: {
            status: BuildStatus.COMPLETED,
            conclusion: buildResult.status ? BuildConclusion.SUCCESS : BuildConclusion.FAILURE,
            log: logupload,
            ended: new Date()
        }
    });

    return buildResult;
}