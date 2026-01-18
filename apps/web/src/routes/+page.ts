import { getStats } from '@/api/getStatistics';
import type { PageLoad } from './$types';
import { getAreas } from '@/api/getAreas';

export const ssr = false;

export const load: PageLoad = async ({ depends }) => {
    return {
        areas: await getAreas(),
        stats: await getStats()
    }
};