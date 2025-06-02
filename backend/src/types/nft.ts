export interface NFTMetadata {
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