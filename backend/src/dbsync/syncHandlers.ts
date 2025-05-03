import { AppDataSource } from "../db/data-source";
import { Listing } from "../entities/Listing";
import { Purchase } from "../entities/Purchase";
import { Fee } from "../entities/Fee";

/**
 * Confirms a listing by updating its status.
 */
export async function confirmListing(txHash: string): Promise<void> {
  const listingRepo = AppDataSource.getRepository(Listing);
  const listing = await listingRepo.findOneBy({ txHash });
  if (listing && listing.status !== "confirmed") {
    listing.status = "confirmed";
    await listingRepo.save(listing);
  }
}

/**
 * Confirms a purchase and returns the purchase entry.
 */
export async function confirmPurchase(txHash: string): Promise<Purchase | null> {
  const purchaseRepo = AppDataSource.getRepository(Purchase);
  const purchase = await purchaseRepo.findOneBy({ txHash });
  if (purchase && purchase.status !== "confirmed") {
    purchase.status = "confirmed";
    await purchaseRepo.save(purchase);
    return purchase;
  }
  return null;
}

/**
 * Records a marketplace fee associated with a purchase.
 */
export async function recordFee(purchase: Purchase, feePercent: number): Promise<void> {
  const feeRepo = AppDataSource.getRepository(Fee);

  const feeAmount = Number(purchase.amount) * (feePercent / 100);
  const fee = new Fee();
  fee.purchase = purchase;
  fee.feeAmount = feeAmount;
  fee.recordedAt = new Date();

  await feeRepo.save(fee);
}
