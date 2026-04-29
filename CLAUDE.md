# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Serenity** is a Spanish-language anxiety management mobile app built with React + Vite, packaged as a native Android app via Capacitor. All UI text and comments are in Spanish (es-MX). Fully offline — no backend, no API.

## Commands

```bash
npm run dev            # Start Vite dev server at localhost:5173
npm run build          # Production build → /dist
npm run preview        # Preview production build locally
npm run build:android  # Build web + sync Capacitor assets to android/
npm run apk:debug      # Generate debug APK (runs build:android first)
npm run apk:release    # Generate signed release APK
bash BUILD.sh          # Automated debug build
bash BUILD.sh release  # Automated release build
```

No test framework is configured.

## Architecture

**Everything lives in `src/App.jsx`** (~1600+ lines) — a single monolithic React component. There are no separate component files, no routing library, no state management library.

### Navigation Model

Screen state is a string stored in React state (`screen`). Navigation is done by calling `setScreen("home")`, `setScreen("techniques")`, etc. The main render function switches on this value to show one of 7 screens:

`onboarding` → `home` → `checkin` → `techniques` → `breathing` → `crisis` → `progress` → `learn`

### Data Persistence

All state is persisted to `localStorage` via `JSON.stringify/parse`. The shape:

```javascript
{
  screen: string,
  profile: { name, streak, totalSessions, joinDate },
  logs: [{ date, level, triggers, mood, notes, timestamp }],
  currentCrisis: boolean
}
```

`useEffect` hooks sync state changes to localStorage on every update.

### Capacitor Integration

Three Capacitor plugins are used at app startup:
- `SplashScreen` — 2-second dark splash
- `StatusBar` — dark styling
- `Haptics` — vibration feedback on crisis button and technique interactions

Capacitor config: `capacitor.config.json` (appId: `com.serenity.anxiety`, webDir: `dist`).

The `vite.config.js` sets `base: './'` so assets resolve correctly inside the Capacitor WebView.

### Key Hardcoded Content

Anxiety techniques (Box Breathing, 4-7-8, Grounding 5-4-3-2-1, Body Scan, Cognitive Reframing) and educational articles are defined as constants inside `App.jsx` — not fetched from any API.

Anxiety levels use a 1–5 scale where **1 = Crisis, 5 = Calm** (inverted from typical UX — keep this in mind when reading log data).

### Styling

Inline styles throughout (no CSS modules, no Tailwind). Global resets in `src/index.css`. Dark GitHub-inspired palette. Mobile-first layout capped at `max-width: 430px`.
