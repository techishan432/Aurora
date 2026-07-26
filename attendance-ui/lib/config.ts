const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '<YOUR_DEPLOYED_CONTRACT_ADDRESS>';
export const config = {
  network: process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK ?? 'preprod',
  contractAddress: address,
  isConfigured: address !== '<YOUR_DEPLOYED_CONTRACT_ADDRESS>',
};
