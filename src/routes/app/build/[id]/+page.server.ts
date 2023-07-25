import type { PageServerLoad } from './$types';

import { get } from 'svelte/store';

import { error } from '@sveltejs/kit';

import * as AWS from '@aws-sdk/client-s3';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';

import GHAppStore from '$lib/stores/app.server';
import db from '$lib/db/client';

import {mapListener, mapBuild, mapDeploy} from '$lib/mappers';

export const load = (async ({ params, parent }) => {
    const { user } = await parent();
    const id = params.id;

    const build = await db.build.findFirstOrThrow({
        where: {
            id: parseInt(id),
            listener: {
                project: {
                    ownerID: user?.id
                }
            }
        },
        include: {
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
            deploys: true
        }
    });

    if (build === null)
        throw error(404, 'Could not find build');

    const installation = await get(GHAppStore).octokit?.getInstallationOctokit(build.listener?.project.repo.installationID ?? 0);

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    let log = null;

    if (build.log) {
        const result = await s3.getObject({
            Bucket: 'idl-files',
            Key: build.log
        });
    
        log = await result.Body?.transformToString();
    }

    const commit = await installation?.rest.repos.getCommit({
        repo: build.listener?.project.repo.name ?? '',
        owner: user?.login ?? '',
        ref: build.commit
    });

    const idls = await db.iDL.findMany({
        where: {
            buildId: build.id
        }
    });

    const deploys = await db.deploy.findMany({
        where: {
            buildID: build.id
        }
    });

    return {
        build,
        log,
        idls,
        deploys,
        message: commit?.data.commit.message
    };
}) satisfies PageServerLoad;