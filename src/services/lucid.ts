import { Lucid, Blockfrost, validatorToAddress } from "@lucid-evolution/lucid";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config();

// Load the contract address from deployment.json
const deploymentInfo = JSON.parse(
  readFileSync(join(__dirname, "../../smartcontract/deployment.json"), "utf8")
);

const contractAddress = deploymentInfo.contractAddress;

// Initialize Lucid with Blockfrost provider
const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
if (!blockfrostApiKey) {
  throw new Error("BLOCKFROST_API_KEY environment variable is not set. Please add it to your .env file.");
}

const lucid = await Lucid(
  new Blockfrost(
    "https://cardano-preprod.blockfrost.io/api/v0",
    blockfrostApiKey
  ),
  "Preprod"
);

// Export the lucid instance and contract address
export { lucid, contractAddress }; 