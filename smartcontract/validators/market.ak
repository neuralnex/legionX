use aiken/collection/list
use aiken/primitive/string
use cardano/address.{VerificationKey}
use cardano/assets
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use store/types.{MBuyFull, MBuySub, MDelist, MEdit, MarketAction, MarketDatum}

// Marketplace Validator Module
validator market {
  spend(
    datum: Option<MarketDatum>,
    r: MarketAction,
    oref: OutputReference,
    tx: Transaction,
  ) -> Bool {
    trace @"Spending UTxO ..."

    expect Some(d) = datum

    when r is {
      MBuySub -> {
        // Buyer pays the subscription price
        expect Some(payment) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == VerificationKey(d.seller)
            },
          )

        trace string.concat(
          @"Buying subscription for: ",
          string.from_int(assets.lovelace_of(payment.value)),
        )

        // Ensure the price paid matches the subscription price
        expect assets.lovelace_of(payment.value) == d.price

        // Record subscription duration if needed (offchain validation)
        expect Some(_duration) = d.duration

        True
      }

MBuyFull -> {
  expect Some(payment) =
    list.find(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == VerificationKey(d.seller)
      },
    )

  trace string.concat(
    @"Buying full ownership for: ",
    string.from_int(assets.lovelace_of(payment.value)),
  )

  expect when d.full_price is {
    Some(fullPrice) -> assets.lovelace_of(payment.value) == fullPrice
    None -> fail @"No full price set"
  }

  expect VerificationKey(ownerPkh) = payment.address.payment_credential

  expect Some(ownInput) =
    list.find(tx.inputs, fn(input) { input.output_reference == oref })

  let oldDatum = ownInput.output.datum

  expect InlineDatum(datum) = oldDatum
  expect oldMarketDatum: MarketDatum = datum

  expect Some(ownOutput) =
    list.find(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == ownInput.output.address.payment_credential &&
        output.value == ownInput.output.value
      },
    )

  expect InlineDatum(newDatumRaw) = ownOutput.datum
  expect newDatum: MarketDatum = newDatumRaw

  expect Some(_buyerOutput) =
    list.find(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == VerificationKey(ownerPkh) &&
        output.value == ownInput.output.value
      },
    )

  expect and {
    newDatum.price == oldMarketDatum.price,
    newDatum.seller == oldMarketDatum.seller,
    newDatum.subscription == oldMarketDatum.subscription,
    newDatum.full_price == oldMarketDatum.full_price,
    newDatum.duration == oldMarketDatum.duration,
    newDatum.owner == ownerPkh
  }

  True
}


      MEdit { price, full_price, duration } -> {
        // Seller edits the listing (update price or subscription details)
        expect Some(ownInput) =
          list.find(tx.inputs, fn(input) { input.output_reference == oref })

        let ownHash = ownInput.output.address.payment_credential

        expect Some(ownOutput) =
          list.find(
            tx.outputs,
            fn(output) {
              output.address.payment_credential == ownHash && output.value == ownInput.output.value
            },
          )

        expect InlineDatum(newDatumRaw) = ownOutput.datum
        expect newDatum: MarketDatum = newDatumRaw

        trace string.concat(
          @"Editing price to: ",
          string.from_int(newDatum.price),
        )

        expect and {
          newDatum.seller == d.seller,
          newDatum.price == price,
          newDatum.full_price == full_price,
          newDatum.duration == duration,
          list.has(tx.extra_signatories, d.seller)
        }

        True
      }

      MDelist -> {
        trace @"Delisting asset"
        expect list.has(tx.extra_signatories, d.seller)

        True
      }
    }
  }

  else(_) {
    fail
  }
}
