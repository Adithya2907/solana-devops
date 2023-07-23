import type { LayoutServerLoad } from './$types';

import type { ProjectInfo, ProjectDeploy, ProjectBuild } from '$lib/types/data';

import type { ReplaceReturnType } from '$lib/types/utils';

import { get } from 'svelte/store';

import app from '$lib/stores/app.server';

import db from '$lib/db/client';

import { mapTime, mapBuild, mapDeploy } from '$lib/mappers';

export const load = (async ({ parent }) => {
    const { user } = await parent();

    const projects: Array<ProjectInfo> = [];

    for (const project of user?.projects ?? []) {
        const installation = await get(app).octokit?.getInstallationOctokit(project.repo.installationID);
        const result = await installation?.rest.repos.get({
            repo: project.repo.name,
            owner: user?.login ?? ''
        });


        const commit = await installation?.rest.repos.getCommit({
            repo: project.repo.name,
            owner: user?.login ?? '',
            ref: result?.data.default_branch ?? ''
        });

        const build = await db.build.findFirst({
            where: {
                listener: {
                    projectID: project.id
                }
            },
            orderBy: {
                started: 'desc'
            },
            include: {
                listener: true
            }
        });

        const deploy = await db.deploy.findFirst({
            where: {
                status: 'COMPLETED',
                conclusion: 'SUCCESS',
                listener: {
                    projectID: project.id
                }
            },
            orderBy: {
                deployed: 'desc'
            },
            include: {
                listener: true,
                build: true
            }
        });

        projects.push({
            id: project.id,
            name: project.name,
            owner: user?.login ?? '',
            commit: {
                message: commit?.data.commit.message ?? '',
                time: mapTime(commit?.data.commit.committer?.date),
                branch: result?.data.default_branch ?? ''
            },
            deploy: mapDeploy(deploy),
            build: mapBuild(build)
        });
    }

    const deploys: Array<ProjectDeploy> = (await db.deploy.findMany({
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
        projects,
        deploys,
        builds
    };
}) satisfies LayoutServerLoad;