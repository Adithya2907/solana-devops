import type { PageServerLoad } from './$types';

import { DeployTarget } from '@prisma/client';

import { error } from '@sveltejs/kit';

const TargetMapping: Record<DeployTarget, string> = {
    [DeployTarget.DEV]: 'devnet',
    [DeployTarget.TEST]: 'testnet',
    [DeployTarget.PROD]: 'mainnet'
};

export const load = (async ({ parent }) => {
    const { idl } = await parent();

    if (idl.deploy === null || idl.deploy.listener === null)
        throw error(400, 'This IDL has not been deployed');

    return {
        cluster: TargetMapping[idl.deploy.listener.deploytarget]
    };
}) satisfies PageServerLoad;