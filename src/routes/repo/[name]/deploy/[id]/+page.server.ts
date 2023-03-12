import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

import * as AWS from '@aws-sdk/client-s3';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';

import db from '$lib/db/client';

export const load = (async ({ parent, params }) => {
    const { repo } = await parent();
    const id = params.id;

    const deploy = await db.deploy.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            build: true,
            listener: true,
            idls: true,
            frontendDeploy: true
        }
    });

    if (deploy === null || deploy?.listener?.repoID !== repo?.id)
        throw error(404, 'Could not find build');

    let log: string | null = null;
    let felog: string | null = null;

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

    return {
        deploy,
        log,
        felog
    };

}) satisfies PageServerLoad;