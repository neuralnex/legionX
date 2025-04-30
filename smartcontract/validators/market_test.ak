use market
use cardano/assets
use cardano/transaction.{InlineDatum, NoDatum, Transaction, placeholder}
use cardano/address.{Address, Script, VerificationKey}
use store/tests as t
use store/types.{MBuyFull, MBuySub, MDelist, MEdit, MarketDatum}

// Helper: Dummy subscription ID
fn dummy_subscription_id() -> ByteArray {
  #"beefdead"
}

// Helper: Dummy duration in seconds
fn dummy_duration() -> Int {
  3600
}

test market_buy_subscription() {
  let seller = #"face"
  let buyer = #"beef"

  let datum = MarketDatum {
    price: 1_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: Some(dummy_subscription_id()),
    duration: Some(dummy_duration()),
    owner: seller
  }

  let action = MBuySub

  let oref = t.oref(#"cafe", 0)
  let market_val = assets.merge(assets.from_lovelace(2), t.makeAsset(#"dead", #"feed", 1))

  let market_input = t.input(oref, t.output(t.scriptAddress(#"deaf"), market_val, InlineDatum(datum)))
  let buyer_input = t.input(t.oref(#"babe", 1), t.output(t.walletAddress(buyer), assets.from_lovelace(1_000_000), NoDatum))
  let buyer_output = t.output(t.walletAddress(buyer), market_val, NoDatum)
  let seller_output = t.output(t.walletAddress(seller), assets.from_lovelace(1_000_000), NoDatum)

  let tx = Transaction {
    ..placeholder,
    inputs: [market_input, buyer_input],
    outputs: [buyer_output, seller_output]
  }

  market.market.spend(Some(datum), action, oref, tx)
}

test market_buy_full_ownership() {
  let seller = #"face"
  let buyer = #"beef"

  let oref = t.oref(#"cafe", 1)

  let nft = t.makeAsset(#"dead", #"feed", 1)
  let marketValue = assets.merge(assets.from_lovelace(2), nft)

  let datum = MarketDatum {
    price: 1_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: None,
    duration: None,
    owner: seller,
  }

  let newDatum = MarketDatum {
    price: 1_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: None,
    duration: None,
    owner: buyer,
  }

  let marketInput =
    t.input(
      oref,
      t.output(t.scriptAddress(#"deaf"), marketValue, InlineDatum(datum)),
    )

  let buyerInput =
    t.input(
      t.oref(#"cece", 2),
      t.output(t.walletAddress(buyer), assets.from_lovelace(5_000_000), NoDatum),
    )

  let buyerOutput =
    t.output(t.walletAddress(buyer), marketValue, NoDatum)

  let marketOutput =
    t.output(t.scriptAddress(#"deaf"), marketValue, InlineDatum(newDatum))

  let sellerOutput =
    t.output(t.walletAddress(seller), assets.from_lovelace(5_000_000), NoDatum)

  let tx =
    Transaction {
      ..placeholder,
      inputs: [buyerInput, marketInput],
      outputs: [buyerOutput, marketOutput, sellerOutput],
    }

  market.market.spend(Some(datum), MBuyFull, oref, tx)
}

test market_edit_listing() {
  let seller = #"face"

  let datum = MarketDatum {
    price: 2_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: Some(dummy_subscription_id()),
    duration: Some(dummy_duration()),
    owner: seller
  }

  let action = MEdit {
    price: 1_500_000,
    full_price: Some(5_000_000),
    duration: Some(dummy_duration())
  }

  let new_datum = MarketDatum {
    ..datum,
    price: 1_500_000
  }

  let oref = t.oref(#"cafe", 2)
  let market_val = assets.merge(assets.from_lovelace(2), t.makeAsset(#"dead", #"feed", 1))
  let market_input = t.input(oref, t.output(t.scriptAddress(#"deaf"), market_val, InlineDatum(datum)))
  let market_output = t.output(t.scriptAddress(#"deaf"), market_val, InlineDatum(new_datum))

  let tx = Transaction {
    ..placeholder,
    inputs: [market_input],
    outputs: [market_output],
    extra_signatories: [seller]
  }

  market.market.spend(Some(datum), action, oref, tx)
}

test market_delist() {
  let seller = #"face"

  let datum = MarketDatum {
    price: 2_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: Some(dummy_subscription_id()),
    duration: Some(dummy_duration()),
    owner: seller
  }

  let action = MDelist
  let oref = t.oref(#"cafe", 3)
  let market_val = assets.merge(assets.from_lovelace(2), t.makeAsset(#"dead", #"feed", 1))
  let market_input = t.input(oref, t.output(t.scriptAddress(#"deaf"), market_val, InlineDatum(datum)))
  let seller_output = t.output(t.walletAddress(seller), market_val, NoDatum)

  let tx = Transaction {
    ..placeholder,
    inputs: [market_input],
    outputs: [seller_output],
    extra_signatories: [seller]
  }

  market.market.spend(Some(datum), action, oref, tx)
}

test market_delist_fail_wrong_signer() fail {
  let seller = #"face"
  let buyer = #"beef"

  let datum = MarketDatum {
    price: 2_000_000,
    full_price: Some(5_000_000),
    seller: seller,
    subscription: Some(dummy_subscription_id()),
    duration: Some(dummy_duration()),
    owner: seller
  }

  let action = MDelist
  let oref = t.oref(#"cafe", 4)
  let market_val = assets.merge(assets.from_lovelace(2), t.makeAsset(#"dead", #"feed", 1))
  let market_input = t.input(oref, t.output(t.scriptAddress(#"deaf"), market_val, InlineDatum(datum)))
  let seller_output = t.output(t.walletAddress(seller), market_val, NoDatum)

  let tx = Transaction {
    ..placeholder,
    inputs: [market_input],
    outputs: [seller_output],
    extra_signatories: [buyer] // ❌ should be seller
  }

  market.market.spend(Some(datum), action, oref, tx)?
}
