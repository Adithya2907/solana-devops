import type { RequestHandler } from "./$types";

import { get } from 'svelte/store';
import { error, text } from '@sveltejs/kit';

import app from '$lib/stores/app.server';

export const POST = (async ({ request }) => {
    const body = await request.json();

    const owner = body.owner;
    const repo = body.repo;
    const installation = body.installation;
    const commit = body.commit;

    if (!owner || !repo || !installation || !commit)
        throw error(400, 'Missing required parameters');

    console.log('creating check for', owner, repo, installation, commit);

    const result = await (await get(app).octokit?.getInstallationOctokit(installation))?.rest.checks.create({
        owner,
        repo,
        name: 'test_check',
        head_sha: commit,
        status: 'in_progress',
        output: {
            title: "Test Check",
            summary: "#Test Check\nThis check will automatically fail in 120 seconds"
        },
        actions: [
            {
                label: "Test Action",
                description: "Action description",
                identifier: "test_action"
            }
        ]
    });

    const checkID = result?.data.id;

    setTimeout(async () => {
        await (await get(app).octokit?.getInstallationOctokit(installation))?.rest.checks.update({
            owner,
            repo,
            check_run_id: checkID,
            status: 'completed',
            conclusion: 'failure',
            output: {
                title: "Test Check",
                summary: "#Test Check\nThis check automatically failed in 120 seconds"
            },
        })
    }, 2 * 60 * 1000);

    return text("asd");
}) satisfies RequestHandler;