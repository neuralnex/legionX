use aiken/assert
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use store/types.{MBuy, MDelist, MEdit, MVerify, MarketDatum, AIDetails, VerificationResult}
use placeholder
use cardano/address.{Address, Script, VerificationKey}

test marketBuy() {
  let seller = #"deef"
  let buyer = #"cafe"
  
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
    assets.from_asset(#"daeddead", #"deadbeef", 1)
  )
  
  let market_utxo = {
    output_reference == { id == #"deaf"
    index == 1 }
    output == {
      address == address.from_credential(ScriptCredential(#"beefbeef"))
      value == market_value
      datum == InlineDatum(market_datum)
    }
  }
  
  let payment_utxo = {
    output_reference == { id == #"beef"
    ndex == 2 }
    output == {
      address == address.from_credential(VerificationKey(buyer))
      value == assets.from_lovelace(200_000_000)
      datum == NoDatum
    }
  }
  
  let tx = Transaction {
    inputs == [market_utxo, payment_utxo]
    outputs == [
      {
        address == address.from_credential(VerificationKey(buyer))
        value == market_value
        datum == NoDatum
      },
      {
        address == address.from_credential(VerificationKey(seller))
        value == assets.from_lovelace(200_000_000)
        datum == NoDatum
      }
    ]
    extra_signatories == []
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MBuy, market_utxo.output_reference, tx)
}

test marketBuy() {
  let seller = #"deadcafe"
  
  let original_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    ai_details == AIDetails {
      model_id == "test-model"
      version == "1.0"
      // ... other required fields
    }
    // ... other required fields
  }
  
  let updated_datum = MarketDatum {
    original_datum
    price == 250_000_000
  }
  
  let market_utxo = {
    output_reference == { id == #"cafebabe" 
    index == 1 }
    output == {
      address == address.from_credential(ScriptCredential(#"cafecafe"))
      value == assets.from_lovelace(2_000_000)
      datum == InlineDatum(original_datum)
    }
  }
  
  let tx = Transaction {
    inputs == [market_utxo]
    outputs == [
      {
        address == address.from_credential(ScriptCredential(#"beafbeaf"))
        value == market_utxo.output.value
        datum == InlineDatum(updated_datum)
      }
    ]
    extra_signatories == [seller]
    time_range == placeholder.time_range
  }
  
  market.spend(
    Some(original_datum), 
    MEdit ( price == 250_000_000, 
    ai_details == original_datum.ai_details ),
    market_utxo.output_reference, 
    tx
  )
}

test marketDelist() {
  let seller = #"deef"
  
  let market_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    // ... other required fields
  }
  
  let market_utxo = {
    output_reference == { id == #"babe"
     index == 1 }
    output == {
      address == address.from_credential(ScriptCredential(#"dead"))
      value == assets.merge(
        assets.from_lovelace(2_000_000)
        assets.from_asset(#"babe", #"cafebabe", 1)
      )
      datum == InlineDatum(market_datum)
    }
  }
  
  let tx = Transaction {
    inputs == [market_utxo]
    outputs == [
      {
        address == address.from_credential(VerificationKey(seller))
        value == market_utxo.output.value
        datum == NoDatum
      }
    ]
    extra_signatories == [seller]
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MDelist, market_utxo.output_reference, tx)
}

test marketVerify() {
  let seller = #"cafe"
  let verifier = #"beaf"
  
  let original_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    ai_details == AIDetails {
      verifications == []
      // ... other required fields
    }
    // ... other required fields
  }
  
  let verification_record = VerificationResult {
    verifier == verifier
    timestamp == 1234567890
    passed == True
    report_hash == "test_report_hash"
    test_parameters == "test_params"
  }
  
  let updated_datum = MarketDatum {
    original_datum
    ai_details == AIDetails {
      original_datum.ai_details
      verifications == [verification_record]
    }
  }
  
  let market_utxo = {
    output_reference == { id == #"babecafe"
     index == 1 }
    output == {
      address == address.from_credential(ScriptCredential(#"cafecafe"))
      value == assets.from_lovelace(2_000_000)
      datum == InlineDatum(original_datum)
    }
  }
  
  let tx = Transaction {
    inputs == [market_utxo]
    outputs == [
      {
        address == address.from_credential(VerificationKey(verifier))
        value == assets.from_lovelace(5_000_000) // Verification fee
        datum == NoDatum
      },
      {
        address == address.from_credential(ScriptCredential(#"deadbabe"))
        value == market_utxo.output.value
        datum == InlineDatum(updated_datum)
      }
    ]
    extra_signatories == []
    time_range == { lower_bound == 1234567890
     upper_bound == 1234567990 }
  }
  
  market.spend(
    Some(original_datum)
    MVerify { verifier_address == verifier
     test_parameters == "test_params" }
    market_utxo.output_reference
    tx
  )
}

test marketBuy() fail {
  let seller = #"cafe"
  let buyer = #"deaf"
  
  let market_datum = MarketDatum {
    price == 200_000_000
    seller == seller
    // ... other required fields
  }
  
  let market_utxo = {
    output_reference == { id == #"cafedeaf"
     index == 1 }
    output == {
      address == address.from_credential(ScriptCredential(#"deaddeaf"))
      value == assets.from_lovelace(2_000_000)
      datum == InlineDatum(market_datum)
    }
  }
  
  let payment_utxo = {
    output_reference == { id == #"babe"
     index == 2 }
    output == {
      address == address.from_credential(VerificationKey(buyer))
      value == assets.from_lovelace(199_999_999) // 1 lovelace short
      datum == NoDatum
    }
  }
  
  let tx = Transaction {
    inputs == (market_utxo
     payment_utxo)
    outputs == [
      {
        address == address.from_credential(VerificationKey(buyer))
        value == market_utxo.output.value
        datum == NoDatum
      },
      {
        address == address.from_credential(VerificationKey(seller))
        value == payment_utxo.output.value
        datum == NoDatum
      }
    ]
    extra_signatories == []
    time_range == placeholder.time_range
  }
  
  market.spend(Some(market_datum), MBuy, market_utxo.output_reference, tx)?
}