import type { RequestHandler } from './$types';

import type { User, Repo, Listener, Build } from '@prisma/client';

import { RepoState } from '@prisma/client';

import { get } from 'svelte/store';
import { error, json } from '@sveltejs/kit';

import { build } from '$lib/build/build';
import { deploy } from '$lib/build/deploy';

import db from '$lib/db/client';
import GHApp from '$lib/stores/app.server';

async function getUser(login: string): Promise<(User & {
	repos: (Repo & {
		listeners: Listener[];
	})[];
}) | null> {
	const user = await db.user.findUnique({
		where: {
			login: login
		},
		include: {
			repos: {
				include: {
					listeners: true
				}
			}
		},
	});

	return user;
}

async function createBuild(commit: string, listener: number, issue: number | null = null): Promise<Build & { listener: Listener | null }> {
	const build = db.build.create({
		data: {
			commit,
			started: new Date(),
			listenerID: listener,
			issue
		},
		include: {
			listener: true
		}
	});

	return build;
}

export const POST = (async ({ request }) => {
	const event = request.headers.get('X-GitHub-Event');

	const body = await request.json();

	const action = body.action;
	const repo = body.repository;
	const installation = body.installation;

	const app = await get(GHApp).octokit?.getInstallationOctokit(installation.id);

	if (event === 'push') {
		const user = await getUser(repo.owner.login);

		if (user === null)
			throw error(400, "Could not find user with username: " + repo.owner.login);

		const repository = user?.repos.find(rep => rep.name === repo.name);

		if (repository === undefined)
			throw error(400, "Could not find repository with name: " + repo.name);

		const listener = repository?.listeners.find(listener => listener.branch === body.ref.split('/').pop());

		if (listener !== undefined) {
			const repoBuild = await createBuild(body.after, listener.id);

			const check = await app?.rest.checks.create({
				owner: repo.owner.login,
				repo: repo.name,
				name: 'SolStromm Build',
				status: 'in_progress',
				head_sha: body.after,
				started_at: new Date().toISOString()
			});

			const result = await build(repo.owner.login, repo.name, body.after, installation.id, repoBuild);

			app?.rest.checks.update({
				owner: repo.owner.login,
				repo: repo.name,
				check_run_id: check,
				status: 'completed',
				conclusion: result.status ? 'success' : 'failure',
				completed_at: new Date().toISOString(),
				output: {
					title: 'SolStromm Build',
					summary: result.status ? 'Build completed successfully!' : 'Build failed! View check logs for details',
					text: result.log
				}
			});
		}
	} else if (event === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
		const user = await getUser(repo.owner.login);

		if (user === null)
			throw error(400, "Could not find user with username: " + repo.owner.login);

		const repository = user?.repos.find(rep => rep.name === repo.name);

		if (repository === undefined)
			throw error(400, "Could not find repository with name: " + repo.name);

		const listener = repository?.listeners.find(listener => listener.branch === body.pull_request.base.ref);

		if (listener !== undefined) {
			const repoBuild = await createBuild(body.after, listener.id, body.pull_request.number);

			await app?.rest.issues.createComment({
				owner: repo.owner.login,
				repo: repo.name,
				issue_number: body.pull_request.number,
				body: `Automated build started for commit ${body.after}\n. Look at the check for status.`
			});

			const check = await app?.rest.checks.create({
				owner: repo.owner.login,
				repo: repo.name,
				name: 'SolStromm Build',
				status: 'in_progress',
				head_sha: body.after,
				started_at: new Date().toISOString()
			});

			try {
				const result = await build(repo.owner.login, repo.name, body.after, installation.id, repoBuild);

				app?.rest.checks.update({
					owner: repo.owner.login,
					repo: repo.name,
					check_run_id: check?.data.id,
					status: 'completed',
					conclusion: result.status ? 'success' : 'failure',
					completed_at: new Date().toISOString(),
					output: {
						title: 'SolStromm Build',
						summary: result.status ? 'Build completed successfully!' : 'Build failed! View check logs for details',
						text: result.log
					}
				});

				await app?.rest.issues.createComment({
					owner: repo.owner.login,
					repo: repo.name,
					issue_number: body.pull_request.number,
					body: result.status ? 'Build completed successfully!' : 'Build failed! View check logs for details'
				});

				if (result.status && listener.autodeploy) {
					const result = deploy(repo.owner.login, repo.name, body.after, installation.id, repoBuild);
					console.log(result.log);
				}
			} catch (e) {
				console.log(e);
			}
		}
	} else if (event === 'installation_repositories') {
		const user = await db.user.findUnique({
			where: {
				login: body.sender.login
			}
		});

		if (user === null)
			throw error(400, "Could not find user with username: " + body.sender.login);

		const added = body.repositories_added;
		const removed = body.repositories_removed;

		const create = db.repo.createMany({
			data: added.map(repo => ({
				name: repo.name,
				fullname: repo.full_name,
				url: `https://www.github.com/${repo.full_name}`,
				state: RepoState.INSTALLED,
				installationID: installation.id,
				ownerID: user.id
			}))
		});

		const remove = db.repo.deleteMany({
			where: {
				fullname: {
					in: removed.map(repo => repo.full_name)
				}
			}
		});

		await db.$transaction([create, remove]);
	}

	return json({});
}) satisfies RequestHandler;
