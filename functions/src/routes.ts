import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

import {
  createInboundAlias,
  db,
  deleteUserData,
  ensureUserProfile,
  toFirestorePlatform,
} from './db';
import { runParsePipeline } from './parsers/pipeline';
import type { InboundEmailPayload } from './types';

export const router = Router();

const requireAuth = async (
  authorization?: string | string[],
): Promise<{ uid: string; email?: string } | null> => {
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!value?.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length);
  try {
    const { auth } = await import('./db');
    const decoded = await auth.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
};

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bill-lens-api', runtime: 'firebase-functions' });
});

router.post('/auth/register', async (req, res) => {
  const authed = await requireAuth(req.headers.authorization);
  if (!authed) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const schema = z.object({
    email: z.string().email().optional(),
    authProvider: z.enum(['apple', 'email']).default('email'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const email = (parsed.data.email || authed.email || '').toLowerCase();
  if (!email) {
    res.status(400).json({ error: 'email_required' });
    return;
  }

  const user = await ensureUserProfile(authed.uid, email, parsed.data.authProvider);
  res.status(201).json(user);
});

router.post('/webhooks/inbound-email', async (req, res) => {
  const secret = process.env.INBOUND_WEBHOOK_SECRET;
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';
  // Production: secret zorunlu — URL bilinse bile 3. şahıs webhook atamaz
  if (!secret && !isEmulator) {
    res.status(503).json({ error: 'webhook_secret_not_configured' });
    return;
  }
  if (secret) {
    const provided = req.headers['x-webhook-secret'];
    if (provided !== secret) {
      res.status(401).json({ error: 'invalid_webhook_secret' });
      return;
    }
  }

  const payload = req.body as InboundEmailPayload;
  const { alias, parsed, platform } = await runParsePipeline(payload);

  if (!alias || !parsed) {
    res.status(202).json({ accepted: true, stored: false, reason: 'unparsed_or_unknown_alias' });
    return;
  }

  const aliasDoc = await db.collection('inboundAliases').doc(alias.toLowerCase()).get();
  if (!aliasDoc.exists) {
    res.status(202).json({ accepted: true, stored: false, reason: 'user_not_found' });
    return;
  }

  const userId = String(aliasDoc.data()?.userId || '');
  if (!userId) {
    res.status(202).json({ accepted: true, stored: false, reason: 'user_not_found' });
    return;
  }

  const ordersRef = db.collection('users').doc(userId).collection('orders');
  const duplicate = await ordersRef
    .where('externalOrderId', '==', parsed.order_id)
    .limit(1)
    .get();

  if (!duplicate.empty) {
    res.json({
      accepted: true,
      stored: false,
      reason: 'duplicate',
      orderId: duplicate.docs[0]?.id,
    });
    return;
  }

  const orderRef = ordersRef.doc();
  const order = {
    platform: toFirestorePlatform(parsed.platform_name || platform),
    externalOrderId: parsed.order_id,
    orderDate: new Date(parsed.order_date),
    subtotal: parsed.total_amount + parsed.discount_amount,
    discountTotal: parsed.discount_amount,
    shippingTotal: parsed.shipping_fee,
    grandTotal: parsed.total_amount,
    currency: 'TRY',
    items: parsed.items.map((item, index) => ({
      id: `${orderRef.id}-${index}`,
      rawProductName: item.product_name,
      normalizedProductName: item.product_name.trim(),
      quantity: item.quantity || 1,
      unitPrice: item.unit_price,
      totalPrice: item.unit_price * (item.quantity || 1),
      category: item.category,
    })),
    createdAt: FieldValue.serverTimestamp(),
  };

  await orderRef.set(order);
  res.status(201).json({ accepted: true, stored: true, order: { id: orderRef.id, ...order } });
});

router.delete('/user/account', async (req, res) => {
  const authed = await requireAuth(req.headers.authorization);
  if (!authed) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  await deleteUserData(authed.uid);
  res.status(204).send();
});

router.patch('/user/budget', async (req, res) => {
  const authed = await requireAuth(req.headers.authorization);
  if (!authed) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const schema = z.object({
    monthlyBudgetLimit: z.number().nonnegative(),
    budgetEnabled: z.boolean().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userRef = db.collection('users').doc(authed.uid);
  const snap = await userRef.get();
  if (!snap.exists) {
    res.status(404).json({ error: 'user_not_found' });
    return;
  }

  await userRef.update({
    monthlyBudgetLimit: parsed.data.monthlyBudgetLimit,
    ...(parsed.data.budgetEnabled !== undefined
      ? { budgetEnabled: parsed.data.budgetEnabled }
      : {}),
  });

  const updated = await userRef.get();
  res.json({ id: authed.uid, ...updated.data() });
});

// Kept for local tooling / docs — alias generator without auth (emulator only)
router.post('/dev/preview-alias', (req, res) => {
  if (process.env.FUNCTIONS_EMULATOR !== 'true') {
    res.status(404).end();
    return;
  }
  const email = String(req.body?.email || 'user@example.com');
  res.json({ inboundAlias: createInboundAlias(email) });
});
