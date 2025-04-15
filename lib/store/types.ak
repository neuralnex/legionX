use aiken/list
use cardano/address.{VerificationKey}
use cardano/assets

pub type ModelType {
  TextGeneration
  ImageGeneration
  AudioProcessing
  DataAnalysis
}

pub type LicenseTier {
  Basic
  Professional
  Enterprise
}

pub type Benchmark {
  metric: ByteArray,
  score: Int,
  dataset: ByteArray,
}

pub type AgentMetadata {
  model_id: ByteArray,
  version: ByteArray,
  model_type: ModelType,
  framework: ByteArray,
  license_tier: LicenseTier,
  api_endpoint: ByteArray,
  input_schema: ByteArray,
  output_schema: ByteArray,
  ipfs_hash: ByteArray,
  benchmarks: List<Benchmark>,
}

pub type RoyaltyInfo {
  creator_share: Int,
  // percentage (0-100)
  creator_address: VerificationKey,
  platform_share: Int,
}

// percentage (0-100)

pub type MarketDatum {
  seller: VerificationKey,
  price: Int,
  // in lovelace
  agent_metadata: AgentMetadata,
  royalties: RoyaltyInfo,
  created_at: Int,
  // slot number
  updated_at: Int,
}

pub type MarketAction {
  Purchase
  Update { new_price: Int, new_metadata: AgentMetadata }
  Verify { verifier: VerificationKey, report: ByteArray }
}
