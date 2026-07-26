import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { TestEnvironment } from '@midnight-ntwrk/testkit-js';

/**
 * Production CLI entrypoint. Wallet proof construction belongs in the wallet
 * extension; this process only verifies its network environment and guides an
 * operator to use the deployed contract address configured in the web app.
 */
export const run = async (_config: Config, environment: TestEnvironment, logger: Logger): Promise<void> => {
  const env = await environment.start();
  logger.info({ network: env.networkId, node: env.node, indexer: env.indexer }, 'Attendance CLI environment ready');
  logger.info('Deploy the attendance contract, set <YOUR_DEPLOYED_CONTRACT_ADDRESS> in attendance-ui/.env.local, then use the wallet-connected UI.');
};
