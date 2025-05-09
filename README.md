# LegionX - AI Agent Marketplace

LegionX is a decentralized marketplace for AI agents built on the Cardano blockchain. It enables creators to monetize their AI agents through subscriptions or full ownership sales, while providing users with secure and transparent access to AI capabilities.

## 🌟 Features

- **Decentralized Marketplace**: Built on Cardano blockchain for transparency and security
- **AI Agent Listings**: Create, manage, and sell AI agents
- **Flexible Pricing**: Support for both subscription and full ownership models
- **Secure Access**: JWT-based authentication and blockchain-verified ownership
- **Metadata Storage**: IPFS integration for decentralized metadata storage
- **Real-time Updates**: WebSocket support for live marketplace updates

## 🏗️ Architecture

The project consists of three main components:

1. **Smart Contracts** (`/smartcontract`): Cardano blockchain contracts for marketplace operations
2. **Backend API** (`/backend`): Node.js/TypeScript REST API
3. **Frontend** (`/frontend`): React-based user interface

For detailed architecture and flow documentation, see [project_flow.md](./project_flow.md)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Cardano DBSync
- Cardano Node (for development)
- IPFS/Pinata account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legionx.git
   cd legionx
   ```

2. **Set up environment variables**
   ```bash
   # In backend directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   pnpm install

   # Install frontend dependencies
   cd ../frontend
   pnpm install
   ```

4. **Set up database**
   ```bash
   # In backend directory
   pnpm prisma migrate dev
   ```

5. **Start development servers**
   ```bash
   # Start backend
   cd backend
   pnpm dev

   # Start frontend
   cd frontend
   pnpm dev
   ```

## 📚 Documentation

- [Project Flow](./project_flow.md) - Detailed system architecture and component interaction
- [Smart Contract Documentation](./smartcontract/README.md) - Smart contract specifications
- [API Documentation](./backend/README.md) - Backend API documentation
- [Frontend Documentation](./frontend/README.md) - Frontend implementation details

## 🔧 Configuration

### Environment Variables

Required environment variables for the backend:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=legionx

# DBSync Configuration
DBSYNC_HOST=localhost
DBSYNC_PORT=5432
DBSYNC_DB=dbsync
DBSYNC_USER=postgres
DBSYNC_PASSWORD=postgres

# Cardano Network Configuration
NETWORK=preprod
BLOCKFROST_API_KEY=your_blockfrost_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# IPFS/Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

## 🛠️ Development

### Smart Contract Development

```bash
cd smartcontract
aiken build
```

### Backend Development

```bash
cd backend
pnpm dev
```

### Frontend Development

```bash
cd frontend
pnpm dev
```

## 🧪 Testing

```bash
# Run backend tests
cd backend
pnpm test

# Run frontend tests
cd frontend
pnpm test

# Run smart contract tests
cd smartcontract
aiken test
```

## 📦 Deployment

### Backend Deployment

1. Build the application:
   ```bash
   cd backend
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

### Frontend Deployment

1. Build the application:
   ```bash
   cd frontend
   pnpm build
   ```

2. Deploy the `dist` directory to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Cardano Foundation
- Aiken Framework
- IPFS/Pinata
- All contributors and supporters

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.
