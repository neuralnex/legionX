declare module 'pinata' {
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

  export interface PinnedFile {
    id: string;
    ipfs_pin_hash: string;
    size: number;
    user_id: string;
    date_pinned: string;
    date_unpinned: string | null;
    metadata: {
      name: string;
      keyvalues: Record<string, any>;
    };
    regions: string[];
  }

  export interface PinnedFilesResponse {
    count: number;
    rows: PinnedFile[];
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
      list: () => Promise<PinnedFilesResponse>;
    };
  }

  export class PinataSDK {
    constructor(config: PinataConfig);
  }
} 