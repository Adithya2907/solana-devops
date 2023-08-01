import type { ListenerType } from "@prisma/client";

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
    count: number;
    project?: string;
    commit: string;
    message?: string;
    time: string;
    branch: string;
    status: ProjectStatus;
};

export type ProjectBuild = ProjectDeploy & {
    issue: number;
}

export type ProjectInfo = {
    id: number;
    name: string;
    owner: string;
    commit: ProjectLastCommit;
    build: ProjectBuild | null;
    deploy: ProjectDeploy | null;
};

export type ListenerInfo = {
    id: number;
    type: ListenerType;
    branch: string;
    time?: string;
    production: boolean;
};