import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';

import { illustrations } from '../../theme/asset-map';
import { tokens } from '../../theme/tokens';
import { formatCurrency } from '../../utils/format';

type SpendHeroProps = {
  amount: number;
  vsLastMonthPercent: number;
};

export const SpendHero = ({ amount, vsLastMonthPercent }: SpendHeroProps) => {
  const isDown = vsLastMonthPercent <= 0;
  const TrendIcon = isDown ? ArrowDownRight : ArrowUpRight;

  return (
    <LinearGradient
      colors={[tokens.colors.primaryDark, tokens.colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.content}>
        <Text style={styles.label}>Aylık Harcama</Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={styles.amount}
          accessibilityRole="text"
          accessibilityLabel={`Aylık harcama ${formatCurrency(amount)}`}
        >
          {formatCurrency(amount)}
        </Text>
        <View style={[styles.badge, isDown ? styles.badgeGood : styles.badgeWarn]}>
          <TrendIcon size={14} color={isDown ? tokens.colors.savingsDark : tokens.colors.warning} />
          <Text style={[styles.badgeText, isDown ? styles.badgeTextGood : styles.badgeTextWarn]}>
            %{Math.abs(vsLastMonthPercent)} Geçen aya göre daha {isDown ? 'az' : 'fazla'}
          </Text>
        </View>
      </View>
      <Image
        source={illustrations['shopping-bag-parcel']}
        style={styles.illustration}
        resizeMode="contain"
        accessible={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderRadius: tokens.radius['2xl'],
    padding: tokens.spacing.xl,
    minHeight: 156,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.body,
  },
  amount: {
    color: '#FFFFFF',
    fontFamily: tokens.fontFamily.bold,
    fontSize: tokens.fontSize.amount,
    lineHeight: tokens.lineHeight.amount,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  badgeGood: {
    backgroundColor: tokens.colors.savingsLight,
  },
  badgeWarn: {
    backgroundColor: tokens.colors.warningLight,
  },
  badgeText: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: 11,
  },
  badgeTextGood: {
    color: tokens.colors.savingsDark,
  },
  badgeTextWarn: {
    color: tokens.colors.warning,
  },
  illustration: {
    width: 120,
    height: 120,
  },
});
