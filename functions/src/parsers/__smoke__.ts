import { parseKnownTemplate } from './htmlParsers';

const trendyolSample = `
<html><body>
  <div data-order-id="TY-1001"></div>
  <div data-product data-qty="1" data-price="2499,00">
    <span data-product-name>Kablosuz Kulaklık</span>
  </div>
  <div data-total>2.499,00</div>
  Sipariş No: TY-1001 Toplam: 2.499,00 İndirim: 200,00 Kargo: 0,00
</body></html>
`;

const result = parseKnownTemplate('Trendyol', trendyolSample);
if (!result || result.order_id !== 'TY-1001') {
  console.error('Parser smoke failed', result);
  process.exit(1);
}
console.log('Parser smoke OK', result.order_id, result.total_amount);
