import * as cheerio from 'cheerio';

import type { ParsedOrder } from '../types.js';
import type { DetectedPlatform } from './detectPlatform.js';

const parseMoney = (raw?: string | null): number => {
  if (!raw) return 0;
  const cleaned = raw
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
};

const textOf = ($: cheerio.CheerioAPI, selector: string): string =>
  $(selector).first().text().replace(/\s+/g, ' ').trim();

export const parseTrendyolHtml = (html: string): ParsedOrder | null => {
  const $ = cheerio.load(html);
  const orderId =
    textOf($, '[data-order-id]') ||
    $('body').text().match(/Sipariş\s*No[:\s]*([A-Z0-9-]+)/i)?.[1];
  if (!orderId) return null;

  const total =
    parseMoney(textOf($, '[data-total]')) ||
    parseMoney($('body').text().match(/Toplam[:\s]*([\d.,]+)/i)?.[1]);
  const discount = parseMoney($('body').text().match(/İndirim[:\s]*([\d.,]+)/i)?.[1]);
  const shipping = parseMoney($('body').text().match(/Kargo[:\s]*([\d.,]+)/i)?.[1]);

  const items = $('[data-product-name]')
    .map((_, el) => {
      const row = $(el).closest('[data-product]') || $(el).parent();
      const name = $(el).text().trim();
      const quantity = Number(row.attr('data-qty') || 1);
      const unitPrice = parseMoney(row.attr('data-price') || row.find('[data-price]').text());
      return {
        product_name: name,
        quantity,
        unit_price: unitPrice,
        category: 'Genel',
      };
    })
    .get();

  return {
    platform_name: 'Trendyol',
    order_date: new Date().toISOString(),
    order_id: orderId,
    total_amount: total,
    discount_amount: discount,
    shipping_fee: shipping,
    items:
      items.length > 0
        ? items
        : [
            {
              product_name: 'Trendyol Siparişi',
              quantity: 1,
              unit_price: total,
              category: 'Genel',
            },
          ],
  };
};

export const parseYemeksepetiHtml = (html: string): ParsedOrder | null => {
  const $ = cheerio.load(html);
  const orderId =
    textOf($, '[data-order-id]') ||
    $('body').text().match(/Sipariş\s*(?:No|Numarası)[:\s]*([A-Z0-9-]+)/i)?.[1];
  if (!orderId) return null;

  const total =
    parseMoney(textOf($, '[data-total]')) ||
    parseMoney($('body').text().match(/Ödenen\s*Tutar[:\s]*([\d.,]+)/i)?.[1]);

  return {
    platform_name: 'Yemeksepeti',
    order_date: new Date().toISOString(),
    order_id: orderId,
    total_amount: total,
    discount_amount: parseMoney($('body').text().match(/İndirim[:\s]*([\d.,]+)/i)?.[1]),
    shipping_fee: 0,
    items: [
      {
        product_name: textOf($, '[data-product-name]') || 'Yemek Siparişi',
        quantity: 1,
        unit_price: total,
        category: 'Yemek',
      },
    ],
  };
};

export const parseGetirHtml = (html: string): ParsedOrder | null => {
  const $ = cheerio.load(html);
  const orderId =
    textOf($, '[data-order-id]') ||
    $('body').text().match(/Sipariş\s*Kodu[:\s]*([A-Z0-9-]+)/i)?.[1];
  if (!orderId) return null;

  const total =
    parseMoney(textOf($, '[data-total]')) ||
    parseMoney($('body').text().match(/Toplam[:\s]*([\d.,]+)/i)?.[1]);

  return {
    platform_name: 'Getir',
    order_date: new Date().toISOString(),
    order_id: orderId,
    total_amount: total,
    discount_amount: parseMoney($('body').text().match(/İndirim[:\s]*([\d.,]+)/i)?.[1]),
    shipping_fee: parseMoney($('body').text().match(/Getirme\s*Ücreti[:\s]*([\d.,]+)/i)?.[1]),
    items: [
      {
        product_name: textOf($, '[data-product-name]') || 'Getir Siparişi',
        quantity: 1,
        unit_price: total,
        category: 'Market',
      },
    ],
  };
};

export const parseKnownTemplate = (
  platform: DetectedPlatform,
  html: string,
): ParsedOrder | null => {
  switch (platform) {
    case 'Trendyol':
      return parseTrendyolHtml(html);
    case 'Yemeksepeti':
      return parseYemeksepetiHtml(html);
    case 'Getir':
      return parseGetirHtml(html);
    default:
      return null;
  }
};
