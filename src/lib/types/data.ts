export enum ProjectStatus {
    SUCCESS = "success",
    FAILURE = "failure",
    NEUTRAL = "neutral",
    PROGRESS = "progress",
};

export type ProjectLastCommit = {
    message: string;
    time: string;
    branch: string;
};

export type ProjectDeploy = {
    id?: number;
    project?: string;
    commit: string;
    time: string;
    branch: string;
    status: ProjectStatus;
};

export type ProjectBuild = ProjectDeploy & {
    issue: number;
}

export type ProjectInfo = {
    name: string;
    owner: string;
    commit: ProjectLastCommit;
    build: ProjectBuild | null;
    deploy: ProjectDeploy | null;
};