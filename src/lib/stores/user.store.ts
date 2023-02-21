import type { Octokit } from 'octokit';

import type { InfoState } from '../types/info.cookie';
import type { UserState, UserStore } from "../types/user.store";

import { writable } from 'svelte/store';

function getUserState(): UserStore {
    const { subscribe, set } = writable<UserState | null>(null);

    function initialize(token: string, info: InfoState, octokit: Octokit) {
        set({
            token,
            octokit,
            ...info
        });
    }

    function logout() {
        set(null);
    }

    return {
        subscribe,
        initialize,
        logout
    };
}

export const user = getUserState();