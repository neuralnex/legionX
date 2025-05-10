# LegionX Frontend Flow

## Overview
The LegionX frontend is a React-based web application that provides a marketplace for AI models and tools. It's built with modern technologies and follows best practices for user experience and security.

## Technology Stack

### Core Technologies
- React with TypeScript
- Vite for build tooling
- React Router v6 for routing
- Axios for API communication
- Web3.js for blockchain interaction
- Pinata for IPFS integration

## Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API and blockchain services
│   ├── styles/        # Global styles
│   ├── types/         # TypeScript types
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies
```

## Core Features

### 1. Authentication Flow
- **Login/Register**: Users can create accounts or log in with email/password
- **Wallet Integration**: Users can link their crypto wallets
- **Protected Routes**: Certain features require authentication
- **Token Management**: JWT tokens stored in localStorage for session management

### 2. Marketplace
- **Listing Display**: Grid view of all available AI models and tools
- **Filtering**: By category, type (SALE/RENTAL), and price range
- **Search**: Full-text search across listings
- **Responsive Design**: Works on desktop and mobile devices

### 3. Listing Management
- **Create Listing**: Form for sellers to create new listings
  - Title, description, category
  - Price (subscription and full purchase)
  - Images upload to IPFS
  - Specifications (JSON format)
- **Edit Listing**: Modify existing listings
- **Delete Listing**: Remove listings from marketplace
- **My Listings**: View and manage own listings

### 4. Purchase Flow
- **Subscription**: Monthly rental of AI models/tools
- **Full Purchase**: One-time purchase of models/tools
- **Purchase History**: Track all transactions
- **Wallet Integration**: Crypto payments

## Component Structure

### 1. Layout Components
```typescript
// components/Navbar.tsx
const Navbar: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const [account, setAccount] = useState<string | null>(null);

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            LegionX
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/my-listings">My Listings</Link>
                <Link to="/create-listing">Create Listing</Link>
                <button onClick={handleDisconnect}>Disconnect</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

### 2. Authentication Components
```typescript
// components/auth/LoginForm.tsx
const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.token);
      navigate('/marketplace');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### 3. Listing Components
```typescript
// components/listings/ListingCard.tsx
interface ListingCardProps {
  listing: Listing;
  onPurchase: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, onPurchase }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img src={`https://ipfs.io/ipfs/${listing.ipfsHash}`} alt={listing.title} />
      <h3 className="text-lg font-semibold">{listing.title}</h3>
      <p className="text-gray-600">{listing.description}</p>
      <div className="mt-4">
        <p>Subscription: {listing.price.subscription} LEGX</p>
        <p>Full Purchase: {listing.price.full} LEGX</p>
      </div>
      <button
        onClick={() => onPurchase(listing.id)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Purchase
      </button>
    </div>
  );
};
```

## Services

### 1. API Service
```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
  linkWallet: (data: LinkWalletRequest) => api.post('/auth/link-wallet', data)
};

export const listingService = {
  getListings: (params: ListingsParams) => api.get('/listings', { params }),
  getListing: (id: string) => api.get(`/listings/${id}`),
  createListing: (data: CreateListingRequest) => api.post('/listings', data),
  updateListing: (id: string, data: UpdateListingRequest) =>
    api.put(`/listings/${id}`, data),
  deleteListing: (id: string) => api.delete(`/listings/${id}`)
};
```

### 2. Blockchain Service
```typescript
// services/blockchain.ts
export const blockchainService = {
  connectWallet: async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      return accounts[0];
    }
    throw new Error('No Ethereum provider found');
  },

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

### 3. IPFS Service
```typescript
// services/ipfs.ts
export const ipfsService = {
  uploadToIPFS: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: process.env.VITE_PINATA_API_KEY,
          pinata_secret_api_key: process.env.VITE_PINATA_SECRET_KEY
        }
      }
    );

    return response.data.IpfsHash;
  }
};
```

## Routing

### 1. Route Configuration
```typescript
// App.tsx
const App: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route
            path="/my-listings"
            element={isAuthenticated ? <MyListings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/create-listing"
            element={isAuthenticated ? <CreateListing /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/edit-listing/:id"
            element={isAuthenticated ? <EditListing /> : <Navigate to="/login" replace />}
          />
          <Route path="/listing/:id" element={<ListingDetails />} />
        </Routes>
      </div>
    </Router>
  );
};
```

## State Management

### 1. Context Setup
```typescript
// context/AuthContext.tsx
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Error Handling

### 1. Error Boundary
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing

### 1. Component Tests
```typescript
// components/__tests__/LoginForm.test.tsx
describe('LoginForm', () => {
  it('should handle login submission', async () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## Build and Deployment

### 1. Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

### 2. Environment Configuration
```bash
# .env
VITE_API_URL=http://localhost:8000
VITE_MARKETPLACE_ADDRESS=0x...
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key
```

## Performance Optimization

### 1. Code Splitting
```typescript
// App.tsx
const CreateListing = React.lazy(() => import('./pages/CreateListing'));
const EditListing = React.lazy(() => import('./pages/EditListing'));
const ListingDetails = React.lazy(() => import('./pages/ListingDetails'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
      </Routes>
    </Suspense>
  );
};
```

### 2. Image Optimization
```typescript
// components/ImageUpload.tsx
const ImageUpload: React.FC = () => {
  const handleImageUpload = async (file: File) => {
    // Compress image before upload
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920
    });

    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadToIPFS(compressedFile);
    return ipfsHash;
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />
    </div>
  );
};
```

## Security Features
1. JWT-based authentication
2. Protected routes for authenticated users
3. Form validation and sanitization
4. Secure API communication
5. CORS protection
6. XSS prevention

## Performance Optimizations
1. Code splitting with React Router
2. Lazy loading of components
3. Image optimization
4. Efficient state management
5. Memoization of expensive computations

## Future Enhancements
1. Real-time updates with WebSocket
2. Advanced search filters
3. User reviews and ratings
4. Chat system for buyer-seller communication
5. Analytics dashboard for sellers
6. Multi-language support
7. Dark mode theme

## Development Workflow
1. Feature branches for new development
2. TypeScript for type safety
3. ESLint for code quality
4. Prettier for code formatting
5. Vite for fast development
6. Hot module replacement

## Testing Strategy
1. Unit tests for components
2. Integration tests for API calls
3. End-to-end tests for critical flows
4. Accessibility testing
5. Cross-browser testing

## Deployment
1. Production build optimization
2. Environment variable management
3. CDN integration for static assets
4. Error tracking and monitoring
5. Performance monitoring

This frontend implementation meets the project scope by providing a secure, scalable, and user-friendly platform for buying and selling AI models and tools, with support for both subscription and full purchase options, integrated with cryptocurrency payments. 