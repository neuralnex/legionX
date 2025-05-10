# LegionX Smart Contract Flow

## Overview
The LegionX smart contracts are built using Aiken, a functional programming language for Cardano smart contracts. The contracts handle the marketplace functionality for buying, selling, and managing AI model listings.

## Project Structure
```
smartcontract/
├── validators/           # Smart contract validators
│   ├── market.ak        # Main marketplace validator
│   ├── oracle.ak        # Oracle validator for price feeds
│   ├── oneshot.ak       # One-time purchase validator
│   └── oracle_constants.ak  # Oracle constants
├── lib/                 # Shared libraries
├── build/              # Compiled contracts
├── aiken.toml         # Project configuration
└── plutus.json        # Contract metadata
```

## Core Validators

### 1. Marketplace Validator
```aiken
// validators/market.ak
validator market {
  spend(
    datum: Option<MarketDatum>,
    r: MarketAction,
    oref: OutputReference,
    tx: Transaction,
  ) {
    // Implementation details
  }
}
```

#### Market Actions
1. **Subscription Purchase (MBuySub)**
   - Validates subscription payment
   - Ensures correct price payment
   - Verifies subscription duration
   - Manages subscription token distribution

2. **Full Purchase (MBuyFull)**
   - Verifies seller signature
   - Checks subscription status
   - Validates full price payment
   - Transfers ownership

3. **Edit Listing (MEdit)**
   - Updates listing prices
   - Modifies subscription details
   - Requires seller signature

4. **Delist (MDelist)**
   - Removes listing from marketplace
   - Requires seller signature

### 2. Oracle Validator
```aiken
// validators/oracle.ak
validator oracle {
  // Oracle implementation for price feeds
  // and market data
}
```

### 3. One-Shot Purchase Validator
```aiken
// validators/oneshot.ak
validator oneshot {
  // Handles one-time purchases
  // without subscription options
}
```

## Data Types

### 1. Market Datum
```aiken
type MarketDatum {
  seller: VerificationKey,
  owner: VerificationKey,
  price: Int,
  full_price: Option<Int>,
  subscription: Option<Token>,
  duration: Option<Int>
}
```

### 2. Market Actions
```aiken
type MarketAction {
  MBuySub,
  MBuyFull,
  MEdit {
    price: Int,
    full_price: Option<Int>,
    duration: Option<Int>
  },
  MDelist
}
```

## Transaction Validation

### 1. Subscription Purchase
```aiken
when r is {
  MBuySub -> {
    // Verify payment amount
    expect assets.lovelace_of(payment.value) == d.price

    // Check subscription duration
    expect Some(_duration) = d.duration

    // Verify token distribution
    expect Some(subscriptionToken) = d.subscription
    expect Some(_subscriptionOutput) = list.find(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == VerificationKey(d.owner) &&
        dict.has_key(tokens, subscriptionToken)
      }
    )

    True
  }
}
```

### 2. Full Purchase
```aiken
when r is {
  MBuyFull -> {
    // Verify seller signature
    expect list.has(tx.extra_signatories, d.seller)

    // Check subscription status
    expect d.subscription == None

    // Validate payment
    expect assets.lovelace_of(payment.value) == d.full_price

    // Transfer ownership
    expect Some(buyerOutput) = list.find(
      tx.outputs,
      fn(output) {
        output.address.payment_credential == VerificationKey(newDatum.owner) &&
        output.value == ownInput.output.value
      }
    )

    True
  }
}
```

## Security Features

### 1. Signature Verification
- All critical actions require seller signature
- Prevents unauthorized modifications
- Ensures transaction authenticity

### 2. Price Validation
- Strict price checking for both subscription and full purchase
- Prevents price manipulation
- Ensures correct payment amounts

### 3. Token Management
- Secure token distribution for subscriptions
- Ownership transfer validation
- Prevents double-spending

## Integration Points

### 1. Backend Integration
```typescript
// Backend service for contract interaction
export class BlockchainService {
  async createListing(listingData: CreateListingRequest) {
    const tx = await this.marketplace.createListing(
      listingData.title,
      listingData.price,
      listingData.ipfsHash
    );
    return await tx.wait();
  }
}
```

### 2. Frontend Integration
```typescript
// Frontend service for contract interaction
export const blockchainService = {
  createListing: async (title: string, price: number, ipfsHash: string) => {
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(
      MARKETPLACE_ABI,
      MARKETPLACE_ADDRESS
    );

    const accounts = await web3.eth.getAccounts();
    return contract.methods
      .createListing(title, price, ipfsHash)
      .send({ from: accounts[0] });
  }
};
```

## Testing

### 1. Unit Tests
```aiken
// tests/market.test.ak
test "subscription purchase" {
  let datum = MarketDatum {
    seller: sellerKey,
    owner: ownerKey,
    price: 1000000,
    full_price: None,
    subscription: Some(subscriptionToken),
    duration: Some(30)
  }

  let action = MBuySub
  let tx = create_test_tx()

  expect True = market.spend(Some(datum), action, oref, tx)
}
```

### 2. Integration Tests
```aiken
// tests/integration.test.ak
test "full purchase flow" {
  // Setup test environment
  let seller = create_test_wallet()
  let buyer = create_test_wallet()
  
  // Create listing
  let listing = create_test_listing(seller)
  
  // Execute purchase
  let result = execute_purchase(buyer, listing)
  
  // Verify results
  expect True = verify_ownership_transfer(result)
}
```

## Deployment

### 1. Contract Compilation
```bash
# Compile contracts
aiken build

# Generate Plutus script
aiken blueprint
```

### 2. Contract Deployment
```bash
# Deploy to testnet
cardano-cli transaction build \
  --testnet-magic 1097911063 \
  --tx-in $TXIN \
  --tx-out $SCRIPT_ADDR+$AMOUNT \
  --tx-out-datum-hash $DATUM_HASH \
  --change-address $CHANGE_ADDR \
  --out-file tx.raw

cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file $SIGNING_KEY \
  --testnet-magic 1097911063 \
  --out-file tx.signed

cardano-cli transaction submit \
  --testnet-magic 1097911063 \
  --tx-file tx.signed
```

## Monitoring and Maintenance

### 1. Contract Monitoring
- Track contract usage
- Monitor transaction success rates
- Identify potential issues

### 2. Contract Updates
- Version control for contracts
- Upgrade mechanisms
- Emergency procedures

## Security Considerations

### 1. Access Control
- Strict signature verification
- Role-based permissions
- Transaction validation

### 2. Asset Protection
- Secure token handling
- Ownership verification
- Price validation

### 3. Error Handling
- Graceful failure modes
- Clear error messages
- Recovery procedures

## Future Enhancements

### 1. Planned Features
- Advanced pricing models
- Batch operations
- Enhanced security measures

### 2. Optimization Opportunities
- Gas optimization
- Transaction batching
- Storage efficiency

## Development Guidelines

### 1. Code Standards
- Aiken best practices
- Documentation requirements
- Testing requirements

### 2. Security Practices
- Code review process
- Security audits
- Vulnerability management

## Conclusion
The LegionX smart contracts provide a secure and efficient marketplace for AI models and tools, with support for both subscription and full purchase options. The implementation follows best practices for security, efficiency, and maintainability. 