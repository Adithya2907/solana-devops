import { ListenerType, DeployTarget, type Build, type Listener, type Deploy } from '@prisma/client';

import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';

import { zip } from 'zip-a-folder';

import * as AWS from '@aws-sdk/client-s3';

import app from '$lib/stores/app.server';
import db from '$lib/db/client';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_REPO_PATH } from '$env/static/public';

const TargetMapping: Record<DeployTarget, string> = {
    [DeployTarget.DEV]: 'devnet',
    [DeployTarget.TEST]: 'testnet',
    [DeployTarget.PROD]: 'mainnet'
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

async function getSites(token: string): Promise<Array<Record<string, string>>> {
    const result = await fetch('https://api.netlify.com/api/v1/sites', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    return await result.json();
}

function getSite(sites: Array<Record<string, string>>, name: string): Record<string, string> | null {
    for (const site of sites) {
        if (site['name'] === name)
            return site;
    }

    return null;
}

async function deploy(site: Record<string, string>, token: string, file: string, preview: boolean): Promise<Record<string, string> | null> {
    try {
        const result = await fetch(`https://api.netlify.com/api/v1/sites/${site["id"]}/deploys?draft=${preview ? 'true' : 'false'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/zip',
                'Authorization': `Bearer ${token}`,
            },
            body: fs.readFileSync(file),
        });

        return await result.json();
    } catch (e) {
        return null;
    }
}

export async function fe(owner: string, repository: string, commit: string, installation: number, build: Build & { listener: Listener }, deployment: Deploy): Promise<boolean> {
    if (!build.listener.fepluginID)
        return false;

    const outputStream = new stream.PassThrough({
        encoding: 'utf-8'
    });

    const plugin = await db.plugin.findUnique({
        where: {
            id: build.listener.fepluginID
        }
    });

    if (!plugin)
        return false;

    const instance = await get(app).octokit?.getInstallationOctokit(installation);

    const check = await instance?.rest.checks.create({
        owner,
        repo: repository,
        name: 'SolStromm Deploy - Frontend',
        status: 'in_progress',
        head_sha: commit,
        started_at: new Date().toISOString()
    });

    const base = path.join(PUBLIC_REPO_PATH, build.id.toString());
    const repo = path.join(base, 'repo');
    const feapp = path.join(repo, plugin.dir);
    const feidl = path.join(repo, plugin.idl);
    const buildidl = path.join(repo, 'target', 'idl');
    const output = path.join(repo, plugin.output);
    const upload = path.join(base, 'upload.zip');

    fs.cpSync(buildidl, feidl, { recursive: true });

    process.env['BUILD_APP_PATH'] = feapp;

    outputStream.push(childProcess.execSync('npm install', { cwd: feapp }));
    outputStream.push(childProcess.execSync(plugin.command.replace('{{cluster}}', TargetMapping[build.listener.deploytarget]), { cwd: feapp }));

    await zip(output, upload);

    const sites = await getSites(plugin.key);
    const site = getSite(sites, plugin.target);

    if (site === null)
        return false;

    const result = await deploy(site, plugin.key, upload, build.listener.type === ListenerType.PULL_REQUEST);

    if (result === null)
        return false;

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    const log = readStream(outputStream);
    const logKey = `${plugin.target}/${result['id']}_${Date.now()}`;

    outputStream.push('Success! Deployed at ' + result['deploy_url'] + '\n');

    await s3.putObject({
        Bucket: 'idl-files',
        Body: log,
        Key: logKey
    });

    const fedeployment = await db.frontendDeploy.create({
        data: {
            url: result['deploy_url'],
            log: logKey,
            deployed: new Date(),
        }
    });

    await db.deploy.update({
        where: {
            id: deployment.id
        },
        data: {
            frontendDeployID: fedeployment.id
        }
    });

    await instance?.rest.checks.update({
        owner,
        repo: repository,
        check_run_id: check?.data.id,
        status: result ? 'completed' : 'in_progress',
        conclusion: result ? 'success' : 'failure',
        completed_at: new Date().toISOString(),
        output: {
            title: 'SolStromm Deploy',
            summary: result ? 'Deployed successfully!' : 'Deploy failed',
            text: log
        }
    });

    return true;
}