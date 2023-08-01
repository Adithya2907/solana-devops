import type { App } from 'octokit';
import type { User, Project, Repo, Listener, Build } from '@prisma/client';

import type { BuildResult } from '../build/build';
import type { DeployResult } from '../build/deploy';

import { get } from 'svelte/store';

import { ListenerType } from '@prisma/client';

import db from '$lib/db/client';
import app from '$lib/stores/app.server';

import builders from '$lib/build';

type InstallationType = App['octokit'];
type CheckType = Awaited<ReturnType<InstallationType['rest']['checks']['create']>>['data'];
type BuildType = Awaited<ReturnType<typeof createBuild>>;
type UserType = User & {
    repos: (Repo & {
        project: (Project & {
            listeners: Listener[];
        }) | null;
    })[];
};
type BaseType<I extends InfoType = InfoType> = {
    info: I;
    installation: InstallationType;
    listener: Listener;
    build: BuildType;
};
type RunType = 'build' | 'deploy' | 'fe';
type ResultType<T extends Exclude<RunType, 'fe'>> =
    T extends 'build' ? BuildResult :
    T extends 'deploy' ? DeployResult :
    never;
type ListenerInfoType<T extends ListenerType> =
    T extends 'PUSH' ? PushInfoType :
    T extends 'PULL_REQUEST' ? PRInfoType :
    never;

type CommonInfoType = {
    installation: number;
    owner: string;
    repo: string;
    commit: string;
    branch: string;
    action?: string;
};
type PushInfoType = CommonInfoType & {
    event: 'push';
};
type PRInfoType = CommonInfoType & {
    event: 'pr';
    issue?: number;
};
export type RepoInfoType = CommonInfoType & {
    event: 'installation_repositories';
    added: Awaited<ReturnType<InstallationType['rest']['repos']['get']>>['data'][];
    removed: Awaited<ReturnType<InstallationType['rest']['repos']['get']>>['data'][];
};
type InfoType = PushInfoType | PRInfoType | RepoInfoType;

const Titles: Record<RunType, string> = {
    build: 'Build',
    deploy: 'Deployment',
    fe: 'Frontend Deployment'
};


export async function getInfo(request: Request): Promise<InfoType> {
    const event = request.headers.get('X-GitHub-Event');

    const body = await request.json();
    const repo = body.repository;

    const common = {
        installation: body.installation.id,
        owner: repo.owner.login,
        repo: repo.name,
        commit: body.after,
        branch: body.ref.split('/').pop(),
        action: body.action
    };

    switch (event) {
        case 'push':
            return {
                ...common,
                event: 'push',
            };
        case 'pr':
            return {
                ...common,
                event: 'pr',
                issue: body.pull_request.number
            };
        case 'installation_repositories':
            return {
                ...common,
                event: 'installation_repositories',
                added: body.repositories_added,
                removed: body.repositories_removed
            };
    }

    throw new Error('Cannot handle event');
};

export async function getInstallation(info: InfoType): Promise<InstallationType> {
    const installation = await get(app).octokit?.getInstallationOctokit(info.installation);

    if (installation == undefined)
        throw new Error('Could not locate instance corresponding to given installation id');

    return installation;
}

export async function getUser(info: InfoType): Promise<UserType> {
    const user = await db.user.findUnique({
        where: {
            login: info.owner
        },
        include: {
            repos: {
                include: {
                    project: {
                        include: {
                            listeners: true
                        }
                    }
                }
            }
        }
    });

    if (user === null)
        throw new Error('Could not find registered user with given login');

    return user;
}

export async function getListener(info: InfoType, type: ListenerType): Promise<Listener> {
    const user = await getUser(info);
    const repo = user.repos.find(repo => repo.name === info.repo);

    if (repo === undefined || repo.project === null)
        throw new Error('Could not find repo with given name');

    const listener = repo.project.listeners.find(listener => listener.branch === info.branch && listener.type === type);

    if (listener === undefined)
        throw new Error('No listener exists for the current combination of branch and event');

    return listener;
}

