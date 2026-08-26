import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledAttendanceContractContract, createAttendancePrivateState } from '@midnight-ntwrk/attendance-contract';
import { initializeMidnightProviders } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { syncWallet } from './wallet-utils.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { FaucetClient } from '@midnight-ntwrk/testkit-js';
import axios from 'axios';
import * as Rx from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { getInitialUnshieldedState } from './wallet-utils.js';

const registerNightUtxosForDust = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  unshieldedKeystore: any,
  logger: Logger,
): Promise<string | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const state: any = await firstValueFrom(wallet.state());
  const unshieldedRaw = unshieldedToken().raw;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unregistered = state.unshielded.availableCoins.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (coin: any) => coin.utxo.type === unshieldedRaw && coin.meta.registeredForDustGeneration === false,
  );
  if (unregistered.length === 0) {
    logger.warn('No unregistered NIGHT UTXOs available to register for dust generation');
    return undefined;
  }
  logger.info(`Registering ${unregistered.length} NIGHT UTXO(s) for dust generation...`);
  const recipe = await wallet.registerNightUtxosForDustGeneration(
    unregistered,
    unshieldedKeystore.getPublicKey(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (payload: any) => unshieldedKeystore.signData(payload),
  );
  const finalized = await wallet.finalizeRecipe(recipe);
  const txId = await wallet.submitTransaction(finalized);
  logger.info(`Dust registration tx submitted: ${txId}`);
  return txId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const syncWalletWithTimeout = (logger: Logger, wallet: any, timeoutMs = 600_000): Promise<any> => {
  logger.info('Syncing wallet state...');
  return firstValueFrom(
    wallet.state().pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rx.tap((state: any) => {
        const shieldedSynced = state.shielded.state.progress?.isStrictlyComplete?.() ?? false;
        const unshieldedSynced = state.unshielded.progress?.isStrictlyComplete?.() ?? false;
        const dustSynced = state.dust.state.progress?.isStrictlyComplete?.() ?? false;
        logger.debug(
          `Wallet synced state emission: { shielded=${shieldedSynced}, unshielded=${unshieldedSynced}, dust=${dustSynced} }`,
        );
      }),
      Rx.throttleTime(3000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rx.filter((state: any) => {
        const shieldedSynced = state.shielded.state.progress?.isStrictlyComplete?.() ?? false;
        const unshieldedSynced = state.unshielded.progress?.isStrictlyComplete?.() ?? false;
        const dustSynced = state.dust.state.progress?.isStrictlyComplete?.() ?? false;
        return shieldedSynced && unshieldedSynced && dustSynced;
      }),
      Rx.tap(() => logger.info('Sync complete')),
      Rx.timeout({
        each: timeoutMs,
        with: () => Rx.throwError(() => new Error(`Wallet sync timeout after ${timeoutMs}ms`)),
      }),
    ),
  );
};

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
    if (walletProvider.unshieldedKeystore) {
      const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
      const unshieldedAddress = UnshieldedAddress.codec.encode(getNetworkId(), initialState.address).toString();
      const nightTokenRaw = unshieldedToken().raw;
      logger.info(`Your unshielded wallet address is: ${unshieldedAddress}`);

      if (env.faucet) {
        logger.info('Requesting tokens from faucet...');
        try {
          await new FaucetClient(env.faucet, logger).requestTokens(unshieldedAddress);
          logger.info('Faucet request sent successfully');
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            logger.warn('Faucet rate limited, proceeding with wallet sync');
          } else {
            logger.warn({ error }, 'Faucet request failed');
          }
        }
      }

      logger.info('Waiting for wallet to sync...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const syncedState: any = await syncWalletWithTimeout(logger, walletProvider.wallet, 600_000);
      const balance = syncedState.unshielded.balances[nightTokenRaw] ?? 0n;
      logger.info(`Unshielded NIGHT balance: ${balance}`);

      if (syncedState.dust.balance(new Date()) === 0n && balance > 0n) {
        logger.info('Registering NIGHT UTXOs for dust generation...');
        await registerNightUtxosForDust(walletProvider.wallet, walletProvider.unshieldedKeystore, logger);
      }
    }

    // Wait for the dust balance to confirm
    let dustBalance = 0n;
    while (true) {
      const state = await firstValueFrom(walletProvider.wallet.state());
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

    const deployed = await deployContract(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      providers as any,
      {
        compiledContract: CompiledAttendanceContractContract,
        privateStateKeyName: 'attendancePrivateState',
        initialPrivateState,
        args: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    );

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
