import type { LayoutServerLoad } from './$types';

import { BuildStatus, BuildConclusion, type Deploy, type Build, type Listener, type Project } from '@prisma/client';

import { ProjectStatus, type ProjectInfo, type ProjectDeploy, type ProjectBuild } from '$lib/types/data';

import { get } from 'svelte/store';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import app from '$lib/stores/app.server';

import db from '$lib/db/client';

type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (...a: Parameters<T>) => TNewReturn;

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

const getTime = (date: Date | null): string => {
    return timeAgo.format(new Date(date ?? '').getTime())
}

const mapStatus = (status: BuildStatus, conclusion: BuildConclusion): ProjectStatus => {
    return status === BuildStatus.COMPLETED ? conclusion === BuildConclusion.SUCCESS ? ProjectStatus.SUCCESS : ProjectStatus.FAILURE : status === BuildStatus.IN_PROGRESS ? ProjectStatus.PROGRESS : ProjectStatus.NEUTRAL;
}

const mapDeploy = (deploy: (Deploy & {
    listener: Listener | null;
    build: Build | null;
}) | null | (Deploy & {
    listener: (Listener & {
        project: Project;
    }) | null;
    build: Build | null;
})): ProjectDeploy | null => {
    if (deploy === null) return null;

    let mapped: ProjectDeploy = {
        id: deploy.id,
        branch: deploy?.listener?.branch ?? '',
        commit: deploy?.build?.commit ?? '',
        time: getTime(deploy.deployed),
        status: mapStatus(deploy?.status ?? BuildStatus.COMPLETED, deploy?.conclusion ?? BuildConclusion.FAILURE)
    };

    if ('project' in (deploy?.listener ?? {})) {
        mapped = {
            project: (deploy.listener as (Listener & { project: Project })).project.name,
            ...mapped
        };
    }

    return mapped;
}

const mapBuild = (build: (Build & {
    listener: Listener | null;
}) | (Build & {
    listener: (Listener & {
        project: Project;
    }) | null;
}) | null): ProjectBuild | null => {
    if (build === null) return null;

    let mapped: ProjectBuild = {
        id: build.id,
        branch: build?.listener?.branch ?? '',
        commit: build?.commit ?? '',
        time: getTime(build.started),
        issue: build?.issue ?? 0,
        status: mapStatus(build?.status ?? BuildStatus.COMPLETED, build?.conclusion ?? BuildConclusion.FAILURE)
    };

    if ('project' in (build?.listener ?? {})) {
        mapped = {
            project: (build.listener as (Listener & { project: Project })).project.name,
            ...mapped
        };
    }

    return mapped;
}

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
            name: project.name,
            owner: user?.login ?? '',
            commit: {
                message: commit?.data.commit.message ?? '',
                time: timeAgo.format(new Date(commit?.data.commit.committer?.date ?? '').getTime()),
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