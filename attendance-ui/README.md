# Aurora — Attendance UI

Next.js 16 frontend for **Aurora**, zero-knowledge student attendance on the Midnight Network. Formerly known as
Private Student Attendance (PSA).

The interface follows the **Atmospheric Glass** design system (see [`design.md`](../design.md)): a vibrant aurora
gradient canvas with frosted glass surfaces, Inter typography, and a strict 8px spacing grid.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **UI:** Atmospheric Glass design system — plain CSS tokens + reusable primitives (`app/components/`)
- **State:** Zustand 5
- **Language:** TypeScript 5.9

## Key Files

| File                                     | Purpose                                                    |
| ---------------------------------------- | ---------------------------------------------------------- |
| `app/page.tsx`                           | Root view — composes header, tabs, modals, toasts          |
| `app/layout.tsx`                         | Aurora metadata, Inter font, aurora background canvas      |
| `app/styles.css`                         | Design tokens and component styles                         |
| `app/components/`                        | Reusable primitives (buttons, cards, fields, modals, etc.) |
| `app/components/tabs/`                   | Home, Dashboard, Analytics, Activity, Settings views       |
| `app/components/modals/`                 | Open-session and check-in dialogs                          |
| `app/providers.tsx`                      | React Query provider                                       |
| `store/use-attendance-store.ts`          | Zustand store for wallet, session & activity lifecycle     |
| `lib/config.ts`                          | Contract address and network configuration                 |
| `lib/format.ts`                          | Display formatting helpers                                 |

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start Next.js dev server             |
| `npm run build`     | Build production bundle              |
| `npm run start`     | Start production server              |
| `npm run lint`      | Run ESLint                           |
| `npm run typecheck` | Type-check without emitting          |
| `npm run ci`        | Run typecheck + lint + build         |

## Environment

Set the deployed contract address in `.env.local`:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
NEXT_PUBLIC_MIDNIGHT_NETWORK=preprod
```
