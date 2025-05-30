declare module '@lucid-evolution/lucid' {
  export class Lucid {
    static new(provider: any, network: string): Promise<Lucid>;
    selectWallet: {
      fromPrivateKey(privateKey: string): void;
      fromAPI(api: any): void;
      fromAddress(address: string, utxos: UTxO[]): void;
    };
    newTx(): TransactionBuilder;
    utxosAt(address: string): Promise<UTxO[]>;
    validatorToAddress(validator: Script): string;
    wallet(): {
      address(): Promise<string>;
    };
  }

  export class Blockfrost {
    constructor(url: string, projectId: string);
  }

  export class TransactionBuilder {
    pay: {
      ToAddress(address: string, amount: { lovelace: bigint } | { [key: string]: bigint }): TransactionBuilder;
    };
    collectFrom(utxos: UTxO[]): TransactionBuilder;
    attachMetadata(label: number, metadata: any): TransactionBuilder;
    mintAssets(assets: { [key: string]: bigint }): TransactionBuilder;
    complete(): Promise<Transaction>;
  }

  export class Transaction {
    sign: {
      withWallet(): Promise<SignedTransaction>;
    };
    toTransaction(): {
      body(): {
        fee(): Promise<bigint>;
      };
    };
  }

  export class SignedTransaction {
    submit(): Promise<string>;
  }

  export interface UTxO {
    txHash: string;
    outputIndex: number;
    assets: { [key: string]: bigint };
    address: string;
    datum?: string;
  }

  export interface Script {
    type: string;
    script: string;
  }
} 