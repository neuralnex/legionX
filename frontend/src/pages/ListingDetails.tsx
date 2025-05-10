import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/api';
import { Listing } from '../types';

const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await listingService.getListing(id!);
      setListing(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!window.confirm('Are you sure you want to purchase this listing?')) {
      return;
    }

    setPurchasing(true);
    try {
      await listingService.purchaseListing(id!);
      navigate('/my-listings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to purchase listing');
    } finally {
      setPurchasing(false);
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">Listing not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{listing.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {listing.type} • {listing.category}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  ${listing.price.toFixed(2)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {listing.description}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Specifications</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">CPU</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="font-medium text-gray-900">{listing.specifications.cpu}</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">GPU</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="font-medium text-gray-900">{listing.specifications.gpu}</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">RAM</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="font-medium text-gray-900">{listing.specifications.ram}</span>
                      </div>
                    </li>
                    <li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate">Storage</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="font-medium text-gray-900">
                          {listing.specifications.storage}
                        </span>
                      </div>
                    </li>
                  </ul>
                </dd>
              </div>
              {listing.images && listing.images.length > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Images</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {listing.images.map((image: string, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Listing image ${index + 1}`}
                            className="h-64 w-full object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchasing}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {purchasing ? 'Processing...' : 'Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails; 