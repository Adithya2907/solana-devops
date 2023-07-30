import { error, json } from "@sveltejs/kit";

import { ListenerType } from "@prisma/client";

import { run } from "./utils";

import builders from '$lib/build';

export async function pr(request: Request): Promise<Response> {
    try {
        await run(request, ListenerType.PULL_REQUEST, ['opened', 'synchronize']);
    } catch (err) {
        throw error(400, (err as Error).message);
    } finally {
        builders.clean();
    }

    return json({});
}