import type { InboundEmailPayload, ParsedOrder } from '../types.js';
import { detectPlatform } from './detectPlatform.js';
import { parseKnownTemplate } from './htmlParsers.js';
import { parseWithLlmFallback } from './llmFallback.js';

const extractAlias = (toHeader?: string | string[]): string | null => {
  const raw = Array.isArray(toHeader) ? toHeader[0] : toHeader;
  if (!raw) return null;
  const match = raw.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match?.[1]?.toLowerCase() ?? null;
};

export const runParsePipeline = async (
  payload: InboundEmailPayload,
): Promise<{ alias: string | null; parsed: ParsedOrder | null; platform: string }> => {
  const alias = extractAlias(payload.to);
  const platform = detectPlatform(payload.from, payload.subject);
  const html = payload.html ?? '';

  // Stage 2: deterministic HTML
  if (html) {
    const known = parseKnownTemplate(platform, html);
    if (known) {
      return { alias, parsed: known, platform };
    }
  }

  // Stage 3: LLM / heuristic fallback (HTML text or PDF attachment text)
  let rawText = payload.text ?? html.replace(/<[^>]+>/g, ' ');
  const pdfAttachment = payload.attachments?.find((a) =>
    (a.contentType ?? a.filename ?? '').toLowerCase().includes('pdf'),
  );
  if (pdfAttachment?.content) {
    try {
      const pdfParse = (await import('pdf-parse')).default as (
        buf: Buffer,
      ) => Promise<{ text: string }>;
      const buffer = Buffer.from(
        pdfAttachment.content,
        (pdfAttachment.encoding as BufferEncoding) || 'base64',
      );
      const pdf = await pdfParse(buffer);
      rawText = `${rawText}\n${pdf.text}`;
    } catch {
      // ignore PDF parse failures; continue with available text
    }
  }

  const fallback = await parseWithLlmFallback(rawText, platform);
  return { alias, parsed: fallback, platform };
};
