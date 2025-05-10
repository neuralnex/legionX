import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import ListingDetails from './pages/ListingDetails';

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

export default App; 