import { create } from 'zustand';

import {
  demoConnectedAccounts,
  demoDashboard,
  demoOrders,
  demoProducts,
  demoSavings,
} from '../data/demoData';
import type {
  ConnectedAccount,
  DashboardSummary,
  Order,
  SavingsSummary,
  TrackedProduct,
} from '../types';

type AppState = {
  orders: Order[];
  products: TrackedProduct[];
  dashboard: DashboardSummary;
  savings: SavingsSummary;
  connectedAccounts: ConnectedAccount[];
  selectedMonthLabel: string;
  savingsPeriod: 'Bu Ay' | 'Son 3 Ay' | 'Son 6 Ay' | 'Bu Yıl';
  productsTab: 'Fiyat Geçmişi' | 'Enflasyon & Artış' | 'Ürün Analizi';
  privacyAccepted: boolean;
  setSavingsPeriod: (period: AppState['savingsPeriod']) => void;
  setProductsTab: (tab: AppState['productsTab']) => void;
  setPrivacyAccepted: (value: boolean) => void;
  toggleProductFollow: (productId: string) => void;
  disconnectAccount: (provider: ConnectedAccount['provider']) => void;
  connectAccount: (provider: ConnectedAccount['provider'], email: string) => void;
  deleteAllLocalData: () => void;
  loadDemoData: () => void;
};

const emptyDashboard = (): DashboardSummary => ({
  monthlySpend: 0,
  vsLastMonthPercent: 0,
  budgetLimit: 0,
  spent: 0,
  remaining: 0,
  progressPercent: 0,
  platformShares: [],
  recentOrders: [],
});

const emptySavings = (): SavingsSummary => ({
  totalSavings: 0,
  vsLastMonthPercent: 0,
  couponDiscounts: 0,
  couponCount: 0,
  productDiscounts: 0,
  discountedProductCount: 0,
  paidShipping: 0,
  freeShippingValue: 0,
  freeShippingThreshold: 400,
  cartTowardFreeShipping: 0,
  insightText: 'Henüz tasarruf verisi yok. E-posta bağlayarak başlayın.',
  avgCartSavingsPercent: 0,
});

export const useAppStore = create<AppState>((set) => ({
  orders: demoOrders,
  products: demoProducts,
  dashboard: demoDashboard,
  savings: demoSavings,
  connectedAccounts: demoConnectedAccounts,
  selectedMonthLabel: 'Kasım 2026',
  savingsPeriod: 'Bu Ay',
  productsTab: 'Fiyat Geçmişi',
  privacyAccepted: false,
  setSavingsPeriod: (period) => set({ savingsPeriod: period }),
  setProductsTab: (tab) => set({ productsTab: tab }),
  setPrivacyAccepted: (value) => set({ privacyAccepted: value }),
  toggleProductFollow: (productId) =>
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId
          ? { ...product, isFollowing: !product.isFollowing }
          : product,
      ),
    })),
  disconnectAccount: (provider) =>
    set((state) => ({
      connectedAccounts: state.connectedAccounts.map((account) =>
        account.provider === provider
          ? { ...account, isActive: false, email: undefined }
          : account,
      ),
    })),
  connectAccount: (provider, email) =>
    set((state) => {
      const exists = state.connectedAccounts.some((a) => a.provider === provider);
      if (exists) {
        return {
          connectedAccounts: state.connectedAccounts.map((account) =>
            account.provider === provider
              ? {
                  ...account,
                  isActive: true,
                  email,
                  lastSyncAt: new Date().toISOString(),
                }
              : account,
          ),
        };
      }
      return {
        connectedAccounts: [
          ...state.connectedAccounts,
          {
            provider,
            email,
            isActive: true,
            lastSyncAt: new Date().toISOString(),
          },
        ],
      };
    }),
  deleteAllLocalData: () =>
    set({
      orders: [],
      products: [],
      dashboard: emptyDashboard(),
      savings: emptySavings(),
      connectedAccounts: [],
      privacyAccepted: false,
    }),
  loadDemoData: () =>
    set({
      orders: demoOrders,
      products: demoProducts,
      dashboard: demoDashboard,
      savings: demoSavings,
      connectedAccounts: demoConnectedAccounts,
    }),
}));
