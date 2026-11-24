import { Bell, Clock3, LineChart, Package, TrendingUp, Wallet } from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const TABS = ['Fiyat Geçmişi', 'Enflasyon & Artış', 'Ürün Analizi'] as const;

export default function ProductsScreen() {
  const products = useAppStore((s) => s.products);
  const productsTab = useAppStore((s) => s.productsTab);
  const setProductsTab = useAppStore((s) => s.setProductsTab);
  const toggleProductFollow = useAppStore((s) => s.toggleProductFollow);

  const totalSpend = products.reduce((sum, p) => sum + p.currentPrice, 0);
  const avgIncrease =
    products.length === 0
      ? 0
      : products.reduce((sum, p) => sum + p.threeMonthChangePercent, 0) / products.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Ürün Fiyat Geçmişi</Text>
            <Text style={styles.subtitle}>
              Aldığın ürünlerin fiyat değişimini ve en uygun satın alma zamanlarını takip et.
            </Text>
          </View>
          <Pressable style={styles.bell} accessibilityRole="button" accessibilityLabel="Bildirimler">
            <Bell size={20} color={tokens.colors.price} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => {
            const active = productsTab === tab;
            const Icon = tab === 'Fiyat Geçmişi' ? LineChart : tab === 'Enflasyon & Artış' ? TrendingUp : Clock3;
            return (
              <Pressable
                key={tab}
                onPress={() => setProductsTab(tab)}
                style={[styles.tab, active && styles.tabActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Icon size={14} color={active ? '#fff' : tokens.colors.price} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <LinearGradient
          colors={['#FFF2E4', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.stat}>
            <TrendingUp size={16} color={tokens.colors.warning} />
            <Text style={styles.statLabel}>Genel Fiyat Artışı (Son 6 Ay)</Text>
            <Text style={styles.statValue}>%{avgIncrease.toFixed(1).replace('.', ',')}</Text>
          </View>
          <View style={styles.stat}>
            <Package size={16} color={tokens.colors.price} />
            <Text style={styles.statLabel}>Takip Edilen Ürün</Text>
            <Text style={styles.statValue}>{products.length}</Text>
          </View>
          <View style={styles.stat}>
            <Wallet size={16} color={tokens.colors.primary} />
            <Text style={styles.statLabel}>Toplam Harcama</Text>
            <Text style={styles.statValue}>{formatCurrency(totalSpend)}</Text>
          </View>
        </LinearGradient>

        {productsTab !== 'Fiyat Geçmişi' ? (
          <Card>
            <Text style={styles.placeholder}>
              {productsTab} görünümü yakında — şu an fiyat geçmişi kartları üzerinden takip edebilirsiniz.
              Fiyatlar son satın alma faturalarına dayanır; canlı piyasa fiyatı değildir.
            </Text>
          </Card>
        ) : null}

        {products.map((product) => {
          const minPoint = product.history.reduce(
            (min, point) => (point.price < min.price ? point : min),
            product.history[0],
          );
          const chartData = product.history.map((point) => ({
            value: point.price,
            label: point.date.slice(5),
            dataPointText: '',
          }));

          return (
            <Card key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Image source={illustrations[product.imageKey]} style={styles.image} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.category}>{product.category}</Text>
                  <Text style={styles.name} numberOfLines={2}>
                    {product.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleProductFollow(product.id)}
                  style={[styles.follow, product.isFollowing && styles.followActive]}
                  accessibilityRole="button"
                  accessibilityLabel={product.isFollowing ? 'Takipten çıkar' : 'Takip et'}
                >
                  <Bell size={14} color={product.isFollowing ? '#fff' : tokens.colors.price} />
                  <Text style={[styles.followText, product.isFollowing && styles.followTextActive]}>
                    {product.isFollowing ? 'Takipte' : 'Takip'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.chartRow}>
                <View style={styles.chart}>
                  <GiftedLineChart
                    data={chartData}
                    height={90}
                    width={180}
                    color={tokens.colors.price}
                    thickness={2}
                    hideDataPoints={false}
                    dataPointsColor={tokens.colors.price}
                    dataPointsRadius={3}
                    curved
                    areaChart
                    startFillColor={tokens.colors.priceLight}
                    endFillColor="#FFFFFF"
                    startOpacity={0.7}
                    endOpacity={0.05}
                    hideRules
                    hideYAxisText
                    xAxisColor="transparent"
                    yAxisColor="transparent"
                    initialSpacing={8}
                    endSpacing={8}
                    pointerConfig={{
                      pointerStripUptoDataPoint: true,
                      pointerColor: tokens.colors.price,
                      radius: 4,
                      pointerLabelWidth: 80,
                      pointerLabelHeight: 30,
                      activatePointersOnLongPress: true,
                      autoAdjustPointerLabelPosition: true,
                      pointerLabelComponent: () => (
                        <View style={styles.tooltip}>
                          <Text style={styles.tooltipText}>{formatCurrency(minPoint.price)}</Text>
                        </View>
                      ),
                    }}
                  />
                </View>
                <View style={styles.priceMeta}>
                  <Text style={styles.currentLabel}>Güncel Fiyat</Text>
                  <Text style={styles.currentPrice}>{formatCurrency(product.currentPrice)}</Text>
                  <View style={styles.trendBadge}>
                    <Text style={styles.trendText}>
                      Son 3 Ay: +%{product.threeMonthChangePercent.toFixed(1).replace('.', ',')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.footerLabel}>En Ucuz Ne Zaman?</Text>
                  <Text style={styles.footerValue}>{formatShortDate(product.cheapestDate)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.footerLabel}>En Ucuz Nereden?</Text>
                  <View style={styles.platformRow}>
                    <Image
                      source={platformPlaceholders[platformKey[product.cheapestPlatform]]}
                      style={styles.platformLogo}
                    />
                    <Text style={styles.footerValue}>{product.cheapestPlatform}</Text>
                  </View>
                </View>
                <View style={styles.cheapPill}>
                  <Text style={styles.cheapPillText}>{formatCurrency(product.cheapestPrice)}</Text>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.background },
  content: {
    paddingHorizontal: tokens.layout.pagePadding,
    paddingBottom: 32,
    gap: 14,
  },
  header: { flexDirection: 'row', gap: 12, paddingTop: 8 },
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
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.priceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.price,
  },
  tabs: { gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.priceLight,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: tokens.colors.price,
    borderColor: tokens.colors.price,
  },
  tabText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 12,
    color: tokens.colors.priceDark,
  },
  tabTextActive: { color: '#fff' },
  statsCard: {
    borderRadius: tokens.radius.xl,
    padding: 16,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  stat: { flex: 1, gap: 4 },
  statLabel: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 11,
    color: tokens.colors.textMuted,
  },
  statValue: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 16,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  placeholder: {
    fontFamily: tokens.fontFamily.regular,
    color: tokens.colors.textSecondary,
    lineHeight: 22,
  },
  productCard: { gap: 12 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  image: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: tokens.colors.priceLight,
  },
  category: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 12,
    color: tokens.colors.price,
  },
  name: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 15,
    color: tokens.colors.text,
  },
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.price,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  followActive: {
    backgroundColor: tokens.colors.price,
  },
  followText: {
    fontSize: 11,
    fontFamily: tokens.fontFamily.medium,
    color: tokens.colors.price,
  },
  followTextActive: { color: '#fff' },
  chartRow: { flexDirection: 'row', gap: 8 },
  chart: { flex: 1 },
  priceMeta: { width: 110, justifyContent: 'center', gap: 4 },
  currentLabel: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontFamily: tokens.fontFamily.regular,
  },
  currentPrice: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 18,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  trendBadge: {
    backgroundColor: tokens.colors.warningLight,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trendText: {
    fontSize: 10,
    color: tokens.colors.warning,
    fontFamily: tokens.fontFamily.medium,
  },
  tooltip: {
    backgroundColor: tokens.colors.price,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tooltipText: { color: '#fff', fontSize: 10, fontFamily: tokens.fontFamily.medium },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontFamily: tokens.fontFamily.regular,
  },
  footerValue: {
    fontSize: 12,
    color: tokens.colors.text,
    fontFamily: tokens.fontFamily.semibold,
  },
  platformRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  platformLogo: { width: 16, height: 16, borderRadius: 4 },
  cheapPill: {
    backgroundColor: tokens.colors.priceLight,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cheapPillText: {
    color: tokens.colors.priceDark,
    fontFamily: tokens.fontFamily.bold,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
