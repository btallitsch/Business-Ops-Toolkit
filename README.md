# Business Ops Toolkit

A lightweight web application built with React + TypeScript that helps individuals and small teams manage the core operational elements of a business in one place.

## Features

### 📊 KPI Tracker
- Define key metrics with start values, targets, and deadlines
- Log data points over time to track progress
- Auto-computed status: on-track, at-risk, off-track, exceeded
- Sparkline charts for visual trend analysis
- Filter by category and status

### 📓 Decision Log
- Record business decisions with full context: problem, options considered, rationale, and risks
- Track decision status from proposed → implemented
- Record outcomes and measured impact
- Link decisions to KPIs to see cause-and-effect
- Tag system for categorisation

### 🔔 Follow-Up Manager
- Manage contacts and pending actions (clients, leads, partners, vendors)
- Priority system: urgent, high, medium, low
- Activity log per contact — track every touchpoint
- Overdue detection and due-soon alerts
- Mark complete, filter by status, type, and priority

### 🧭 Dashboard
- Operational summary across all three modules
- KPI sparklines with status indicators
- Urgent follow-ups and overdue alerts
- Recent decisions at a glance

## What Makes This Different

Most software focuses on just one of: analytics (dashboards), documentation (decision logs), or task management. Business Ops Toolkit **connects all three**:

- A decision is linked to the KPIs it should move
- A follow-up is linked to the decision that triggered it
- The dashboard shows whether actions are moving the numbers

This creates a simple but powerful **operational memory system** — typically only found in much larger enterprise platforms.

## Tech Stack

- **React 18** + **TypeScript**
- **Recharts** for sparkline charts
- **Vite** for fast dev server and builds
- **localStorage** for persistence (no backend needed)
- **date-fns** for date handling
- **uuid** for unique IDs
- Custom CSS with CSS variables — no UI library dependency

## Project Structure

```
src/
├── types/          # All TypeScript types and interfaces
│   └── index.ts
├── context/        # Global state management
│   └── AppContext.tsx
├── hooks/          # Custom React hooks
│   └── useLocalStorage.ts
├── utils/          # Helpers, formatters, seed data
│   ├── helpers.ts
│   └── seedData.ts
├── styles/         # Global CSS variables and base styles
│   └── globals.css
├── components/
│   ├── layout/     # Sidebar + Header
│   ├── dashboard/  # Dashboard view
│   ├── kpi/        # KPI Tracker, Card, Form
│   ├── decisions/  # Decision Log, Card, Form
│   └── followups/  # Follow-Up Manager, Card, Form
├── App.tsx
└── main.tsx
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app opens at `http://localhost:5173` and comes pre-loaded with sample data so you can explore all features immediately.

## Data Persistence

All data is stored in `localStorage` under the keys `bot:kpis`, `bot:decisions`, and `bot:followups`. No backend or authentication required. Data persists across browser sessions.

## Customisation

- **Colors & Theme**: Edit CSS variables in `src/styles/globals.css`
- **Seed Data**: Modify `src/utils/seedData.ts` to change the default sample data
- **Status Logic**: KPI status auto-calculation lives in `src/utils/helpers.ts` (`computeKPIStatus`)
- **Linking**: Use `linkKPIToDecision`, `linkFollowUpToKPI`, etc. from `AppContext` to create cross-module relationships

## License

MIT
