import type { RequestHandler } from "./$types";

import type { UserState } from "$lib//types/user.cookie";

import { fail, redirect } from '@sveltejs/kit';

import { UserCookie, UserCookieActions, UserCookieOptions } from "$lib/cookies/user.cookie";

import { getCookie, setCookie } from "$lib/cookie";

export const GET = (async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const action = url.searchParams.get('setup_action');
    const installation = url.searchParams.get('installation_id');

    if (code === null)
        throw fail(400, { code: "Code is a required query parameter" });

    if (action !== null && installation !== null)
        throw redirect(302, '/');

    if (state === null)
        throw fail(400, { state: "State is a required query parameter" });

    let user = getCookie<UserState>(cookies, UserCookie);
    let success = false;

    if (user === undefined)
        throw fail(400, { user: "Could not find user cookie before attempting login" });

    [user, success] = UserCookieActions.callback(user, code, state);

    if (!success)
        throw fail(400, { state: 'Invalid state or code' });

    setCookie(cookies, UserCookie, user, UserCookieOptions);

    throw redirect(302, '/');
}) satisfies RequestHandler;