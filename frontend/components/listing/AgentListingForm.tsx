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
import { Loader2, Upload, Plus, X, FileText, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const agentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  setupDoc: z.string().min(5, 'Setup documentation is required'),
  dependencies: z.array(z.string()).optional(),
  abilities: z.array(z.string()).min(1, 'At least one ability is required'),
  price: z.number().min(0.01, 'Price must be at least $0.01'),
  modelType: z.string().min(1, 'Model type is required'),
  version: z.string().min(1, 'Version is required'),
  minMemory: z.number().min(1, 'Minimum memory is required'),
  minStorage: z.number().min(1, 'Minimum storage is required'),
})

type AgentFormData = z.infer<typeof agentSchema>

export default function AgentListingForm({ onComplete, onPointsUpdate }: { onComplete: () => void, onPointsUpdate: () => void }) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [dependencies, setDependencies] = useState<string[]>([])
  const [abilities, setAbilities] = useState<string[]>([])
  const [depInput, setDepInput] = useState('')
  const [abilityInput, setAbilityInput] = useState('')
  const [agentFiles, setAgentFiles] = useState<File[]>([])
  const [agentImage, setAgentImage] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    mode: 'onChange',
    defaultValues: {
      dependencies: [],
      abilities: [],
      modelType: 'custom',
      version: '1.0.0',
      minMemory: 4,
      minStorage: 1,
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'files' | 'image') => {
    const files = event.target.files
    if (!files) return

    if (type === 'image') {
      setAgentImage(files[0])
    } else {
      setAgentFiles(Array.from(files))
    }
  }

  const onSubmit = async (data: AgentFormData) => {
    setIsLoading(true)
    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('type', 'agent')
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('price', data.price.toString())
      
      // Add metadata
      const metadata = {
        setupDoc: data.setupDoc,
        dependencies: dependencies,
        abilities: abilities,
        modelType: data.modelType,
        version: data.version,
        minMemory: data.minMemory,
        minStorage: data.minStorage,
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Add files
      if (agentImage) {
        formData.append('files', agentImage)
      }
      agentFiles.forEach((file, index) => {
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
        title: "Agent listed successfully!",
        description: "Your agent has been uploaded to IPFS and listed on the marketplace.",
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

  const addDependency = () => {
    if (depInput.trim() && !dependencies.includes(depInput.trim())) {
      const newDeps = [...dependencies, depInput.trim()]
      setDependencies(newDeps)
      setValue('dependencies', newDeps)
      setDepInput('')
    }
  }

  const removeDependency = (dep: string) => {
    const newDeps = dependencies.filter((d) => d !== dep)
    setDependencies(newDeps)
    setValue('dependencies', newDeps)
  }

  const addAbility = () => {
    if (abilityInput.trim() && !abilities.includes(abilityInput.trim())) {
      const newAbs = [...abilities, abilityInput.trim()]
      setAbilities(newAbs)
      setValue('abilities', newAbs)
      setAbilityInput('')
    }
  }

  const removeAbility = (a: string) => {
    const newAbs = abilities.filter((d) => d !== a)
    setAbilities(newAbs)
    setValue('abilities', newAbs)
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">List AI Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name</Label>
              <Input 
                id="name" 
                {...register('name')} 
                placeholder="My AI Agent" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input 
                id="price" 
                type="number" 
                step="0.01" 
                {...register('price', { valueAsNumber: true })} 
                placeholder="0.00" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...register('description')} 
              placeholder="Describe your agent's capabilities and features" 
              rows={3}
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="setupDoc">Setup Documentation</Label>
            <Textarea 
              id="setupDoc" 
              {...register('setupDoc')} 
              placeholder="How to set up and use this agent" 
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.setupDoc && <p className="text-red-400 text-sm mt-1">{errors.setupDoc.message}</p>}
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="modelType">Model Type</Label>
              <select 
                id="modelType" 
                {...register('modelType')} 
                className="bg-gray-700 text-white border-gray-600 rounded px-3 py-2 w-full"
              >
                <option value="custom">Custom</option>
                <option value="gpt">GPT</option>
                <option value="llama">LLaMA</option>
                <option value="claude">Claude</option>
                <option value="other">Other</option>
              </select>
              {errors.modelType && <p className="text-red-400 text-sm mt-1">{errors.modelType.message}</p>}
            </div>
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
              <Label htmlFor="minMemory">Min Memory (GB)</Label>
              <Input 
                id="minMemory" 
                type="number" 
                {...register('minMemory', { valueAsNumber: true })} 
                placeholder="4" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              {errors.minMemory && <p className="text-red-400 text-sm mt-1">{errors.minMemory.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="minStorage">Min Storage (GB)</Label>
            <Input 
              id="minStorage" 
              type="number" 
              {...register('minStorage', { valueAsNumber: true })} 
              placeholder="1" 
              className="bg-gray-700 border-gray-600 text-white"
            />
            {errors.minStorage && <p className="text-red-400 text-sm mt-1">{errors.minStorage.message}</p>}
          </div>

          {/* Dependencies */}
          <div>
            <Label>Dependencies</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={depInput} 
                onChange={e => setDepInput(e.target.value)} 
                placeholder="Add dependency (e.g., tensorflow)" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button type="button" onClick={addDependency} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {dependencies.map(dep => (
                <span key={dep} className="bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center">
                  {dep}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeDependency(dep)} />
                </span>
              ))}
            </div>
          </div>

          {/* Abilities */}
          <div>
            <Label>Abilities</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={abilityInput} 
                onChange={e => setAbilityInput(e.target.value)} 
                placeholder="Add ability (e.g., text generation)" 
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button type="button" onClick={addAbility} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {abilities.map(a => (
                <span key={a} className="bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center">
                  {a}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeAbility(a)} />
                </span>
              ))}
            </div>
            {errors.abilities && <p className="text-red-400 text-sm mt-1">{errors.abilities.message}</p>}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agentImage">Agent Picture</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <input
                  id="agentImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  className="hidden"
                />
                <label htmlFor="agentImage" className="cursor-pointer text-blue-400 hover:text-blue-300">
                  {agentImage ? agentImage.name : 'Click to upload image'}
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="agentFiles">Agent Files</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <input
                  id="agentFiles"
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'files')}
                  className="hidden"
                />
                <label htmlFor="agentFiles" className="cursor-pointer text-blue-400 hover:text-blue-300">
                  {agentFiles.length > 0 ? `${agentFiles.length} files selected` : 'Click to upload files'}
                </label>
              </div>
              {agentFiles.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  {agentFiles.map((file, index) => (
                    <div key={index}>{file.name}</div>
                  ))}
                </div>
              )}
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
                List Agent (1 point)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 