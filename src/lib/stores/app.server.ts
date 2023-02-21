import type { GHAppState, GHAppStore } from '$lib/types/app.store';

import { writable } from 'svelte/store';

import { App } from 'octokit';

import { GITHUB_APP_IDENTIFIER, GITHUB_PRIVATE_KEY, GITHUB_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GITHUB_CLIENT_ID } from '$env/static/public';

const GHAppStateDefault: GHAppState = {
    initialized: false,
    octokit: null
};

export function getAppStore(): GHAppStore {
    const { subscribe, update } = writable(GHAppStateDefault);

    function initialize() {
        const octokit = new App({
            appId: GITHUB_APP_IDENTIFIER,
            privateKey: GITHUB_PRIVATE_KEY,
            oauth: {
                clientId: PUBLIC_GITHUB_CLIENT_ID,
                clientSecret: GITHUB_CLIENT_SECRET
            }
        });

        update(state => ({
            ...state,
            octokit
        }));
    }

    return {
        subscribe,
        initialize,
    }
}

export default getAppStore();