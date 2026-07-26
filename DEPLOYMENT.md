# Deployment

1. Compile `contract/src/attendance.compact` and deploy it with the Midnight CLI/wallet.
2. Set `NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>` in `attendance-ui/.env.local`.
3. Build and run `docker compose up --build`.

No private key, student identifier, roster, attendance evidence, or secret salt belongs in an environment file.
