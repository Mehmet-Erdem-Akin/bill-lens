export type ParsedOrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  category?: string;
};

export type ParsedOrder = {
  platform_name: string;
  order_date: string;
  order_id: string;
  total_amount: number;
  discount_amount: number;
  shipping_fee: number;
  items: ParsedOrderItem[];
};

export type InboundEmailPayload = {
  to?: string | string[];
  from?: string;
  subject?: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename?: string;
    contentType?: string;
    content?: string;
    encoding?: string;
  }>;
};
