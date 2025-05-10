import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const WalletLink: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.linkWallet(walletAddress);
      localStorage.setItem('token', response.token);
      navigate('/marketplace');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
          Wallet Address
        </label>
        <input
          type="text"
          id="walletAddress"
          required
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {loading ? 'Linking wallet...' : 'Link Wallet'}
        </button>
      </div>
    </form>
  );
};

export default WalletLink; 