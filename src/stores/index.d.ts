 
// Type declarations for stores (JavaScript files)

export interface RootStore {
  loaded: boolean;
  client: any;
  networkInfo: any;
  ingestStore: any;
  tenantStore: any;
  uiStore: any;
  Initialize: () => void;
  Decode: (str: string) => string | undefined;
  DecodeVersionHash: (params: {versionHash: string}) => any;
}

export const rootStore: RootStore;
export const ingestStore: any;
export const tenantStore: any;
export const uiStore: any;
