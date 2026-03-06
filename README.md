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

---

## Firebase Setup (Cloud Sync)

This version adds Firebase Firestore cloud sync and authentication. Follow these steps to connect your Firebase project:

### 1. Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**, give it a name, and complete the setup wizard
3. From the project overview, click the **Web** icon (`</>`) to add a web app
4. Copy the `firebaseConfig` values shown — you'll need them in step 3

### 2. Enable Firestore and Authentication

**Firestore Database:**
1. In the left sidebar, go to **Build → Firestore Database**
2. Click **Create database**, choose **Start in production mode**, pick a region
3. After creation, go to the **Rules** tab and paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
4. Click **Publish**

**Authentication:**
1. In the left sidebar, go to **Build → Authentication**
2. Click **Get started**
3. Enable **Anonymous** sign-in (for first-time users)
4. Enable **Email/Password** sign-in (for account creation and cross-device access)

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Run the App

```bash
npm install
npm run dev
```

### How Sync Works

- **Anonymous auth**: On first load, users are automatically signed in anonymously — no friction, immediate access
- **Optimistic updates**: UI updates instantly; writes to Firestore happen in the background
- **Real-time sync**: Firestore `onSnapshot` listeners mean changes appear instantly across tabs/devices
- **Offline support**: IndexedDB persistence means the app works offline; writes queue and sync when reconnected
- **Account upgrade**: Users can convert their anonymous session to a full email account (same UID = same data) via the account button in the sidebar
- **Sync status indicator**: Bottom of the sidebar shows live sync state: Loading / Saving / Synced / Offline / Error

### Data Structure in Firestore

```
users/
  {uid}/
    kpis/
      {kpiId} → KPI document
    decisions/
      {decisionId} → Decision document
    followups/
      {followUpId} → FollowUp document
```
