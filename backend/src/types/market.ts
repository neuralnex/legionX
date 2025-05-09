export type MarketDatum = {
  price: bigint;
  full_price: Option<bigint>;
  seller: string;
  subscription: Option<string>;
  duration: Option<bigint>;
  owner: string;
};

export type MarketAction = 
  | 'MBuyFull'
  | 'MBuySub'
  | {
      MEdit: {
        price: bigint;
        full_price: Option<bigint>;
        duration: Option<bigint>;
      };
    }
  | 'MDelist';

export type Option<T> = {
  Some: T;
} | {
  None: null;
};

export const Some = <T>(value: T): Option<T> => ({ Some: value });
export const None = <T>(): Option<T> => ({ None: null }); 