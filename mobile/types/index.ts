export type AuthProvider = 'apple' | 'email' | 'demo';

export type PlatformName =
  | 'Trendyol'
  | 'Yemeksepeti'
  | 'Getir'
  | 'Amazon TR'
  | 'Hepsiburada';

export type OrderStatus = 'Teslim edildi' | 'Kargoda' | 'Hazırlanıyor' | 'İptal';

export type ConnectedProvider = 'gmail' | 'outlook' | 'inbound';

export type OrderItem = {
  id: string;
  rawProductName: string;
  normalizedProductName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  imageKey?: keyof typeof import('../theme/asset-map').illustrations;
};

export type Order = {
  id: string;
  platform: PlatformName;
  externalOrderId: string;
  orderDate: string;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  currency: 'TRY';
  category?: string;
  status: OrderStatus;
  items: OrderItem[];
  productImageKey?: keyof typeof import('../theme/asset-map').illustrations;
  productTitle: string;
};

export type PlatformShare = {
  platform: PlatformName;
  amount: number;
  percent: number;
  color: string;
};

export type PriceHistoryPoint = {
  date: string;
  price: number;
};

export type TrackedProduct = {
  id: string;
  category: string;
  name: string;
  imageKey: keyof typeof import('../theme/asset-map').illustrations;
  currentPrice: number;
  threeMonthChangePercent: number;
  cheapestDate: string;
  cheapestPrice: number;
  cheapestPlatform: PlatformName;
  history: PriceHistoryPoint[];
  isFollowing: boolean;
};

export type ConnectedAccount = {
  provider: ConnectedProvider;
  email?: string;
  isActive: boolean;
  lastSyncAt?: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  authProvider: AuthProvider;
  inboundAlias: string;
  monthlyBudgetLimit: number;
  budgetEnabled: boolean;
};

export type SavingsSummary = {
  totalSavings: number;
  vsLastMonthPercent: number;
  couponDiscounts: number;
  couponCount: number;
  productDiscounts: number;
  discountedProductCount: number;
  paidShipping: number;
  freeShippingValue: number;
  freeShippingThreshold: number;
  cartTowardFreeShipping: number;
  insightText: string;
  avgCartSavingsPercent: number;
};

export type DashboardSummary = {
  monthlySpend: number;
  vsLastMonthPercent: number;
  budgetLimit: number;
  spent: number;
  remaining: number;
  progressPercent: number;
  platformShares: PlatformShare[];
  recentOrders: Order[];
};
