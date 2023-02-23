import type { App } from 'octokit';

import type { CustomStore } from "./store";

export type GHAppState = {
    initialized: boolean;
    octokit: App | null;
};

export type GHAppActions = {
    initialize: () => void;
}

export type GHAppStore = CustomStore<GHAppState, GHAppActions>;