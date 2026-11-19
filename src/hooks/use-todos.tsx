import * as SQLite from 'expo-sqlite';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoCategory = 'Personal' | 'Work' | 'Errands';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  category: TodoCategory;
  createdAt: number;
  completedAt?: number;
}

interface TodoRow {
  id: string;
  title: string;
  completed: number;
  priority: TodoPriority;
  category: TodoCategory;
  created_at: number;
  completed_at: number | null;
}

const DB_NAME = 'taskflow.db';
const WEB_STORAGE_KEY = 'taskflow-todos-v1';

const INITIAL_TODOS: Todo[] = [
  {
    id: 'starter-1',
    title: 'Plan weekly sprint goals in TaskFlow',
    completed: false,
    priority: 'high',
    category: 'Work',
    createdAt: Date.now() - 1000 * 60 * 90,
  },
  {
    id: 'starter-2',
    title: 'Pick up fresh coffee beans & groceries',
    completed: false,
    priority: 'medium',
    category: 'Errands',
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: 'starter-3',
    title: 'Evening 20-minute stretch & reading',
    completed: false,
    priority: 'low',
    category: 'Personal',
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'starter-4',
    title: 'Set up TaskFlow custom icon and SQLite database',
    completed: true,
    priority: 'high',
    category: 'Work',
    createdAt: Date.now() - 1000 * 60 * 180,
    completedAt: Date.now() - 1000 * 60 * 15,
  },
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          priority TEXT NOT NULL DEFAULT 'medium',
          category TEXT NOT NULL DEFAULT 'Personal',
          created_at INTEGER NOT NULL,
          completed_at INTEGER
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

function rowToTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    priority: row.priority,
    category: row.category,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

async function initAndLoadTodos(): Promise<Todo[]> {
  if (Platform.OS === 'web') {
    try {
      const raw = globalThis.localStorage?.getItem(WEB_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as Todo[];
      }
      globalThis.localStorage?.setItem(WEB_STORAGE_KEY, JSON.stringify(INITIAL_TODOS));
    } catch (err) {
      console.warn('Web storage fallback error:', err);
    }
    return INITIAL_TODOS;
  }

  try {
    const db = await getDatabase();
    const countRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM todos'
    );

    if (!countRow || countRow.count === 0) {
      for (const todo of INITIAL_TODOS) {
        await db.runAsync(
          `INSERT OR REPLACE INTO todos (id, title, completed, priority, category, created_at, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          todo.id,
          todo.title,
          todo.completed ? 1 : 0,
          todo.priority,
          todo.category,
          todo.createdAt,
          todo.completedAt ?? null
        );
      }
      return INITIAL_TODOS;
    }

    const rows = await db.getAllAsync<TodoRow>(
      'SELECT * FROM todos ORDER BY created_at DESC'
    );
    return rows.map(rowToTodo);
  } catch (err) {
    console.warn('Failed to load todos from SQLite:', err);
    return INITIAL_TODOS;
  }
}

function syncWebStorage(todos: Todo[]) {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(WEB_STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn('Failed to save todos to web storage:', err);
    }
  }
}

interface TodoContextValue {
  todos: Todo[];
  activeTodos: Todo[];
  completedTodos: Todo[];
  isLoaded: boolean;
  addTodo: (title: string, priority?: TodoPriority, category?: TodoCategory) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    initAndLoadTodos().then((loaded) => {
      if (!mounted) return;
      setTodos(loaded);
      setIsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addTodo = useCallback(
    (title: string, priority: TodoPriority = 'medium', category: TodoCategory = 'Personal') => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const newTodo: Todo = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: trimmed,
        completed: false,
        priority,
        category,
        createdAt: Date.now(),
      };

      setTodos((prev) => {
        const next = [newTodo, ...prev];
        syncWebStorage(next);
        return next;
      });

      if (Platform.OS !== 'web') {
        getDatabase()
          .then((db) =>
            db.runAsync(
              `INSERT INTO todos (id, title, completed, priority, category, created_at, completed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              newTodo.id,
              newTodo.title,
              0,
              newTodo.priority,
              newTodo.category,
              newTodo.createdAt,
              null
            )
          )
          .catch((err) => console.warn('Failed to insert todo into SQLite:', err));
      }
    },
    []
  );

  const toggleTodo = useCallback((id: string) => {
    let toggledCompleted = false;
    let toggledCompletedAt: number | null = null;

    setTodos((prev) => {
      const next = prev.map((todo) => {
        if (todo.id !== id) return todo;
        toggledCompleted = !todo.completed;
        toggledCompletedAt = toggledCompleted ? Date.now() : null;
        return {
          ...todo,
          completed: toggledCompleted,
          completedAt: toggledCompletedAt ?? undefined,
        };
      });
      syncWebStorage(next);
      return next;
    });

    if (Platform.OS !== 'web') {
      getDatabase()
        .then((db) =>
          db.runAsync(
            'UPDATE todos SET completed = ?, completed_at = ? WHERE id = ?',
            toggledCompleted ? 1 : 0,
            toggledCompletedAt,
            id
          )
        )
        .catch((err) => console.warn('Failed to toggle todo in SQLite:', err));
    }
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const next = prev.filter((todo) => todo.id !== id);
      syncWebStorage(next);
      return next;
    });

    if (Platform.OS !== 'web') {
      getDatabase()
        .then((db) => db.runAsync('DELETE FROM todos WHERE id = ?', id))
        .catch((err) => console.warn('Failed to delete todo from SQLite:', err));
    }
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => {
      const next = prev.filter((todo) => !todo.completed);
      syncWebStorage(next);
      return next;
    });

    if (Platform.OS !== 'web') {
      getDatabase()
        .then((db) => db.runAsync('DELETE FROM todos WHERE completed = 1'))
        .catch((err) => console.warn('Failed to clear completed todos from SQLite:', err));
    }
  }, []);

  const activeTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);
  const completedTodos = useMemo(
    () =>
      todos
        .filter((todo) => todo.completed)
        .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt)),
    [todos]
  );

  const value = useMemo(
    () => ({
      todos,
      activeTodos,
      completedTodos,
      isLoaded,
      addTodo,
      toggleTodo,
      deleteTodo,
      clearCompleted,
    }),
    [todos, activeTodos, completedTodos, isLoaded, addTodo, toggleTodo, deleteTodo, clearCompleted]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return ctx;
}
