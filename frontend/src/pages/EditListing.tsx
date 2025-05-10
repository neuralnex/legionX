import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingService } from '../services/api';
import { Listing } from '../types';

interface FormData {
  title: string;
  description: string;
  type: 'SALE' | 'RENT';
  category: 'GAMING' | 'WORKSTATION' | 'MINING';
  price: {
    subscription: number;
    full: number;
  };
  specifications: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    motherboard: string;
    powerSupply: string;
  };
  images: (string | File)[];
}

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'SALE',
    category: 'GAMING',
    price: {
      subscription: 0,
      full: 0
    },
    specifications: {
      cpu: '',
      gpu: '',
      ram: '',
      storage: '',
      motherboard: '',
      powerSupply: ''
    },
    images: []
  });

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const data = await listingService.getListing(id!);
      setFormData({
        ...data,
        images: data.images || []
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch listing');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      (Object.entries(formData) as [keyof FormData, FormData[keyof FormData]][]).forEach(([key, value]) => {
        if (key === 'price' || key === 'specifications') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'images') {
          (value as (string | File)[]).forEach((file: string | File) => {
            if (file instanceof File) {
              formDataToSend.append('images', file);
            } else if (typeof file === 'string') {
              formDataToSend.append('existingImages', file);
            }
          });
        } else if (typeof value === 'string') {
          formDataToSend.append(key, value);
        }
      });

      await listingService.updateListing(id!, formDataToSend);
      navigate('/my-listings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else if (name.startsWith('price.')) {
      const priceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [priceField]: parseFloat(value)
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles]
      }));
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
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Listing</h3>
              <p className="mt-1 text-sm text-gray-600">
                Update your listing information here.
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="SALE">Sale</option>
                      <option value="RENT">Rent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="GAMING">Gaming</option>
                      <option value="WORKSTATION">Workstation</option>
                      <option value="MINING">Mining</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="price.subscription" className="block text-sm font-medium text-gray-700">
                        Subscription Price (per month)
                      </label>
                      <input
                        type="number"
                        name="price.subscription"
                        id="price.subscription"
                        value={formData.price.subscription}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="price.full" className="block text-sm font-medium text-gray-700">
                        Full Purchase Price
                      </label>
                      <input
                        type="number"
                        name="price.full"
                        id="price.full"
                        value={formData.price.full}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="specifications.cpu" className="block text-sm font-medium text-gray-700">
                        CPU
                      </label>
                      <input
                        type="text"
                        name="specifications.cpu"
                        id="specifications.cpu"
                        value={formData.specifications.cpu}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="specifications.gpu" className="block text-sm font-medium text-gray-700">
                        GPU
                      </label>
                      <input
                        type="text"
                        name="specifications.gpu"
                        id="specifications.gpu"
                        value={formData.specifications.gpu}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="specifications.ram" className="block text-sm font-medium text-gray-700">
                        RAM
                      </label>
                      <input
                        type="text"
                        name="specifications.ram"
                        id="specifications.ram"
                        value={formData.specifications.ram}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="specifications.storage" className="block text-sm font-medium text-gray-700">
                        Storage
                      </label>
                      <input
                        type="text"
                        name="specifications.storage"
                        id="specifications.storage"
                        value={formData.specifications.storage}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="specifications.motherboard" className="block text-sm font-medium text-gray-700">
                        Motherboard
                      </label>
                      <input
                        type="text"
                        name="specifications.motherboard"
                        id="specifications.motherboard"
                        value={formData.specifications.motherboard}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label htmlFor="specifications.powerSupply" className="block text-sm font-medium text-gray-700">
                        Power Supply
                      </label>
                      <input
                        type="text"
                        name="specifications.powerSupply"
                        id="specifications.powerSupply"
                        value={formData.specifications.powerSupply}
                        onChange={handleChange}
                        required
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Images</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              multiple
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Listing image ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                images: prev.images.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <span className="sr-only">Remove image</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing; 