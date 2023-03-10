import type { Build } from '@prisma/client';

import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';

import { BuildStatus, BuildConclusion } from '@prisma/client';

import AWS from 'aws-sdk';

import extract from 'extract-zip';

import app from '$lib/stores/app.server';
import db from '$lib/db/client';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_REPO_PATH } from '$env/static/public';

type BuildResult = {
    status: boolean;
    log: string;
};

export async function build(owner: string, repo: string, commit: string, installation: number, repoBuild: Build): Promise<BuildResult> {
    const outputStream = new stream.PassThrough({
        encoding: "utf-8",
    });

    const instance = await get(app).octokit?.getInstallationOctokit(installation);

    const buildResult: BuildResult = {
        status: false,
        log: ""
    };

    outputStream.on("data", (data) => {
        console.log(data);
    });

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

    outputStream.push("\nCopying dependencies");
    fs.copyFileSync(path.join(platform, "Dockerfile"), path.join(PUBLIC_REPO_PATH, "Dockerfile"));
    fs.copyFileSync(path.join(platform, "solana-install.sh"), path.join(extracted, "install.sh"), fs.constants.X_OK);

    console.log("Building repo using ", path.join(platform, "build.sh"));

    const buildProcess = childProcess.execSync(`. ${path.join(platform, 'build.sh')}`).toString("utf-8");
    outputStream.push("\n" + buildProcess);

    const s3 = new AWS.S3({
        accessKeyId: AWS_S3_ACCESS_KEY,
        secretAccessKey: AWS_S3_SECRET_KEY
    });

    const idls = fs.readdirSync(path.join(PUBLIC_REPO_PATH, "artifacts", "idl"));
    const idluploads: Array<AWS.S3.ManagedUpload.SendData> = [];
    idls
        .map(idl =>
            path.join(PUBLIC_REPO_PATH, "artifacts", "idl", idl))
        .forEach(idl => {
            s3.upload({
                Bucket: 'idl-files',
                Body: fs.createReadStream(idl),
                Key: "folder/" + Date.now() + "_" + path.basename(idl)
            }, (err, data) => {
                if (err !== null || err !== undefined) {
                    outputStream.push("ERROR: Could not upload IDL to S3");
                    outputStream.push("DESCRIPTION: " + err.message);

                    buildResult.status = false;
                }

                console.log(`Uploaded IDL ${idl} to ${data.Location}`, data);
                idluploads.push(data);
            });
        });

    let logupload: AWS.S3.ManagedUpload.SendData;

    s3.upload({
        Bucket: 'idl-files',
        Body: outputStream,
        Key: "folder/" + Date.now() + "_" + commit + 'build'
    }, (err, data) => {
        if (err !== null || err !== undefined) {
            outputStream.push("ERROR: Could not upload build logs to S3");
            outputStream.push("DESCRIPTION: " + err.message);

            buildResult.status = false;
        }

        logupload = data;

        console.log(`Upload logs to ${data.Location}`, data);
    });

    outputStream.pause();

    buildResult.status = true;
    buildResult.log = outputStream.read();

    console.log(buildResult.log);

    db.build.update({
        where: {
            id: repoBuild.id
        },
        data: {
            status: BuildStatus.COMPLETED,
            conclusion: buildResult.status ? BuildConclusion.SUCCESS : BuildConclusion.FAILURE,
            //@ts-ignore
            log: logupload?.Location,
        }
    });

    return buildResult;
}