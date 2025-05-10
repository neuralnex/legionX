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
  const [purchaseType, setPurchaseType] = useState<'subscription' | 'full'>('subscription');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const data = await listingService.getListing(id!);
      setListing(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!listing) return;
    setPurchasing(true);
    try {
      await listingService.purchaseListing(listing.id, purchaseType);
      navigate('/marketplace');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Listing not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            <div className="hidden mt-6 w-full max-w-2xl mx-auto sm:block lg:max-w-none">
              <div className="grid grid-cols-4 gap-6">
                {listing.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <img src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-center object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full aspect-w-1 aspect-h-1">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-center object-cover sm:rounded-lg"
              />
            </div>
          </div>

          {/* Listing info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{listing.title}</h1>

            <div className="mt-3">
              <h2 className="sr-only">Listing information</h2>
              <p className="text-3xl text-gray-900">
                ${purchaseType === 'subscription' ? listing.price.subscription : listing.price.full}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">{listing.description}</div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Category</h3>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {listing.category}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
              <div className="mt-2">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CPU</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.cpu}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">GPU</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.gpu}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">RAM</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.ram}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Storage</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.storage}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Motherboard</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.motherboard}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Power Supply</dt>
                    <dd className="mt-1 text-sm text-gray-900">{listing.specifications.powerSupply}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  <input
                    id="subscription"
                    name="purchase-type"
                    type="radio"
                    checked={purchaseType === 'subscription'}
                    onChange={() => setPurchaseType('subscription')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="subscription" className="ml-3 block text-sm font-medium text-gray-700">
                    Subscription (${listing.price.subscription}/month)
                  </label>
                </div>
                <div className="ml-6 flex items-center">
                  <input
                    id="full"
                    name="purchase-type"
                    type="radio"
                    checked={purchaseType === 'full'}
                    onChange={() => setPurchaseType('full')}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="full" className="ml-3 block text-sm font-medium text-gray-700">
                    Full Purchase (${listing.price.full})
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {purchasing ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails; 