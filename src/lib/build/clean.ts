import fs from 'node:fs';

import { PUBLIC_REPO_PATH } from '$env/static/public';

export function clean(): boolean {
    if (fs.existsSync(PUBLIC_REPO_PATH)) {
        fs.rmSync(PUBLIC_REPO_PATH, { recursive: true });
    }

    return true;
}