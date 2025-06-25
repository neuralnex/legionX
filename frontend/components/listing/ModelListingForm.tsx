"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Plus, X, FileText, Link } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const modelSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  url: z.string().url('Valid URL required'),
  version: z.string().min(1, 'Version is required'),
  type: z.string().min(1, 'Type is required'),
  subscriptionType: z.string().min(1, 'Subscription type is required'),
  priceLifetime: z.number().min(0, 'Price required'),
  priceMonthly: z.number().min(0, 'Price required'),
  priceYearly: z.number().min(0, 'Price required'),
  description: z.string().min(10, 'Description is required'),
  tasks: z.array(z.string()).optional(),
})

type ModelFormData = z.infer<typeof modelSchema>

const modelTypes = ['GPT', 'GAN', 'Transformer', 'CNN', 'RNN', 'BERT', 'T5', 'Other']
const subscriptionTypes = ['Lifetime', 'Monthly', 'Yearly']

export default function ModelListingForm({ onComplete, onPointsUpdate }: { onComplete: () => void, onPointsUpdate: () => void }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tasks, setTasks] = useState<string[]>([])
  const [taskInput, setTaskInput] = useState('')
  const [modelFiles, setModelFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    mode: 'onChange',
    defaultValues: {
      tasks: [],
      type: '',
      subscriptionType: '',
      priceLifetime: 0,
      priceMonthly: 0,
      priceYearly: 0,
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    setModelFiles(Array.from(files))
  }

  const onSubmit = async (data: ModelFormData) => {
    setIsLoading(true)
    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('type', 'model')
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('price', data.priceLifetime.toString()) // Use lifetime price as main price
      
      // Add metadata
      const metadata = {
        url: data.url,
        version: data.version,
        type: data.type,
        subscriptionType: data.subscriptionType,
        priceLifetime: data.priceLifetime,
        priceMonthly: data.priceMonthly,
        priceYearly: data.priceYearly,
        tasks: tasks,
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Add files if any
      modelFiles.forEach((file, index) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/listings/create-with-ipfs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create listing')
      }

      const result = await response.json()
      
      toast({
        title: "Model listed successfully!",
        description: "Your model has been uploaded to IPFS and listed on the marketplace.",
      })

      onPointsUpdate()
      onComplete()
    } catch (error) {
      console.error('Listing creation error:', error)
      toast({
        title: "Listing failed",
        description: error instanceof Error ? error.message : "Failed to create listing. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addTask = () => {
    if (taskInput.trim() && !tasks.includes(taskInput.trim())) {
      const newTasks = [...tasks, taskInput.trim()]
      setTasks(newTasks)
      setValue('tasks', newTasks)
      setTaskInput('')
    }
  }

  const removeTask = (t: string) => {
    const newTasks = tasks.filter((d) => d !== t)
    setTasks(newTasks)
    setValue('tasks', newTasks)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">List AI Model</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Model Name</Label>
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="My AI Model" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="url">API Endpoint URL</Label>
              <Input 
                id="url" 
                {...register('url')} 
                placeholder="https://api.example.com/model" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register('description')} 
              placeholder="Describe your model's capabilities and use cases" 
              rows={3}
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input 
                id="version" 
                {...register('version')} 
                placeholder="1.0.0" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.version && <p className="text-red-400 text-sm mt-1">{errors.version.message}</p>}
            </div>
            <div>
              <Label htmlFor="type">Model Type</Label>
              <select 
                id="type" 
                {...register('type')} 
                className="bg-gray-700 text-white border-gray-600 rounded px-3 py-2 w-full"
              >
                <option value="">Select type</option>
                {modelTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label htmlFor="subscriptionType">Subscription Type</Label>
              <select 
                id="subscriptionType" 
                {...register('subscriptionType')} 
                className="bg-gray-700 text-white border-gray-600 rounded px-3 py-2 w-full"
              >
                <option value="">Select subscription</option>
                {subscriptionTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.subscriptionType && <p className="text-red-400 text-sm mt-1">{errors.subscriptionType.message}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <Label className="text-white font-medium mb-4 block">Pricing (USD)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priceLifetime">Lifetime Access</Label>
                <Input 
                  id="priceLifetime" 
                  type="number" 
                  step="0.01" 
                  {...register('priceLifetime', { valueAsNumber: true })} 
                  placeholder="0.00" 
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {errors.priceLifetime && <p className="text-red-400 text-sm mt-1">{errors.priceLifetime.message}</p>}
              </div>
              <div>
                <Label htmlFor="priceMonthly">Monthly Subscription</Label>
                <Input 
                  id="priceMonthly" 
                  type="number" 
                  step="0.01" 
                  {...register('priceMonthly', { valueAsNumber: true })} 
                  placeholder="0.00" 
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {errors.priceMonthly && <p className="text-red-400 text-sm mt-1">{errors.priceMonthly.message}</p>}
              </div>
              <div>
                <Label htmlFor="priceYearly">Yearly Subscription</Label>
                <Input 
                  id="priceYearly" 
                  type="number" 
                  step="0.01" 
                  {...register('priceYearly', { valueAsNumber: true })} 
                  placeholder="0.00" 
                  className="bg-gray-700 border-gray-600 text-white"
                />
                {errors.priceYearly && <p className="text-red-400 text-sm mt-1">{errors.priceYearly.message}</p>}
              </div>
            </div>
          </div>

          {/* Supported Tasks */}
          <div>
            <Label>Supported Tasks</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={taskInput} 
                onChange={e => setTaskInput(e.target.value)} 
                placeholder="Add task (e.g., text generation)" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button type="button" onClick={addTask} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tasks.map(t => (
                <span key={t} className="bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center">
                  {t}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTask(t)} />
                </span>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="modelFiles">Model Files (Optional)</Label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <input
                id="modelFiles"
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="modelFiles" className="cursor-pointer text-blue-400 hover:text-blue-300">
                {modelFiles.length > 0 ? `${modelFiles.length} files selected` : 'Click to upload model files'}
              </label>
            </div>
            {modelFiles.length > 0 && (
              <div className="mt-2 text-xs text-gray-400">
                {modelFiles.map((file, index) => (
                  <div key={index}>{file.name}</div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Link className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium">API Endpoint Required</p>
                <p>Your model must have a publicly accessible API endpoint. Users will access your model through this URL after purchase.</p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" 
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Listing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                List Model (1 point)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 