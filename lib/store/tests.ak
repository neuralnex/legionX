use aiken/assert
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use store/types.{MBuy, MDelist, MEdit, MVerify, MarketDatum, AIDetails, VerificationResult}
use course/tests as t
use cardano/address.{Script, VerificationKey}

test marketBuy() {
  let seller = #"deadbeef"
  let buyer = #"cafebabe"
  
  let ai_details = AIDetails {
    model_id == "test-model-1"
    version == "1.0"
    model_type == MLModel { category == NLP }
    size == 1000
    framework == "PyTorch"
    supported_platforms == ["Linux"]
    verifications == []
    accuracy == Some(92)
    training_data == "ipfs://QmTestHash"
    benchmarks == []
    input_schema == "{}"
    output_schema == "{}"
    dependencies == []
    privacy_policy == AnonymousUsageTracking
  }
  
  let market_datum = MarketDatum { 
    price == 200_000_000 // 200 ADA
    seller == seller
    ai_details == ai_details
    reputation == 0
    license_type == PersonalUse { concurrent_users == 1 }
    escrow == None
    royalties == None
    collateral == 10_000_000
    created_at == 0
    updated_at == 0
  }
  
  let market_value = assets.merge(
    assets.from_lovelace(2_000_000), 
    t.makeAsset(#"daeddead", #"deadbeef", 1)
  )
  
  let market_utxo = t.input(
    t.oref(#"deaf", 1),
    t.output(
      t.scriptAddress(#"beefbeef"),
      market_value,
      InlineDatum(market_datum)
    )
  )
  
  let payment_utxo = t.input(
    t.oref(#"beef", 2),
    t.output(
      t.walletAddress(buyer),
      assets.from_lovelace(200_000_000),
      NoDatum
    )
  )
  
  let tx = Transaction {
    inputs == [market_utxo, payment_utxo]
    outputs == [
      t.output(
        t.walletAddress(buyer),
        market_value,
        NoDatum
      ),
      t.output(
        t.walletAddress(seller),
        assets.from_lovelace(200_000_000),
        NoDatum
      )
    ]
    extra_signatories == []
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MBuy, market_utxo.output_reference, tx)
}

test marketEdit() {
  let seller = #"deadcafe"
  
  let original_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    ai_details == AIDetails {
      model_id == "test-model"
      version == "1.0"
      size == 1000
      framework == "PyTorch"
      supported_platforms == ["Linux"]
      verifications == []
      accuracy == Some(92)
      training_data == "ipfs://QmTest"
      benchmarks == []
      input_schema == "{}"
      output_schema == "{}"
      dependencies == []
      privacy_policy == AnonymousUsageTracking
    }
    reputation == 0
    license_type == PersonalUse { concurrent_users == 1 }
    escrow == None
    royalties == None
    collateral == 10_000_000
    created_at == 0
    updated_at == 0
  }
  
  let updated_datum = MarketDatum {
    original_datum with
    price == 250_000_000
  }
  
  let market_utxo = t.input(
    t.oref(#"cafebabe", 1),
    t.output(
      t.scriptAddress(#"cafecafe"),
      assets.from_lovelace(2_000_000),
      InlineDatum(original_datum)
    )
  )
  
  let tx = Transaction {
    inputs == [market_utxo]
    outputs == [
      t.output(
        t.scriptAddress(#"beafbeaf"),
        market_utxo.output.value,
        InlineDatum(updated_datum)
      )
    ]
    extra_signatories == [seller]
    time_range == placeholder.time_range
  }
  
  market.spend(
    Some(original_datum), 
    MEdit ( price == 250_000_000, ai_details == original_datum.ai_details ),
    market_utxo.output_reference, 
    tx
  )
}

test marketDelist() {
  let seller = #"deef"
  
  let market_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    ai_details == AIDetails {
      model_id == "test-model"
      version == "1.0"
      size == 1000
      framework == "PyTorch"
      supported_platforms == ["Linux"]
      verifications == []
      accuracy == Some(92)
      training_data == "ipfs://QmTest"
      benchmarks == []
      input_schema == "{}"
      output_schema == "{}"
      dependencies == []
      privacy_policy == AnonymousUsageTracking
    }
    reputation == 0
    license_type == PersonalUse { concurrent_users == 1 }
    escrow == None
    royalties == None
    collateral == 10_000_000
    created_at == 0
    updated_at == 0
  }
  
  let market_utxo = t.input(
    t.oref(#"babe", 1),
    t.output(
      t.scriptAddress(#"dead"),
      assets.merge(
        assets.from_lovelace(2_000_000),
        t.makeAsset(#"babe", #"cafebabe", 1)
      ),
      InlineDatum(market_datum)
    )
  )
  
  let tx = Transaction {
    inputs == [market_utxo]
    outputs == [
      t.output(
        t.walletAddress(seller),
        market_utxo.output.value,
        NoDatum
      )
    ]
    extra_signatories == [seller]
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MDelist, market_utxo.output_reference, tx)
}

test marketBuy_fail() fail {
  let seller = #"cafe"
  let buyer = #"deaf"
  
  let market_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    ai_details == AIDetails {
      model_id == "test-model"
      version == "1.0"
      size == 1000
      framework == "PyTorch"
      supported_platforms == ["Linux"]
      verifications == []
      accuracy == Some(92)
      training_data == "ipfs://QmTest"
      benchmarks == []
      input_schema == "{}"
      output_schema == "{}"
      dependencies == []
      privacy_policy == AnonymousUsageTracking
    }
    reputation == 0
    license_type == PersonalUse { concurrent_users == 1 }
    escrow == None
    royalties == None
    collateral == 10_000_000
    created_at == 0
    updated_at == 0
  }
  
  let market_utxo = t.input(
    t.oref(#"cafedeaf", 1),
    t.output(
      t.scriptAddress(#"deaddeaf"),
      assets.from_lovelace(2_000_000),
      InlineDatum(market_datum)
    )
  )
  
  let payment_utxo = t.input(
    t.oref(#"babe", 2),
    t.output(
      t.walletAddress(buyer),
      assets.from_lovelace(199_999_999), // 1 lovelace short
      NoDatum
    )
  )
  
  let tx = Transaction {
    inputs == [market_utxo, payment_utxo]
    outputs == [
      t.output(
        t.walletAddress(buyer),
        market_utxo.output.value,
        NoDatum
      ),
      t.output(
        t.walletAddress(seller),
        payment_utxo.output.value,
        NoDatum
      )
    ]
    extra_signatories == []
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MBuy, market_utxo.output_reference, tx)?
}