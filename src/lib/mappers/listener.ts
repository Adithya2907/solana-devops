import type { Listener } from "@prisma/client";

import type { ListenerInfo } from "../types/data";

import { mapTime } from "./time";

export function mapListener(listener: Listener, date: Parameters<typeof mapTime>[0]): ListenerInfo {
    const result = {
        id: listener.id,
        type: listener.type,
        branch: listener.branch,
        production: listener.production
    };

    if (date) {
        return {
            ...result,
            time: mapTime(date)
        };
    }

    return result;
}