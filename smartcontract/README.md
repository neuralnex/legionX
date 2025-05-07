# LegionX Smart Contract System

A Cardano-based marketplace for AI agents with subscription capabilities and oracle-based exchange rates.

## Overview

The LegionX smart contract system implements a marketplace for AI agents with subscription capabilities and an oracle system for exchange rates. The system consists of three main validators: Market, Oracle, and Oneshot.

## Core Components

### 1. Market Validator
The market validator handles the trading and subscription management of AI agents.

#### Key Features:
- **Subscription Management**
  - Allows users to purchase time-limited access to AI agents
  - Handles subscription token minting and distribution
  - Manages subscription durations and pricing

- **Full Ownership Transfer**
  - Enables complete transfer of AI agent ownership
  - Requires seller signature for security
  - Handles full price payments

#### Actions:
1. **MBuySub** (Subscription Purchase)
   ```aiken
   - Validates subscription price payment
   - Mints subscription token for buyer
   - Maintains original AI agent in marketplace
   - Requires valid subscription duration
   ```

2. **MBuyFull** (Full Ownership)
   ```aiken
   - Requires seller signature
   - Transfers complete ownership
   - Handles full price payment
   - Updates ownership records
   ```

3. **MEdit** (Listing Management)
   ```aiken
   - Allows price updates
   - Modifies subscription details
   - Requires seller signature
   ```

4. **MDelist** (Remove Listing)
   ```aiken
   - Removes asset from marketplace
   - Returns asset to seller
   - Requires seller signature
   ```

### 2. Oracle Validator
The oracle validator provides trusted exchange rates for the marketplace.

#### Key Features:
- **Exchange Rate Management**
  - Maintains current exchange rates
  - Updates rates with timestamp validation
  - Supports multiple currencies

#### Actions:
1. **OMint** (Oracle Token Creation)
   ```aiken
   - Creates new oracle token
   - Validates exchange rate data
   - Sets initial timestamp
   ```

2. **OUpdate** (Rate Updates)
   ```aiken
   - Updates exchange rates
   - Validates timestamp sequence
   - Ensures rate changes are reasonable
   ```

3. **OClose** (Oracle Closure)
   ```aiken
   - Handles oracle token burning
   - Validates token quantities
   ```

### 3. Oneshot Validator
A simple minting policy that ensures tokens can only be minted once.

#### Features:
- **Single Minting**
  - Allows only one minting operation
  - Supports token burning
  - Ensures token uniqueness

## Security Features

### Market Security
1. **Signature Verification**
   - All critical operations require seller signatures
   - Prevents unauthorized modifications

2. **Payment Validation**
   - Exact price matching required
   - Secure payment routing

3. **Token Management**
   - Secure subscription token minting
   - Protected ownership transfers

### Oracle Security
1. **Rate Validation**
   ```aiken
   - Minimum rate: 1
   - Maximum rate: 1,000,000,000,000
   - Decimal places: 8
   ```

2. **Update Controls**
   - Maximum future timestamp offset: 3600 seconds (1 hour)
   - Minimum update interval: 60 seconds
   - Maximum updates per hour: 60

3. **Currency Support**
   ```aiken
   Supported currencies:
   - USD, EUR, GBP, JPY, AUD
   - CAD, CHF, CNY, INR, BRL
   ```

## Testing
The system includes comprehensive test coverage:

1. **Market Tests**
   - Subscription purchase validation
   - Full ownership transfer
   - Listing management
   - Delisting operations
   - Security checks

2. **Oracle Tests**
   - Rate validation
   - Update frequency checks
   - Currency validation

## Usage Examples

### Creating a Subscription
```aiken
let datum = MarketDatum {
  price: 1_000_000,
  full_price: Some(5_000_000),
  seller,
  subscription: Some(subscription_id),
  duration: Some(3600),
  owner: buyer
}
```

### Updating Exchange Rate
```aiken
let action = OUpdate {
  exchange: new_rate,
  timestamp: current_time
}
```

## Best Practices

1. **Market Operations**
   - Always verify seller signatures
   - Validate subscription durations
   - Check payment amounts exactly

2. **Oracle Usage**
   - Respect update frequency limits
   - Validate rates before updates
   - Use supported currencies only

3. **Security**
   - Never skip signature verification
   - Validate all inputs
   - Check token quantities

## Error Handling
The system implements strict validation with clear error messages:
- Invalid signatures
- Incorrect payment amounts
- Invalid timestamps
- Unsupported currencies
- Rate validation failures

## Project Structure
```
smartcontract/
├── validators/
│   ├── market.ak
│   ├── market_test.ak
│   ├── oracle.ak
│   ├── oracle_constants.ak
│   └── oneshot.ak
└── store/
    └── types.ak
```

## Development

### Prerequisites
- Aiken compiler
- Cardano node
- Cardano CLI

### Building
```bash
aiken build
```

### Testing
```bash
aiken check
```

## Resources

Find more on the [Aiken's user manual](https://aiken-lang.org).

