import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

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

    if (build === null || build?.listener?.repoID !== repo?.id)
        throw error(404, 'Could not find build');

    return {
        build
    };
}) satisfies PageServerLoad;