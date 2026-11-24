import { StyleSheet, View } from 'react-native';

import { tokens } from '../../theme/tokens';

type ProgressBarProps = {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
};

export const ProgressBar = ({
  progress,
  color = tokens.colors.savings,
  trackColor = tokens.colors.track,
  height = 12,
}: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View
      style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
