import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Target } from 'lucide-react-native';

import { tokens } from '../../theme/tokens';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { SectionHeader } from '../ui/SectionHeader';

type BudgetCardProps = {
  budgetLimit: number;
  spent: number;
  remaining: number;
  progressPercent: number;
  onEditPress?: () => void;
};

export const BudgetCard = ({
  budgetLimit,
  spent,
  remaining,
  progressPercent,
  onEditPress,
}: BudgetCardProps) => (
  <Card>
    <SectionHeader
      title="Bütçe İlerlemesi"
      icon={<Target size={20} color={tokens.colors.primary} />}
      trailing={
        <Pressable
          onPress={onEditPress}
          accessibilityRole="button"
          accessibilityLabel="Bütçe Düzenle"
          style={styles.editBtn}
          hitSlop={8}
        >
          <Pencil size={14} color={tokens.colors.primary} />
          <Text style={styles.editText}>Bütçe Düzenle</Text>
        </Pressable>
      }
    />
    <Text style={styles.budgetLabel}>Aylık Bütçe: {formatCurrency(budgetLimit)}</Text>
    <View style={styles.barWrap}>
      <ProgressBar progress={progressPercent} color="#22C55E" height={14} />
    </View>
    <View style={styles.footer}>
      <Text style={styles.meta}>Harcanan: {formatCurrency(spent)}</Text>
      <Text style={styles.remaining}>Kalan: {formatCurrency(remaining)}</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    color: tokens.colors.primary,
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.caption,
  },
  budgetLabel: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.body,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.md,
  },
  barWrap: {
    marginBottom: tokens.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  remaining: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.savings,
    fontVariant: ['tabular-nums'],
  },
});
