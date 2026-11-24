import type { ParsedOrder } from '../types.js';

/**
 * Structured JSON fallback for unknown templates / PDF e-Arşiv text.
 * Wire OPENAI_API_KEY (or similar) in production. Locally returns a heuristic stub.
 */
export const parseWithLlmFallback = async (
  rawText: string,
  platformHint = 'Unknown',
): Promise<ParsedOrder | null> => {
  const apiKey = process.env.OPENAI_API_KEY;
  const orderIdMatch = rawText.match(/(?:Sipariş|Order)\s*(?:No|ID|#)?[:\s]*([A-Z0-9-]+)/i);
  const amountMatch = rawText.match(/(?:Toplam|Total|Ödenen)[:\s]*([\d.,]+)/i);

  if (!apiKey) {
    if (!orderIdMatch) return null;
    const total = Number(
      (amountMatch?.[1] ?? '0').replace(/\./g, '').replace(',', '.'),
    );
    return {
      platform_name: platformHint,
      order_date: new Date().toISOString(),
      order_id: orderIdMatch[1],
      total_amount: Number.isFinite(total) ? total : 0,
      discount_amount: 0,
      shipping_fee: 0,
      items: [
        {
          product_name: 'Ayrıştırılan Sipariş',
          quantity: 1,
          unit_price: Number.isFinite(total) ? total : 0,
          category: 'Genel',
        },
      ],
    };
  }

  // Production path — keep payload schema-aligned for Structured Outputs
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Extract e-commerce invoice fields as JSON with keys: platform_name, order_date, order_id, total_amount, discount_amount, shipping_fee, items[{product_name,quantity,unit_price,category}]',
        },
        { role: 'user', content: rawText.slice(0, 12000) },
      ],
    }),
  });

  if (!response.ok) return null;
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content) as ParsedOrder;
};
