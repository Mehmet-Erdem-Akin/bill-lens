import type { ParsedOrder } from '../types';

const EXTRACTION_PROMPT =
  'Extract e-commerce invoice fields as JSON with keys: platform_name, order_date, order_id, total_amount, discount_amount, shipping_fee, items[{product_name,quantity,unit_price,category}]';

const heuristicParse = (
  rawText: string,
  platformHint: string,
): ParsedOrder | null => {
  const orderIdMatch = rawText.match(
    /(?:Sipariş|Order)\s*(?:No|ID|#)?[:\s]*([A-Z0-9-]+)/i,
  );
  const amountMatch = rawText.match(/(?:Toplam|Total|Ödenen)[:\s]*([\d.,]+)/i);

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
};

/**
 * Structured JSON fallback for unknown templates / PDF e-Arşiv text.
 * Uses Google AI Studio Gemini (`GEMINI_API_KEY`). Without a key, returns a heuristic stub.
 */
export const parseWithLlmFallback = async (
  rawText: string,
  platformHint = 'Unknown',
): Promise<ParsedOrder | null> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return heuristicParse(rawText, platformHint);
  }

  const model = process.env.LLM_MODEL ?? 'gemini-3.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${EXTRACTION_PROMPT}\n\n---\n${rawText.slice(0, 12000)}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0,
      },
    }),
  });

  if (!response.ok) return null;

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) return null;

  return JSON.parse(content) as ParsedOrder;
};
