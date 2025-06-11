// Re-export the comprehensive AIModelMetadata from model.ts
export type { AIModelMetadata } from './model.js';

// Additional AI-specific types can be added here
export interface AIModelCapability {
    name: string;
    description: string;
    parameters: {
        [key: string]: any;
    };
}

export interface AIModelMetrics {
    accuracy?: number;
    latency?: number;
    throughput?: number;
    costPerRequest?: number;
    lastUpdated: string;
} 