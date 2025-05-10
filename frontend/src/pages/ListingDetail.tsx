import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService, purchaseService } from '../services/api';
import { Listing } from '../types';
import { Dialog } from '@headlessui/react';

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'subscription' | 'full'>('subscription');

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      const response = await listingService.getListing(id!);
      setListing(response.data);
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!listing) return;

    try {
      await purchaseService.createPurchase({
        listingId: listing.id,
        type: purchaseType,
      });
      setIsPurchaseModalOpen(false);
      // Redirect to purchases page or show success message
      navigate('/purchases');
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 btn-primary"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img
            src={listing.image}
            alt={listing.name}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.name}</h1>
          <p className="text-gray-600 mb-6">{listing.description}</p>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {listing.capabilities.map((capability, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-500">Subscription Price</p>
                <p className="text-2xl font-bold text-primary-600">
                  {listing.price.subscription} ₳
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Price</p>
                <p className="text-2xl font-bold text-primary-600">
                  {listing.price.full} ₳
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full btn-primary"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Choose Purchase Type
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={purchaseType === 'subscription'}
                    onChange={() => setPurchaseType('subscription')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-gray-700">
                    Subscription ({listing.price.subscription} ₳)
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={purchaseType === 'full'}
                    onChange={() => setPurchaseType('full')}
                    className="h-4 w-4 text-primary-600"
                  />
                  <span className="text-gray-700">
                    Full Purchase ({listing.price.full} ₳)
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="btn-primary"
              >
                Confirm Purchase
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default ListingDetail; 