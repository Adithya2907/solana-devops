import type { Octokit } from "octokit";

import type { CustomStore } from "./store";
import type { InfoState } from "./info.cookie";

export type UserState = InfoState & {
    token: string;
    octokit: Octokit;
};

export type UserActions = {
    initialize(token: string, info: InfoState, octokit: Octokit): void;
    logout: () => void;
}

export type UserStore = CustomStore<UserState | null, UserActions>;