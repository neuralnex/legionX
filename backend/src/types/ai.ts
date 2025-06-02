export interface AIModelMetadata {
    name: string;
    description: string;
    version: string;
    modelType: string;
    parameters: {
        [key: string]: any;
    };
    capabilities: string[];
    requirements: {
        [key: string]: any;
    };
} 