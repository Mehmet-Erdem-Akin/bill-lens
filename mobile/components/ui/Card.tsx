import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { tokens } from '../../theme/tokens';

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export const Card = ({ children, style, padded = true }: CardProps) => (
  <View style={[styles.card, padded && styles.padded, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.xl,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    shadowColor: tokens.shadow.shadowColor,
    shadowOpacity: tokens.shadow.shadowOpacity,
    shadowRadius: tokens.shadow.shadowRadius,
    shadowOffset: tokens.shadow.shadowOffset,
    elevation: tokens.shadow.elevation,
  },
  padded: {
    padding: tokens.layout.cardPadding,
  },
});
