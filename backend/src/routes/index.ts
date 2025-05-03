import express, { Router, Request, Response } from "express";
import { initLucid, buildListingTx, buildPurchaseTx, buildEditTx, buildDelistTx } from "../services/lucid";
import { AppDataSource } from "../db/data-source";
import { Listing } from "../entities/Listing";
import { Agent } from "../entities/Agent";
import { Purchase } from "../entities/Purchase";
import { User } from "../entities/User";
import authRoutes from "./auth";
import { AgentMetadata } from "../metadata/schema";
import { uploadMetadataToIPFS } from "../utils/ipfs";

const router: Router = Router();

router.use("/", authRoutes);

/**
 * POST /list
 */
router.post("/list", async (req: Request, res: Response) => {
  try {
    const { sellerAddress, asset, price, fullPrice, duration, agentId, subscriptionId } = req.body;

    if (!sellerAddress || !asset || !price || !fullPrice || !duration || !agentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const agentRepo = AppDataSource.getRepository(Agent);
    const listingRepo = AppDataSource.getRepository(Listing);
    const userRepo = AppDataSource.getRepository(User);

    const agent = await agentRepo.findOneBy({ id: agentId });
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    const user = await userRepo.findOneBy({ wallet: sellerAddress });
    if (!user) return res.status(404).json({ message: "User not found" });

    const metadata: AgentMetadata = {
      name: agent.name,
      description: agent.description,
      modelVersion: agent.modelVersion,
      usageRights: {
        type: subscriptionId ? "subscription" : "full",
        durationDays: subscriptionId ? duration : undefined,
      },
      creator: user.wallet,
    };

    const metadataUri = await uploadMetadataToIPFS(metadata);
    agent.metadataUri = metadataUri;
    await agentRepo.save(agent);

    const lucid = await initLucid();
    const tx = await buildListingTx(lucid, sellerAddress, asset, Number(price), Number(fullPrice), Number(duration), subscriptionId);
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    const listing = listingRepo.create({
      txHash,
      seller: sellerAddress,
      agent,
      price: Number(price),
      fullPrice: Number(fullPrice),
      duration: Number(duration),
      subscriptionId,
      metadataUri,
    });

    await listingRepo.save(listing);

    res.status(201).json({ message: "Listing created", txHash, metadataUri, listingId: listing.id });
  } catch (err) {
    console.error("POST /list error:", err);
    res.status(500).json({ message: "Listing failed" });
  }
});

/**
 * POST /buy
 */
router.post("/buy", async (req: Request, res: Response) => {
  try {
    const { buyerAddress, listingId } = req.body;

    if (!buyerAddress || !listingId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listingRepo = AppDataSource.getRepository(Listing);
    const purchaseRepo = AppDataSource.getRepository(Purchase);

    const listing = await listingRepo.findOne({
      where: { id: listingId },
      relations: ["agent"],
    });

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const lucid = await initLucid();
    const utxoRef = listing.txHash + "#0";
    const datum = null;
    const tx = await buildPurchaseTx(lucid, buyerAddress, utxoRef, datum, Number(listing.price), "MBuyFull");
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    const purchase = purchaseRepo.create({
      txHash,
      buyer: buyerAddress,
      listing,
    });

    await purchaseRepo.save(purchase);

    res.status(201).json({ message: "Purchase successful", txHash, purchaseId: purchase.id });
  } catch (err) {
    console.error("POST /buy error:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
});

/**
 * POST /edit
 */
router.post("/edit", async (req: Request, res: Response) => {
  try {
    const { sellerAddress, listingId, newPrice, newFullPrice } = req.body;

    if (!sellerAddress || !listingId || !newPrice || !newFullPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listingRepo = AppDataSource.getRepository(Listing);
    const listing = await listingRepo.findOneBy({ id: listingId });

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const lucid = await initLucid();
    const utxoRef = listing.txHash + "#0";
    const updatedDatum = {
      price: Number(newPrice),
      fullPrice: Number(newFullPrice),
      duration: listing.duration,
      seller: listing.seller,
      subscription: listing.subscriptionId,
      owner: listing.seller,
    };
    const tx = await buildEditTx(lucid, utxoRef, updatedDatum);
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    listing.price = newPrice.toString();
    listing.fullPrice = newFullPrice.toString();
    await listingRepo.save(listing);

    res.status(200).json({ message: "Listing edited", txHash });
  } catch (err) {
    console.error("POST /edit error:", err);
    res.status(500).json({ message: "Edit failed" });
  }
});

/**
 * POST /delist
 */
router.post("/delist", async (req: Request, res: Response) => {
  try {
    const { sellerAddress, listingId } = req.body;

    if (!sellerAddress || !listingId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listingRepo = AppDataSource.getRepository(Listing);
    const listing = await listingRepo.findOneBy({ id: listingId });

    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const lucid = await initLucid();
    const utxoRef = listing.txHash + "#0";
    const tx = await buildDelistTx(lucid, utxoRef, sellerAddress);
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();

    await listingRepo.remove(listing);

    res.status(200).json({ message: "Listing delisted", txHash });
  } catch (err) {
    console.error("POST /delist error:", err);
    res.status(500).json({ message: "Delisting failed" });
  }
});

/**
 * GET /nfts
 */
router.get("/nfts", async (_req: Request, res: Response) => {
  try {
    const agentRepo = AppDataSource.getRepository(Agent);
    const agents = await agentRepo.find();
    res.status(200).json({ agents });
  } catch (err) {
    console.error("GET /nfts error:", err);
    res.status(500).json({ message: "Failed to fetch NFTs" });
  }
});

/**
 * GET /listings
 */
router.get("/listings", async (_req: Request, res: Response) => {
  try {
    const listingRepo = AppDataSource.getRepository(Listing);
    const listings = await listingRepo.find({
      relations: ["agent"],
      order: { createdAt: "DESC" },
    });
    res.status(200).json({ listings });
  } catch (err) {
    console.error("GET /listings error:", err);
    res.status(500).json({ message: "Failed to fetch listings" });
  }
});

/**
 * GET /profile/:user
 */
router.get("/profile/:user", async (req: Request, res: Response) => {
  try {
    const userAddress = req.params.user;
    const listingRepo = AppDataSource.getRepository(Listing);
    const purchaseRepo = AppDataSource.getRepository(Purchase);
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOneBy({ wallet: userAddress });

    const listings = await listingRepo.find({
      where: { seller: { wallet: userAddress } },
      relations: ["agent"],
    });

    const purchases = await purchaseRepo.find({
      where: { buyer: {wallet: userAddress }},
      relations: ["listing", "listing.agent"],
    });

    res.status(200).json({ user, listings, purchases });
  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

export default router;
