import {Permission} from "@/types/eluvio.ts";
import {AbrProfile} from "@/types/abr-profile.ts";

export interface CreateFormData {
  contentType?: string;
  master: {
    libraryId: string;
    accessGroup: string;
    writeToken: string;
    files: File[];
    title: string;
    description: string;
    playbackEncryption: string;
    access: string;
    copy: boolean;
    abr?: string;
  };
  mez: {
    libraryId: string;
    accessGroup: string;
    name: string;
    description: string;
    displayTitle: string;
    newObject: boolean;
    permission?: Permission;
    masterObjectId: string;
    masterVersionHash: string;
    abrProfile: AbrProfile;
    type: string;
    variant: string;
    offeringKey: string;
    access: S3Reference[];
  };
}

export interface S3Reference {
  remote_access: {
    storage_endpoint: {
      region: string;
    };
    path: string;
    cloud_credentials: {
      access_key_id: string;
      secret_access_key: string;
      signed_url: string;
    }
  }
}
