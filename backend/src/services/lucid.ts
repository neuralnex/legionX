import { Lucid, Blockfrost, UTxO, LucidEvolution } from "@lucid-evolution/lucid";
import { Logger } from '../utils/logger';
import { AIModelMetadata } from '../types/model';

interface MarketDatum {
  listingId: string;
  price: bigint;
  full_price: bigint | null;
  seller: string;
  action: 'List' | 'Edit' | 'Cancel';
  modelMetadata: AIModelMetadata;
  subscription?: {
    duration: number;
    token: string;
  };
}

interface OracleDatum {
  exchange: bigint;
  timestamp: number;
  currency: string;
}

interface ListingUTxO extends Omit<UTxO, 'datum'> {
  datum: MarketDatum;
}

export class LucidService {
  private lucid!: LucidEvolution;
  private marketValidatorAddress: string;
  private oracleValidatorAddress: string;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private logger: Logger;

  constructor(
    blockfrostApiKey: string,
    marketValidatorAddress: string,
    oracleValidatorAddress: string
  ) {
    this.marketValidatorAddress = marketValidatorAddress;
    this.oracleValidatorAddress = oracleValidatorAddress;
    this.logger = new Logger('LucidService');
    this.initialize(blockfrostApiKey);
  }

  private async initialize(blockfrostApiKey: string) {
    const blockfrost = new Blockfrost(
      "https://cardano-preprod.blockfrost.io/api/v0",
      blockfrostApiKey
    );
    this.lucid = await Lucid(blockfrost, "Preprod");
  }

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.error(`Operation failed (attempt ${i + 1}/${this.maxRetries}):`, error);
        if (i < this.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    throw lastError;
  }

  getLucid(): LucidEvolution {
    return this.lucid;
  }

  async getExchangeRate(currency: string): Promise<bigint> {
    const oracleUtxos = await this.lucid.utxosAt(this.oracleValidatorAddress);
    const oracleUtxo = oracleUtxos.find((utxo: UTxO) => {
      try {
        const datum = JSON.parse(utxo.datum || '{}') as OracleDatum;
        return datum.currency === currency;
      } catch {
        return false;
      }
    });

    if (!oracleUtxo) {
      throw new Error(`No exchange rate found for currency: ${currency}`);
    }

    const datum = JSON.parse(oracleUtxo.datum || '{}') as OracleDatum;
    return datum.exchange;
  }

  async buildSubscriptionTransaction(
    listingUtxo: ListingUTxO,
    buyerUtxos: UTxO[],
    duration: number
  ): Promise<string> {
    const exchangeRate = await this.getExchangeRate('USD');
    const price = listingUtxo.datum.price * BigInt(duration);
    const adaPrice = (price * exchangeRate) / BigInt(1000000); // Convert to ADA

    const tx = await this.lucid
      .newTx()
      .collectFrom([{
        ...listingUtxo,
        datum: JSON.stringify(listingUtxo.datum)
      }])
      .collectFrom(buyerUtxos)
      .attachMetadata(674, {
        msg: ['MBuySub', listingUtxo.datum.listingId],
        duration: duration,
        price: price.toString()
      })
      .pay.ToAddress(this.marketValidatorAddress, {
        ...listingUtxo.assets,
        lovelace: adaPrice
      })
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  async mintOneshotToken(
    utxo: UTxO,
    tokenName: string
  ): Promise<string> {
    const tx = await this.lucid
      .newTx()
      .collectFrom([utxo])
      .attachMetadata(674, {
        msg: ['OneMint'],
        tokenName: tokenName
      })
      .mintAssets({
        [tokenName]: 1n
      })
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  async createListing(
    assetUtxo: UTxO,
    listingId: string,
    price: bigint,
    fullPrice: bigint | null,
    modelMetadata: AIModelMetadata
  ): Promise<string> {
    const datum: MarketDatum = {
      listingId,
      price,
      full_price: fullPrice,
      seller: assetUtxo.address,
      action: 'List',
      modelMetadata
    };

    const tx = await this.lucid
      .newTx()
      .collectFrom([assetUtxo])
      .attachMetadata(674, { 
        msg: [listingId],
        modelMetadata: JSON.stringify(modelMetadata),
        datum: JSON.stringify(datum)
      })
      .pay.ToAddress(this.marketValidatorAddress, assetUtxo.assets)
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  async editListing(
    listingUtxo: ListingUTxO,
    sellerUtxos: UTxO[],
    updatedMetadata: AIModelMetadata
  ): Promise<string> {
    const updatedDatum: MarketDatum = {
      ...listingUtxo.datum,
      action: 'Edit',
      modelMetadata: updatedMetadata
    };

    const tx = await this.lucid
      .newTx()
      .collectFrom([{
        ...listingUtxo,
        datum: JSON.stringify(listingUtxo.datum)
      }])
      .collectFrom(sellerUtxos)
      .attachMetadata(674, { 
        msg: ['Edit', listingUtxo.datum.listingId],
        modelMetadata: JSON.stringify(updatedMetadata),
        datum: JSON.stringify(updatedDatum)
      })
      .pay.ToAddress(this.marketValidatorAddress, listingUtxo.assets)
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  async cancelListing(
    listingUtxo: ListingUTxO,
    sellerUtxos: UTxO[]
  ): Promise<string> {
    const tx = await this.lucid
      .newTx()
      .collectFrom([{
        ...listingUtxo,
        datum: JSON.stringify(listingUtxo.datum)
      }])
      .collectFrom(sellerUtxos)
      .attachMetadata(674, { 
        msg: ['Cancel', listingUtxo.datum.listingId]
      })
      .pay.ToAddress(listingUtxo.datum.seller, listingUtxo.assets)
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  async getListingUTxO(listingId: string): Promise<ListingUTxO | null> {
    return this.retry(async () => {
      const utxos = await this.lucid.utxosAt(this.marketValidatorAddress);
      const listingUtxo = utxos.find((utxo: UTxO) => {
        try {
          const datum = JSON.parse(utxo.datum || '{}') as MarketDatum;
          return datum.listingId === listingId;
        } catch {
          return false;
        }
      });

      if (!listingUtxo) return null;

      return {
        ...listingUtxo,
        datum: JSON.parse(listingUtxo.datum || '{}') as MarketDatum
      };
    });
  }

  async buildPurchaseTransaction(
    listingUtxo: ListingUTxO,
    buyerUtxos: UTxO[],
    sellerAddress: string
  ): Promise<string> {
    const exchangeRate = await this.getExchangeRate('USD');
    const price = listingUtxo.datum.full_price || listingUtxo.datum.price;
    const adaPrice = (price * exchangeRate) / BigInt(1000000); // Convert to ADA

    const tx = await this.lucid
      .newTx()
      .collectFrom([{
        ...listingUtxo,
        datum: JSON.stringify(listingUtxo.datum)
      }])
      .collectFrom(buyerUtxos)
      .attachMetadata(674, {
        msg: ['MBuy', listingUtxo.datum.listingId],
        price: price.toString()
      })
      .pay.ToAddress(sellerAddress, {
        lovelace: adaPrice
      })
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }
} 