import type { RequestHandler } from "./$types";

import fs from 'node:fs';
import path from 'node:path';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';
import { error, json } from '@sveltejs/kit';

import extract from 'extract-zip';

import app from '$lib/stores/app.server';

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

    console.log(path.join(platform, 'version.sh'));
    childProcess.exec(`. ${path.join(platform, "version.sh")}`);

    console.log("found versions", import.meta.env._BUILD_RUST_VERSION, import.meta.env._BUILD_ANCHOR_VERSION);

    console.log("Copying dependencies");
    fs.copyFileSync(path.join(platform, "Dockerfile"), path.join(PUBLIC_REPO_PATH, "Dockerfile"));
    fs.copyFileSync(path.join(platform, "solana-install.sh"), path.join(extracted, "install.sh"), fs.constants.X_OK);

    console.log("Building repo using ", path.join(platform, "build.sh"));

    process.env['_BUILD_REPO_PATH'] = path.resolve(PUBLIC_REPO_PATH);

    const buildProcess = childProcess.exec(`. ${path.join(platform, 'build.sh')}`);
    buildProcess.stdout?.pipe(process.stdout);
    buildProcess.stderr?.pipe(process.stderr);

    return json({});
}) satisfies RequestHandler;