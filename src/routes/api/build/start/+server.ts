import type { RequestHandler } from "./$types";

import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';
import { error, json } from '@sveltejs/kit';

import AWS from 'aws-sdk';

import extract from 'extract-zip';

import app from '$lib/stores/app.server';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_REPO_PATH } from '$env/static/public';

export const POST = (async ({ request }) => {
    const body = await request.json();

    const owner = body.owner;
    const repo = body.repo;
    const commit = body.commit;
    const installation = body.installation;

    if (!owner || !repo || !commit || !installation)
        throw error(400, "Missing required parameters");

    const instance = await get(app).octokit?.getInstallationOctokit(installation);

    console.log("Started download");

    const result = await instance?.rest.repos.downloadZipballArchive({
        owner,
        repo,
        ref: commit
    });

    console.log("Finished download");

    const zipped = result?.data as ArrayBuffer;
    const download = path.parse(path.join(PUBLIC_REPO_PATH, "download.zip"));
    const name = path.join(PUBLIC_REPO_PATH, `${owner}-${repo}-${commit.substring(0, 7)}`);
    const extracted = path.join(PUBLIC_REPO_PATH, 'repo');
    const platform = path.resolve('src', 'lib', 'platform');

    fs.mkdirSync(download.dir, { recursive: true });
    fs.writeFileSync(path.format(download), Buffer.from(zipped));

    console.log("Downloaded file to " + path.format(download));

    await extract(path.format(download), {
        dir: path.resolve(PUBLIC_REPO_PATH),
    });

    if (fs.existsSync(extracted))
        fs.rmSync(extracted, { recursive: true });
    fs.renameSync(name, extracted);

    console.log("Extracted repo to " + extracted);

    process.env['_BUILD_REPO_PATH'] = path.resolve(PUBLIC_REPO_PATH);

    console.log(path.join(platform, 'version.sh'));
    const versions = childProcess.execSync(`. ${path.join(platform, "version.sh")}`).toString();

    process.env['_BUILD_RUST_VERSION'] = versions.split('Found rust version: ')[1].split('\n')[0].trim();
    process.env['_BUILD_ANCHOR_VERSION'] = versions.split('Found anchor version: ')[1].split('\n')[0].trim();

    console.log("found versions", process.env['_BUILD_RUST_VERSION'], process.env['_BUILD_ANCHOR_VERSION']);

    console.log("Copying dependencies");
    fs.copyFileSync(path.join(platform, "Dockerfile"), path.join(PUBLIC_REPO_PATH, "Dockerfile"));
    fs.copyFileSync(path.join(platform, "solana-install.sh"), path.join(extracted, "install.sh"), fs.constants.X_OK);

    console.log("Building repo using ", path.join(platform, "build.sh"));

    const buildProcess = childProcess.exec(`. ${path.join(platform, 'build.sh')}`);
    buildProcess.stdout?.pipe(process.stdout);
    buildProcess.stderr?.pipe(process.stderr);

    const s3 = new AWS.S3({
        accessKeyId: AWS_S3_ACCESS_KEY,
        secretAccessKey: AWS_S3_SECRET_KEY
    });

    const idls = fs.readdirSync(path.join(PUBLIC_REPO_PATH, "artifacts", "idl"));
    idls
        .map(idl => 
            path.join(PUBLIC_REPO_PATH, "artifacts", "idl", idl))
        .forEach(idl => {
            s3.upload({
                Bucket: 'idl',
                Body: fs.createReadStream(idl),
                Key: "folder/" + Date.now() + "_" + path.basename(idl)
            }, (err, data) => {
                if (err !== null || err !== undefined) {
                    console.log(err);
                    throw error(500, 'Could not upload IDL to S3');
                }


                console.log(`Uploaded IDL ${idl} to ${data.Location}`);
            });
        });

    return json({});
}) satisfies RequestHandler;