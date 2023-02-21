import type { RequestHandler } from "./$types";

import { get } from 'svelte/store';
import { error, redirect } from "@sveltejs/kit";

import app from '$lib/stores/app.server';

import { PUBLIC_GITHUB_REDIRECT_URI } from '$env/static/public';

export const GET = (async ({ url }) => {
    const state = url.searchParams.get('state') ?? 'defaultstate';
    const location = get(app).octokit?.oauth.getWebFlowAuthorizationUrl({
        state,
        redirectUrl: PUBLIC_GITHUB_REDIRECT_URI
    }).url;

    if (location === undefined)
        throw error(500, 'Encountered error when trying to construct oauth redirect location');

    throw redirect(302, location);
}) satisfies RequestHandler;