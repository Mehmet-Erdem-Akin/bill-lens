import { Receipt, Search } from 'lucide-react-native';
import { FlatList, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/appStore';
import { illustrations, platformPlaceholders } from '@/theme/asset-map';
import { tokens } from '@/theme/tokens';
import type { PlatformName } from '@/types';
import { formatCurrency, formatShortDate } from '@/utils/format';

const platformKey: Record<PlatformName, keyof typeof platformPlaceholders> = {
  Trendyol: 'trendyol',
  Yemeksepeti: 'yemeksepeti',
  Getir: 'getir',
  'Amazon TR': 'amazon-tr',
  Hepsiburada: 'hepsiburada',
};

export default function ExpensesScreen() {
  const orders = useAppStore((s) => s.orders);
  const [query, setQuery] = useState('');

  const filtered = orders.filter((order) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      order.productTitle.toLowerCase().includes(q) ||
      order.platform.toLowerCase().includes(q) ||
      order.externalOrderId.toLowerCase().includes(q)
    );
  });

  const total = filtered.reduce((sum, order) => sum + order.grandTotal, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Receipt size={22} color={tokens.colors.primary} />
          <Text style={styles.title}>Harcamalar</Text>
        </View>
        <Text style={styles.subtitle}>Tüm sipariş ve fatura özetlerin</Text>
      </View>

      <View style={styles.searchWrap}>
        <Search size={18} color={tokens.colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sipariş veya platform ara"
          placeholderTextColor={tokens.colors.textMuted}
          style={styles.search}
          accessibilityLabel="Harcama ara"
        />
      </View>

      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>{filtered.length} sipariş</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>
      </Card>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.rowCard}>
            <View style={styles.row}>
              <Image
                source={platformPlaceholders[platformKey[item.platform]]}
                style={styles.logo}
              />
              {item.productImageKey ? (
                <Image
                  source={illustrations[item.productImageKey]}
                  style={styles.thumb}
                  resizeMode="contain"
                />
              ) : null}
              <View style={styles.meta}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.productTitle}
                </Text>
                <Text style={styles.metaText}>
                  {item.platform} · {formatShortDate(item.orderDate)}
                </Text>
                <View style={styles.status}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.price}>{formatCurrency(item.grandTotal)}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Text style={styles.empty}>Eşleşen harcama bulunamadı.</Text>
          </Card>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    paddingHorizontal: tokens.layout.pagePadding,
    paddingTop: 8,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h1,
    color: tokens.colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.body,
    color: tokens.colors.textSecondary,
  },
  searchWrap: {
    marginHorizontal: tokens.layout.pagePadding,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  search: {
    flex: 1,
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.body,
    color: tokens.colors.text,
  },
  summary: {
    marginHorizontal: tokens.layout.pagePadding,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.textSecondary,
  },
  summaryAmount: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h3,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  list: {
    paddingHorizontal: tokens.layout.pagePadding,
    paddingBottom: 32,
    gap: 12,
  },
  rowCard: {
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: tokens.colors.primaryLight,
  },
  meta: {
    flex: 1,
  },
  name: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  metaText: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.textMuted,
  },
  status: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: tokens.colors.savingsLight,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.savingsDark,
  },
  price: {
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  empty: {
    color: tokens.colors.textSecondary,
    fontFamily: tokens.fontFamily.regular,
  },
});
