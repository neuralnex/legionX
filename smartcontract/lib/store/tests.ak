use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{Value}
use cardano/transaction.{Datum, Input, Output, OutputReference}

// Creates an Input from a reference and its Output
pub fn input(oref: OutputReference, output: Output) -> Input {
  Input {
    output_reference: oref,
    output,
  }
}

// Creates a dummy OutputReference from tx_id and index
pub fn oref(tx_id: ByteArray, output_index: Int) -> OutputReference {
  OutputReference {
    transaction_id: tx_id,
    output_index,
  }
}

// Creates an Output from address, value and datum
pub fn output(address: Address, value: Value, datum: Datum) -> Output {
  Output {
    address,
    value,
    datum,
    reference_script: None,
  }
}

// Generates a script address for a given script hash
pub fn scriptAddress(hash: ByteArray) -> Address {
  Address {
    payment_credential: Script(hash),
    stake_credential: None,
  }
}

// Generates a wallet address for a given public key hash
pub fn walletAddress(hash: ByteArray) -> Address {
  Address {
    payment_credential: VerificationKey(hash),
    stake_credential: None,
  }
}

// Utility: Constructs a Value from an asset policy and name
pub fn makeAsset(policyId: ByteArray, assetName: ByteArray, quantity: Int) -> Value {
  assets.from_asset(policyId, assetName, quantity)
}
