import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

import * as AWS from '@aws-sdk/client-s3';

import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';

import db from '$lib/db/client';

export const load = (async ({ params, parent }) => {
    const { repo } = await parent();
    const id = params.id;

    const build = await db.build.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            listener: true
        }
    });

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    if (build === null || build?.listener?.repoID !== repo?.id)
        throw error(404, 'Could not find build');

    const result = await s3.getObject({
        Bucket: 'idl-files',
        Key: build.log
    });

    const log = await result.Body?.transformToString();

    return {
        build,
        log
    };
}) satisfies PageServerLoad;