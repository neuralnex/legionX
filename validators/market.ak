use aiken/collection/list
use cardano/address.{VerificationKey}
use cardano/assets
use cardano/script_context.{ScriptContext}
use cardano/transaction.{
  InlineDatum, OutputReference, Transaction,
}
use store/types.{AgentMetadata, MarketAction, MarketDatum}

validator market {
  spend(datum: Option<MarketDatum>, redeemer: MarketAction, ctx: ScriptContext) {
    let tx = ctx.transaction

    // Extract the MarketDatum from the optional input datum
    expect Some(d) = datum

    // Handle different actions in the marketplace
    when redeemer is {
      Purchase -> {
        // Validate payment to the seller
        expect Some(payment) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(d.seller) && assets.lovelace_of(
                output.value,
              ) >= d.price
            },
          )

        // Validate NFT transfer
        expect Some(nft_output) =
          list.find(
            tx.outputs,
            fn(output) {
              when output.datum is {
                InlineDatum(metadata) -> metadata == d.agent_metadata
                _ -> False
              }
            },
          )
      }

      Update { new_price, new_metadata } -> {
        // Only the seller can update the listing
        assert
        list.has(tx.extra_signatories, d.seller)
        @"Unauthorized: Only the seller can update the listing"

        // Enforce price change limits (±50%)
        assert
        new_price <= d.price * 2
        @"Price increase exceeds 100% limit"
        assert
        new_price >= d.price / 2
        @"Price decrease exceeds 50% limit"

        // Validate the new metadata
        validate_metadata(new_metadata)?

        // Verify that the output contains the updated listing
        expect Some(updated_output) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(d.seller) && when
                output.datum
              is {
                InlineDatum(new_datum) ->
                  new_datum.seller == d.seller && new_datum.price == new_price && new_datum.agent_metadata == new_metadata
                _ -> False
              }
            },
          )
      }

      Verify { verifier, report } -> {
        // Ensure the verification report is not empty
        assert
        string.length(report) > 0
        @"Verification report cannot be empty"

        // Verify fee payment (minimum 5 ADA)
        expect Some(fee_payment) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(verifier) && assets.lovelace_of(
                output.value,
              ) >= 5_000_000
            },
          )

        // Update the metadata to track verification
        let updated_metadata = AgentMetadata
        {
          d.agent_metadata
          benchmarks == list.append(
            d.agent_metadata.benchmarks,
            [
              {
                metric == "verification"
                score == 1
                dataset == report
              },
            ],
          )
        }

        // Verify the output contains the updated metadata
        expect Some(verified_output) =
          list.find(
            tx.outputs,
            fn(output) {
              when output.datum is {
                InlineDatum(new_datum) ->
                  new_datum.agent_metadata == updated_metadata
                _ -> False
              }
            },
          )
      }
    }
  }

  else(_) {
    fail
  }
}

fn validate_metadata(metadata: AgentMetadata) -> Bool {
  and {
    string.length(metadata.model_id) > 0,
    string.length(metadata.version) > 0,
    string.length(metadata.api_endpoint) > 0,
    string.length(metadata.ipfs_hash) > 0,
    // Validate JSON schemas
    json.parse(metadata.input_schema) != None,
    json.parse(metadata.output_schema) != None,
    // Validate royalty shares
    metadata.royalties.creator_share + metadata.royalties.platform_share <= 100,
  }
}
