import { Blockfrost } from '@lucid-evolution/lucid';

declare module '@lucid-evolution/lucid' {
  export interface Lucid {
    // Add any Lucid interface methods you need
    selectWallet: any;
    newTx: () => any;
    utxosAt: (address: string) => Promise<any[]>;
    validatorToAddress: (validator: any) => string;
  }

  export function Lucid(
    provider: Blockfrost,
    network: "Mainnet" | "Preprod" | "Preview" | "Custom"
  ): Promise<Lucid>;
} 