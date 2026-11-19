import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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

  return (
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
        onPress={() => onToggle(todo.id)}
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
        onPress={() => onDelete(todo.id)}
        hitSlop={10}
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
  );
}

const styles = StyleSheet.create({
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
