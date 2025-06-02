import { Lucid, Blockfrost} from '@lucid-evolution/lucid';
import dotenv from 'dotenv';

dotenv.config();


const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
   if (!blockfrostApiKey) {
        throw new Error("BLOCKFROST_API_KEY environment variable is not set");
   }
 
const lucid = await Lucid(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", blockfrostApiKey),
  "Preprod"
);