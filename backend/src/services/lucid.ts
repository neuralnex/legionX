import { 
  Lucid, 
  Blockfrost, 
  UTxO, 
  Data, 
  TxHash, 
  Address, 
  Assets, 
  Unit, 
  PolicyId,
  Script,
  ScriptType,
  validatorToAddress,
  Network,
  LucidEvolution
} from '@lucid-evolution/lucid';
import { Logger } from '../utils/logger';
import { AIModelMetadata } from '../types/model';
import dotenv from 'dotenv';
import { Listing } from '../entities/Listing';
import { Purchase } from '../entities/Purchase';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { FeeService } from './fee.service';

// Load environment variables
dotenv.config();

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
  private marketValidatorAddress!: Address;
  private oracleValidatorAddress!: Address;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private logger: Logger;
  private walletApi: any | null = null;

  constructor() {
    this.logger = new Logger('LucidService');
    this.initializeLucid();
  }

  private async initializeLucid() {
    try {
      // Initialize Lucid with Blockfrost provider
      this.lucid = await Lucid(
        new Blockfrost(
          process.env.BLOCKFROST_API_URL || 'https://cardano-preprod.blockfrost.io/api/v0',
          process.env.BLOCKFROST_API_KEY || ''
        ),
        (process.env.NETWORK || 'Preprod') as Network
      );
      this.logger.info('Lucid initialized successfully');
    } catch (error) {
      this.logger.error('Error initializing Lucid:', error);
      throw new Error('Failed to initialize Lucid');
    }

    // Get validator addresses using validatorToAddress
    const marketValidator: Script = {
      type: "PlutusV3" as ScriptType,
      script: "59099301010029800aba2aba1aba0aab9faab9eaab9dab9a488888896600264653001300800198041804800cdc3a400530080024888966002600460106ea800e3300130093754007370e90004dc3a40093008375400891114c004c040012602060220092232598009803000c4c8c966002602c0050048b2026375a602800260206ea800e2b300130090018acc004c040dd5001c00a2c808a2c807100e18071baa0024888c966002600e00b15980098089baa00c800c590124566002601400b15980098089baa00c800c590124566002600c00b1323232332259800980d001c4cc01cc0640104cc01c00801a2c80b8c05c004dd6980b801980b800980b00098089baa00c8acc004cdc3a400c00b15980098089baa00c800c5901245900f201e403c8078566002600c601e6ea800a3300130133010375400523014301530150019180a180a980a980a980a980a800c88c8cc00400400c896600200314a115980099b8f375c602e00200714a31330020023018001404880aa601e6ea802e46028602a602a602a602a602a00323014301530153015001912cc004c020c044dd500144c8c8c8c8c8ca60026eb8c06c0066eb4c06c01a6eb8c06c0126036007301b00248888966002604200d13300e302000a1332259800980a800c4c8c966002604a0050048b2044375c6046002603e6ea80122b300130180018acc004c07cdd5002400a2c81022c80e901d099807000806180e1baa0028b203c180d800980d000980c800980c000980b80098091baa0028b20209180a180a980a980a980a800c8c050c0540066e952000488888888888c8cc8966002602801513259800980a980f1baa0018acc004cdc398019bab3006301f37546044603e6ea8004dd69811180f9baa00f8acc004c054c078dd51803980f9baa00f8992cc004c058c07cdd5000c4c8c966002602e60426ea8006266016604a60446ea80044c966002603260446ea8006264b300130193023375400313300d302730243754002264b3001301b3024375400313259800980e18129baa330093758602a604c6ea807896600266ebcc0a8c09cdd5181518139baa001300d3302930123027375402e97ae089919800800992cc004c088c0a0dd5000c52f5bded8c113756605860526ea8005027198069bab300f30283754004910102dead002259800800c52844c96600266e44014006266e3c014006266006006605c0048140dd718141816000a0548a50409514a31640906eb8c0a0c094dd5000c59023180718121baa0148b2044301230233754604c60466ea80062c8108cc014dd6180898111baa01a25980099baf302630233754604c60466ea8004c098c08cdd5181318119baa300a3023375400713375e601460466ea8004c028c08cdd5180518119baa0038a504085164080602060426ea8c020c084dd5000981198101baa0018b2044330063758602460466ea806c96600266ebcc09cc090dd5181398121baa001302730243754604e60486ea8c02cc090dd500244cdd7980598121baa001300b30243754601660486ea80122941022181298111baa0018b2040301030213754601060426ea8004c08cc080dd5000c5901e198011bac3022301f375402e466ebcc08cc080dd5000809c5901d45901d198009bac300d301e375402c466ebcc088c07cdd51811180f9baa001300533021300e301f375401e97ae08b20388b20388acc004c04c02a264653001302300198119812000ccc00cdd6181198101baa01823375e604860426ea80040526eb4c08c009222259800980d18119baa00289919192cc004c074c098dd5000c4c966002603a604e6ea8006264660240022b30015980099b8f375c603060526ea8004dd7180c18149baa0198acc004cdc39bad302c3029375400200d15980099baf30103029375400201315980099baf3011302937540020111330163758602e60526ea8084dd7180c18149baa0198a50409d14a0813a29410274528204e8a518b204e302b30283754003164098602c604e6ea8c0a8c09cdd5000c59025198049bac30153026375403c4b30013375e6054604e6ea8c0a8c09cdd500080144cdd7980718139baa001300e30273754601c604e6ea800e2941025181418129baa3028302537546018604a6ea8004c09cc090dd50014590220c08c004c078dd500cc566002660166eb0c030c078dd500b1bae300d301e375401d14a316407080e101c203823259800980b980e9baa0018a40011375a6042603c6ea800501c192cc004c05cc074dd5000c5300103d87a8000899198008009bab3022301f375400444b30010018a6103d87a8000899192cc004cdc8a45000018acc004cdc7a441000018980419812181100125eb82298103d87a80004081133004004302600340806eb8c080004c08c005021203833002001489002232330010010032259800800c530103d87a80008992cc004c0100062600e6604600297ae08998018019812801203e3023001408444646600200200644b30010018a6103d87a8000899192cc004cdc8802800c56600266e3c0140062600e66046604200497ae08a60103d87a8000407d1330040043025003407c6eb8c07c004c08800502022c80708b200e180400098019baa0088a4d1365640041"
    };

    const oracleValidator: Script = {
      type: "PlutusV3" as ScriptType,
      script: "5908af010100229800aba2aba1aba0aab9faab9eaab9dab9a48888889660033001300337540112232330010010032259800800c528456600266e3cdd71805000801c528c4cc008008c02c00500520109180398041804000c96600266e252002001899b890014820302a32a68ea2941002496600266e252000001899b890014820212bd7e294100248c01cc0200066e1d2000911919800800801912cc004006298103d87a80008992cc004c010006266e9520003300a0014bd7044cc00c00cc0300090061805000a0109b874800922222222298009808004cc03c02646601297ae10104435553440081044345555200810443474250008104434a505900810443415544008104434341440081044343484600810443434e5900810443494e520081044342524c00000c8966002600a601a6ea800a26464653001375c6028003375a6028007375a60280049112cc004c06001200f16405430140013013001300e3754005164031223259800980218071baa0018a5eb7bdb18226eacc048c03cdd5000a01a32330010010032259800800c5300103d87a8000899192cc004cdc8802800c56600266e3c014006266e9520003301430120024bd7045300103d87a80004041133004004301600340406eb8c040004c04c0050112444446530013011375400325980098029bae300e3013375400315980098069bad30163013375400315980098061bad30163013375400313371090001bad300b3013375400314a0808a294101145282022980a8032444b3001300c00389919912cc004c03c00626464653001375c603c003375a603c007375a603c0049112cc004c08801201116407c301e001301d001301837540091598009806800c56600260306ea801200516406516405880b04c8c966002b3001300f3017375400913233225980098069bae301e301f0028acc004c0540062b30013014001899b8848000dd6980f001452820328a50406514a080c8c074004dd6980e000980c1baa0048a51405913259800980e800c4c8cc8966002602660366ea8022264653001375a6042003375c60426044003375a60420049112cc004c060c080dd51980b9bac302400b23375e604a60446ea80040a2264b30013019302137540031325980099baf3374a9001198129ba900e4bd70181318119baa3026302337540031325980099b8748010c08cdd5000c4c8cc058004566002602400315980099b8f00b4881008acc004c06802a2b30013370e6eb4c0a0c094dd5000802c56600266e1cdd6980e98129baa001007899b8f375c6040604a6ea800401a2941023452820468a50408d14a0811a2c8118c09cc090dd5000c59022180f18119baa0018b20423025302237540031640806602e6eb0c0900288cdd79ba632330010013756603660466ea8008896600200314bd6f7b63044ca60026eb8c0900066eacc09400660520049112cc004cdc8a45000038acc004cdc7a441000038800c401502644cc0a8cdd81ba9003374c0046600c00c0028130604e0028128dd32cc004c06401e297adef6c608991919800800a5eb7bdb1808966002003133027337606ea4040dd3001a5eb7bdb1822653001375c604a0033756604c003302a00248896600266e4005000e26605666ec0dd480a1ba60070058acc004cdc780a001c4cc0accdd81ba9014374c00e00313302b337606ea400cdd300119803003000a04e409c30280014098646600200297adef6c602259800800c4cc098cdd81ba900a375001297adef6c608994c004dd71812000cdd69812800cc0a40092225980099b9000e00389981519bb0375201c6ea00340162b30013371e01c00713302a337606ea4038dd4006800c4cc0a8cdd81ba900337500046600c00c00281310260c09c00502520408b203e1810800980e1baa008899b870014800501a1bae3019001375a60340026038003164068660106eacc06cc070c07000400e2c80b0c06cc06c004c058dd5004980a9baa002375c6030602a6ea80122b3001300a003899199119912cc004c044006264646644b3001302200380345901f1bad301f001375a603e004603e00260346ea801a2b3001300f0018acc004c068dd5003400a2c80da2c80c1018099192cc004c044c064dd5001c4c9660026010003132598009809980d9baa001899192cc004c04cc074dd5000c4c966002b30013016301e3754017132332259800980e00145660026036005159800992cc004cdc400080144cdc480119b8000148280e229410211bad301a30223754011133712903c19b81001375a603460446ea80222941020452820408a5040806eb4c08c004dd698119812000980f9baa00b8a514075159800980b180f1baa00b8994c004dd69811800cdd698119812000ccc058dd6181180392cc004cc074c8cc004004dd5980d18111baa0022259800800c52f5c113302530223026001330020023027001409000713375e604860426ea8c090c084dd50008024528203e488966002603460446ea8006264b30013370e900218119baa0018991980b0008acc004c0480062b30013370e6eb4c0a0c094dd5000802c56600266e3cdd7181018129baa001375c6040604a6ea802e2b30013370e6eb4c074c094dd500080244cdc41bad301d3025375401600914a0811a2941023452820468b2046302730243754003164088603c60466ea8c098c08cdd5000c590210c07cdd5005c4cc8966002646466ebcdd398008019ba7300100430010012259800800c52f5c1133025302230260013300200230270014091132325980099baf374e6002006981039f20ff00899baf374e6002008981039f01ff008a504084600200244b30010018a5eb8226604a6046604c00266004004604e0028122294101f198079bab3017301f3754602e603e6ea800c004cc03cdd5981118119811803000a03a8b203a375c6042603c6ea80062c80e0c080c074dd51810180e9baa3015301d3754002603e60386ea80062c80d0cc044dd6180f001919baf301f301c375400200d164064603a60346ea800e2c80c0c074c074004c060dd5005980b9baa00430190013019301a0013015375400916404c80986028602a00a452689b2b20021"
    };

    this.marketValidatorAddress = validatorToAddress("Preprod" as Network, marketValidator);
    this.oracleValidatorAddress = validatorToAddress("Preprod" as Network, oracleValidator);
  }

  /**
   * Set the wallet API for transaction signing
   */
  setWalletApi(walletApi: any): void {
    this.walletApi = walletApi;
    if (this.walletApi) {
      this.lucid.selectWallet.fromAPI(this.walletApi);
      this.logger.info('Wallet API set for transaction signing');
    } else {
      this.logger.warn('No wallet API provided');
    }
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

  /**
   * Calculate total fees for a transaction
   */
  private async calculateTotalFees(
    amount: number,
    platformFeePercentage: number = 0.03 // 3% platform fee
  ): Promise<{ networkFee: bigint, platformFee: bigint }> {
    // Calculate platform fee
    const platformFee = BigInt(Math.floor(amount * platformFeePercentage * 1000000)); // Convert to Lovelace

    // Draft transaction to calculate network fee
    const draftTx = await this.lucid
      .newTx()
      .pay.ToAddress(this.marketValidatorAddress, {
        lovelace: BigInt(amount * 1000000) + platformFee
      })
      .complete();

    // Get network fee
    const networkFee = await draftTx.toTransaction().body().fee();

    return { networkFee, platformFee };
  }

  /**
   * Build and submit a fee transaction with all fees included
   */
  async buildFeeTransaction(
    amount: number,
    treasuryAddress: string,
    description: string,
    platformFeePercentage: number = 0.03
  ): Promise<string> {
    // Calculate all fees
    const { networkFee, platformFee } = await this.calculateTotalFees(amount, platformFeePercentage);
    const totalAmount = BigInt(amount * 1000000) + platformFee;

    // Build the final transaction with all fees included
    const tx = await this.lucid
      .newTx()
      .attachMetadata(674, {
        msg: ['FeePayment'],
        description: description,
        amount: amount.toString(),
        platformFee: platformFee.toString(),
        networkFee: networkFee.toString()
      })
      .pay.ToAddress(treasuryAddress, {
        lovelace: totalAmount
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

    // First, create the listing on-chain (user pays network fee)
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

    // Calculate transaction fee (3%)
    const transactionFee = (adaPrice * BigInt(3)) / BigInt(100);

    // Build transaction with both payment and fee
    const tx = await this.lucid
      .newTx()
      .collectFrom([{
        ...listingUtxo,
        datum: JSON.stringify(listingUtxo.datum)
      }])
      .collectFrom(buyerUtxos)
      .attachMetadata(674, {
        msg: ['MBuy', listingUtxo.datum.listingId],
        price: price.toString(),
        transactionFee: transactionFee.toString()
      })
      .pay.ToAddress(sellerAddress, {
        lovelace: adaPrice - transactionFee // Seller gets price minus fee
      })
      .pay.ToAddress(this.marketValidatorAddress, {
        lovelace: transactionFee // Platform fee goes to market validator
      })
      .complete();

    const signedTx = await tx.sign.withWallet().complete();
    return await signedTx.submit();
  }

  /**
   * Estimate network fee for a transaction
   */
  async estimateNetworkFee(tx: any): Promise<bigint> {
    try {
      const fee = await tx.fee();
      return fee;
    } catch (error) {
      this.logger.error('Error estimating network fee:', error);
      throw new Error('Failed to estimate network fee');
    }
  }

  /**
   * Connect a testnet wallet using a private key
   */
  async connectTestnetWallet(privateKey: string): Promise<void> {
    try {
      this.lucid.selectWallet.fromPrivateKey(privateKey);
      const address = await this.lucid.wallet().address();
      this.logger.info(`Testnet wallet connected: ${address}`);
    } catch (error) {
      this.logger.error('Error connecting testnet wallet:', error);
      throw new Error('Failed to connect testnet wallet');
    }
  }

  /**
   * Connect Eternl wallet as fee payer
   */
  async connectEternlFeePayer(): Promise<void> {
    try {
      // In a backend environment, we need to receive the wallet API from the frontend
      if (!this.walletApi) {
        throw new Error('No wallet API provided. Please set the wallet API first using setWalletApi()');
      }

      // Connect the wallet to Lucid for fee payments
      this.lucid.selectWallet.fromAPI(this.walletApi);
      
      // Get the connected address
      const address = await this.lucid.wallet().address();
      this.logger.info(`Eternl wallet connected as fee payer: ${address}`);
    } catch (error) {
      this.logger.error('Error connecting Eternl fee payer:', error);
      throw new Error('Failed to connect Eternl fee payer');
    }
  }

  /**
   * Connect a wallet to the Lucid instance
   */
  async connectWallet(walletAddress: string): Promise<void> {
    try {
      const utxos = await this.lucid.utxosAt(walletAddress);
      this.lucid.selectWallet.fromAddress(walletAddress, utxos);
      this.logger.info(`Wallet connected: ${walletAddress}`);
    } catch (error) {
      this.logger.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  /**
   * Connect a user's wallet for transaction signing
   */
  async connectUserWallet(walletAddress: string, utxos: UTxO[]): Promise<void> {
    try {
      // Connect using the provided address and UTxOs
      this.lucid.selectWallet.fromAddress(walletAddress, utxos);
      this.logger.info(`User wallet connected: ${walletAddress}`);
    } catch (error) {
      this.logger.error('Error connecting user wallet:', error);
      throw new Error('Failed to connect user wallet');
    }
  }

  /**
   * Sign a transaction with the connected user wallet
   */
  async signTransaction(tx: any): Promise<string> {
    try {
      const signedTx = await tx.sign.withWallet().complete();
      return await signedTx.submit();
    } catch (error) {
      this.logger.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  // Comment out treasury wallet methods for now
  /*
  async initializeTreasuryWalletFromSeed(): Promise<void> {
    // ... existing code ...
  }

  async initializeTreasuryWalletFromJson(): Promise<void> {
    // ... existing code ...
  }
  */
} 