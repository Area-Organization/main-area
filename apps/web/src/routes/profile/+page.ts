import { getServices } from '@/api/getServices';
import { getServiceConnections } from '@/api/getServiceConnections';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ depends }) => {
    depends('app:connections');

    const [services, connections] = await Promise.all([
        getServices(),
        getServiceConnections()
    ]);

    return {
        services,
        connections
    };
};