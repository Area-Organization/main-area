import { getServiceConnections } from '@/api/getServiceConnections';
import type { PageLoad } from './$types';
import { getServices } from '@/api/getServices';

export const ssr = false;

export const load: PageLoad = async ({ }) => {
    return {
        services: await getServices(),
        connections: await getServiceConnections()
    }
};