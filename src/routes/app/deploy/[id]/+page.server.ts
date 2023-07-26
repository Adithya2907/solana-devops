import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

import * as AWS from '@aws-sdk/client-s3';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';

import GHAppStore from '$lib/stores/app.server';
import db from '$lib/db/client';
import { get } from 'svelte/store';

export const load = (async ({ parent, params }) => {
    const { user } = await parent();
    const id = params.id;

    const deploy = await db.deploy.findFirstOrThrow({
        where: {
            id: parseInt(id),
            build: {
                listener: {
                    project: {
                        ownerID: user?.id
                    }
                }
            }
        },
        include: {
            build: true,
            listener: {
                include: {
                    project: {
                        include: {
                            repo: true
                        }
                    }
                }
            },
            idls: true,
            frontendDeploy: true
        }
    });

    if (deploy === null)
        throw error(404, 'Could not find deploy');

    let log: string | null = null;
    let felog: string | null = null;

    const installation = await get(GHAppStore).octokit?.getInstallationOctokit(deploy.listener?.project.repo.installationID ?? 0);

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    if (deploy.log) {
        const result = await s3.getObject({
            Bucket: 'idl-files',
            Key: deploy.log
        });

        log = (await result.Body?.transformToString()) ?? '';
    }

    if (deploy.frontendDeploy && deploy.frontendDeploy.log) {
        const result = await s3.getObject({
            Bucket: 'idl-files',
            Key: deploy.frontendDeploy.log
        });

        felog = (await result.Body?.transformToString()) ?? '';
    }

    const commit = await installation?.rest.repos.getCommit({
        repo: deploy.listener?.project.repo.name ?? '',
        owner: user?.login ?? '',
        ref: deploy.build?.commit
    });

    const idls = await db.iDL.findMany({
        where: {
            deployId: deploy.id
        }
    });

    return {
        deploy,
        log,
        felog,
        idls,
        message: commit?.data.commit.message
    };

}) satisfies PageServerLoad;