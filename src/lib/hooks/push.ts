import { error, json } from "@sveltejs/kit";

import { ListenerType } from "@prisma/client";

import { run } from "./utils";

export async function push(request: Request): Promise<Response> {
    try {
        await run(request, ListenerType.PUSH);
    } catch (err) {
        throw error(400, (err as Error).message);
    }

    return json({});
}