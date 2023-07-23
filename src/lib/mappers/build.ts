import type { Build, Listener, Project } from '@prisma/client';

import type { ProjectBuild } from '../types/data';

import { BuildStatus, BuildConclusion } from '@prisma/client';

import { mapStatus } from "./status";
import { mapTime } from "./time";

export function mapBuild(build: (Build & {
    listener: Listener | null;
}) | (Build & {
    listener: (Listener & {
        project: Project;
    }) | null;
}) | null): ProjectBuild | null {
    if (build === null) return null;

    let mapped: ProjectBuild = {
        id: build.id,
        branch: build?.listener?.branch ?? '',
        commit: build?.commit ?? '',
        time: mapTime(build.started),
        issue: build?.issue ?? 0,
        status: mapStatus(build?.status ?? BuildStatus.COMPLETED, build?.conclusion ?? BuildConclusion.FAILURE)
    };

    if ('project' in (build?.listener ?? {})) {
        mapped = {
            project: (build.listener as (Listener & { project: Project })).project.name,
            ...mapped
        };
    }

    return mapped;
}