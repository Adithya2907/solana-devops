import type { Actions, PageServerLoad } from './$types';
import type { UserState } from '$lib//types/user.cookie';

import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';

import GHAppStore from '$lib/stores/app.server';

import { UserCookie, UserCookieActions, UserCookieOptions, UserCookieDefaultState } from '$lib/cookies/user.cookie';
import { InfoCookie, InfoCookieOptions } from '$lib/cookies/info.cookie';

import { getCookie, setCookie } from '$lib/cookie';
import { Octokit } from 'octokit';

export const actions = {
    login: async ({ cookies }) => {
        let user = getCookie<UserState>(cookies, UserCookie);
        let state = '';

        if (user !== undefined && user.authenticated)
            throw error(400, 'Already logged in');

        [user, state] = UserCookieActions.state(UserCookieDefaultState);

        setCookie(cookies, UserCookie, user, UserCookieOptions);

        throw redirect(302, `/api/user/login?state=${state}`);
    },
    token: async ({ cookies, locals }) => {
        let user = getCookie<UserState>(cookies, UserCookie);

        if (user === undefined || user.authenticating === false || user.code === null)
            throw error(400, 'Invalid user to fetch token');
        else if (user !== undefined && user.authenticated)
            throw error(400, 'Already logged in');

        const result = await get(GHAppStore).octokit?.oauth.createToken({ code: user.code });
        const token = result?.authentication.token;

        if (token === undefined)
            throw error(500, 'Failed to fetch token');

        user = UserCookieActions.token(user, token);

        const info = await new Octokit().rest.users.getAuthenticated({
            headers: {
                authorization: 'Bearer ' + token
            }
        });

        if (info === undefined)
            throw error(500, "Unable to fetch user information");

        setCookie(cookies, UserCookie, user, UserCookieOptions);
        setCookie(cookies, InfoCookie, info.data, InfoCookieOptions);

        locals.info = info.data;
    },
    logout: async ({ cookies }) => {
        const user = getCookie<UserState>(cookies, UserCookie);

        if (user === undefined || user.authenticated === false)
            throw error(400, 'Not logged in');

        cookies.delete(UserCookie);
        cookies.delete(InfoCookie);

        throw redirect(302, '/');
    },
} satisfies Actions;

export const load = (async ({ cookies, locals }) => {
    try {
        GHAppStore.initialize();
    } catch (err) {
        throw error(500, 'Failed to initialize app');
    }

    const user = getCookie<UserState>(cookies, UserCookie);

    if (user === undefined)
        setCookie(cookies, UserCookie, UserCookieDefaultState, UserCookieOptions);

    return {
        user: user ?? UserCookieDefaultState,
        info: locals.info
    };
}) satisfies PageServerLoad;