import { treaty } from '@elysiajs/eden';
import type { App } from '@area/backend/src/app';

export const client = treaty<App>('http://localhost:8080');
