import { useRouter } from 'expo-router';
import { Bell, Calendar, ChevronDown } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { PlatformDistribution } from '@/components/dashboard/PlatformDistribution';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { SpendHero } from '@/components/dashboard/SpendHero';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { tokens } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const dashboard = useAppStore((s) => s.dashboard);
  const selectedMonthLabel = useAppStore((s) => s.selectedMonthLabel);
  const budgetLimit = user?.monthlyBudgetLimit ?? dashboard.budgetLimit;
  const spent = dashboard.spent;
  const remaining = Math.max(0, budgetLimit - spent);
  const progressPercent = budgetLimit > 0 ? Math.round((spent / budgetLimit) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Merhaba {user?.name ?? 'Misafir'} 👋</Text>
            <Text style={styles.subtitle}>
              Alışveriş harcamaların ve birikim durumun tek yerde.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
            style={styles.bell}
            hitSlop={8}
          >
            <Bell size={22} color={tokens.colors.text} />
            <View style={styles.dot} />
          </Pressable>
        </View>

        {isDemoMode ? (
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>Demo Modu — örnek verilerle keşfediyorsunuz</Text>
          </View>
        ) : null}

        <Pressable
          style={styles.monthPill}
          accessibilityRole="button"
          accessibilityLabel={`Ay seçici: ${selectedMonthLabel}`}
        >
          <Calendar size={16} color={tokens.colors.primary} />
          <Text style={styles.monthText}>{selectedMonthLabel}</Text>
          <ChevronDown size={16} color={tokens.colors.textMuted} />
        </Pressable>

        <SpendHero
          amount={dashboard.monthlySpend}
          vsLastMonthPercent={dashboard.vsLastMonthPercent}
        />

        <BudgetCard
          budgetLimit={budgetLimit}
          spent={spent}
          remaining={remaining}
          progressPercent={progressPercent}
          onEditPress={() => router.push('/(tabs)/settings')}
        />

        <PlatformDistribution
          shares={dashboard.platformShares}
          total={dashboard.monthlySpend}
        />

        <RecentOrders
          orders={dashboard.recentOrders}
          onSeeAll={() => router.push('/(tabs)/expenses')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  content: {
    paddingHorizontal: tokens.layout.pagePadding,
    paddingBottom: 32,
    gap: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.h1,
    lineHeight: tokens.lineHeight.h1,
    color: tokens.colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.body,
    lineHeight: tokens.lineHeight.body,
    color: tokens.colors.textSecondary,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.danger,
  },
  demoBanner: {
    backgroundColor: tokens.colors.primaryLight,
    borderRadius: tokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  demoText: {
    color: tokens.colors.primaryDark,
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.caption,
  },
  monthPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  monthText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.body,
    color: tokens.colors.text,
    textTransform: 'capitalize',
  },
});
