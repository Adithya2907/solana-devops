import type { Actions, PageServerLoad } from './$types';

import { ListenerType, DeployTarget } from '@prisma/client'

import { get } from 'svelte/store';

import { error, fail } from '@sveltejs/kit';

import GHAppStore from '$lib/stores/app.server';
import db from '$lib/db/client';

export const actions = {
    "listener:add": async ({ request }) => {
        const data = await request.formData();

        const errors: Record<string, string> = {};

        const branch = data.get("branch")?.toString();
        const type = data.get("type")?.toString();
        const autodeploy = data.get("autodeploy")?.toString() === "on" ? true : false;
        const deploytarget = data.get("deploytarget")?.toString();
        const repoID = data.get("repoID")?.toString();

        if (branch === null || branch === undefined)
            errors["branch"] = "Branch is required";
        if (type === null || type === undefined)
            errors["type"] = "Type is required";
        if (autodeploy === null || autodeploy === undefined)
            errors["autodeploy"] = "Autodeploy is required";
        if (deploytarget === null || deploytarget === undefined)
            errors["deploytarget"] = "Deploy target is required";
        if (repoID === null || repoID === undefined)
            errors["repoID"] = "Repo ID is required";

        if (Object.keys(errors).length > 0)
            return fail(400, errors);

        await db.listener.create({
            data: {
                branch,
                type: ListenerType[type],
                autodeploy,
                deploytarget: DeployTarget[deploytarget],
                repoID: parseInt(repoID)
            }
        });
    }
} satisfies Actions;

export const load = (async ({ params, parent }) => {
    const { user } = await parent();
    const name = params.name;

    const partial = user?.repos.find(repo => repo.name === name);

    if (partial === undefined)
        throw error(404, 'Could not find repo');

    const octokit = await get(GHAppStore).octokit?.getInstallationOctokit(partial.installationID)
    const result = await octokit?.rest.repos.listBranches({
        owner: user?.login ?? '',
        repo: name
    });

    if (result === undefined)
        throw error(500, 'Could not fetch branches for repo');

    const repo = await db.repo.findUnique({
        where: {
            fullname: partial.fullname
        },
        include: {
            listeners: true,
        },
    });

    const branches = result.data;

    return {
        repo,
        branches
    };
}) satisfies PageServerLoad;