import { AppDataSource } from "../db/data-source";
import { Listing } from "../entities/Listing";
import { Purchase } from "../entities/Purchase";
import { getTxsAtAddress, getTxOutputs, getTxMetadata } from "./dbsyn";
import { confirmListing, confirmPurchase, recordFee } from "./syncHandlers";
import { MARKETPLACE_ADDRESS, MARKETPLACE_FEE_PERCENT } from "../config/marketplace";

export async function pollMarketplaceEvents() {
  try {
    await AppDataSource.initialize();
    console.log("[DB] Connected");

    // Fetch recent transactions at marketplace address
    const txs = await getTxsAtAddress(MARKETPLACE_ADDRESS);
    for (const tx of txs) {
      const txHash = tx.tx_hash;

      // Confirm listing if exists
      const listing = await AppDataSource.getRepository(Listing).findOneBy({ txHash });
      if (listing && listing.status !== "confirmed") {
        console.log(`[Listing] Confirming listing tx ${txHash}`);
        await confirmListing(txHash);
      }

      // Confirm purchase if exists
      const purchase = await AppDataSource.getRepository(Purchase).findOneBy({ txHash });
      if (purchase && purchase.status !== "confirmed") {
        console.log(`[Purchase] Confirming purchase tx ${txHash}`);
        const confirmedPurchase = await confirmPurchase(txHash);

        if (confirmedPurchase) {
          await recordFee(confirmedPurchase, MARKETPLACE_FEE_PERCENT);
          console.log(`[Fee] Recorded ${MARKETPLACE_FEE_PERCENT}% for tx ${txHash}`);
        }
      }
    }

    await AppDataSource.destroy();
    console.log("[DB] Disconnected");
  } catch (error) {
    console.error("[Poller] Error:", error);
  }
}

// Run once or set interval
pollMarketplaceEvents();
// Optionally run on interval
// setInterval(pollMarketplaceEvents, 30000); // every 30 seconds
