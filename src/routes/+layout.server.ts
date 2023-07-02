import type { LayoutServerLoad } from './$types';
import type { UserState } from '$lib//types/user.cookie';

import { error } from '@sveltejs/kit';

import GHAppStore from '$lib/stores/app.server';

import { UserCookie, UserCookieOptions, UserCookieDefaultState } from '$lib/cookies/user.cookie';

import { getCookie, setCookie } from '$lib/cookie';

import db from '$lib/db/client';

export const load = (async ({ cookies, locals }) => {
    try {
        GHAppStore.initialize();
    } catch (err) {
        throw error(500, 'Failed to initialize app');
    }

    const userCookie = getCookie<UserState>(cookies, UserCookie);

    if (userCookie === undefined)
        setCookie(cookies, UserCookie, UserCookieDefaultState, UserCookieOptions);

    let user = null;

    if (locals.info) {
        user = await db.user.findUnique({
            where: {
                login: locals.info.login
            },
            include: {
                repos: true,
                projects: {
                    include: {
                        repo: true
                    }
                }
            }
        });
    }

    return {
        userCookie: userCookie ?? UserCookieDefaultState,
        info: locals.info,
        user
    };
}) satisfies LayoutServerLoad;