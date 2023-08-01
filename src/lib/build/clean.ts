import type { Build } from '@prisma/client';

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_REPO_PATH } from '$env/static/public';

export function clean(build: Build): boolean {
    const base = path.join(PUBLIC_REPO_PATH, build.id.toString());

    if (fs.existsSync(base)) {
        fs.rmSync(base, { recursive: true });
    }

    return true;
}