export async function createBuild(info: InfoType, listener: Listener, issue: number | null = null): Promise<Build & { listener: Listener }> {
    const count = await db.build.count({
        where: {
            listener: {
                project: {
                    owner: {
                        projects: {
                            some: {
                                id: listener.projectID
                            }
                        }
                    }
                }
            }
        }
    });

    const build = await db.build.create({
        data: {
            count: count + 1,
            commit: info.commit,
            started: new Date(),
            listenerID: listener.id,
            issue
        },
        include: {
            listener: true
        }
    });

    return build;
}

export async function createComment(installation: InstallationType, info: PRInfoType, comment: string): Promise<void> {
    if (!info.issue)
        return;

    await installation.rest.issues.createComment({
        owner: info.owner,
        repo: info.repo,
        issue_number: info.issue,
        body: comment
    });
}

export async function startComment(installation: InstallationType, info: PRInfoType, type: RunType): Promise<void> {
    await createComment(installation, info, `Automated ${Titles[type].toLowerCase()} started for commit ${info.commit}\n. Look at the check for status.`)
}

export async function endComment(installation: InstallationType, info: PRInfoType, type: RunType): Promise<void> {
    await createComment(installation, info, `Finsihed automated ${Titles[type].toLowerCase()}. View check logs for more details`);
}

export async function startCheck(installation: InstallationType, info: InfoType, type: RunType = 'build'): Promise<CheckType> {
    const check = await installation.rest.checks.create({
        owner: info.owner,
        repo: info.repo,
        name: `SolStromm ${Titles[type]}`,
        status: 'in_progress',
        head_sha: info.commit,
        started_at: new Date().toISOString()
    });

    return check.data;
}

export async function finishCheck(installation: InstallationType, id: number, result: BuildResult, type: RunType = 'build'): Promise<void> {
    await installation.rest.checks.update({
        check_run_id: id,
        status: 'complete',
        conclusion: result.status ? 'success' : 'failure',
        completed_at: new Date().toISOString(),
        output: {
            title: `SolStromm ${Titles[type]}`,
            summary: result.status ? `${Titles[type]} completed successfully!` : `${Titles[type]} failed! View logs for details`,
            text: result.log
        }
    });
}

export async function startBuild(info: InfoType, build: BuildType): Promise<BuildResult> {
    return await builders.build(info.owner, info.repo, info.commit, info.installation, build);
}

export async function startDeploy(info: InfoType, build: BuildType): Promise<DeployResult> {
    return await builders.deploy(info.owner, info.repo, info.commit, info.installation, build);
}

export async function startFrontend(info: InfoType, build: BuildType, result: DeployResult): Promise<boolean> {
    return await builders.fe(info.owner, info.repo, info.commit, info.installation, build, result.deploy);
}

export async function flow<R extends Exclude<RunType, 'fe'>, L extends ListenerType>(base: BaseType<ListenerInfoType<L>>, run: R, type: L): Promise<ResultType<R>> {
    const { installation, info, build } = base;

    const check = await startCheck(installation, info, run);

    if (type == ListenerType.PULL_REQUEST)
        startComment(installation, info as PRInfoType, run);

    const result = run === 'build' ? await startBuild(info, build) : await startDeploy(info, build);

    if (type == ListenerType.PULL_REQUEST)
        endComment(installation, info as PRInfoType, run);

    await finishCheck(installation, check.id, result);

    return result as ResultType<R>;
}

export async function feflow(info: InfoType, build: BuildType, result: DeployResult): Promise<void> {
    startFrontend(info, build, result);
}

export async function base<T extends ListenerType>(request: Request, type: T): Promise<BaseType<ListenerInfoType<T>>> {
    const info = await getInfo(request) as ListenerInfoType<T>;

    const installation = await getInstallation(info);
    const listener = await getListener(info, type);
    const build = await createBuild(info, listener);

    return {
        info,
        installation,
        listener,
        build
    };
}

export async function run(request: Request, type: ListenerType, actions: Array<string> = []): Promise<void> {
    const data = await base(request, type);

    if (actions.length > 0 && data.info.action && !actions.includes(data.info.action))
        return;

    try {
        await flow(data, 'build', type);

        if (data.listener.autodeploy) {
            const result = await flow(data, 'deploy', type);

            if (data.listener.deployfe) {
                await feflow(data.info, data.build, result);
            }
        }
    } finally {
        builders.clean(data.build);
    }
}