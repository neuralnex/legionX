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

### 2. Root State
```typescript
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
  wallet: {
    connected: boolean;
    address: string | null;
  };
}
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

## Root Page Layout

The root page (`/`) serves as the main landing page and navigation hub for the application. Here's a detailed breakdown of its structure and components:

### Layout Structure

```tsx
<Layout>
  <Header />
  <MainContent />
  <Footer />
</Layout>
```

### Header Component
- **Logo**: LegionX logo positioned on the left
- **Navigation Menu**: Centered navigation links
- **Wallet Connect**: Right-aligned wallet connection button
- **User Menu**: Appears when wallet is connected, showing:
  - Truncated wallet address
  - Profile link
  - Logout option

### Main Navigation Buttons

The root page features a grid of main navigation buttons, each styled as a card with an icon and description:

1. **Create Listing**
   - Icon: Plus circle
   - Description: "Create a new listing for your content"
   - Action: Navigates to `/create-listing`
   - Required: Connected wallet

2. **Browse Listings**
   - Icon: Search
   - Description: "Browse available content listings"
   - Action: Navigates to `/listings`
   - Access: Public

3. **My Listings**
   - Icon: List
   - Description: "Manage your active listings"
   - Action: Navigates to `/my-listings`
   - Required: Connected wallet

4. **My Purchases**
   - Icon: Shopping bag
   - Description: "View your purchased content"
   - Action: Navigates to `/my-purchases`
   - Required: Connected wallet

5. **Profile**
   - Icon: User
   - Description: "Manage your profile settings"
   - Action: Navigates to `/profile`
   - Required: Connected wallet

### Styling

```css
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.nav-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-4px);
}

.nav-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}
```

### Authentication Flow

1. **Wallet Connection**
   - Users must connect their wallet to access protected features
   - Connection status is persisted in local storage
   - Wallet address is displayed in header when connected

2. **Protected Routes**
   - Create Listing
   - My Listings
   - My Purchases
   - Profile
   - These routes redirect to login if not authenticated

3. **Public Routes**
   - Browse Listings
   - Home page
   - These are accessible without authentication

### Responsive Design

- Desktop: 4-column grid layout
- Tablet: 3-column grid layout
- Mobile: 2-column grid layout
- Header collapses to hamburger menu on mobile

### State Management

```typescript
interface RootState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
  wallet: {
    connected: boolean;
    address: string | null;
  };
}
```

### Error Handling

- Wallet connection errors display toast notifications
- Network errors show retry options
- Invalid routes redirect to 404 page

### Loading States

- Skeleton loaders for navigation cards
- Spinner for wallet connection
- Progress indicators for protected route checks

### Accessibility

- ARIA labels for all navigation buttons
- Keyboard navigation support
- High contrast mode support
- Screen reader friendly structure

### Performance Considerations

- Lazy loading for route components
- Image optimization for icons
- Minimal initial bundle size
- Efficient state updates

This guide provides a foundation for implementing the root page and navigation system. The layout is designed to be intuitive, responsive, and user-friendly while maintaining security through hybrid authentication (fiat-based with optional wallet linking).

## Authentication Components

### 1. Auth Provider
```typescript
// components/auth/AuthProvider.tsx
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Protected Route Component
```typescript
// components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 3. Login Page
```typescript
// pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Welcome to LegionX</h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

### 4. Auth Hook
```typescript
// hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../components/auth/AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 5. API Authentication Interceptor
```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 6. Route Configuration
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-purchases"
            element={
              <ProtectedRoute>
                <MyPurchases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
```

### 7. User Profile Interface
```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  wallet: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}
```

### 8. Authentication State Management
```typescript
// stores/authStore.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

This authentication system provides:
- Hybrid authentication (fiat-based with optional wallet linking)
- Protected routes
- Persistent sessions
- Automatic token management
- Secure API communication
- User profile management

The system integrates with the existing wallet connection for blockchain operations while providing a seamless fiat-based authentication experience for users. 