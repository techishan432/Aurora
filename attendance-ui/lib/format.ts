export const shortenAddress = (address: string): string =>
  address.length > 22 ? `${address.slice(0, 12)}…${address.slice(-8)}` : address;
