/// Marketplace Listing
pub type MarketDatum {
  price: Int,
  // Subscription Price in USDM (6 decimals like 1_000_000 = 1 USDM)
  seller: ByteArray,
  // Seller's VerificationKey hash
  subscription: Bool,
  // Is this listing a subscription? (true = subscription, false = full buy only)
  full_price: Option<Int>,
  // If subscription, optional full purchase price
  duration: Option<Int>,
  // Subscription duration (in months, for example)
  owner: ByteArray,
}

// Current owner's VerificationKey hash (buyer or seller)

// If subscription: how long the subscription lasts (in seconds)

/// Actions that can happen on Marketplace
pub type MarketAction {
  MBuySub
  // Buy a subscription access (temporary)
  MBuyFull
  // Buy full ownership (permanent)
  MEdit { price: Int, full_price: Option<Int>, duration: Option<Int> }
  // Edit prices and subscription duration
  MDelist
}

// Remove listing

/// Oracle Live Data
pub type OracleDatum {
  exchange: Int,
  // 1 USDM = exchange lovelace
  timestamp: Int,
  // Last update timestamp
  currency: ByteArray,
}

// Example: b"USDM"

/// Actions when spending Oracle UTxO
pub type OracleAction {
  OUpdate { exchange: Int, timestamp: Int }
  // Update exchange rate
  OClose
}

// Close Oracle (burn token)

/// Actions when minting Oracle Token
pub type OracleMintAction {
  OMint { exchange: Int, timestamp: Int, currency: ByteArray }
  // Mint a new Oracle token
  OBurn
}
// Burn Oracle token
