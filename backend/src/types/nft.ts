import type { AIModelMetadata } from './model.js';

export interface BaseNFTMetadata {
    name: string;
    description: string;
    image: string;
    properties: {
        [key: string]: any;
    };
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export interface AIModelNFTMetadata extends BaseNFTMetadata {
    properties: {
        modelMetadata: AIModelMetadata;
        category: string;
        version: string;
    };
} 