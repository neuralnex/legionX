# Backend Structure and Functions

## Overview
The backend is built using TypeScript, Node.js, and follows a modular architecture with clear separation of concerns. It uses TypeORM for database operations and includes blockchain integration through DBSync.

## Directory Structure

### `/src`
Main source code directory containing all application logic.

#### `/config`
Configuration files and database setup.

**database.ts**
- `AppDataSource`: TypeORM data source configuration
- `DBSyncService`: Blockchain data synchronization service
  - `getUtxosForAddress(address)`: Retrieves UTXOs for a given address
  - `getTransactionDetails(txHash)`: Gets transaction details from blockchain
- Types:
  - `UTXO`: Represents unspent transaction outputs
  - `TransactionDetails`: Contains transaction metadata and IPFS information

#### `/controllers`
Request handlers and business logic controllers.

**listing.controller.ts**
- Handles NFT listing operations
- Endpoints for creating, updating, and managing NFT listings

**purchase.controller.ts**
- Manages NFT purchase transactions
- Handles payment processing and ownership transfers

**access.controller.ts**
- Controls access to NFT resources
- Verifies ownership and permissions

**auth.controller.ts**
- User authentication and authorization
- JWT token management
- User session handling

#### `/entities`
TypeORM entity definitions for database models.
- `User`: User entity
- `Listing`: NFT listing entity
- `Purchase`: Purchase transaction entity
- `Agent`: Agent entity

#### `/middleware`
Custom middleware functions for request processing.

#### `/routes`
API route definitions and endpoint handlers.

**listing.routes.ts**
- `POST /listings`: Create new NFT listing
- `GET /listings`: Get all listings
- `GET /listings/:id`: Get specific listing
- `PUT /listings/:id`: Update listing
- `DELETE /listings/:id`: Delete listing

**purchase.routes.ts**
- `POST /purchases`: Create new purchase
- `GET /purchases`: Get user's purchases
- `GET /purchases/:id`: Get specific purchase
- `POST /purchases/:id/confirm`: Confirm purchase

**access.routes.ts**
- `GET /access/verify/:assetId`: Verify NFT ownership
- `GET /access/metadata/:assetId`: Get NFT metadata
- `POST /access/grant`: Grant access to NFT
- `POST /access/revoke`: Revoke access to NFT

**auth.routes.ts**
- `POST /auth/register`: Register new user
- `POST /auth/login`: User login
- `POST /auth/logout`: User logout
- `GET /auth/me`: Get current user info

#### `/services`
Core business logic and external service integrations.

**nft.service.ts**
- `NFTService`: Handles NFT-related operations
  - `getMetadataFromNFT(assetId, ownerAddress)`: Retrieves NFT metadata
  - `verifyAccess(assetId, ownerAddress)`: Verifies NFT ownership
  - `extractIPFSHash(txDetails)`: Extracts IPFS hash from transaction metadata

**pinata.ts**
- `PinataService`: IPFS integration through Pinata
  - `uploadMetadata(metadata)`: Uploads NFT metadata to IPFS
  - `uploadFile(file)`: Uploads files to IPFS
  - `getMetadata(ipfsHash)`: Retrieves metadata from IPFS
  - `getFile(ipfsHash)`: Retrieves files from IPFS
  - `pinFile(ipfsHash)`: Pins files to IPFS
  - `unpinFile(ipfsHash)`: Unpins files from IPFS
  - `validateMetadata(metadata)`: Validates NFT metadata structure

#### `/types`
TypeScript type definitions and interfaces.

#### `/utils`
Utility functions and helper classes.

**logger.ts**
- `Logger`: Custom logging utility
  - `info(message)`: Logs informational messages
  - `error(message, error)`: Logs error messages
  - `warn(message)`: Logs warning messages

## Key Features

### NFT Management
- NFT metadata storage and retrieval
- Ownership verification
- IPFS integration for decentralized storage
- Blockchain data synchronization

### Database Integration
- PostgreSQL database with TypeORM
- Entity relationships and migrations
- Data synchronization with blockchain

### Security
- Input validation
- Error handling
- Type safety
- Environment variable management
- JWT-based authentication
- Role-based access control

### Logging and Monitoring
- Custom logging system
- Error tracking
- Transaction monitoring

## Dependencies
- TypeScript
- Node.js
- TypeORM
- PostgreSQL
- Pinata SDK
- DBSync
- Express.js
- JWT

## Environment Variables
Required environment variables:
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `PINATA_JWT`: Pinata JWT token
- `PINATA_GATEWAY`: Pinata gateway URL
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT token generation 