// utils/addressValidator.ts

export function isValidKadenaAddress(address: string): boolean {
    // Kadena addresses start with 'k:' followed by 64 hexadecimal characters
    const kadenaAddressRegex = /^k:[a-fA-F0-9]{64}$/;
    return kadenaAddressRegex.test(address);
  }