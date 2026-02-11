import {makeAutoObservable} from "mobx";
import type {RootStore} from "@/stores/index";

class TenantStore {
  rootStore: RootStore;
  tenantId: string = "";
  titleContentType: string = "";
  loaded = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;

    this.LoadTenantData();
  }

  get client() {
    return this.rootStore.client;
  }

  *LoadTenantData(): Generator<any, void, any> {
    try {
      if(!this.tenantId) {
        this.tenantId = yield this.client.userProfileClient.TenantContractId();

        if(!this.tenantId) {
          throw new Error("Tenant ID not found");
        }
      }

      const response = yield this.client.ContentObjectMetadata({
        libraryId: this.tenantId.replace("iten", "ilib"),
        objectId: this.tenantId.replace("iten", "iq__"),
        metadataSubtree: "public/content_types/title",
      });

      if(response) {
        this.titleContentType = response;
      }
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this.loaded = true;
    }
  };
}

export default TenantStore;
