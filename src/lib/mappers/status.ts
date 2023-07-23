import { BuildStatus, BuildConclusion } from "@prisma/client";

import { ProjectStatus } from "../types/data";

export function mapStatus(status: BuildStatus, conclusion: BuildConclusion): ProjectStatus {
    return status === BuildStatus.COMPLETED ? conclusion === BuildConclusion.SUCCESS ? ProjectStatus.SUCCESS : ProjectStatus.FAILURE : status === BuildStatus.IN_PROGRESS ? ProjectStatus.PROGRESS : ProjectStatus.NEUTRAL;
}