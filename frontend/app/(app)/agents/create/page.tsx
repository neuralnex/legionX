"use client";

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgentCreation } from '@/hooks/useMarketplace';
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
  Coins,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  const { toast } = useToast();
  const [userPoints, setUserPoints] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
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

  // Fetch user points on component mount
  useState(() => {
    fetchUserPoints();
  });

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserPoints(userData.user.listingPoints || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    }
  };

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

      // Check if user has enough points
      if (userPoints < 1) {
        throw new Error('Insufficient listing points. You need 1 point to list an agent. Please buy more points.');
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
      };

      // Call the mutation function with properly formatted data
      await createAgent(createListingData);

      setCurrentStep('success');
      
      toast({
        title: "Agent created successfully!",
        description: "Your agent has been listed on the marketplace.",
      });

      setTimeout(() => {
        router.push('/agents');
      }, 2000);
    } catch (error: any) {
      setCurrentStep('error');
      setErrorMessage(
        error.message || 'Failed to create agent. Please try again.'
      );
      
      toast({
        title: "Creation failed",
        description: error.message || "Unable to create agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFinish = () => {
    router.push('/marketplace');
  };

  const handleTryAgain = () => {
    setCurrentStep('preview');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Agent</h1>
          <p className="text-gray-400">List your AI agent on the marketplace</p>
        </div>

        {/* Points Check */}
        <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-white font-medium">Your Points: {userPoints}</span>
            </div>
                <div className="text-sm text-gray-400">
              Required: 1 point per listing
                </div>
          </div>
          {userPoints < 1 && (
            <div className="mt-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Insufficient points. Please buy more points to list an agent.</span>
              </div>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Agent Details</CardTitle>
              <CardDescription className="text-gray-400">
                Provide information about your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                  <Label htmlFor="title" className="text-white">Agent Title</Label>
                  <Input
                      id="title"
                      {...register('title')}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter agent title"
                    />
                    {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                      id="description"
                      {...register('description')}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Describe your agent's capabilities and features"
                      rows={4}
                  />
                    {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                  <Label htmlFor="price" className="text-white">Price (USD)</Label>
                  <Input
                      id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0.00"
                    />
                    {errors.price && (
                    <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                  <Label htmlFor="image" className="text-white">Agent Image</Label>
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

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/agents')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || userPoints < 1 || isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Agent'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
                <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
                <CardDescription className="text-gray-400">
                  How your agent will appear on the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white">
                      {watchedValues.title || 'Agent Title'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {watchedValues.description || 'Agent description will appear here...'}
                    </p>
                  </div>

                            <div className="flex items-center justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-semibold">
                      ${watchedValues.price || '0.00'} USD
                                </span>
                      </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Listing Cost:</span>
                    <span className="text-yellow-400 font-semibold">1 point</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-900/20 border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium">Important:</p>
                    <p>• Listing an agent costs 1 point</p>
                    <p>• Your agent will be available for purchase immediately</p>
                    <p>• Buyers will pay the price you set in USD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
                </div>
              </div>
      </div>
    </div>
  );
}
