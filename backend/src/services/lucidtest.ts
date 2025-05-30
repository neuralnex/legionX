import { Lucid, Blockfrost } from "@lucid-evolution/lucid";
 
const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "<blockfrost-api-key>"),
  "Preprod"
);