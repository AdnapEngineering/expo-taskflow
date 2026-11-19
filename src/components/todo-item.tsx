import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Swipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown, FadeOutRight, LinearTransition } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { Todo, TodoPriority } from '@/hooks/use-todos';
import { useTheme } from '@/hooks/use-theme';

const PRIORITY_COLORS: Record<TodoPriority, { bg: string; text: string; label: string }> = {
  high: { bg: '#FEE2E2', text: '#DC2626', label: 'High' },
  medium: { bg: '#FEF3C7', text: '#D97706', label: 'Med' },
  low: { bg: '#E0F2FE', text: '#0284C7', label: 'Low' },
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const theme = useTheme();
  const priorityStyle = PRIORITY_COLORS[todo.priority];
  const swipeableRef = useRef<SwipeableMethods>(null);

  const handleToggle = () => {
    const feedback =
      Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(
            todo.completed
              ? Haptics.AndroidHaptics.Toggle_Off
              : Haptics.AndroidHaptics.Toggle_On
          )
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void feedback.catch((error) => console.warn('Failed to provide toggle haptic feedback:', error));
    onToggle(todo.id);
  };

  const handleDelete = () => {
    const feedback =
      Platform.OS === 'android'
        ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void feedback.catch((error) => console.warn('Failed to provide delete haptic feedback:', error));
    onDelete(todo.id);
  };

  const renderLeftActions = (
    _progress: unknown,
    _translation: unknown,
    swipeableMethods: SwipeableMethods
  ) => (
    <Pressable
      onPress={() => {
        handleToggle();
        swipeableMethods.close();
      }}
      style={[
        styles.swipeAction,
        styles.leftAction,
        { backgroundColor: todo.completed ? '#F59E0B' : '#10B981' },
      ]}>
      <ThemedText style={styles.swipeActionText}>
        {todo.completed ? '↩ Undo' : '✓ Done'}
      </ThemedText>
    </Pressable>
  );

  const renderRightActions = (
    _progress: unknown,
    _translation: unknown,
    swipeableMethods: SwipeableMethods
  ) => (
    <Pressable
      onPress={() => {
        swipeableMethods.close();
        handleDelete();
      }}
      style={[styles.swipeAction, styles.rightAction, { backgroundColor: '#EF4444' }]}>
      <ThemedText style={styles.swipeActionText}>✕ Delete</ThemedText>
    </Pressable>
  );

  const handleSwipeableOpen = (direction: SwipeDirection) => {
    if (direction === SwipeDirection.RIGHT) {
      handleToggle();
      swipeableRef.current?.close();
    } else if (direction === SwipeDirection.LEFT) {
      handleDelete();
    }
  };

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutRight}
      layout={LinearTransition}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        leftThreshold={48}
        rightThreshold={48}
        overshootLeft={false}
        overshootRight={false}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={handleSwipeableOpen}
        containerStyle={styles.swipeContainer}>
        <ThemedView
          type="backgroundElement"
          style={[
            styles.card,
            {
              borderColor: theme.border,
              opacity: todo.completed ? 0.85 : 1,
            },
          ]}>
          <Pressable
            onPress={handleToggle}
            hitSlop={12}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: todo.completed }}
            accessibilityLabel={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            style={({ pressed }) => [styles.mainTouchArea, pressed && styles.pressed]}>
            <View
              style={[
                styles.checkbox,
                todo.completed
                  ? { backgroundColor: theme.accent, borderColor: theme.accent }
                  : { borderColor: theme.textSecondary, backgroundColor: theme.background },
              ]}>
              {todo.completed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
            </View>

            <View style={styles.contentColumn}>
              <ThemedText
                style={[
                  styles.title,
                  todo.completed && {
                    textDecorationLine: 'line-through',
                    color: theme.textSecondary,
                  },
                ]}>
                {todo.title}
              </ThemedText>

              <View style={styles.metaRow}>
                <View style={[styles.categoryPill, { backgroundColor: theme.accentSoft }]}>
                  <ThemedText style={[styles.categoryText, { color: theme.accent }]}>
                    {todo.category}
                  </ThemedText>
                </View>

                <View style={[styles.priorityPill, { backgroundColor: priorityStyle.bg }]}>
                  <ThemedText style={[styles.priorityText, { color: priorityStyle.text }]}>
                    {priorityStyle.label}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Delete "${todo.title}"`}
            style={({ pressed }) => [
              styles.deleteButton,
              { backgroundColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.deleteIcon, { color: theme.textSecondary }]}>✕</ThemedText>
          </Pressable>
        </ThemedView>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
  leftAction: {
    marginRight: Spacing.two,
  },
  rightAction: {
    marginLeft: Spacing.two,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
  },
  mainTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  contentColumn: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  categoryPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.two,
  },
  categoryText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  priorityPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.two,
  },
  priorityText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
