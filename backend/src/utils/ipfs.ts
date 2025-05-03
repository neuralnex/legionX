import axios from "axios";
import { AgentMetadata } from "../metadata/schema";
import dotenv from "dotenv";

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

export async function uploadMetadataToIPFS(metadata: AgentMetadata): Promise<string> {
  try {
    const response = await axios.post(
      PINATA_URL,
      {
        pinataMetadata: {
          name: `${metadata.name}-metadata`,
        },
        pinataContent: metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  } catch (error: any) {
    console.error("❌ IPFS upload failed:", error?.response?.data || error.message);
    throw new Error("IPFS upload failed");
  }
}
