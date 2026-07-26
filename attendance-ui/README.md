# @midnight-ntwrk/attendance-ui

Next.js 16 frontend for the Private Student Attendance (PSA) platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **UI:** Material UI (MUI) v7
- **State:** Zustand 5
- **Language:** TypeScript 5.9

## Key Files

| File                          | Purpose                                         |
|-------------------------------|-------------------------------------------------|
| `app/page.tsx`                | Main dashboard page                             |
| `app/layout.tsx`              | Root layout with MUI theme and providers        |
| `app/providers.tsx`           | React context providers (theme, wallet)          |
| `store/use-attendance-store.ts` | Zustand store for session & activity lifecycle |
| `lib/config.ts`               | Contract address and network configuration      |

## Scripts

| Script              | Description                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Start Next.js dev server                     |
| `npm run build`     | Build production bundle                      |
| `npm run start`     | Start production server                      |
| `npm run lint`      | Run ESLint                                   |
| `npm run typecheck` | Type-check without emitting                  |
| `npm run ci`        | Run typecheck + lint + build                 |

## Environment

Set the deployed contract address in `.env.local`:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```
