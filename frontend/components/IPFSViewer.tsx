"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  Archive,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface IPFSViewerProps {
  ipfsHash: string
  title?: string
  description?: string
  fileType?: 'image' | 'document' | 'code' | 'archive' | 'unknown'
}

export default function IPFSViewer({ 
  ipfsHash, 
  title = "IPFS Content", 
  description,
  fileType = 'unknown'
}: IPFSViewerProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [contentUrl, setContentUrl] = useState<string>('')

  useEffect(() => {
    if (ipfsHash) {
      setContentUrl(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
    }
  }, [ipfsHash])

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-400" />
      case 'document':
        return <FileText className="h-6 w-6 text-green-400" />
      case 'code':
        return <Code className="h-6 w-6 text-purple-400" />
      case 'archive':
        return <Archive className="h-6 w-6 text-orange-400" />
      default:
        return <FileText className="h-6 w-6 text-gray-400" />
    }
  }

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'image':
        return 'Image'
      case 'document':
        return 'Document'
      case 'code':
        return 'Code'
      case 'archive':
        return 'Archive'
      default:
        return 'File'
    }
  }

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(contentUrl)
      if (!response.ok) throw new Error('Failed to fetch file')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ipfs-${ipfsHash.substring(0, 8)}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download started",
        description: "File download has begun.",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = () => {
    window.open(contentUrl, '_blank')
  }

  const copyIPFSHash = () => {
    navigator.clipboard.writeText(ipfsHash)
    toast({
      title: "IPFS Hash copied",
      description: "The IPFS hash has been copied to your clipboard.",
    })
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(fileType)}
            <div>
              <CardTitle className="text-white text-lg">{title}</CardTitle>
              {description && (
                <p className="text-gray-400 text-sm">{description}</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {getFileTypeLabel(fileType)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IPFS Hash Display */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1">IPFS Hash</p>
              <p className="text-sm text-white font-mono break-all">{ipfsHash}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyIPFSHash}
              className="text-blue-400 hover:text-blue-300"
            >
              Copy
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleView}
            variant="outline"
            className="flex-1 bg-blue-600/20 border-blue-600 text-blue-400 hover:bg-blue-600/30"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Content
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={isLoading}
            variant="outline"
            className="flex-1 bg-green-600/20 border-green-600 text-green-400 hover:bg-green-600/30"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </div>

        {/* External Links */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(contentUrl, '_blank')}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Pinata Gateway
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank')}
            className="text-gray-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            IPFS Gateway
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-medium">IPFS Content</p>
              <p>This content is stored on IPFS (InterPlanetary File System) for decentralized, permanent storage. You can view or download the files using various IPFS gateways.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 