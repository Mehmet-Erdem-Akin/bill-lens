import {
  ArrowUpRight,
  ChevronRight,
  Gift,
  Percent,
  ShoppingBag,
  Sparkles,
  Ticket,
  Truck,
} from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppStore } from '@/store/appStore';
import { illustrations } from '@/theme/asset-map';
import { tokens } from '@/theme/tokens';
import { formatCurrency } from '@/utils/format';

const PERIODS = ['Bu Ay', 'Son 3 Ay', 'Son 6 Ay', 'Bu Yıl'] as const;

export default function SavingsScreen() {
  const savings = useAppStore((s) => s.savings);
  const savingsPeriod = useAppStore((s) => s.savingsPeriod);
  const setSavingsPeriod = useAppStore((s) => s.setSavingsPeriod);

  const shippingTotal = savings.paidShipping + savings.freeShippingValue;
  const freeProgress =
    savings.freeShippingThreshold > 0
      ? Math.round((savings.cartTowardFreeShipping / savings.freeShippingThreshold) * 100)
      : 0;
  const remainingToFree = Math.max(
    0,
    savings.freeShippingThreshold - savings.cartTowardFreeShipping,
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasarruf Analizi</Text>
          <ShoppingBag size={22} color={tokens.colors.savings} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {PERIODS.map((period) => {
            const active = savingsPeriod === period;
            return (
              <Pressable
                key={period}
                onPress={() => setSavingsPeriod(period)}
                style={[styles.tab, active && styles.tabActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{period}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <LinearGradient
          colors={[tokens.colors.savingsDark, '#0FA37F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.heroLabel}>Bu Ayki Toplam Tasarrufun</Text>
            <Text style={styles.heroAmount}>{formatCurrency(savings.totalSavings)}</Text>
            <View style={styles.heroBadge}>
              <ArrowUpRight size={14} color={tokens.colors.savingsDark} />
              <Text style={styles.heroBadgeText}>
                Geçen aya göre %{savings.vsLastMonthPercent} daha fazla
              </Text>
            </View>
          </View>
          <Image
            source={illustrations['savings-bag-coins']}
            style={styles.heroImage}
            resizeMode="contain"
            accessible={false}
          />
        </LinearGradient>

        <SectionHeader
          title="Kazanılan İndirimler"
          icon={<Ticket size={18} color={tokens.colors.savings} />}
          trailing={
            <Text style={styles.sectionTotal}>{formatCurrency(savings.totalSavings)}</Text>
          }
        />
        <View style={styles.discountRow}>
          <Card style={styles.discountCard}>
            <Ticket size={18} color={tokens.colors.savings} />
            <Text style={styles.discountTitle}>Kupon İndirimleri</Text>
            <Text style={styles.discountAmount}>{formatCurrency(savings.couponDiscounts)}</Text>
            <Text style={styles.discountMeta}>{savings.couponCount} kupon kullanıldı</Text>
            <ChevronRight size={16} color={tokens.colors.textMuted} style={styles.chevron} />
          </Card>
          <Card style={styles.discountCard}>
            <Percent size={18} color={tokens.colors.savings} />
            <Text style={styles.discountTitle}>Ürün İndirimleri</Text>
            <Text style={styles.discountAmount}>{formatCurrency(savings.productDiscounts)}</Text>
            <Text style={styles.discountMeta}>
              {savings.discountedProductCount} üründe indirim
            </Text>
            <ChevronRight size={16} color={tokens.colors.textMuted} style={styles.chevron} />
          </Card>
        </View>

        <SectionHeader
          title="Toplam Kargo Ücreti"
          icon={<Truck size={18} color={tokens.colors.savings} />}
          trailing={<Text style={styles.sectionTotal}>{formatCurrency(shippingTotal)}</Text>}
        />
        <Card>
          <View style={styles.shippingBody}>
            <PieChart
              data={[
                { value: savings.paidShipping, color: tokens.colors.savingsDark },
                { value: savings.freeShippingValue, color: '#8FD6B8' },
              ]}
              donut
              radius={60}
              innerRadius={40}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.centerAmount}>{formatCurrency(shippingTotal)}</Text>
                  <Text style={styles.centerCaption}>Toplam Kargo</Text>
                </View>
              )}
            />
            <View style={styles.shippingLegend}>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: tokens.colors.savingsDark }]} />
                <View>
                  <Text style={styles.legendTitle}>Ücretli Kargo</Text>
                  <Text style={styles.legendMeta}>
                    {formatCurrency(savings.paidShipping)} (
                    {shippingTotal ? Math.round((savings.paidShipping / shippingTotal) * 100) : 0}
                    %)
                  </Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: '#8FD6B8' }]} />
                <View>
                  <Text style={styles.legendTitle}>Kargo Bedava</Text>
                  <Text style={styles.legendMeta}>
                    {formatCurrency(savings.freeShippingValue)} (
                    {shippingTotal
                      ? Math.round((savings.freeShippingValue / shippingTotal) * 100)
                      : 0}
                    %)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.freeShipCard}>
          <Image source={illustrations['gift-box']} style={styles.gift} resizeMode="contain" />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.freeHeader}>
              <Gift size={16} color={tokens.colors.savingsDark} />
              <Text style={styles.freeTitle}>Kargo Bedava Limiti</Text>
            </View>
            <Text style={styles.freeText}>
              Kargo bedava kazanmak için sepetine en az {formatCurrency(remainingToFree)} daha ekle!
            </Text>
            <ProgressBar progress={freeProgress} color={tokens.colors.savingsDark} height={10} />
            <View style={styles.freeFooter}>
              <Text style={styles.freeMeta}>{formatCurrency(savings.cartTowardFreeShipping)}</Text>
              <Text style={styles.freeMeta}>{formatCurrency(savings.freeShippingThreshold)}</Text>
            </View>
          </View>
          <ChevronRight size={18} color={tokens.colors.savingsDark} />
        </Card>

        <SectionHeader
          title="Tasarruf İçgörüleri"
          icon={<Sparkles size={18} color={tokens.colors.savings} />}
        />
        <Card style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Percent size={18} color={tokens.colors.savings} />
          </View>
          <Text style={styles.insightText}>{savings.insightText}</Text>
          <ChevronRight size={18} color={tokens.colors.textMuted} />
        </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  title: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h1,
    color: tokens.colors.text,
  },
  tabs: { gap: 8 },
  tab: {
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: tokens.colors.savingsLight,
    borderColor: tokens.colors.savingsLight,
  },
  tabText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  tabTextActive: { color: tokens.colors.savingsDark },
  hero: {
    borderRadius: tokens.radius['2xl'],
    padding: 20,
    minHeight: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: tokens.fontFamily.medium,
    fontSize: 14,
  },
  heroAmount: {
    color: '#fff',
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.amount,
    fontVariant: ['tabular-nums'],
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.colors.savingsLight,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  heroBadgeText: {
    color: tokens.colors.savingsDark,
    fontFamily: tokens.fontFamily.medium,
    fontSize: 11,
  },
  heroImage: { width: 110, height: 110 },
  sectionTotal: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  discountRow: { flexDirection: 'row', gap: 12 },
  discountCard: { flex: 1, gap: 4, minHeight: 120 },
  discountTitle: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  discountAmount: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 18,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  discountMeta: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  chevron: { position: 'absolute', right: 12, top: 12 },
  shippingBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  centerAmount: {
    fontSize: 11,
    fontFamily: tokens.fontFamily.bold,
    color: tokens.colors.text,
  },
  centerCaption: {
    fontSize: 9,
    color: tokens.colors.textMuted,
  },
  shippingLegend: { flex: 1, gap: 12 },
  legendRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  legendTitle: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.text,
  },
  legendMeta: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  freeShipCard: {
    backgroundColor: tokens.colors.savingsLight,
    borderColor: '#C9EBD9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gift: { width: 56, height: 56 },
  freeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  freeTitle: {
    fontFamily: tokens.fontFamily.semibold,
    color: tokens.colors.savingsDark,
  },
  freeText: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 18,
  },
  freeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freeMeta: {
    fontSize: 11,
    color: tokens.colors.savingsDark,
    fontFamily: tokens.fontFamily.medium,
    fontVariant: ['tabular-nums'],
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tokens.colors.savingsLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    flex: 1,
    fontFamily: tokens.fontFamily.regular,
    fontSize: 14,
    color: tokens.colors.textSecondary,
    lineHeight: 20,
  },
});
