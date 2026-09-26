import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.factory';

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  appPromise ??= createApp().then(async (app) => {
    await app.init();
    return app;
  });
  const app = await appPromise;
  return app.getHttpAdapter().getInstance()(req, res);
}
