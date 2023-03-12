import * as AWS from '@aws-sdk/client-s3';
import { AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY } from '$env/static/private';
import axios from 'axios';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    const fetchIdl = async () => {
        const s3 = new AWS.S3({
            credentials: {
                accessKeyId: AWS_S3_ACCESS_KEY,
                secretAccessKey: AWS_S3_SECRET_KEY
            },
            region: 'ap-south-1'
        });

        console.log('Getting the file');
        try {
            const result = await s3.getObject({
                Bucket: 'idl-files',
                Key: params.idlFile + '.json'
            });
            const log = await result.Body?.transformToString();
            return log;
        } catch (e) {
            console.log('Error occured', e);
            return 'ERROR';
        }
    };

    return {
        idlJson: fetchIdl()
    };
}
