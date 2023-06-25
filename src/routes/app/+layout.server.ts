import type { LayoutServerLoad } from './$types';

import { RepoStatus, type RepoInfo, type RepoDeploy, type RepoBuild } from '$lib/types/data';

import { get } from 'svelte/store';

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

import app from '$lib/stores/app.server';

import db from '$lib/db/client';

export const load = (async ({ parent }) => {
    const { user } = await parent();

    const timeAgo = new TimeAgo('en-US');

    const repos: Array<RepoInfo> = [];

    for (const repo of user?.repos ?? []) {
        console.log(repo);

        const installation = await get(app).octokit?.getInstallationOctokit(repo.installationID);
        const result = await installation?.rest.repos.get({
            repo: repo.name,
            owner: user?.login ?? ''
        });

        const commit = await installation?.rest.repos.getCommit({
            repo: repo.name,
            owner: user?.login ?? '',
            ref: result?.data.default_branch ?? ''
        });

        const build = await db.build.findFirst({
            where: {
                listener: {
                    repoID: repo.id
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
                    repoID: repo.id
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

        repos.push({
            name: repo.name,
            owner: user?.login ?? '',
            commit: {
                message: commit?.data.commit.message ?? '',
                time: timeAgo.format(new Date(commit?.data.commit.committer?.date ?? '').getTime()),
                branch: result?.data.default_branch ?? ''
            },
            deploy: deploy === null ? null : {
                branch: deploy?.listener?.branch ?? '',
                commit: deploy?.build?.commit ?? '',
                time: timeAgo.format(new Date(deploy?.deployed ?? '').getTime()),
                status: deploy?.status !== 'COMPLETED' ? RepoStatus.NEUTRAL : deploy?.conclusion !== 'SUCCESS' ? RepoStatus.FAILURE : RepoStatus.SUCCESS,
            },
            build: {
                branch: build?.listener?.branch ?? '',
                commit: build?.commit ?? '',
                time: timeAgo.format(new Date(build?.started ?? '').getTime()),
                status: build?.status !== 'COMPLETED' ? RepoStatus.NEUTRAL : build?.conclusion !== 'SUCCESS' ? RepoStatus.FAILURE : RepoStatus.SUCCESS,
                issue: build?.issue ?? 0
            }
        });
    }

    const deploys: Array<RepoDeploy> = (await db.deploy.findMany({
        orderBy: {
            deployed: 'desc'
        },
        include: {
            listener: {
                include: {
                    repo: true
                }
            },
            build: true
        },
        take: 5
    })).map(deploy => ({
        id: deploy.id,
        project: deploy.listener?.repo?.name.replace('-', ' ') ?? '',
        branch: deploy?.listener?.branch ?? '',
        commit: deploy?.build?.commit ?? '',
        time: timeAgo.format(new Date(deploy?.deployed ?? '').getTime()),
        status: deploy?.status !== 'COMPLETED' ? RepoStatus.NEUTRAL : deploy?.conclusion !== 'SUCCESS' ? RepoStatus.FAILURE : RepoStatus.SUCCESS,
    }));

    const builds: Array<RepoBuild> = (await db.build.findMany({
        orderBy: {
            started: 'desc'
        },
        include: {
            listener: {
                include: {
                    repo: true
                }
            }
        },
        take: 5
    })).map(build => ({
        id: build.id,
        project: build.listener?.repo?.name.replace('-', ' ') ?? '',
        branch: build?.listener?.branch ?? '',
        issue: build.issue ?? 0,
        commit: build?.commit ?? '',
        time: timeAgo.format(new Date(build?.ended ?? '').getTime()),
        status: build?.status !== 'COMPLETED' ? RepoStatus.NEUTRAL : build?.conclusion !== 'SUCCESS' ? RepoStatus.FAILURE : RepoStatus.SUCCESS,
    }))

    return {
        repos,
        deploys,
        builds
    };
}) satisfies LayoutServerLoad;