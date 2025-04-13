use aiken/collection/list
use aiken/primitive/string
use cardano/address.{VerificationKey}
use cardano/assets
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use store/types.{MBuy, MDelist, MEdit, MVerify, MarketAction, MarketDatum, AIDetails, VerificationResult}

validator market {
  spend(
    datum: Option<MarketDatum>,
    r: MarketAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    trace @"Processing AI Marketplace Transaction..."

    expect Some(d) = datum

    when r is {
      MBuy -> {
        // Validate payment to seller
        expect Some(payment) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(d.seller)
            },
          )

        trace string.concat(
          @"Purchasing AI asset for: ",
          string.from_int(assets.lovelace_of(payment.value)),
          @" ADA"
        )

        // Validate correct payment amount
        assets.lovelace_of(payment.value) == d.price
        
        // Additional validation for AI-specific assets
        validate_ai_metadata(d.ai_details)?
      }
      
      MEdit { price, ai_details } -> {
        // Only seller can edit listing
        list.has(tx.extra_signatories, d.seller)?
        
        // Find the marketplace output
        expect Some(ownInput) =
          list.find(tx.inputs, fn(input) { input.output_reference == oref })

        let ownHash = ownInput.output.address.payment_credential

        expect Some(ownOutput) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == ownHash && 
              output.value == ownInput.output.value
            },
          )

        // Validate updated datum
        expect InlineDatum(datum) = ownOutput.datum
        expect newDatum: MarketDatum = datum

        trace string.concat(
          @"Updating AI listing - New price: ",
          string.from_int(newDatum.price),
          @" | Model version: ",
          newDatum.ai_details.version
        )

        and {
          newDatum.seller == d.seller,
          newDatum.price == price,
          validate_ai_metadata(ai_details)?,
          price <= d.price * 2,  // Max 2x price increase
          price >= d.price / 2   // Min 50% price decrease
        }
      }
      
      MDelist -> {
        trace @"Delisting AI asset"
        list.has(tx.extra_signatories, d.seller)?
      }
      
      MVerify { verifier_address, test_parameters } -> {
        trace @"Verification requested for AI model"
        
        // Deduct verification fee from buyer
        expect Some(verification_payment) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(verifier_address)
            },
          )
        
        assets.lovelace_of(verification_payment.value) >= 5_000_000  // 5 ADA fee
        
        // Find current listing UTxO
        expect Some(ownInput) =
          list.find(tx.inputs, fn(input) { input.output_reference == oref })
        
        let ownHash = ownInput.output.address.payment_credential

        // Find the updated listing output
        expect Some(ownOutput) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == ownHash && 
              output.value == ownInput.output.value
            },
          )
        
        // Create new verification record
        let new_verification = VerificationResult {
          verifier: verifier_address,
          timestamp: tx.time_range.lower_bound,
          passed: True,  // Assuming verification succeeds
          report_hash: test_parameters,  // Would normally be a hash
          test_parameters: test_parameters
        }
        
        // Create updated AI details
        let updated_ai_details = AIDetails {
          model_id: d.ai_details.model_id,
          version: d.ai_details.version,
          model_type: d.ai_details.model_type,
          size: d.ai_details.size,
          framework: d.ai_details.framework,
          supported_platforms: d.ai_details.supported_platforms,
          verifications: list.append(d.ai_details.verifications, [new_verification]),
          accuracy: d.ai_details.accuracy,
          training_data: d.ai_details.training_data,
          benchmarks: d.ai_details.benchmarks,
          input_schema: d.ai_details.input_schema,
          output_schema: d.ai_details.output_schema,
          dependencies: d.ai_details.dependencies,
          privacy_policy: d.ai_details.privacy_policy
        }
        
        // Create updated market datum
        let updated_datum = MarketDatum {
          price: d.price,
          seller: d.seller,
          ai_details: updated_ai_details,
          reputation: d.reputation,
          license_type: d.license_type,
          escrow: d.escrow,
          royalties: d.royalties,
          collateral: d.collateral,
          created_at: d.created_at,
          updated_at: tx.time_range.lower_bound
        }
        
        // Verify the output contains our updated datum
        expect InlineDatum(output_datum) = ownOutput.datum
        output_datum == updated_datum
      }
    }
  }

  else(_) {
    fail @"Invalid marketplace transaction"
  }
}

fn validate_ai_metadata(ai_details: AIDetails) -> Bool {
  and {
    string.length(ai_details.model_id) > 0,
    string.length(ai_details.version) > 0,
    ai_details.size > 0,
    ai_details.size < 10_000_000_000,  // 10GB max size
    list.length(ai_details.supported_platforms) > 0,
    // Validate verification records if they exist
    list.all(
      ai_details.verifications,
      fn(v) { string.length(v.report_hash) > 0 }
    )?
  }
}