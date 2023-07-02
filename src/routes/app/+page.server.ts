import type { Actions } from './$types';
import type { UserState } from '$lib//types/user.cookie';

import { get } from 'svelte/store';
import { error, redirect } from '@sveltejs/kit';

import GHAppStore from '$lib/stores/app.server';

import { UserCookie, UserCookieActions, UserCookieOptions, UserCookieDefaultState } from '$lib/cookies/user.cookie';
import { InfoCookie, InfoCookieOptions } from '$lib/cookies/info.cookie';

import { getCookie, setCookie } from '$lib/cookie';
import { Octokit } from 'octokit';

import db from '$lib/db/client';

export const actions = {
    login: async ({ cookies }) => {
        let user = getCookie<UserState>(cookies, UserCookie);
        let state = '';

        console.log(user);

        if (user !== undefined && user.authenticated)
            throw redirect(302, '/app');

        [user, state] = UserCookieActions.state(UserCookieDefaultState);

        setCookie(cookies, UserCookie, user, UserCookieOptions);

        throw redirect(302, `/api/user/login?state=${state}`);
    },
    token: async ({ cookies, locals }) => {
        let userCookie = getCookie<UserState>(cookies, UserCookie);

        if (userCookie === undefined || userCookie.authenticating === false || userCookie.code === null)
            throw error(400, 'Invalid user to fetch token');
        else if (userCookie !== undefined && userCookie.authenticated)
            throw error(400, 'Already logged in');

        const result = await get(GHAppStore).octokit?.oauth.createToken({ code: userCookie.code });
        const token = result?.authentication.token;

        if (token === undefined)
            throw error(500, 'Failed to fetch token');

        userCookie = UserCookieActions.token(userCookie, token);

        const info = await new Octokit().rest.users.getAuthenticated({
            headers: {
                authorization: 'Bearer ' + token
            }
        });

        if (info === undefined)
            throw error(500, "Unable to fetch user information");

        setCookie(cookies, UserCookie, userCookie, UserCookieOptions);
        setCookie(cookies, InfoCookie, info.data, InfoCookieOptions);

        locals.info = info.data;

        const user = await db.user.findUnique({
            where: {
                login: info.data.login
            }
        });

        if (user === null) {
            await db.user.create({
                data: {
                    login: info.data.login
                }
            });
        }
    },
    logout: async ({ cookies }) => {
        const user = getCookie<UserState>(cookies, UserCookie);

        if (user === undefined || user.authenticated === false)
            throw error(400, 'Not logged in');

        cookies.delete(UserCookie);
        cookies.delete(InfoCookie);

        throw redirect(302, '/');
    },
    project: async ({ request }) => {
        const data = await request.formData();

        if (!data.has('id'))
            throw error(400, 'Missing repo id');

        const id = Number.parseInt(data.get('id') as unknown as string);
        const repo = await db.repo.findUnique({
            where: {
                id: id
            }
        });

        if (repo === null)
            throw error(400, 'Invalid repo id');

        const result = await db.project.create({
            data: {
                name: repo.name.replace('-', ' '),
                ownerID: repo.ownerID,
                repoID: repo.id,
            }
        });

        if (result === null)
            throw error(500, 'Failed to create project');

        return {
            added: id
        }
    }
} satisfies Actions;
