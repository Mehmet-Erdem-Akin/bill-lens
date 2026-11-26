import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, ShoppingBag } from 'lucide-react-native';

import { illustrations, platformPlaceholders } from '../../theme/asset-map';
import { tokens } from '../../theme/tokens';
import type { Order, PlatformName } from '../../types';
import { formatCurrency, formatShortDate } from '../../utils/format';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

const platformKey: Record<PlatformName, keyof typeof platformPlaceholders> = {
  Trendyol: 'trendyol',
  Yemeksepeti: 'yemeksepeti',
  Getir: 'getir',
  'Amazon TR': 'amazon-tr',
  Hepsiburada: 'hepsiburada',
};

type RecentOrdersProps = {
  orders: Order[];
  onSeeAll?: () => void;
};

export const RecentOrders = ({ orders, onSeeAll }: RecentOrdersProps) => (
  <View>
    <SectionHeader
      title="Son Siparişler"
      icon={<ShoppingBag size={20} color={tokens.colors.primary} />}
      actionLabel="Tümünü Gör >"
      onActionPress={onSeeAll}
    />
    <View style={styles.list}>
      {orders.map((order) => (
        <Card key={order.id} style={styles.item}>
          <View style={styles.row}>
            <Image
              source={platformPlaceholders[platformKey[order.platform]]}
              style={styles.platformLogo}
              accessibilityLabel={order.platform}
            />
            {order.productImageKey ? (
              <Image
                source={illustrations[order.productImageKey]}
                style={styles.productImage}
                resizeMode="contain"
                accessible={false}
              />
            ) : (
              <View style={[styles.productImage, styles.placeholder]} />
            )}
            <View style={styles.meta}>
              <Text style={styles.title} numberOfLines={1}>
                {order.productTitle}
              </Text>
              <Text style={styles.date}>{formatShortDate(order.orderDate)}</Text>
              <View style={styles.status}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
            <Text style={styles.price}>{formatCurrency(order.grandTotal)}</Text>
          </View>
        </Card>
      ))}
      {orders.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Henüz sipariş yok. Demo veriler veya e-posta bağlantısı ile başlayın.</Text>
        </Card>
      ) : null}
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          accessibilityRole="button"
          accessibilityLabel="Tüm siparişleri gör"
          style={styles.seeAll}
        >
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
          <ChevronRight size={16} color={tokens.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  list: {
    gap: tokens.spacing.md,
  },
  item: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: tokens.colors.primaryLight,
  },
  placeholder: {
    backgroundColor: tokens.colors.track,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 14,
    color: tokens.colors.text,
  },
  date: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.textMuted,
  },
  status: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.savingsLight,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  statusText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 11,
    color: tokens.colors.savingsDark,
  },
  price: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 14,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.body,
    color: tokens.colors.textSecondary,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  seeAllText: {
    color: tokens.colors.primary,
    fontFamily: tokens.fontFamily.medium,
  },
});
