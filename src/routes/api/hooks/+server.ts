import type { RequestHandler } from './$types';

import type { User, Repo, Listener } from '@prisma/client';

import { RepoState } from '@prisma/client';

import { error, json } from '@sveltejs/kit';

import db from '$lib/db/client';

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

export const POST = (async ({ fetch, request }) => {
	const event = request.headers.get('X-GitHub-Event');

	const body = await request.json();

	const action = body.action;
	const repo = body.repository;
	const installation = body.installation;

	if (event === 'push') {
		const user = await getUser(repo.owner.login);

		if (user === null)
			throw error(400, "Could not find user with username: " + repo.owner.login);

		const repository = user?.repos.find(rep => rep.name === repo.name);

		if (repository === undefined)
			throw error(400, "Could not find repository with name: " + repo.name);

		const listener = repository?.listeners.find(listener => listener.branch === body.pull_request.head.ref);


		if (listener !== undefined) {
			await fetch('/api/build/start', {
				method: 'POST',
				body: JSON.stringify({
					owner: repo.owner.login,
					repo: repo.name,
					installation: installation.id,
					commit: body.after
				})
			});
		}
	} else if (event === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
		const user = await getUser(repo.owner.login);

		if (user === null)
			throw error(400, "Could not find user with username: " + repo.owner.login);

		const repository = user?.repos.find(rep => rep.name === repo.name);

		if (repository === undefined)
			throw error(400, "Could not find repository with name: " + repo.name);

		const listener = repository?.listeners.find(listener => listener.branch === body.pull_request.head.ref);


		if (listener !== undefined) {
			await fetch('/api/build/start', {
				method: 'POST',
				body: JSON.stringify({
					owner: repo.owner.login,
					repo: repo.name,
					installation: installation.id,
					commit: body.after
				})
			});
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
