import type { Logger } from 'pino';
import type { Config } from './config.js';
import type { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledAttendanceContractContract, createAttendancePrivateState } from '@midnight-ntwrk/attendance-contract';
import { initializeMidnightProviders } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider.js';
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
const waitForUnshieldedBalance = (logger: Logger, wallet: any, tokenRaw: string, timeoutMs = 300_000): Promise<any> => {
  logger.info('Waiting for unshielded NIGHT funds to arrive from faucet...');
  return firstValueFrom(
    wallet.state().pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rx.tap((state: any) => {
        const balance = state.unshielded?.balances?.[tokenRaw] ?? 0n;
        const availableCoins = state.unshielded?.availableCoins?.length ?? 0;
        logger.info(`Checking unshielded balance: ${balance} (${availableCoins} UTXOs available)`);
      }),
      Rx.throttleTime(3000),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Rx.filter((state: any) => {
        const balance = state.unshielded?.balances?.[tokenRaw] ?? 0n;
        return balance > 0n;
      }),
      Rx.tap(() => logger.info('✓ Unshielded NIGHT funds confirmed!')),
      Rx.timeout({
        each: timeoutMs,
        with: () => Rx.throwError(() => new Error(`Timeout waiting for funds after ${timeoutMs}ms`)),
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
      (environment as unknown as { genesisMintWalletSeed?: string[] }).genesisMintWalletSeed?.[0] ??
      '4b8d9c12e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0';
    const walletProvider = await MidnightWalletProvider.build(logger, env, seed);
    await walletProvider.start();

    logger.info('Syncing wallet and waiting for Dust funds...');
    if (walletProvider.unshieldedKeystore) {
      const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
      const unshieldedAddress = UnshieldedAddress.codec.encode(getNetworkId(), initialState.address).toString();
      const nightTokenRaw = unshieldedToken().raw;
      logger.info(`Your unshielded wallet address is: ${unshieldedAddress}`);

      console.log('\n======================================================');
      console.log('📌 PREPROD WALLET DEPLOYMENT ADDRESS:');
      console.log(`   Address: ${unshieldedAddress}`);
      console.log('👉 To fund this wallet on Midnight Preprod:');
      console.log('   1. Open https://midnight-tmnight-preprod.nethermind.dev/ in your browser');
      console.log(`   2. Paste address: ${unshieldedAddress}`);
      console.log('   3. Complete the Captcha & click "Request Tokens"');
      console.log('   (Or run with WALLET_SEED=<your_funded_seed>)');
      console.log('⏳ Waiting for funds on Midnight Preprod...');
      console.log('======================================================\n');

      if (env.faucet) {
        logger.info('Attempting automated faucet request...');
        try {
          await new FaucetClient(env.faucet, logger).requestTokens(unshieldedAddress);
          logger.info('Faucet request sent');
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            logger.warn('Faucet rate limited, waiting for manual funding or existing balance');
          } else {
            logger.warn({ error }, 'Faucet request rejected (Captcha required in browser)');
          }
        }
      }

      await waitForUnshieldedBalance(logger, walletProvider.wallet, nightTokenRaw, 600_000);
      logger.info('Registering NIGHT UTXOs for dust generation...');
      await registerNightUtxosForDust(walletProvider.wallet, walletProvider.unshieldedKeystore, logger);
    }

    // Wait for the dust balance to confirm
    let dustBalance = 0n;
    logger.info('Waiting for dust balance to generate from registered UTXOs...');
    while (true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state: any = await firstValueFrom(walletProvider.wallet.state());
      dustBalance = state.dust.balance(new Date()) || 0n;
      if (dustBalance > 0n) {
        logger.info(`✓ Dust balance is now ${dustBalance}. Ready to deploy!`);
        break;
      }
      logger.info(`Waiting for dust balance to become available... currently ${dustBalance}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
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
