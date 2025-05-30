import { Lucid, Blockfrost, validatorToAddress } from "@lucid-evolution/lucid";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables
config();

async function deployContract() {
  try {
    // Check for Blockfrost API key
    const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
    if (!blockfrostApiKey) {
      throw new Error("BLOCKFROST_API_KEY environment variable is not set. Please add it to your .env file.");
    }

    // Initialize Lucid with Blockfrost provider
    const lucid = await Lucid(
      new Blockfrost(
        "https://cardano-preprod.blockfrost.io/api/v0",
        blockfrostApiKey
      ),
      "Preprod"
    );

    // Load the compiled contract
    const plutusJson = JSON.parse(
      readFileSync(join(__dirname, "plutus.json"), "utf8")
    );

    // Get the market validator
    const marketValidator = plutusJson.validators.find(
      (v: any) => v.title === "market.market.spend"
    );

    if (!marketValidator) {
      throw new Error("Market validator not found in plutus.json");
    }

    // Create the contract address using the correct method
    const contractAddress = validatorToAddress("Preprod", marketValidator.compiledCode);
    console.log("Contract Address:", contractAddress);

    // Save the contract address to a file
    const deploymentInfo = {
      contractAddress,
      network: "Preprod",
      deployedAt: new Date().toISOString(),
      validatorHash: marketValidator.hash
    };

    // Write deployment info to a file
    const fs = require("fs");
    fs.writeFileSync(
      join(__dirname, "deployment.json"),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment info saved to deployment.json");
    return contractAddress;
  } catch (error) {
    console.error("Error deploying contract:", error);
    throw error;
  }
}

// Run the deployment
deployContract()
  .then((address) => {
    console.log("Contract deployed successfully!");
    console.log("Contract Address:", address);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  }); 