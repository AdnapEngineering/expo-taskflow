import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { TodoCategory, TodoPriority, useTodos } from '@/hooks/use-todos';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES: TodoCategory[] = ['Personal', 'Work', 'Errands'];
const STATUS_FILTERS = ['All', 'Active', 'Completed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const PRIORITIES: { value: TodoPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function ActiveTasksScreen() {
  const theme = useTheme();
  const {
    activeTodos,
    completedTodos,
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  } = useTodos();

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory>('Personal');
  const [selectedPriority, setSelectedPriority] = useState<TodoPriority>('medium');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('Active');
  const [filterCategory, setFilterCategory] = useState<'All' | TodoCategory>('All');

  const filteredTodos = useMemo(() => {
    const baseList =
      filterStatus === 'All'
        ? todos
        : filterStatus === 'Active'
          ? activeTodos
          : completedTodos;
    if (filterCategory === 'All') return baseList;
    return baseList.filter((todo) => todo.category === filterCategory);
  }, [todos, activeTodos, completedTodos, filterStatus, filterCategory]);

  const completionPercent =
    todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  const handleAdd = () => {
    if (!title.trim()) return;
    addTodo(title, selectedPriority, selectedCategory);
    setTitle('');
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <FlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerWrapper}>
                {/* App Brand Header */}
                <View style={styles.brandHeader}>
                  <View style={styles.brandTitleRow}>
                    <Image
                      source={require('@/assets/images/icon.png')}
                      style={styles.appIcon}
                    />
                    <View style={styles.brandTextCol}>
                      <ThemedText type="subtitle" style={styles.appName}>
                        TaskFlow
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {activeTodos.length === 0
                          ? 'All caught up for today!'
                          : `${activeTodos.length} task${activeTodos.length === 1 ? '' : 's'} remaining`}
                      </ThemedText>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => router.push('/explore')}
                    style={({ pressed }) => [
                      styles.progressBadge,
                      { backgroundColor: theme.accentSoft, borderColor: theme.accent },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      {completionPercent}% Done
                    </ThemedText>
                  </Pressable>
                </View>

                {/* New Task Composer Card */}
                <ThemedView
                  type="backgroundElement"
                  style={[styles.composerCard, { borderColor: theme.border }]}>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      onSubmitEditing={handleAdd}
                      placeholder="What needs to be done?"
                      placeholderTextColor={theme.textSecondary}
                      returnKeyType="done"
                      style={[
                        styles.input,
                        {
                          color: theme.text,
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                    />
                    <Pressable
                      onPress={handleAdd}
                      disabled={!title.trim()}
                      accessibilityRole="button"
                      accessibilityLabel="Add task"
                      style={({ pressed }) => [
                        styles.addButton,
                        {
                          backgroundColor: title.trim()
                            ? theme.accent
                            : theme.backgroundSelected,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={{
                          color: title.trim() ? '#FFFFFF' : theme.textSecondary,
                        }}>
                        + Add
                      </ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.optionsSection}>
                    <View style={styles.selectorGroup}>
                      <ThemedText type="code" themeColor="textSecondary" style={styles.optionLabel}>
                        CATEGORY
                      </ThemedText>
                      <View style={styles.chipRow}>
                        {CATEGORIES.map((cat) => {
                          const active = selectedCategory === cat;
                          return (
                            <Pressable
                              key={cat}
                              onPress={() => setSelectedCategory(cat)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: active ? theme.accent : theme.background,
                                  borderColor: active ? theme.accent : theme.border,
                                },
                              ]}>
                              <ThemedText
                                style={[
                                  styles.chipText,
                                  { color: active ? '#FFFFFF' : theme.textSecondary },
                                ]}>
                                {cat}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.selectorGroup}>
                      <ThemedText type="code" themeColor="textSecondary" style={styles.optionLabel}>
                        PRIORITY
                      </ThemedText>
                      <View style={styles.chipRow}>
                        {PRIORITIES.map((p) => {
                          const active = selectedPriority === p.value;
                          return (
                            <Pressable
                              key={p.value}
                              onPress={() => setSelectedPriority(p.value)}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: active ? theme.accent : theme.background,
                                  borderColor: active ? theme.accent : theme.border,
                                },
                              ]}>
                              <ThemedText
                                style={[
                                  styles.chipText,
                                  { color: active ? '#FFFFFF' : theme.textSecondary },
                                ]}>
                                {p.label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                </ThemedView>

                {/* Status Filter Bar & Task Counter */}
                <ThemedView
                  type="backgroundElement"
                  style={[styles.statusFilterBar, { borderColor: theme.border }]}>
                  <View style={styles.statusFilterPills}>
                    {STATUS_FILTERS.map((status) => {
                      const active = filterStatus === status;
                      return (
                        <Pressable
                          key={status}
                          onPress={() => setFilterStatus(status)}
                          style={[
                            styles.statusChip,
                            {
                              backgroundColor: active ? theme.accent : theme.background,
                              borderColor: active ? theme.accent : theme.border,
                            },
                          ]}>
                          <ThemedText
                            style={[
                              styles.filterChipText,
                              { color: active ? '#FFFFFF' : theme.textSecondary },
                            ]}>
                            {status}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.counterRow}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {`${activeTodos.length} task${activeTodos.length === 1 ? '' : 's'} remaining`}
                    </ThemedText>
                    {completedTodos.length > 0 && (
                      <Pressable
                        onPress={clearCompleted}
                        accessibilityRole="button"
                        accessibilityLabel="Clear completed tasks"
                        style={({ pressed }) => [
                          styles.clearCompletedBtn,
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText type="smallBold" style={{ color: theme.accent }}>
                          Clear completed
                        </ThemedText>
                      </Pressable>
                    )}
                  </View>
                </ThemedView>

                {/* Category Filter Pills */}
                <View style={styles.filterHeaderRow}>
                  <ThemedText type="smallBold">{filterStatus} Tasks</ThemedText>
                  <View style={styles.filterPills}>
                    {(['All', ...CATEGORIES] as const).map((cat) => {
                      const active = filterCategory === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setFilterCategory(cat)}
                          style={[
                            styles.filterChip,
                            {
                              backgroundColor: active
                                ? theme.accentSoft
                                : theme.backgroundElement,
                              borderColor: active ? theme.accent : theme.border,
                            },
                          ]}>
                          <ThemedText
                            style={[
                              styles.filterChipText,
                              { color: active ? theme.accent : theme.textSecondary },
                            ]}>
                            {cat}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <TodoItem todo={item} onToggle={toggleTodo} onDelete={deleteTodo} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <ThemedView
                type="backgroundElement"
                style={[styles.emptyCard, { borderColor: theme.border }]}>
                <View style={[styles.emptyIconBadge, { backgroundColor: theme.accentSoft }]}>
                  <ThemedText style={[styles.emptyIconText, { color: theme.accent }]}>
                    {filterStatus === 'Completed' ? '✨' : '✓'}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={styles.emptyTitle}>
                  {filterStatus === 'Completed'
                    ? filterCategory === 'All'
                      ? 'No completed tasks yet'
                      : `No completed tasks in ${filterCategory}`
                    : filterCategory === 'All'
                      ? 'All caught up! Add a task below.'
                      : `No ${filterStatus.toLowerCase()} tasks in ${filterCategory}`}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
                  {filterStatus === 'Completed'
                    ? 'Swipe right or tap a task checkbox to mark it complete.'
                    : 'All caught up! Add a task below or swipe tasks to complete or delete them.'}
                </ThemedText>
                {completedTodos.length > 0 && filterStatus !== 'Completed' && (
                  <Pressable
                    onPress={() => router.push('/explore')}
                    style={({ pressed }) => [
                      styles.viewCompletedBtn,
                      { backgroundColor: theme.accentSoft },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText type="smallBold" style={{ color: theme.accent }}>
                      View {completedTodos.length} Completed Task
                      {completedTodos.length === 1 ? '' : 's'} →
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedView>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'web' ? Spacing.six : Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  headerWrapper: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  brandTextCol: {
    flex: 1,
  },
  appName: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  composerCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.three,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.two,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  addButton: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsSection: {
    gap: Spacing.two,
  },
  selectorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  optionLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.two,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  statusFilterBar: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
  },
  statusFilterPills: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  clearCompletedBtn: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.one,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  filterPills: {
    flexDirection: 'row',
    gap: Spacing.one,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  separator: {
    height: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  emptyIconText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  viewCompletedBtn: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
});
