import type { RepoInfoType } from "./utils";

import { error, json } from "@sveltejs/kit";

import { RepoState } from "@prisma/client";

import { getInfo, getUser } from "./utils";

import db from '$lib/db/client';

export async function repo(request: Request): Promise<Response> {
    try {
        const info = await getInfo(request) as RepoInfoType;
        const user = await getUser(info);

        const create = db.repo.createMany({
            data: info.added.map(repo => ({
                name: repo.name,
                fullname: repo.full_name,
                url: `https://www.github.com/${repo.full_name}`,
                state: RepoState.INSTALLED,
                installationID: info.installation,
                ownerID: user.id
            }))
        });

        const remove = db.repo.deleteMany({
            where: {
                fullname: {
                    in: info.removed.map(repo => repo.full_name)
                },
                ownerID: user.id
            }
        });

        db.$transaction([create, remove]);

    } catch (err) {
        throw error(400, (err as Error).message);
    }

    return json({});
}