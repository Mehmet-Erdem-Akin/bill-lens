import cors from 'cors';
import express from 'express';
import * as functionsV1 from 'firebase-functions/v1';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';

import { ensureUserProfile } from './db';
import { router } from './routes';

setGlobalOptions({
  region: 'europe-west1',
  maxInstances: 20,
});

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', router);
app.use('/', router);

/** HTTPS API — inbound webhook, auth helpers, account lifecycle */
export const api = onRequest(
  {
    timeoutSeconds: 60,
    memory: '512MiB',
    invoker: 'public',
  },
  app,
);

/** Create Firestore profile + inbound alias when a Firebase Auth user is created */
export const onAuthUserCreate = functionsV1
  .region('europe-west1')
  .auth.user()
  .onCreate(async (user) => {
    const email = user.email || `${user.uid}@users.billlens.app`;
    const provider = user.providerData.some((p) => p.providerId === 'apple.com')
      ? 'apple'
      : 'email';
    await ensureUserProfile(user.uid, email, provider);
  });
