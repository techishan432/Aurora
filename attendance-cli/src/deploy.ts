import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledAttendanceContractContract, createAttendancePrivateState } from '@midnight-ntwrk/attendance-contract';
import { initializeMidnightProviders } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { syncWallet } from './wallet-utils.js';

export const run = async (config: Config, environment: TestEnvironment, logger: Logger): Promise<void> => {
  logger.info('=== Attendance Contract Deployment to Preprod ===');

  const env = await environment.start();
  logger.info({ network: env.networkId, node: env.node, indexer: env.indexer }, 'Environment started');

  logger.info('Building wallet provider...');
  const seed =
    process.env.WALLET_SEED ??
    (environment as unknown as { genesisMintWalletSeed?: string[] }).genesisMintWalletSeed?.[0];
  const walletProvider = await MidnightWalletProvider.build(logger, env, seed);
  await walletProvider.start();

  logger.info('Syncing wallet...');
  await syncWallet(logger, walletProvider.wallet);

  // Initialize providers using testkit helpers
  logger.info('Initializing contract providers...');
  const providers = initializeMidnightProviders(walletProvider, env, {
    privateStateStoreName: config.privateStateStoreName,
    zkConfigPath: config.zkConfigPath,
  });

  logger.info('Deploying contract...');
  const secretKey = crypto.getRandomValues(new Uint8Array(32));
  const initialPrivateState = createAttendancePrivateState(secretKey);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  const deployed = await deployContract(providers as any, {
    compiledContract: CompiledAttendanceContractContract,
    privateStateId: 'attendance',
    initialPrivateState,
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  logger.info('✓ Contract deployed successfully!');
  logger.info(`Contract Address: ${contractAddress}`);
  logger.info(`Transaction ID: ${deployed.deployTxData.public.txId}`);

  console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
  console.log(`Contract Address: ${contractAddress}`);
  console.log('\nAdd this to attendance-ui/.env.local:');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('============================\n');

  await walletProvider.stop();
};
