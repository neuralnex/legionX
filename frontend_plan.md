# LegionX Frontend Plan

## Technology Stack

- **Framework**: React with TypeScript
- **UI Library**: HeroUI (Headless UI)
- **State Management**: React Query + Zustand
- **Styling**: Tailwind CSS
- **Web3 Integration**: Lucid (Cardano)
- **Real-time Updates**: WebSocket

## Component Structure

### 1. Layout Components
```typescript
// components/layout/
├── Header/
│   ├── Navigation.tsx
│   ├── WalletConnect.tsx
│   └── UserMenu.tsx
├── Footer/
│   └── Footer.tsx
└── MainLayout.tsx
```

### 2. Marketplace Components
```typescript
// components/marketplace/
├── ListingCard/
│   ├── ListingCard.tsx
│   └── ListingCardSkeleton.tsx
├── ListingGrid/
│   ├── ListingGrid.tsx
│   └── FilterBar.tsx
├── ListingDetail/
│   ├── ListingDetail.tsx
│   ├── PurchaseOptions.tsx
│   └── AgentPreview.tsx
└── CreateListing/
    ├── CreateListingForm.tsx
    └── MetadataUpload.tsx
```

### 3. Authentication Components
```typescript
// components/auth/
├── LoginForm.tsx
├── RegisterForm.tsx
└── WalletAuth.tsx
```

### 4. User Dashboard Components
```typescript
// components/dashboard/
├── MyListings/
│   ├── MyListings.tsx
│   └── ListingManagement.tsx
├── MyPurchases/
│   ├── MyPurchases.tsx
│   └── SubscriptionStatus.tsx
└── Profile/
    ├── ProfileSettings.tsx
    └── WalletSettings.tsx
```

## Page Structure

### 1. Public Pages
```typescript
// pages/
├── Home/
│   └── index.tsx
├── Marketplace/
│   ├── index.tsx
│   └── [listingId].tsx
├── Auth/
│   ├── login.tsx
│   └── register.tsx
└── About/
    └── index.tsx
```

### 2. Protected Pages
```typescript
// pages/dashboard/
├── index.tsx
├── listings/
│   ├── index.tsx
│   └── create.tsx
├── purchases/
│   └── index.tsx
└── profile/
    └── index.tsx
```

## State Management

### 1. Global State (Zustand)
```typescript
// stores/
├── authStore.ts
├── walletStore.ts
└── uiStore.ts
```

### 2. Server State (React Query)
```typescript
// queries/
├── listings.ts
├── purchases.ts
└── user.ts
```

## UI/UX Features

### 1. Marketplace
- Responsive grid layout for listings
- Infinite scroll with pagination
- Advanced filtering and sorting
- Real-time price updates
- Quick purchase actions

### 2. Listing Cards
```typescript
interface ListingCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: {
    subscription: number;
    full: number;
  };
  creator: {
    name: string;
    wallet: string;
  };
  capabilities: string[];
  createdAt: Date;
}
```

### 3. Interactive Elements
- Wallet connection modal
- Purchase confirmation dialog
- Loading states and skeletons
- Toast notifications
- Error boundaries

## Styling Guidelines

### 1. Theme Configuration
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          // ... other shades
          900: '#0c4a6e',
        },
        // ... other colors
      },
    },
  },
}
```

### 2. Component Styling
- Use Tailwind utility classes
- Custom components with HeroUI
- Responsive design patterns
- Dark mode support

## Web3 Integration

### 1. Wallet Connection
```typescript
// hooks/useWallet.ts
const useWallet = () => {
  // Wallet connection logic
  // Transaction signing
  // Balance checking
}
```

### 2. Transaction Handling
```typescript
// hooks/useTransaction.ts
const useTransaction = () => {
  // Transaction building
  // Status monitoring
  // Error handling
}
```

## Performance Optimization

1. **Code Splitting**
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. **Asset Optimization**
   - Image optimization
   - SVG sprites
   - Font loading

3. **Caching Strategy**
   - API response caching
   - Static page generation
   - Service worker implementation

## Testing Strategy

1. **Unit Tests**
   - Component testing
   - Hook testing
   - Utility testing

2. **Integration Tests**
   - Page testing
   - User flow testing
   - API integration testing

3. **E2E Tests**
   - Critical user journeys
   - Wallet integration
   - Purchase flow

## Deployment

1. **Build Process**
   ```bash
   # Development
   pnpm dev

   # Production build
   pnpm build

   # Preview
   pnpm preview
   ```

2. **Environment Configuration**
   ```env
   NEXT_PUBLIC_API_URL=
   NEXT_PUBLIC_NETWORK=
   NEXT_PUBLIC_IPFS_GATEWAY=
   ```

## Monitoring and Analytics

1. **Error Tracking**
   - Error boundary implementation
   - Error logging service
   - Performance monitoring

2. **User Analytics**
   - Page views
   - User interactions
   - Conversion tracking

## Security Measures

1. **Input Validation**
   - Form validation
   - API request validation
   - XSS prevention

2. **Authentication**
   - JWT handling
   - Wallet verification
   - Session management 