import type { RequestHandler } from "./$types";

import { json } from "@sveltejs/kit";

export const POST = (async ({ fetch, request }) => {
    const event = request.headers.get('X-GitHub-Event');

    const body = await request.json();

    const action = body.action;
    const repo = body.repository;
    const installation = body.installation;

    console.log(event, action, repo.full_name);

    if (event === 'pull_request' && action === 'edited') {
        await fetch('/api/app/comment', {
            method: 'POST',
            body: JSON.stringify({
                owner: repo.owner.login,
                repo: repo.name,
                issue: body.pull_request.number,
                content: 'You just edit a pull request!',
                installation: installation.id
            })
        });
    } else if (event === 'pull_request' && (action === 'opened' || action === 'synchronize')) {
        // await fetch('/api/app/check', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         owner: repo.owner.login,
        //         repo: repo.name,
        //         installation: installation.id,
        //         commit: body.after
        //     })
        // });

        console.log("Starting build");

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

    return json({});
}) satisfies RequestHandler;