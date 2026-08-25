import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledAttendanceContractContract, createAttendancePrivateState } from '@midnight-ntwrk/attendance-contract';
import { initializeMidnightProviders } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { syncWallet } from './wallet-utils.js';

export const run = async (config: Config, environment: TestEnvironment, logger: Logger): Promise<void> => {
  logger.info('=== Attendance Contract Deployment to Preview ===');

  try {
    const env = await environment.start();
    logger.info({ network: env.networkId, node: env.node, indexer: env.indexer }, 'Environment started');

    logger.info('Building wallet provider...');
    const seed =
      process.env.WALLET_SEED ??
      (environment as unknown as { genesisMintWalletSeed?: string[] }).genesisMintWalletSeed?.[0];
    const walletProvider = await MidnightWalletProvider.build(logger, env, seed);
    await walletProvider.start();

    logger.info('Syncing wallet and waiting for Dust funds...');
    // We must register NIGHT UTXOs to Dust if we have no Dust, testkit-js has a helper for this:
    const { waitForFunds } = await import('@midnight-ntwrk/testkit-js');
    await waitForFunds(walletProvider.wallet, env, false, walletProvider.unshieldedKeystore as any);
    
    // Wait for the dust registration transaction to confirm
    let dustBalance = 0n;
    while (true) {
        const state = await import('rxjs').then(Rx => Rx.firstValueFrom(walletProvider.wallet.state()));
        dustBalance = state.dust.balance(new Date()) || 0n;
        if (dustBalance > 0n) {
            logger.info(`Dust balance is now ${dustBalance}. Ready to deploy!`);
            break;
        }
        logger.info(`Waiting for dust balance to become available... currently ${dustBalance}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await syncWallet(logger, walletProvider.wallet);
    }

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
      privateStateKeyName: 'attendancePrivateState',
      initialPrivateState,
      args: [],
    } as any);

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
  } catch (err) {
    logger.error({ err }, 'Deployment failed with error');
    console.error('Caught error in deploy.ts:', err);
    throw err;
  }
};
