import { treaty } from '@elysiajs/eden';
import type { App } from '@area/backend';

export const client = treaty<App>('http://localhost:8080');
