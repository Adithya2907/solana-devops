import type { LayoutServerLoad } from '../$types'

import { error } from '@sveltejs/kit';

import { get } from 'svelte/store';

import GHAppStore from '$lib/stores/app.server';
import db from '$lib/db/client';

export const load = (async ({ params, parent }) => {
    const { user } = await parent();
    const name = params.name;

    const partial = user?.repos.find(repo => repo.name === name);

    if (partial === undefined)
        throw error(404, 'Could not find repo');

    const octokit = await get(GHAppStore).octokit?.getInstallationOctokit(partial.installationID)
    const result = await octokit?.rest.repos.listBranches({
        owner: user?.login ?? '',
        repo: name ?? ''
    });

    if (result === undefined)
        throw error(500, 'Could not fetch branches for repo');

    const repo = await db.repo.findUnique({
        where: {
            fullname: partial.fullname
        },
        include: {
            listeners: {
                include: {
                    builds: true,
                    deploys: true
                }
            },
        },
    });

    const branches = result.data;

    return {
        repo,
        branches
    };
}) satisfies LayoutServerLoad;