use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use oracle_constants.{
  validate_datum, validate_mint_action, validate_update_action,
}
use store/types.{
  OBurn, OClose, OMint, OUpdate, OracleAction, OracleDatum, OracleMintAction,
}

// Oracle Validator: Provides trusted exchange rates

validator oracle(oneshot_ref: OutputReference) {
  mint(r: OracleMintAction, p: PolicyId, tx: Transaction) {
    let Transaction { inputs, outputs, mint, .. } = tx

    // Validate mint action
    expect validate_mint_action(r)

    // Mint exactly one token
    expect [Pair(tokenName, tokenQty)] =
      mint
        |> assets.tokens(p)
        |> dict.to_pairs()

    when r is {
      OMint { exchange, timestamp, currency } -> {
        expect Some(_in) =
          list.find(inputs, fn(input) { input.output_reference == oneshot_ref })

        expect Some(tokenOut) =
          list.find(
            outputs,
            fn(output) {
              assets.without_lovelace(output.value) == assets.from_asset(
                p,
                tokenName,
                tokenQty,
              )
            },
          )

        expect Script(p) == tokenOut.address.payment_credential

        expect InlineDatum(d) = tokenOut.datum
        expect oracleDatum: OracleDatum = d

        // Validate the new datum
        expect validate_datum(oracleDatum)

        and {
          tokenName == "",
          tokenQty == 1,
          oracleDatum.exchange == exchange,
          oracleDatum.timestamp == timestamp,
          oracleDatum.currency == currency,
        }
      }
      OBurn -> tokenQty == -1
    }
  }

  spend(
    datum: Option<OracleDatum>,
    r: OracleAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { inputs, outputs, mint, .. } = tx

    expect Some(d) = datum
    // Validate existing datum
    expect validate_datum(d)

    expect Some(ownInput) =
      list.find(inputs, fn(input) { input.output_reference == oref })

    let ownCredential = ownInput.output.address.payment_credential
    expect Script(scriptHash) = ownCredential

    // Validate update action
    expect validate_update_action(r, d)

    when r is {
      OUpdate { exchange, timestamp } -> {
        expect Some(ownOut) =
          list.find(
            outputs,
            fn(output) {
              list.has(assets.policies(output.value), scriptHash) && output.address.payment_credential == ownCredential
            },
          )

        expect InlineDatum(outDatumRaw) = ownOut.datum
        expect outDatum: OracleDatum = outDatumRaw

        // Validate the new datum
        expect validate_datum(outDatum)

        and {
          outDatum.exchange == exchange,
          outDatum.currency == d.currency,
          outDatum.timestamp == timestamp,
          timestamp > d.timestamp,
        }
      }
      OClose -> {
        let oracleValue =
          ownInput.output.value
            |> assets.tokens(scriptHash)
            |> dict.to_pairs()

        let burnValue =
          mint
            |> assets.tokens(scriptHash)
            |> dict.to_pairs()

        and {
          pairs.keys(burnValue) == pairs.keys(oracleValue),
          pairs.values(burnValue) == [-1],
          pairs.values(oracleValue) == [1],
        }
      }
    }
  }

  else(_) {
    fail
  }
}
