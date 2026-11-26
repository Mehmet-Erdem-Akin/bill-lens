import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { tokens } from '../../theme/tokens';

type SectionHeaderProps = {
  title: string;
  icon?: ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  trailing?: ReactNode;
};

export const SectionHeader = ({
  title,
  icon,
  actionLabel,
  onActionPress,
  trailing,
}: SectionHeaderProps) => (
  <View style={styles.row}>
    <View style={styles.left}>
      {icon}
      <Text style={styles.title}>{title}</Text>
    </View>
    {trailing}
    {actionLabel && onActionPress ? (
      <Pressable
        onPress={onActionPress}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        hitSlop={8}
      >
        <Text style={styles.action}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontFamily: tokens.fontFamily.semibold,
    fontSize: tokens.fontSize.h3,
    lineHeight: tokens.lineHeight.h3,
    color: tokens.colors.text,
  },
  action: {
    fontFamily: tokens.fontFamily.medium,
    fontSize: tokens.fontSize.caption,
    color: tokens.colors.primary,
  },
});
