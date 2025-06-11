declare module '@pinata/sdk' {
  export interface PinataConfig {
    pinataJwt: string;
    pinataGateway?: string;
  }

  export interface PinataResponse {
    cid: string;
    ipfsHash: string;
    pinSize: number;
    timestamp: string;
  }

  export interface GetCIDResponse {
    cid: string;
    name: string;
    size: number;
    type: string;
    created: string;
    [key: string]: any;
  }

  export interface PinataSDK {
    upload: {
      public: {
        json: (data: any) => Promise<PinataResponse>;
        file: (file: File) => Promise<PinataResponse>;
      };
    };
    gateways: {
      public: {
        get: (cid: string) => Promise<GetCIDResponse>;
      };
    };
    pinning: {
      add: (cid: string) => Promise<void>;
      remove: (cid: string) => Promise<void>;
    };
  }

  export class PinataSDK {
    constructor(config: PinataConfig);
  }
} 