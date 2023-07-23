import type { Build, Deploy, Listener, Project } from '@prisma/client';

import type { ProjectDeploy } from '../types/data';

import { BuildStatus, BuildConclusion } from '@prisma/client';

import { mapStatus } from './status';
import { mapTime } from './time';

export function mapDeploy(deploy: (Deploy & {
    listener: Listener | null;
    build: Build | null;
}) | null | (Deploy & {
    listener: (Listener & {
        project: Project;
    }) | null;
    build: Build | null;
})): ProjectDeploy | null {
    if (deploy === null) return null;

    let mapped: ProjectDeploy = {
        id: deploy.id,
        branch: deploy?.listener?.branch ?? '',
        commit: deploy?.build?.commit ?? '',
        time: mapTime(deploy.deployed),
        status: mapStatus(deploy?.status ?? BuildStatus.COMPLETED, deploy?.conclusion ?? BuildConclusion.FAILURE)
    };

    if ('project' in (deploy?.listener ?? {})) {
        mapped = {
            project: (deploy.listener as (Listener & { project: Project })).project.name,
            ...mapped
        };
    }

    return mapped;
}