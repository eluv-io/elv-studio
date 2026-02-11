import {configure, flow, makeObservable, observable} from "mobx";
import {FrameClient} from "@eluvio/elv-client-js/src/FrameClient";
import IngestStore from "@/stores/IngestStore";
import TenantStore from "@/stores/TenantStore";
import UiStore from "@/stores/UiStore";

// Force strict mode so mutations are only allowed within actions.
configure({
  enforceActions: "always"
});

export class RootStore {
  loaded = false;
  client: any;
  networkInfo: {name: string; id: string; configUrl: string} | null = null;
  ingestStore: IngestStore;
  tenantStore: TenantStore;
  uiStore: UiStore;

  constructor() {
    makeObservable(this, {
      client: observable,
      loaded: observable,
      networkInfo: observable
    });

    this.Initialize();
    this.ingestStore = new IngestStore(this);
    this.tenantStore = new TenantStore(this);
    this.uiStore = new UiStore(this);
  }

  Initialize = flow(function * (this: RootStore) {
    try {
      this.client = new FrameClient({
        target: window.parent,
        timeout: 60 * 10 // seconds
      });
      (window as any).client = this.client;

      this.networkInfo = yield this.client.NetworkInfo();
    } catch(error) {
      /* eslint-disable no-console */
      console.error("Failed to initialize application");
      console.error(error);
      /* eslint-enable no-console */
    } finally {
      this.loaded = true;
    }
  });

  Decode = (value: string) => {
    try {
      return this.client.utils.FromB64(value);
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(`Unable to decode ${value}.`, error);
    }
  };

  DecodeVersionHash = ({versionHash}: {versionHash: string}) => {
    return this.client.utils.DecodeVersionHash(versionHash);
  };
}

export const rootStore = new RootStore();
export const ingestStore = rootStore.ingestStore;
export const tenantStore = rootStore.tenantStore;
export const uiStore = rootStore.uiStore;

(window as any).rootStore = rootStore;
