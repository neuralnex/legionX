export interface UTXO {
    txHash: string;
    outputIndex: number;
    amount: number;
    address: string;
    assets?: {
        [key: string]: number;
    };
}

export interface TransactionDetails {
    txHash: string;
    blockHeight: number;
    timestamp: number;
    inputs: UTXO[];
    outputs: UTXO[];
    metadata?: {
        [key: string]: {
            msg?: string;
            ipfs?: string;
        };
    };
} 