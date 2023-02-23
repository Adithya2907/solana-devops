import type { Octokit } from "octokit";

export type InfoState = Awaited<ReturnType<Octokit['rest']['users']['getAuthenticated']>>['data'];