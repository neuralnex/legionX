'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgentCreation } from '@/hooks/useMarketplace';
import { useWallet } from '@/contexts/WalletContext';
import { ipfsAPI } from '@/lib/api';
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const agentSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title must be less than 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  price: z
    .string()
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      {
        message: 'Price must be a positive number',
      }
    ),
  isPremium: z.boolean().optional(),
  modelType: z.string().min(1, 'Model type is required'),
  version: z.string().min(1, 'Version is required'),
  capabilities: z
    .array(z.string())
    .min(1, 'At least one capability is required'),
  minMemory: z
    .string()
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: 'Memory must be a positive number',
    }),
  minStorage: z
    .string()
    .refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
      message: 'Storage must be a positive number',
    }),
  dependencies: z.array(z.string()).optional(),
  modelFile: z.instanceof(File).optional(),
  modelUrl: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

type FormStep =
  | 'details'
  | 'capabilities'
  | 'technical'
  | 'preview'
  | 'submitting'
  | 'success'
  | 'error';

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('details');
  const [newCapability, setNewCapability] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: createAgent, isPending } = useAgentCreation();
  const { address } = useWallet();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      title: '',
      description: '',
      price: '',
      isPremium: false,
      modelType: '',
      version: '1.0.0',
      capabilities: [],
      minMemory: '4',
      minStorage: '1',
      dependencies: [],
    },
  });

  const watchedValues = watch();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCapability = () => {
    if (
      newCapability.trim() &&
      !watchedValues.capabilities.includes(newCapability.trim())
    ) {
      setValue('capabilities', [
        ...watchedValues.capabilities,
        newCapability.trim(),
      ]);
      setNewCapability('');
    }
  };

  const removeCapability = (capability: string) => {
    setValue(
      'capabilities',
      watchedValues.capabilities.filter((c) => c !== capability)
    );
  };

  const addDependency = () => {
    if (
      newDependency.trim() &&
      (!watchedValues.dependencies ||
        !watchedValues.dependencies.includes(newDependency.trim()))
    ) {
      setValue('dependencies', [
        ...(watchedValues.dependencies || []),
        newDependency.trim(),
      ]);
      setNewDependency('');
    }
  };

  const removeDependency = (dependency: string) => {
    if (watchedValues.dependencies) {
      setValue(
        'dependencies',
        watchedValues.dependencies.filter((d) => d !== dependency)
      );
    }
  };

  const nextStep = () => {
    if (currentStep === 'details') setCurrentStep('capabilities');
    else if (currentStep === 'capabilities') setCurrentStep('technical');
    else if (currentStep === 'technical') setCurrentStep('preview');
  };

  const prevStep = () => {
    if (currentStep === 'capabilities') setCurrentStep('details');
    else if (currentStep === 'technical') setCurrentStep('capabilities');
    else if (currentStep === 'preview') setCurrentStep('technical');
  };

  const onSubmit = async (data: AgentFormData) => {
    try {
      setCurrentStep('submitting');
      setErrorMessage(null);

      // Check if wallet is connected
      if (!address) {
        throw new Error('Please connect your wallet before creating an agent');
      }

      // Check if either model file or model URL is provided
      if (!data.modelFile && !data.modelUrl) {
        throw new Error('Please provide either a model file or model URL');
      }

      // In a real app, we would upload the image to a storage service
      // and get back a URL to include in the agent data
      const imageUrl = imagePreview || '/placeholder.svg?height=400&width=400';

      // Upload model file to IPFS if provided
      let modelIpfsHash = '';
      if (data.modelFile) {
        try {
          const uploadResult = await ipfsAPI.uploadFile(data.modelFile);
          modelIpfsHash = uploadResult.cid;
          console.log('✅ Model file uploaded to IPFS:', modelIpfsHash);
        } catch (error) {
          console.error('❌ Failed to upload model file:', error);
          throw new Error('Failed to upload model file to IPFS');
        }
      }

      // Transform form data to match CreateListingRequest interface
      const createListingData = {
        // agentId is now optional - backend will create agent automatically
        price: data.price, // Keep as string for BigInt
        duration: 1, // Default duration in months
        modelMetadata: {
          name: data.title,
          description: data.description,
          version: data.version,
          framework: data.modelType,
          inputFormat: "text",
          outputFormat: "text",
          accessPoint: {
            type: 'custom' as const,
            endpoint: data.modelUrl || (modelIpfsHash ? `ipfs://${modelIpfsHash}` : "https://api.example.com/model")
          },
          requirements: {
            minMemory: parseInt(data.minMemory),
            minGPU: false,
            minCPUCores: 1
          },
          pricing: {
            perRequest: 0.001,
            perHour: 0.1,
            perMonth: 10
          },
          tags: data.capabilities,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        title: data.title,
        description: data.description,
        assetId: `asset_${Date.now()}`, // Generate a unique asset ID
        ownerAddress: address // Use the actual wallet address
      };

      // Call the mutation function with properly formatted data
      await createAgent(createListingData);

      setCurrentStep('success');
    } catch (error: any) {
      setCurrentStep('error');
      setErrorMessage(
        error.message || 'Failed to create agent. Please try again.'
      );
    }
  };

  const handleFinish = () => {
    router.push('/marketplace');
  };

  const handleTryAgain = () => {
    setCurrentStep('preview');
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Create AI Agent</h1>
            {currentStep !== 'submitting' &&
              currentStep !== 'success' &&
              currentStep !== 'error' && (
                <div className="text-sm text-gray-400">
                  Step{' '}
                  {currentStep === 'details'
                    ? '1'
                    : currentStep === 'capabilities'
                      ? '2'
                      : currentStep === 'technical'
                        ? '3'
                        : '4'}{' '}
                  of 4
                </div>
              )}
          </div>

          {/* Progress Bar */}
          {currentStep !== 'submitting' &&
            currentStep !== 'success' &&
            currentStep !== 'error' && (
              <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width:
                      currentStep === 'details'
                        ? '25%'
                        : currentStep === 'capabilities'
                          ? '50%'
                          : currentStep === 'technical'
                            ? '75%'
                            : '100%',
                  }}
                ></div>
              </div>
            )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Basic Details</h2>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Agent Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      {...register('title')}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. CodeCraft Pro"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Describe what your AI agent does and its key features..."
                    ></textarea>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.description.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {watchedValues.description.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Price (ADA) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="price"
                      {...register('price')}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 0.25"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Agent Image
                    </label>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                          {imagePreview ? (
                            <img
                              src={imagePreview || '/placeholder.svg'}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <Upload className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <label className="flex items-center justify-center w-full h-10 bg-gray-800 border border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-700">
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="text-sm">Upload image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-1 text-xs text-gray-500">
                          Recommended: 800x800px. Max size: 5MB. PNG or JPG.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Controller
                      name="isPremium"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          id="isPremium"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded bg-gray-800"
                        />
                      )}
                    />
                    <label
                      htmlFor="isPremium"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      List as premium agent (featured placement)
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'capabilities' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  Agent Capabilities
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="modelType"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Model Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="modelType"
                      {...register('modelType')}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. Transformer, GPT, BERT"
                    />
                    {errors.modelType && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.modelType.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Capabilities <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {watchedValues.capabilities.map((capability) => (
                        <div
                          key={capability}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {capability}
                          <button
                            type="button"
                            onClick={() => removeCapability(capability)}
                            className="ml-2 text-gray-400 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newCapability}
                        onChange={(e) => setNewCapability(e.target.value)}
                        className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add a capability"
                      />
                      <button
                        type="button"
                        onClick={addCapability}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-r-lg"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    {errors.capabilities && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.capabilities.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Add capabilities like "Code Generation", "Data Analysis",
                      etc.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'technical' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  Technical Requirements
                </h2>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="version"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Version <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="version"
                      {...register('version')}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 1.0.0"
                    />
                    {errors.version && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.version.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="minMemory"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Minimum Memory (GB){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="minMemory"
                        {...register('minMemory')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. 4"
                      />
                      {errors.minMemory && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.minMemory.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="minStorage"
                        className="block text-sm font-medium text-gray-300 mb-1"
                      >
                        Minimum Storage (GB){' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="minStorage"
                        {...register('minStorage')}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. 1"
                      />
                      {errors.minStorage && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.minStorage.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Dependencies
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {watchedValues.dependencies?.map((dependency) => (
                        <div
                          key={dependency}
                          className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {dependency}
                          <button
                            type="button"
                            onClick={() => removeDependency(dependency)}
                            className="ml-2 text-gray-400 hover:text-red-400"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={newDependency}
                        onChange={(e) => setNewDependency(e.target.value)}
                        className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Add a dependency"
                      />
                      <button
                        type="button"
                        onClick={addDependency}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-r-lg"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Add dependencies like "Node.js", "Python 3.8+", etc.
                    </p>
                  </div>

                  {/* Model File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      AI Model Files <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-4">
                      {/* Option 1: File Upload */}
                      <div>
                        <label className="flex items-center justify-center w-full h-32 bg-gray-800 border border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-700">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-400">
                              Upload AI Model Files
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Supported: .json, .pkl, .h5, .pt, .onnx, .zip
                            </p>
                            <p className="text-xs text-gray-500">
                              Max size: 100MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".json,.pkl,.h5,.pt,.onnx,.zip,.model,.bin"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setValue('modelFile', file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {watchedValues.modelFile && (
                          <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Upload className="h-4 w-4 text-green-400 mr-2" />
                                <span className="text-sm text-white">
                                  {watchedValues.modelFile.name}
                                </span>
                                <span className="ml-2 text-xs text-gray-400">
                                  ({(watchedValues.modelFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setValue('modelFile', undefined)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Option 2: Model URL */}
                      <div className="text-center">
                        <span className="text-sm text-gray-400">OR</span>
                      </div>

                      <div>
                        <label
                          htmlFor="modelUrl"
                          className="block text-sm font-medium text-gray-300 mb-1"
                        >
                          Model URL (for hosted models)
                        </label>
                        <input
                          id="modelUrl"
                          {...register('modelUrl')}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="https://api.example.com/model or IPFS hash"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Provide a URL if your model is hosted externally
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'preview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Preview & Submit</h2>

                {/* Wallet Connection Status */}
                <div className="mb-6 p-4 rounded-lg border">
                  {address ? (
                    <div className="flex items-center text-green-400">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span className="font-medium">Wallet Connected</span>
                      <span className="ml-2 text-sm text-gray-400">
                        {address.slice(0, 8)}...{address.slice(-8)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-400">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Wallet Not Connected</span>
                      <span className="ml-2 text-sm text-gray-400">
                        Please connect your wallet to create an agent
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                      <div className="aspect-square relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview || '/placeholder.svg'}
                            alt="Agent preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                            <Upload className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">
                          {watchedValues.title || 'Agent Title'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                          Created by You
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-purple-400">
                            {watchedValues.price
                              ? `${watchedValues.price} ADA`
                              : '0.00 ADA'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Description
                      </h3>
                      <p className="text-white">
                        {watchedValues.description ||
                          'No description provided.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Capabilities
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {watchedValues.capabilities.length > 0 ? (
                          watchedValues.capabilities.map((capability) => (
                            <span
                              key={capability}
                              className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                            >
                              {capability}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            No capabilities added.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Technical Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mt-1">
                        <div>
                          <p className="text-xs text-gray-500">Model Type</p>
                          <p className="text-white">
                            {watchedValues.modelType || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Version</p>
                          <p className="text-white">
                            {watchedValues.version || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Min Memory</p>
                          <p className="text-white">
                            {watchedValues.minMemory || '0'} GB
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Min Storage</p>
                          <p className="text-white">
                            {watchedValues.minStorage || '0'} GB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Dependencies
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {watchedValues.dependencies &&
                        watchedValues.dependencies.length > 0 ? (
                          watchedValues.dependencies.map((dependency) => (
                            <span
                              key={dependency}
                              className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                            >
                              {dependency}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">
                            No dependencies added.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Model File Information */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        AI Model Files
                      </h3>
                      <div className="mt-1">
                        {watchedValues.modelFile ? (
                          <div className="flex items-center text-green-400">
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              {watchedValues.modelFile.name}
                            </span>
                            <span className="ml-2 text-xs text-gray-400">
                              ({(watchedValues.modelFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        ) : watchedValues.modelUrl ? (
                          <div className="flex items-center text-blue-400">
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              External Model URL
                            </span>
                          </div>
                        ) : (
                          <p className="text-red-400 text-sm">
                            No model file or URL provided
                          </p>
                        )}
                      </div>
                    </div>

                    {watchedValues.isPremium && (
                      <div className="bg-purple-900/30 border border-purple-800 rounded-lg p-3">
                        <p className="text-purple-400 text-sm">
                          This agent will be listed as premium and receive
                          featured placement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium flex items-center"
                  >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!address}
                    whileHover={address ? { scale: 1.02 } : {}}
                    whileTap={address ? { scale: 0.98 } : {}}
                    className={`py-2 px-6 rounded-lg font-medium ${
                      address
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {address ? 'Create Agent' : 'Connect Wallet First'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {currentStep === 'submitting' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Creating Your Agent
                </h3>
                <p className="text-gray-400">
                  Please wait while we process your submission...
                </p>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                <div className="bg-green-900/20 text-green-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Agent Created Successfully!
                </h3>
                <p className="text-gray-400 mb-6">
                  Your AI agent has been created and is now available in the
                  marketplace.
                </p>
                <motion.button
                  onClick={handleFinish}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium"
                >
                  Go to Marketplace
                </motion.button>
              </div>
            )}

            {currentStep === 'error' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                <div className="bg-red-900/20 text-red-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Something Went Wrong
                </h3>
                <p className="text-gray-400 mb-2">
                  There was an error creating your agent. Please try again.
                </p>
                {errorMessage && (
                  <p className="text-red-400 text-sm mb-6">{errorMessage}</p>
                )}
                <motion.button
                  onClick={handleTryAgain}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium"
                >
                  Try Again
                </motion.button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
