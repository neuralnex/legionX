import { AppDataSource } from "../db/data-source";
import { Listing } from "../entities/Listing";
import { Purchase } from "../entities/Purchase";
import { Fee } from "../entities/Fee";

export async function getPendingListings(): Promise<Listing[]> {
  return await AppDataSource.getRepository(Listing).findBy({ status: "pending" });
}

export async function updateListingStatus(id: number, status: string) {
  await AppDataSource.getRepository(Listing).update({ id }, { status });
}

export async function getPendingPurchases(): Promise<Purchase[]> {
  return await AppDataSource.getRepository(Purchase).findBy({ status: "pending" });
}

export async function updatePurchaseRecord(id: number, status: string) {
  await AppDataSource.getRepository(Purchase).update({ id }, { status });
}

export async function recordMarketplaceFee(purchaseId: number, feeAmount: number) {
  const fee = new Fee();
  fee.purchaseId = purchaseId;
  fee.feeAmount = feeAmount;
  fee.recordedAt = new Date();
  await AppDataSource.getRepository(Fee).save(fee);
}
