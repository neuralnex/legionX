import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { Listing } from '../types';

const MyListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingService.getMyListings();
      setListings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await listingService.deleteListing(id);
      setListings(listings.filter(listing => listing.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <Link
            to="/create-listing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Create New Listing
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No listings</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new listing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{listing.description}</p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {listing.type}
                    </span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {listing.status}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      ${listing.price.toFixed(2)}
                    </span>
                    <div className="flex space-x-3">
                      <Link
                        to={`/edit-listing/${listing.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings; 