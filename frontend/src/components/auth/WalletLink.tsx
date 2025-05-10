import React, { useState } from 'react';
import { authService } from '../../services/api';

const WalletLink: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authService.linkWallet({ walletAddress });
      setSuccess(true);
      setWalletAddress('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Link your wallet</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Connect your wallet to enable cryptocurrency transactions.</p>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
            Wallet linked successfully!
          </div>
        )}

        <form className="mt-5" onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="walletAddress" className="sr-only">
                Wallet address
              </label>
              <input
                type="text"
                name="walletAddress"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter your wallet address"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Linking...' : 'Link wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletLink; 