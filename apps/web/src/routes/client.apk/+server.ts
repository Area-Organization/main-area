import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';

export const GET: RequestHandler = async () => {
  const filePath = 'static/apk/client.apk';

  if (!existsSync(filePath)) {
    throw error(404, 'APK file not found');
  }

  const file = readFileSync(filePath);

  return new Response(file, {
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="client.apk"'
    }
  });
};