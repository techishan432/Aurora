import { MidnightWalletProvider } from './midnight-wallet-provider.js';
import { createLogger } from './logger-utils.js';
import { getInitialUnshieldedState } from './wallet-utils.js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';

try {
  setNetworkId('preprod');

  const envConfig: EnvironmentConfiguration = {
    walletNetworkId: 'preprod',
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
    proofServer: 'http://localhost:6300',
  };

  const logger = await createLogger('logs/get-address.log');
  const seed = process.env.WALLET_SEED ?? '4b8d9c12e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0';

  const walletProvider = await MidnightWalletProvider.build(logger, envConfig, seed);
  const initialState = await getInitialUnshieldedState(logger, walletProvider.wallet.unshielded);
  const unshieldedAddress = UnshieldedAddress.codec.encode(getNetworkId(), initialState.address).toString();

  console.log('\n========================================================================');
  console.log('📌 MIDNIGHT PREPROD DEPLOYER WALLET');
  console.log('========================================================================');
  console.log(`Unshielded Address (Bech32): ${unshieldedAddress}`);
  console.log(`Seed:                        ${seed}`);
  console.log('========================================================================\n');
  process.exit(0);
} catch (e) {
  console.error('ERROR IN SCRIPT:', e);
  process.exit(1);
}
