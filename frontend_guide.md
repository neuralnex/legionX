# Frontend Development Guide - AI Agent Marketplace

## Overview
This guide outlines the frontend implementation of the AI agent marketplace using HeroUI, a modern React component library built on top of TailwindCSS and React Aria. The frontend will provide a seamless user experience for browsing, purchasing, and managing AI agents.

## Technology Stack
- React (with TypeScript)
- HeroUI (UI Component Library)
- TailwindCSS (Styling)
- Framer Motion (Animations)
- React Query (Data Fetching)
- React Hook Form (Form Handling)
- Zustand (State Management)

## Project Structure
```
src/
├── components/
│   ├── agents/
│   │   ├── AgentCard.tsx
│   │   ├── AgentList.tsx
│   │   ├── AgentDetails.tsx
│   │   └── AgentForm.tsx
│   ├── marketplace/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   └── ListingFilters.tsx
│   ├── wallet/
│   │   ├── WalletConnect.tsx
│   │   └── WalletBalance.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── hooks/
│   ├── useAgent.ts
│   ├── useListing.ts
│   └── useWallet.ts
├── pages/
│   ├── Home.tsx
│   ├── Marketplace.tsx
│   ├── AgentDetails.tsx
│   ├── CreateAgent.tsx
│   └── Dashboard.tsx
└── utils/
    ├── api.ts
    └── constants.ts
```

## Key Features Implementation

### 1. Agent Marketplace Page
```typescript
// pages/Marketplace.tsx
import { Card, Grid, Input, Select } from '@heroui/react';

const Marketplace = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">AI Agent Marketplace</h1>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input 
          placeholder="Search agents..."
          className="w-64"
        />
        <Select
          label="Type"
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Language Models', value: 'llm' },
            { label: 'Image Generation', value: 'image' }
          ]}
        />
        <Select
          label="Price Range"
          options={[
            { label: 'All Prices', value: 'all' },
            { label: 'Under $100', value: 'under-100' },
            { label: '$100 - $500', value: '100-500' }
          ]}
        />
      </div>

      {/* Agent Grid */}
      <Grid cols={3} gap={6}>
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </Grid>
    </div>
  );
};
```

### 2. Agent Card Component
```typescript
// components/agents/AgentCard.tsx
import { Card, Button, Badge } from '@heroui/react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    price: number;
    type: string;
    image: string;
  };
}

const AgentCard = ({ agent }: AgentCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <img 
          src={agent.image} 
          alt={agent.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge 
          color="primary"
          className="absolute top-2 right-2"
        >
          {agent.type}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
        <p className="text-gray-600 mb-4">{agent.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">
            ${agent.price}
          </span>
          <Button 
            color="primary"
            onClick={() => handlePurchase(agent.id)}
          >
            Purchase
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

### 3. Agent Creation Form
```typescript
// components/agents/AgentForm.tsx
import { Form, Input, Textarea, Select, Button } from '@heroui/react';

const AgentForm = () => {
  return (
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Input
          label="Agent Name"
          placeholder="Enter agent name"
          required
        />
        
        <Textarea
          label="Description"
          placeholder="Describe your agent's capabilities"
          required
        />
        
        <Select
          label="Agent Type"
          options={[
            { label: 'Language Model', value: 'llm' },
            { label: 'Image Generation', value: 'image' },
            { label: 'Data Analysis', value: 'data' }
          ]}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Monthly Subscription Price"
            type="number"
            placeholder="0.00"
          />
          <Input
            label="One-time Purchase Price"
            type="number"
            placeholder="0.00"
          />
        </div>
        
        <Button 
          type="submit"
          color="primary"
          className="w-full"
        >
          Create Agent
        </Button>
      </div>
    </Form>
  );
};
```

### 4. Wallet Integration
```typescript
// components/wallet/WalletConnect.tsx
import { Button, Modal } from '@heroui/react';

const WalletConnect = () => {
  return (
    <div>
      {!isConnected ? (
        <Button
          color="primary"
          onClick={handleConnect}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {truncateAddress(address)}
          </span>
          <Button
            color="secondary"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      )}
      
      <Modal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            Connect Wallet
          </h2>
          <div className="space-y-4">
            {wallets.map(wallet => (
              <Button
                key={wallet.id}
                className="w-full"
                onClick={() => connectWallet(wallet)}
              >
                {wallet.name}
              </Button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
```

## State Management

### 1. Agent Store
```typescript
// stores/agentStore.ts
import create from 'zustand';

interface AgentStore {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  createAgent: (agent: Agent) => Promise<void>;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  loading: false,
  error: null,
  fetchAgents: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/agents');
      set({ agents: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  createAgent: async (agent) => {
    set({ loading: true });
    try {
      await api.post('/agents', agent);
      set(state => ({
        agents: [...state.agents, agent],
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

## API Integration

### 1. API Client
```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Styling Guidelines

### 1. Theme Configuration
```typescript
// styles/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      // ... other shades
      900: '#0c4a6e'
    },
    secondary: {
      // ... color shades
    }
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif'
  }
};
```

### 2. Custom Components
```typescript
// components/common/CustomButton.tsx
import { Button } from '@heroui/react';

export const CustomButton = ({ children, ...props }) => {
  return (
    <Button
      className="bg-gradient-to-r from-primary-500 to-primary-600 
                 hover:from-primary-600 hover:to-primary-700
                 text-white font-semibold py-2 px-4 rounded-lg
                 transition-all duration-200"
      {...props}
    >
      {children}
    </Button>
  );
};
```

## Best Practices

1. **Component Organization**
   - Keep components small and focused
   - Use composition over inheritance
   - Implement proper prop typing
   - Add error boundaries

2. **Performance Optimization**
   - Use React.memo for expensive renders
   - Implement proper loading states
   - Use virtualization for long lists
   - Optimize images and assets

3. **Accessibility**
   - Use semantic HTML
   - Implement proper ARIA labels
   - Ensure keyboard navigation
   - Test with screen readers

4. **Error Handling**
   - Implement proper error boundaries
   - Show user-friendly error messages
   - Add retry mechanisms
   - Log errors properly

## Deployment

1. **Build Process**
   ```bash
   # Install dependencies
   npm install

   # Build for production
   npm run build

   # Start production server
   npm start
   ```

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=https://api.example.com
   NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
   NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
   ```

## Future Improvements

1. **UI/UX Enhancements**
   - Add dark mode support
   - Implement advanced animations
   - Add more interactive features
   - Improve mobile responsiveness

2. **Performance**
   - Implement code splitting
   - Add service worker for offline support
   - Optimize bundle size
   - Add caching strategies

3. **Features**
   - Add agent versioning UI
   - Implement usage analytics dashboard
   - Add social features
   - Implement advanced search

4. **Testing**
   - Add unit tests
   - Implement E2E testing
   - Add performance testing
   - Implement accessibility testing 