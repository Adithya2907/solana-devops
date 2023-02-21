import type { CookieSerializeOptions } from "cookie";

import type { UserState } from '$lib//types/user.cookie'

export const UserCookie = 'user';

export const UserCookieOptions: CookieSerializeOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 30
};

export const UserCookieActions = {
    state: (user: UserState): [UserState, string] => {
        const state = 'defaultstate';

        return [{ ...user, state }, state];
    },
    callback: (user: UserState, code: string, state: string): [UserState, boolean] => {
        if (user.state !== state)
            return [user, false];

        return [{
            ...user,
            code,
            authenticating: true,
            state: null
        }, true];
    },
    token: (user: UserState, token: string): UserState => {
        return {
            ...user,
            authenticated: true,
            authenticating: false,
            code: null,
            token
        };
    }
}

export const UserCookieDefaultState: UserState = {
    authenticated: false,
    authenticating: false,
    code: null,
    state: null,
    token: null
};