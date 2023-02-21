import type { RequestHandler } from "./$types";

import { get } from 'svelte/store';
import { error, text } from '@sveltejs/kit';

import app from '$lib/stores/app.server';

export const POST = (async ({ request }) => {
    const body = await request.json();

    const owner = body.owner;
    const repo = body.repo;
    const issue = body.issue;
    const content = body.content;
    const installation = body.installation;

    if (!owner || !repo || !issue || !content || !installation)
        throw error(400, 'Missing required parameters');

    const result = await (await get(app).octokit?.getInstallationOctokit(installation))!.rest.issues.createComment({
        owner,
        repo,
        issue_number: issue,
        body: content,
    });

    console.log(result?.status);

    return text("asd");
}) satisfies RequestHandler;