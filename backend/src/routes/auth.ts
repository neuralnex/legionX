// src/routes/auth.ts
import { Router } from "express";
import { verifyJwt } from "../utils/verifyJwt";
import { AppDataSource } from "../db/data-source";
import { User } from "../entities/User";

const router = Router();



router.post("/link", async (req, res) => {
  const { address, idToken } = req.body;

  if (!address || !idToken) {
    return res.status(400).json({ error: "Missing address or idToken" });
  }

  try {
    const payload = await verifyJwt(idToken);
    const email = payload.email || payload.name || payload.sub;

    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOneBy({ email });

    if (!user) {
      user = userRepo.create({ email, wallet: address });
    } else {
      user.wallet = address; // update if not set
    }

    await userRepo.save(user);

    return res.json({ message: "Wallet linked", user });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid JWT" });
  }
});

export default router;
