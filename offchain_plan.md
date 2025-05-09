# 🛠️ Offchain Development Plan for `market` Validator

## 🧩 1. Smart Contract Actions Mapping

Align offchain logic to these **onchain actions**:
- `MBuyFull`: Full purchase, requires seller signature and full_price payment.
- `MBuySub`: Subscription purchase, buyer pays `price`, gets subscription token.
- `MEdit`: Seller edits listing, validated via signature and updated datum.
- `MDelist`: Seller removes listing, validated via signature.

---

## 🏗️ 2. Entity Schema Enhancements (TypeORM)

Ensure DB schemas are aligned:

### `Listing.ts`
- `id: number`
- `seller: User` _(relation)_
- `agent: Agent` _(relation)_
- `price: string`
- `fullPrice: string`
- `duration: number`
- `subscriptionId: string | null`
- `txHash: string`
- `metadataUri: string`
- `status: "active" | "sold" | "cancelled"`
- `createdAt`, `updatedAt`

### `Purchase.ts`
- `id: number`
- `listing: Listing` _(relation)_
- `buyer: User`
- `txHash: string`
- `amount: string`
- `status: "pending" | "confirmed"`
- `createdAt`, `updatedAt`

### `Agent.ts`
- `id: number`
- `name: string`
- `description: string`
- `modelVersion: string`
- `metadataUri: string`
- `creator: User` _(relation)_

---

## 🔁 3. Route Handler Definitions

### `/list`
- Uploads metadata to Pinata
- Calls `buildListingTx()`
- Creates Listing DB entry

### `/buy`
- Fetches `Listing` by `id`
- Calls `buildPurchaseTx()`
- Creates `Purchase` DB entry

### `/edit`
- Calls `buildEditTx()`
- Updates listing prices

### `/delist`
- Calls `buildDelistTx()`
- Deletes/updates listing in DB

---

## 🧠 4. Lucid Evolution Integration

In `services/lucid.ts`:

- `initLucid()`:
  - Initialize Lucid with Blockfrost & owner.sk
- `buildListingTx()`
- `buildPurchaseTx()`
- `buildEditTx()`
- `buildDelistTx()`

---

## 📡 5. DBSync Integration

- Confirm transactions using `txHash`
- Update `status` in `Listing`, `Purchase`
- Calculate fees and write to `Fee.ts` table
- Confirm both `MBuyFull` and `MBuySub`

---

## 🔒 6. Auth Logic

### `/auth/link`
- Verify Web3Auth JWT
- Write/update user with wallet address

Ensure `User` entity has:
- `id`, `email`, `wallet`, etc.

---

## 📄 7. Metadata Logic

### Metadata schema (IPFS)
```ts
{
  name: string;
  description: string;
  modelVersion: string;
  usageRights: {
    type: 'subscription' | 'full';
    durationDays?: number;
  };
  creator: string;
}
```

Upload via `utils/ipfs.ts` (Pinata)

---

## 📬 8. Open API Routes

### GET `/nfts`
Return all agents

### GET `/listings`
Return active listings with agent data

### GET `/profile/:wallet`
Return user, their listings, and purchases

---

## ⚙️ 9. Next Enhancements (Optional)

- Webhooks to monitor subscription expiration
- Multi-agent listing support
- Subscription NFT token metadata standardization
- Marketplace royalties