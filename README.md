# TaskFlow

**TaskFlow** is a cross-platform task management and productivity application built with [Expo](https://expo.dev) (SDK 58), [React Native](https://reactnative.dev), and [Expo Router](https://docs.expo.dev/router/introduction/). It runs natively on iOS, Android, and the web with persistent local storage, swipe gestures, fluid animations, and adaptive light/dark theming.

---

## Features

- **Task Creation & Organization**
  - Create tasks with a title, category (`Personal`, `Work`, `Errands`), and priority level (`Low`, `Medium`, `High`).
  - Pre-seeded starter tasks on first launch to showcase categories, priorities, and completion states.
- **Interactive Task Management**
  - **Swipe Gestures**: Swipe right on any task to toggle completion (`✓ Done` / `↩ Undo`) or swipe left to delete (`✕ Delete`), powered by `react-native-gesture-handler` (`ReanimatedSwipeable`).
  - **Haptic Feedback**: Light haptic feedback on task completion toggles and deletions via `expo-haptics`.
  - **Smooth Animations**: Layout transitions and entering/exiting animations powered by `react-native-reanimated`.
- **Filtering & Bulk Actions**
  - Filter tasks by status (`All`, `Active`, `Completed`) and by category (`All`, `Personal`, `Work`, `Errands`).
  - Live counter of remaining active tasks and one-tap **Clear completed** action.
- **Completed & Productivity Stats (`/explore`)**
  - Overall completion rate percentage with an animated/visual progress bar.
  - Summary counters for **Done**, **Active**, and **Total** tasks.
  - **Category Breakdown** displaying per-category completion counts, percentages, and progress bars.
  - Dedicated list of completed tasks sorted by completion time.
- **Cross-Platform Persistence**
  - **iOS & Android**: Local SQLite database (`taskflow.db` in WAL mode) via `expo-sqlite`.
  - **Web**: Automatic fallback to `localStorage` (`taskflow-todos-v1`).
- **Platform-Adaptive Navigation & Theming**
  - Uses native bottom tabs (`expo-router/native-tabs`) on iOS and Android, and a custom floating header tab bar (`expo-router/ui`) with live task counters on Web.
  - Automatic light and dark mode support with custom brand accent palette (`#F46430` / `#FF7847`).

---

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (~58.0.26) & [React Native](https://reactnative.dev) (0.88.1) with React 19.3
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (`expo-router`) with typed routes enabled
- **Storage**: `expo-sqlite` (Native) & `localStorage` (Web)
- **Animations & Gestures**: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`
- **UI & Feedback**: `@expo/ui`, `expo-haptics`, `expo-image`, `expo-symbols`, `expo-splash-screen`
- **Language & Tooling**: TypeScript (~6.0.3), React Compiler enabled, ESLint (`eslint-config-expo`)

---

## Project Structure

```text
src/
├── app/
│   ├── _layout.tsx          # Root layout: GestureHandler, ThemeProvider, TodoProvider, Splash & Tabs
│   ├── index.tsx            # Active Tasks screen (task composer, status/category filters, task list)
│   └── explore.tsx          # Completed & Stats screen (completion rate, category breakdown, completed list)
├── components/
│   ├── app-tabs.tsx         # Native bottom tab navigation (iOS / Android)
│   ├── app-tabs.web.tsx     # Web custom top tab bar with live task counts
│   ├── todo-item.tsx        # Swipeable & animated task card with category/priority pills
│   ├── animated-icon.tsx    # Animated splash screen overlay and icon component
│   ├── themed-text.tsx      # Typography component with theme support
│   ├── themed-view.tsx      # Container view with theme token support
│   └── ui/                  # Shared UI primitives (e.g., Collapsible)
├── constants/
│   └── theme.ts             # Light/dark color palette, typography fonts, spacing, and layout constants
└── hooks/
    ├── use-todos.tsx        # TodoContext provider, SQLite / localStorage persistence, and CRUD hooks
    ├── use-theme.ts         # Hook for accessing current theme colors
    └── use-color-scheme.ts  # Color scheme detection
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- For mobile development: [Expo Go](https://expo.dev/go), an [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/), or an [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Expo development server:

   ```bash
   npx expo start
   ```

3. Run on your target platform:
   - Press `i` to open in the **iOS Simulator** (`npm run ios`)
   - Press `a` to open in the **Android Emulator** (`npm run android`)
   - Press `w` to open in the **Web Browser** (`npm run web`)

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npx expo start` / `npm start` | Start the Expo development server |
| `npm run ios` | Start the dev server and open on iOS simulator |
| `npm run android` | Start the dev server and open on Android emulator |
| `npm run web` | Start the dev server for Web |
| `npx expo lint` / `npm run lint` | Run ESLint via Expo CLI |
| `npx tsc --noEmit` | Run TypeScript typechecking |
| `npx expo-doctor` | Diagnose Expo dependency and configuration issues |
| `npx expo install <package>` | Install an Expo SDK-compatible package version |

---

## License

This project is licensed under the [MIT License](./LICENSE).
