import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, motion, radii } from '../theme';

export function ProgressBar({
  progress,
  color = colors.volt,
}: {
  progress: number;
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const width = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: clamped,
      duration: motion.fillMs,
      useNativeDriver: false,
    }).start();
  }, [clamped, width]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radii.sharp,
    backgroundColor: colors.line,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: radii.sharp,
  },
});
