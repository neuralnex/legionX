import pinataSDK from '@pinata/sdk';

export interface AgentMetadata {
  name: string;
  description: string;
  modelVersion: string;
  usageRights: {
    type: 'subscription' | 'full';
    durationDays?: number;
  };
  creator: string;
  // API access information
  apiEndpoint: {
    url: string;
    method: 'POST' | 'GET';
    headers?: Record<string, string>;
    authentication?: {
      type: 'apiKey' | 'bearer' | 'basic';
      key?: string;
      value?: string;
    };
  };
  // Model configuration
  modelConfig: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
  };
  // Rate limiting
  rateLimit?: {
    requestsPerMinute: number;
    concurrentRequests: number;
  };
}

export class PinataService {
  private pinata;

  constructor() {
    this.pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY
    );
  }

  async uploadMetadata(metadata: AgentMetadata): Promise<string> {
    try {
      const result = await this.pinata.pinJSONToIPFS(metadata);
      return `ipfs://${result.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  async getMetadata(ipfsHash: string): Promise<AgentMetadata> {
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      if (!response.ok) {
        throw new Error('Failed to fetch metadata from IPFS');
      }
      const data = await response.json();
      
      // Validate the response data matches AgentMetadata
      if (!this.isValidAgentMetadata(data)) {
        throw new Error('Invalid metadata format');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      throw new Error('Failed to fetch metadata from IPFS');
    }
  }

  private isValidAgentMetadata(data: unknown): data is AgentMetadata {
    if (typeof data !== 'object' || data === null) return false;
    
    const metadata = data as Partial<AgentMetadata>;
    
    // Basic validation
    const hasBasicFields = (
      typeof metadata.name === 'string' &&
      typeof metadata.description === 'string' &&
      typeof metadata.modelVersion === 'string' &&
      typeof metadata.creator === 'string' &&
      typeof metadata.usageRights === 'object' &&
      metadata.usageRights !== null &&
      (metadata.usageRights.type === 'subscription' || metadata.usageRights.type === 'full') &&
      (metadata.usageRights.durationDays === undefined || typeof metadata.usageRights.durationDays === 'number')
    );

    if (!hasBasicFields) return false;

    // API endpoint validation
    if (!metadata.apiEndpoint || typeof metadata.apiEndpoint !== 'object') return false;
    const apiEndpoint = metadata.apiEndpoint;
    if (
      typeof apiEndpoint.url !== 'string' ||
      !['POST', 'GET'].includes(apiEndpoint.method)
    ) return false;

    // Optional authentication validation
    if (apiEndpoint.authentication) {
      if (
        !['apiKey', 'bearer', 'basic'].includes(apiEndpoint.authentication.type) ||
        (apiEndpoint.authentication.type === 'apiKey' && typeof apiEndpoint.authentication.key !== 'string')
      ) return false;
    }

    // Optional model config validation
    if (metadata.modelConfig) {
      const config = metadata.modelConfig;
      if (
        (config.maxTokens !== undefined && typeof config.maxTokens !== 'number') ||
        (config.temperature !== undefined && typeof config.temperature !== 'number') ||
        (config.topP !== undefined && typeof config.topP !== 'number') ||
        (config.frequencyPenalty !== undefined && typeof config.frequencyPenalty !== 'number') ||
        (config.presencePenalty !== undefined && typeof config.presencePenalty !== 'number') ||
        (config.stopSequences !== undefined && !Array.isArray(config.stopSequences))
      ) return false;
    }

    // Optional rate limit validation
    if (metadata.rateLimit) {
      if (
        typeof metadata.rateLimit.requestsPerMinute !== 'number' ||
        typeof metadata.rateLimit.concurrentRequests !== 'number'
      ) return false;
    }

    return true;
  }
} 