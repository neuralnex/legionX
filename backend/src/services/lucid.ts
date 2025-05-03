import {
  Lucid,
  Blockfrost,
  TxComplete,
  SpendingValidator,
  fromText,
  toUnit,
  Data,
} from "lucid-evolution";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";
import { UTxO } from "@lucid-evolution/lucid";

let lucid: Lucid;
let validator: SpendingValidator;

export async function initLucid(): Promise<Lucid> {
  if (lucid) return lucid;

  lucid = await Lucid.new(
    new Blockfrost(process.env.BLOCKFROST_API_URL!, process.env.BLOCKFROST_API_KEY!),
    "Preprod"
  );

  const validatorPath = path.join(__dirname, "../../plutus.json");
  const validatorJson = JSON.parse(fs.readFileSync(validatorPath, "utf8"));
  validator = lucid.utils.validatorFromJson(validatorJson);

  const privateKey = await fs.promises.readFile("owner.sk", "utf8");
  lucid.selectWalletFromPrivateKey(privateKey);

  return lucid;
}

/**
 * Builds a transaction to list an NFT with metadata and payment datum.
 */
export async function buildListingTx(
  lucid: Lucid,
  sellerAddress: string,
  unit: string,
  price: number,
  fullPrice: number,
  duration: number,
  subscriptionId?: string
): Promise<TxComplete> {
  const [policyId, assetNameHex] = [unit.slice(0, 56), unit.slice(56)];
  const datum = Data.to({
    price,
    fullPrice,
    duration,
    seller: sellerAddress,
    subscription: subscriptionId || null,
    owner: sellerAddress,
  });

  const utxos = await lucid.wallet.getUtxos();
  const ownedUtxo = utxos.find((u: UTxO) => u.assets[unit] === 1n);
  if (!ownedUtxo) throw new Error("NFT not found in wallet");

  return await lucid
    .newTx()
    .collectFrom([ownedUtxo], Data.void())
    .payToContract(
      validator.address,
      { inline: datum },
      { [unit]: 1n }
    )
    .payToContract(
      validator.address,
      { inline: Data.void() },
      { lovelace: BigInt(price) }
    )
    .attachMetadata(721, {
      [policyId]: {
        [Buffer.from(assetNameHex, "hex").toString("utf8")]: {
          usage: "model-rights",
          uri: "ipfs://...", // Filled before signing via metadataUri
        },
      },
    })
    .complete();
}

/**
 * Builds a transaction to purchase a listed NFT from the validator.
 */
export async function buildPurchaseTx(
  lucid: Lucid,
  buyerAddress: string,
  utxoRef: string,
  datum: any,
  price: number,
  branch: "MBuyFull" | "MBuySub"
): Promise<TxComplete> {
  const utxos = await lucid.utxosAt(validator.address);
  const targetUtxo = utxos.find((u: UTxO) => `${u.txHash}#${u.outputIndex}` === utxoRef);
  if (!targetUtxo) throw new Error("Listing UTxO not found at script");

  return await lucid
    .newTx()
    .collectFrom([targetUtxo], Data.void())
    .payToAddress(buyerAddress, targetUtxo.assets)
    .attachSpendingValidator(validator)
    .addSigner(buyerAddress)
    .complete();
}

/**
 * Builds a transaction to edit a listing (change price/fullPrice).
 */
export async function buildEditTx(
  lucid: Lucid,
  utxoRef: string,
  updatedDatum: any
): Promise<TxComplete> {
  const utxos = await lucid.utxosAt(validator.address);
  const targetUtxo = utxos.find((u: UTxO) => `${u.txHash}#${u.outputIndex}` === utxoRef);
  if (!targetUtxo) throw new Error("Listing UTxO not found");

  const newDatum = Data.to(updatedDatum);

  return await lucid
    .newTx()
    .collectFrom([targetUtxo], Data.void())
    .payToContract(validator.address, { inline: newDatum }, targetUtxo.assets)
    .attachSpendingValidator(validator)
    .complete();
}

/**
 * Builds a transaction to delist (withdraw) a listing.
 */
export async function buildDelistTx(
  lucid: Lucid,
  utxoRef: string,
  sellerAddress: string
): Promise<TxComplete> {
  const utxos = await lucid.utxosAt(validator.address);
  const targetUtxo = utxos.find((u: UTxO) => `${u.txHash}#${u.outputIndex}` === utxoRef);
  if (!targetUtxo) throw new Error("Listing UTxO not found");

  return await lucid
    .newTx()
    .collectFrom([targetUtxo], Data.void())
    .payToAddress(sellerAddress, targetUtxo.assets)
    .attachSpendingValidator(validator)
    .complete();
}
