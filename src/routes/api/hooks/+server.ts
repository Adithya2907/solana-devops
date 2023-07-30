import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';

import hooks from '$lib/hooks';

export const POST = (async ({ request }) => {
	const event = request.headers.get('X-GitHub-Event');

	switch (event) {
		case 'push':
			hooks.push(request);
			break;
		case 'pull_request':
			hooks.pr(request);
			break;
		case 'installation_repositories':
			hooks.repo(request);
			break;
	}


	return json({});
}) satisfies RequestHandler;
