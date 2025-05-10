import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingService } from '../services/api';
import { Listing } from '../types';

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await listingService.getListings();
      setListings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Marketplace
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/create-listing"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Listing
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listings/${listing.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{listing.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ${listing.price.subscription}/month
                    </p>
                    <p className="text-sm text-gray-500">Full: ${listing.price.full}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      listing.type === 'SALE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {listing.type}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace; 