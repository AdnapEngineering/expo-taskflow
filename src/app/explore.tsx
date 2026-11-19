import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TodoItem } from '@/components/todo-item';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { TodoCategory, useTodos } from '@/hooks/use-todos';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES: TodoCategory[] = ['Personal', 'Work', 'Errands'];

export default function CompletedAndStatsScreen() {
  const theme = useTheme();
  const { todos, activeTodos, completedTodos, toggleTodo, deleteTodo, clearCompleted } =
    useTodos();

  const completionRate =
    todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((category) => {
      const allInCat = todos.filter((t) => t.category === category);
      const doneInCat = allInCat.filter((t) => t.completed);
      const pct = allInCat.length > 0 ? Math.round((doneInCat.length / allInCat.length) * 100) : 0;
      return {
        category,
        total: allInCat.length,
        completed: doneInCat.length,
        pct,
      };
    });
  }, [todos]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={completedTodos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              {/* Header */}
              <View style={styles.titleSection}>
                <ThemedText type="subtitle" style={styles.pageTitle}>
                  Completed & Stats
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Track your TaskFlow productivity and review finished items
                </ThemedText>
              </View>

              {/* Hero Progress Card */}
              <ThemedView
                type="backgroundElement"
                style={[styles.heroStatsCard, { borderColor: theme.border }]}>
                <View style={styles.heroTopRow}>
                  <View>
                    <ThemedText type="code" themeColor="textSecondary">
                      COMPLETION RATE
                    </ThemedText>
                    <ThemedText type="title" style={[styles.rateNumber, { color: theme.accent }]}>
                      {completionRate}%
                    </ThemedText>
                  </View>

                  <View style={styles.statGrid}>
                    <View style={[styles.statBox, { backgroundColor: theme.background }]}>
                      <ThemedText type="smallBold" style={{ color: theme.accent }}>
                        {completedTodos.length}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                        Done
                      </ThemedText>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: theme.background }]}>
                      <ThemedText type="smallBold">{activeTodos.length}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                        Active
                      </ThemedText>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: theme.background }]}>
                      <ThemedText type="smallBold">{todos.length}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                        Total
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.accent,
                        width: `${completionRate}%`,
                      },
                    ]}
                  />
                </View>
              </ThemedView>

              {/* Category Breakdown */}
              <ThemedView
                type="backgroundElement"
                style={[styles.categoryCard, { borderColor: theme.border }]}>
                <ThemedText type="smallBold">Category Breakdown</ThemedText>
                <View style={styles.categoryRows}>
                  {categoryStats.map((stat) => (
                    <View key={stat.category} style={styles.categoryRow}>
                      <View style={styles.categoryHeader}>
                        <ThemedText type="small">{stat.category}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {stat.completed} / {stat.total} ({stat.pct}%)
                        </ThemedText>
                      </View>
                      <View
                        style={[
                          styles.miniTrack,
                          { backgroundColor: theme.backgroundSelected },
                        ]}>
                        <View
                          style={[
                            styles.miniFill,
                            {
                              backgroundColor: theme.accent,
                              width: `${stat.pct}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </ThemedView>

              {/* Completed Section Header */}
              <View style={styles.completedHeaderRow}>
                <ThemedText type="smallBold">
                  Completed Tasks ({completedTodos.length})
                </ThemedText>
                {completedTodos.length > 0 && (
                  <Pressable
                    onPress={clearCompleted}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all completed tasks"
                    style={({ pressed }) => [
                      styles.clearBtn,
                      { backgroundColor: theme.accentSoft },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={[styles.clearBtnText, { color: theme.accent }]}>
                      Clear Completed
                    </ThemedText>
                  </Pressable>
                )}
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
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No completed tasks yet
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.emptySubtitle}>
                Check off tasks in the Active Tasks tab to see your progress here.
              </ThemedText>
              <Pressable
                onPress={() => router.push('/')}
                style={({ pressed }) => [
                  styles.backToActiveBtn,
                  { backgroundColor: theme.accent },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>
                  Go to Active Tasks
                </ThemedText>
              </Pressable>
            </ThemedView>
          }
        />
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
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'web' ? Spacing.six : Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  headerWrapper: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  titleSection: {
    gap: Spacing.half,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  heroStatsCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.three,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  rateNumber: {
    fontSize: 38,
    lineHeight: 44,
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    minWidth: 64,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  categoryCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
  },
  categoryRows: {
    gap: Spacing.two,
  },
  categoryRow: {
    gap: Spacing.one,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  clearBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Spacing.two,
  },
  clearBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
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
  emptyTitle: {
    textAlign: 'center',
    fontSize: 16,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  backToActiveBtn: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
});
