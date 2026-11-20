import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CELEBRATION_MS = 2500;

interface ProgressCelebrationProps {
  done: number;
  total: number;
  isLoaded: boolean;
}

/**
 * "X of Y done" progress bar that celebrates the moment the last active task
 * is checked off: a banner plus a success haptic. Uses only Reanimated and
 * expo-haptics, which are already in the native build, so it ships OTA.
 */
export function ProgressCelebration({ done, total, isLoaded }: ProgressCelebrationProps) {
  const theme = useTheme();
  const [celebrating, setCelebrating] = useState(false);
  const previous = useRef<{ done: number; total: number } | null>(null);
  const progress = useSharedValue(0);

  const percent = total > 0 ? (done / total) * 100 : 0;

  useEffect(() => {
    progress.value = withTiming(percent, { duration: 400 });
  }, [percent, progress]);

  useEffect(() => {
    if (!isLoaded) return;
    const prev = previous.current;
    previous.current = { done, total };
    // Celebrate only when a check-off finishes the list: same list size,
    // one more done, and nothing left. Loading data or deleting doesn't count.
    const finishedList =
      prev !== null && total > 0 && prev.total === total && prev.done < total && done === total;
    if (!finishedList) return;

    setCelebrating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((error) =>
      console.warn('Failed to provide success haptic feedback:', error)
    );
    const timer = setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [done, total, isLoaded]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  if (total === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText type="smallBold">{`${done} of ${total} done`}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {`${Math.round(percent)}%`}
        </ThemedText>
      </View>
      <View style={[styles.track, { backgroundColor: theme.accentSoft }]}>
        <Animated.View style={[styles.fill, { backgroundColor: theme.accent }, fillStyle]} />
      </View>
      {celebrating && (
        <Animated.View
          entering={FadeInUp}
          exiting={FadeOut}
          style={[styles.banner, { backgroundColor: theme.accent }]}>
          <ThemedText style={styles.bannerText}>All caught up! 🎉</ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  banner: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
