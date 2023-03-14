import type { LayoutServerLoad } from './$types';

import type { IDL } from './IDL';

import { error } from '@sveltejs/kit';

import * as AWS from '@aws-sdk/client-s3';
import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';

import db from '$lib/db/client';

export const load = (async ({ params }) => {
    const id = parseInt(params.id);

    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: AWS_S3_ACCESS_KEY,
            secretAccessKey: AWS_S3_SECRET_KEY
        },
        region: 'ap-south-1'
    });

    const idl = await db.iDL.findUnique({
        where: {
            id
        },
        include: {
            build: true,
            deploy: true
        }
    });

    if (idl === null)
        throw error(404, 'Could not find IDL');

    const result = await s3.getObject({
        Bucket: 'idl-files',
        Key: idl.key
    });

    const file = await result.Body?.transformToString();

    if (file === undefined)
        throw error(404, 'Could not find IDL file');

    const json: IDL = await JSON.parse(file) as IDL;

    return {
        idl,
        json
    };

}) satisfies LayoutServerLoad;
