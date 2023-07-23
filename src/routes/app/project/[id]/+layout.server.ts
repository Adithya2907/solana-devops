import type { LayoutServerLoad } from './$types'

import type { ReplaceReturnType } from '$lib/types/utils';
import type { ProjectBuild, ProjectDeploy } from '$lib/types/data';

import { error } from '@sveltejs/kit';

import { get } from 'svelte/store';

import GHAppStore from '$lib/stores/app.server';
import db from '$lib/db/client';

import { mapListener, mapBuild, mapDeploy } from '$lib/mappers';

export const load = (async ({ params, parent }) => {
    const { user } = await parent();
    const id = parseInt(params.id);

    const project = user?.projects.find(project => project.id === id);

    if (project === undefined)
        throw error(404, 'Could not find repo');

    const installation = await get(GHAppStore).octokit?.getInstallationOctokit(project.repo.installationID);

    const listeners = await db.listener.findMany({
        where: {
            projectID: id
        }
    });

    const commits = await Promise.all(listeners.map(listener => installation?.rest.repos.getCommit({
        repo: project.repo.name,
        owner: user?.login ?? '',
        ref: listener.branch ?? ''
    })));

    const branches = await installation?.rest.repos.listBranches({
        repo: project.repo.name,
        owner: user?.login ?? ''
    });

    const production = await db.deploy.findFirst({
        where: {
            listener: {
                projectID: id,
                production: true
            }
        },
        orderBy: {
            deployed: 'desc'
        },
        include: {
            idls: true,
            build: true,
            listener: true
        }
    });

    const commit = await installation?.rest.repos.getCommit({
        repo: project.repo.name,
        owner: user?.login ?? '',
        ref: production?.build?.commit ?? ''
    });

    const deploys: Array<ProjectDeploy> = (await db.deploy.findMany({
        where: {
            listener: {
                projectID: id
            }
        },
        orderBy: {
            deployed: 'desc'
        },
        include: {
            listener: {
                include: {
                    project: true
                }
            },
            build: true
        },
        take: 5
    })).map(mapDeploy as ReplaceReturnType<typeof mapDeploy, ProjectDeploy>);

    const builds: Array<ProjectBuild> = (await db.build.findMany({
        where: {
            listener: {
                projectID: id
            }
        },
        orderBy: {
            started: 'desc'
        },
        include: {
            listener: {
                include: {
                    project: true
                }
            }
        },
        take: 5
    })).map(mapBuild as ReplaceReturnType<typeof mapBuild, ProjectBuild>);

    return {
        project,
        branches: branches?.data ?? new Array<NonNullable<typeof branches>['data'][number]>,
        production: {
            ...mapDeploy(production),
            build: production?.build,
            message: commit?.data.commit.message
        },
        listeners: listeners.map((listener, index) => mapListener(listener, commits[index]?.data.commit.committer?.date)),
        builds,
        deploys,
        idls: production?.idls
    };
}) satisfies LayoutServerLoad;