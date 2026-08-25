# @midnight-ntwrk/attendance-cli

Command-line tool for deploying and interacting with the **Aurora** attendance contract on the Midnight Network
(formerly Private Student Attendance / PSA).

## Entry Points

| Script              | Target Network     |
|---------------------|--------------------|
| `npm run standalone` | Local standalone  |
| `npm run preview-remote` | Preview remote |
| `npm run preprod-remote` | Preprod remote  |

## Scripts

| Script              | Description                          |
|---------------------|--------------------------------------|
| `npm run build`     | Compile TypeScript to `dist/`        |
| `npm run typecheck` | Type-check without emitting          |
| `npm run lint`      | Run ESLint                           |
| `npm run ci`        | Run typecheck + lint + build         |
