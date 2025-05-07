use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use aiken/primitive/int
use aiken/primitive/string
use cardano/assets.{PolicyId}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}
use store/types.{
  OBurn, OClose, OMint, OUpdate, OracleAction, OracleDatum, OracleMintAction,
}

// Constants for validation
fn max_future_timestamp_offset() -> Int {
  3600
  // 1 hour in seconds
}

fn min_exchange_rate() -> Int {
  1
  // Minimum rate in smallest unit (e.g., satoshis)
}

fn max_exchange_rate() -> Int {
  1000000000000
  // Maximum rate in smallest unit
}

pub fn max_decimal_places() -> Int {
  8
}

fn allowed_currencies() -> List<ByteArray> {
  ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BRL"]
}

pub fn max_updates_per_hour() -> Int {
  60
}

// Validation functions
fn validate_timestamp(current: Int, new: Int) -> Bool {
  let max_future = current + max_future_timestamp_offset()
  new > current && new <= max_future
}

fn validate_exchange_rate(rate: Int) -> Bool {
  rate >= min_exchange_rate() && rate <= max_exchange_rate()
}

fn validate_decimal_places(rate: Int) -> Bool {
  // Check if the rate is within reasonable bounds for the given decimal places
  // For 8 decimal places, we'll use a simpler check
  rate >= 0 && rate <= 100000000
  // 1 with 8 decimal places
}

fn validate_currency(currency: ByteArray) -> Bool {
  list.has(allowed_currencies(), currency)
}

fn validate_update_frequency(timestamp: Int, last_update: Int) -> Bool {
  let time_diff = timestamp - last_update
  time_diff >= 60
  // At least 1 minute between updates
}

pub fn validate_datum(datum: OracleDatum) -> Bool {
  and {
    validate_currency(datum.currency),
    validate_exchange_rate(datum.exchange),
    validate_decimal_places(datum.exchange),
    datum.timestamp > 0,
  }
}

pub fn validate_mint_action(action: OracleMintAction) -> Bool {
  when action is {
    OMint { exchange, timestamp, currency } -> and {
        validate_currency(currency),
        validate_exchange_rate(exchange),
        validate_decimal_places(exchange),
        timestamp > 0,
      }
    OBurn -> True
  }
}

pub fn validate_update_action(
  action: OracleAction,
  current_datum: OracleDatum,
) -> Bool {
  when action is {
    OUpdate { exchange, timestamp } -> and {
        validate_exchange_rate(exchange),
        validate_decimal_places(exchange),
        validate_timestamp(current_datum.timestamp, timestamp),
        validate_update_frequency(timestamp, current_datum.timestamp),
      }
    OClose -> True
  }
}
