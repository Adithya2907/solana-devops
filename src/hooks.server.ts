import type { Handle } from "@sveltejs/kit";

import type { InfoState } from "$lib//types/info.cookie";

import { InfoCookie } from "$lib//cookies/info.cookie";

import { getCookie } from "$lib/cookie";

export const handle = (async ({ event, resolve }) => {
    const info = getCookie<InfoState>(event.cookies, InfoCookie);

    if (info === undefined)
        return await resolve(event);

    event.locals.info = info;

    return await resolve(event);
}) satisfies Handle;