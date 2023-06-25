export enum RepoStatus {
    SUCCESS = "success",
    FAILURE = "failure",
    NEUTRAL = "neutral",
    PROGRESS = "progress",
};

export type RepoLastCommit = {
    message: string;
    time: string;
    branch: string;
};

export type RepoDeploy = {
    id?: number;
    project?: string;
    commit: string;
    time: string;
    branch: string;
    status: RepoStatus;
};

export type RepoBuild = RepoDeploy & {
    issue: number;
}

export type RepoInfo = {
    name: string;
    owner: string;
    commit: RepoLastCommit;
    build: RepoBuild | null;
    deploy: RepoDeploy | null;
};