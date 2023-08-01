import { BuildConclusion, BuildStatus, DeployTarget, type Build, type Listener, type Deploy } from '@prisma/client';

import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import childProcess from 'node:child_process';

import { get } from 'svelte/store';

import * as AWS from '@aws-sdk/client-s3';

import app from '$lib/stores/app.server';
import db from '$lib/db/client';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import { PUBLIC_REPO_PATH } from '$env/static/public';

export type DeployResult = {
    status: boolean;
    log: string;
    deploy: Deploy;
};

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

export async function deploy(owner: string, repo: string, commit: string, installation: number, build: Build & { listener: Listener }): Promise<DeployResult> {
    const outputStream = new stream.PassThrough({
        encoding: "utf-8",
    });

    const instance = await get(app).octokit?.getInstallationOctokit(installation);

    const deploymentCount = await db.deploy.count({
        where: {
            listener: {
                project: {
                    owner: {
                        projects: {
                            some: {
                                id: build.listener.projectID
                            }
                        }
                    }
                }
            }
        }
    });

    const deployment = await db.deploy.create({
        data: {
            count: deploymentCount + 1,
            listenerID: build.listener.id,
            buildID: build.id,
            deployed: new Date()
        }
    });

    const result: DeployResult = {
        status: false,
        log: "",
        deploy: deployment
    };

    const check = await instance?.rest.checks.create({
        owner,
        repo,
        name: 'SolStromm Deploy',
        status: 'in_progress',
        head_sha: commit,
        started_at: new Date().toISOString()
    });

    const base = path.join(PUBLIC_REPO_PATH, build.id.toString());
    const cluster = TargetMapping[build.listener.deploytarget];
    const extracted = path.join(base, 'repo');
    const platform = path.resolve('src', 'lib', 'platform');

    process.env['_BUILD_CLUSTER'] = cluster;
    process.env['_BUILD_REPO_PATH'] = extracted;

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    try {
        const deployProcess = childProcess.execSync(`. ${path.join(platform, 'deploy.sh')}`).toString();
        const lines = deployProcess.split('\n');
        const programs: Record<string, string> = {};

        lines.forEach((line, index) => {
            if (line.includes('Deploying program')) {
                const program = line.split('Deploying program ')[1].split('...')[0].replace('"', '');
                const id = lines[index + 2].split('Program Id: ')[1];

                programs[program.replace('"', '')] = id;
            }
        });

        outputStream.push(deployProcess);

        const idlfiles = fs.readdirSync(path.join(base, "repo", "target", "idl"));
        const idlkeys: Record<string, string> = {};

        idlfiles.forEach(async idlfile => {
            const idlkey = Date.now() + '_' + path.basename(idlfile);
            idlkeys[path.basename(idlfile)] = idlkey;

            await s3.putObject({
                Bucket: 'idl-files',
                Body: fs.createReadStream(path.join(base, "repo", "target", "idl", idlfile)),
                Key: idlkey
            });
        });

        const updates = Object.keys(programs).map(program =>
            db.iDL.updateMany({
                where: {
                    buildId: build.id,
                    program: program.replace('-', '_')
                },
                data: {
                    programid: programs[program],
                    deployId: deployment.id,
                    key: idlkeys[program.replace('-', '_') + '.json']
                }
            })
        );

        await db.$transaction(updates);

        result.status = true;
        result.log = readStream(outputStream);
    } catch (err) {
        outputStream.push((err as Error).message);
    } finally {
        await instance?.rest.checks.update({
            owner,
            repo,
            check_run_id: check?.data.id,
            status: result.status ? 'completed' : 'in_progress',
            conclusion: result.status ? 'success' : 'failure',
            completed_at: new Date().toISOString(),
            output: {
                title: 'SolStromm Deploy',
                summary: result.status ? 'Deployed successfully!' : 'Deploy failed',
                text: result.log
            }
        });

        const key = Date.now() + "_" + commit + '_build';

        await s3.putObject({
            Bucket: 'idl-files',
            Body: result.log,
            Key: key
        });

        await db.deploy.update({
            where: {
                id: deployment.id
            },
            data: {
                deployed: new Date(),
                status: BuildStatus.COMPLETED,
                conclusion: result.status ? BuildConclusion.SUCCESS : BuildConclusion.FAILURE,
                log: key
            }
        });
    }

    return result;
}