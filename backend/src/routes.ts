import { Router } from 'express';
import { z } from 'zod';

import { createInboundAlias, prisma, toPrismaPlatform } from './db.js';
import { runParsePipeline } from './parsers/pipeline.js';
import type { InboundEmailPayload } from './types.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'bill-lens-api' });
});

router.post('/auth/register', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    authProvider: z.enum(['apple', 'email']).default('email'),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, authProvider } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.json(existing);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      authProvider,
      inboundAlias: createInboundAlias(email),
      monthlyBudgetLimit: 15000,
      connectedAccounts: {
        create: { provider: 'inbound', isActive: true },
      },
    },
  });

  res.status(201).json(user);
});

router.post('/webhooks/inbound-email', async (req, res) => {
  const payload = req.body as InboundEmailPayload;
  const { alias, parsed, platform } = await runParsePipeline(payload);

  if (!alias || !parsed) {
    res.status(202).json({ accepted: true, stored: false, reason: 'unparsed_or_unknown_alias' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { inboundAlias: alias } });
  if (!user) {
    res.status(202).json({ accepted: true, stored: false, reason: 'user_not_found' });
    return;
  }

  // Idempotency: unique (userId, externalOrderId)
  const existing = await prisma.order.findUnique({
    where: {
      userId_externalOrderId: {
        userId: user.id,
        externalOrderId: parsed.order_id,
      },
    },
  });
  if (existing) {
    res.json({ accepted: true, stored: false, reason: 'duplicate', orderId: existing.id });
    return;
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      platform: toPrismaPlatform(parsed.platform_name || platform),
      externalOrderId: parsed.order_id,
      orderDate: new Date(parsed.order_date),
      subtotal: parsed.total_amount + parsed.discount_amount,
      discountTotal: parsed.discount_amount,
      shippingTotal: parsed.shipping_fee,
      grandTotal: parsed.total_amount,
      currency: 'TRY',
      items: {
        create: parsed.items.map((item) => ({
          rawProductName: item.product_name,
          normalizedProductName: item.product_name.trim(),
          quantity: item.quantity || 1,
          unitPrice: item.unit_price,
          totalPrice: item.unit_price * (item.quantity || 1),
        })),
      },
    },
    include: { items: true },
  });

  res.status(201).json({ accepted: true, stored: true, order });
});

router.delete('/user/account', async (req, res) => {
  const userId = String(req.headers['x-user-id'] || '');
  const email = String(req.headers['x-user-email'] || '');

  if (!userId && !email) {
    res.status(400).json({ error: 'x-user-id or x-user-email required' });
    return;
  }

  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(404).json({ error: 'user_not_found' });
    return;
  }

  // Cascades delete connected_accounts, orders, order_items
  await prisma.user.delete({ where: { id: user.id } });
  res.status(204).send();
});

router.patch('/user/budget', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    monthlyBudgetLimit: z.number().nonnegative(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.update({
    where: { email: parsed.data.email },
    data: { monthlyBudgetLimit: parsed.data.monthlyBudgetLimit },
  });
  res.json(user);
});
