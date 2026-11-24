import { StyleSheet, Text, View } from 'react-native';
import { Layers } from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts';

import { tokens } from '../../theme/tokens';
import type { PlatformShare } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';
import { SectionHeader } from '../ui/SectionHeader';

type PlatformDistributionProps = {
  shares: PlatformShare[];
  total: number;
};

export const PlatformDistribution = ({ shares, total }: PlatformDistributionProps) => {
  const pieData = shares.map((share) => ({
    value: share.amount,
    color: share.color,
    text: `${share.percent}`,
  }));

  return (
    <Card>
      <SectionHeader
        title="Platform Dağılımı"
        icon={<Layers size={20} color={tokens.colors.primary} />}
        trailing={
          <Text style={styles.total}>Toplam: {formatCurrency(total)}</Text>
        }
      />
      <View style={styles.body}>
        <View style={styles.chartWrap}>
          <PieChart
            data={pieData}
            donut
            radius={72}
            innerRadius={48}
            innerCircleColor={tokens.colors.surface}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerAmount} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(total)}
                </Text>
                <Text style={styles.centerCaption}>Toplam Harcama</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.legend}>
          {shares.map((share) => (
            <View key={share.platform} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: share.color }]} />
              <View style={styles.legendText}>
                <Text style={styles.platform}>{share.platform}</Text>
                <Text style={styles.amount}>
                  {formatCurrency(share.amount)} (%{share.percent.toFixed(1).replace('.', ',')})
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  total: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartWrap: {
    width: 150,
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  centerAmount: {
    fontFamily: tokens.fontFamily.bold,
    fontSize: 11,
    color: tokens.colors.text,
    fontVariant: ['tabular-nums'],
  },
  centerCaption: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 9,
    color: tokens.colors.textMuted,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  legendText: {
    flex: 1,
  },
  platform: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: 13,
    color: tokens.colors.text,
  },
  amount: {
    fontFamily: tokens.fontFamily.regular,
    fontSize: 12,
    color: tokens.colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
});
