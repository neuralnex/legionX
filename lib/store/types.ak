pub type MarketDatum {
  price: Int,
  seller: ByteArray,
  ai_details: AIDetails,
  reputation: Int,
  license_type: LicenseType,
}

pub type AIDetails {
  model_id: String,
  version: String,
  model_type: ModelType,
  size: Int,  // in bytes
  framework: String,
  supported_platforms: List<String>,
  verifications: Int,
  accuracy: Option<Float>,
  training_data: String,
  benchmarks: List<Benchmark>,
}

pub type ModelType {
  MLModel
  VirtualAssistant
  AgentSystem
  OtherModel
}

pub type LicenseType {
  PersonalUse
  CommercialUse
  AcademicUse
  OpenSource
}

pub type Benchmark {
  metric: String,
  score: Float,
  dataset: String,
}

pub type MarketAction {
  MBuy
  MEdit { price: Int, ai_details: AIDetails }
  MDelist
  MVerify { verifier_address: ByteArray, test_parameters: String }
}

pub type OracleDatum {
  exchange: Int,
  timestamp: Int,
  currency: ByteArray,
  ai_model_prices: List<ModelPrice>,
}

pub type ModelPrice {
  model_type: ModelType,
  avg_price: Int,
  price_trend: Int,  // percentage change
}

pub type OracleAction {
  OUpdate { exchange: Int, timestamp: Int, ai_model_prices: List<ModelPrice> }
  OClose
}

pub type OracleMintAction {
  OMint { 
    exchange: Int, 
    timestamp: Int, 
    currency: ByteArray,
    model_type: ModelType
  }
  OBurn
}