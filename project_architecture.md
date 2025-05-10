# LegionX Project Architecture

## System Overview
LegionX is a decentralized marketplace for AI models and tools, built on blockchain technology. The system consists of three main components:

1. Smart Contracts (Blockchain Layer)
2. Backend API (Application Layer)
3. Frontend Application (Presentation Layer)

## Architecture Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Smart Contracts│◄────┤  Backend API    │◄────┤  Frontend App   │
│  (Blockchain)   │     │  (Lucid)        │     │  (HeroUI)       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲                        ▲
        │                       │                        │
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Blockchain     │     │  PostgreSQL     │     │  User Browser   │
│  Network        │     │  (DbSync)       │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Component Interaction Flow

### 1. User Authentication
1. User connects wallet through frontend
2. Frontend sends wallet address to backend
3. Backend verifies wallet signature
4. Backend creates/updates user record
5. Backend issues JWT token
6. Frontend stores token for authenticated requests

### 2. Listing Creation
1. User submits listing through frontend
2. Frontend uploads images to Pinata IPFS
3. Backend stores listing data in PostgreSQL via DbSync
4. Backend creates listing NFT on blockchain
5. Backend updates database with NFT details
6. Frontend displays new listing

### 3. Purchase Flow
1. User initiates purchase through frontend
2. Frontend requests purchase from backend
3. Backend creates purchase record in PostgreSQL
4. Backend initiates blockchain transaction
5. Smart contract handles payment and NFT transfer
6. Backend updates purchase status
7. Frontend shows purchase confirmation

## Technology Stack

### Smart Contracts
- Solidity
- Hardhat
- OpenZeppelin
- Web3.js

### Backend
- Lucid Evolution (TypeScript)
- DbSync for PostgreSQL
- Pinata for IPFS
- JWT Authentication
- Express.js

### Frontend
- HeroUI
- TypeScript
- Vite
- Web3.js
- Axios

## Security Considerations
1. Smart Contract Security
   - Access control
   - Reentrancy protection
   - Input validation
   - Emergency stops

2. Backend Security
   - JWT authentication
   - Rate limiting
   - Input sanitization
   - CORS protection
   - IPFS content validation

3. Frontend Security
   - XSS prevention
   - CSRF protection
   - Secure storage
   - Input validation

## Development Workflow
1. Smart Contract Development
   - Write and test contracts
   - Deploy to testnet
   - Verify contracts
   - Update backend integration

2. Backend Development
   - API implementation with Lucid
   - DbSync schema management
   - Pinata IPFS integration
   - Integration tests
   - Security audits

3. Frontend Development
   - HeroUI implementation
   - API integration
   - Wallet connection
   - Testing

## Deployment Strategy
1. Smart Contracts
   - Deploy to mainnet
   - Verify contracts
   - Update contract addresses

2. Backend
   - Deploy Lucid application
   - Configure DbSync
   - Set up Pinata credentials
   - Configure environment
   - Set up monitoring
   - Enable SSL

3. Frontend
   - Build production version
   - Deploy to CDN
   - Configure environment
   - Enable caching

## Monitoring and Maintenance
1. Smart Contracts
   - Transaction monitoring
   - Gas usage tracking
   - Event logging
   - Emergency response

2. Backend
   - API monitoring
   - DbSync performance
   - IPFS content availability
   - Error tracking
   - Performance metrics
   - Database maintenance

3. Frontend
   - Error tracking
   - Performance monitoring
   - User analytics
   - Cache management 