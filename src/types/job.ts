import {AbrProfile} from "@/types/abr-profile.ts";

export type JobStep = "create" | "upload" | "ingest" | "finalize";

export interface Job {
  currentStep: "" | "finalize";
  create?: {
    complete?: boolean;
    runState?: "finished"
  };
  upload: {
    percentage?: number;
    complete?: boolean;
    runState?: "finished"
  };
  ingest: {
    runState?: "finished";
    estimatedTimeLeft?: string;
  };
  finalize: {
    complete?: boolean;
    runState?: "finished";
    mezzanineHash?: string;
    objectId?: string;
  };
  lastUpdatedTime?: string;
  active?: boolean;
  size?: number;
  masterLibraryId?: string;
  masterObjectId?: string;
  masterWriteToken?: string;
  masterNodeUrl?: string;
  mezLibraryId?: string;
  mezObjectId?: string;
  mezWriteToken?: string;
  mezNodeUrl?: string;
  embedUrl?: string;
  contentType?: string;
  _title?: string;
  _objectId?: string;
  streams?: {
    audio: boolean;
    video: boolean;
  };
  formData?: {
    master?: {
      libraryId: string;
      title: string;
      desription: string;
      playbackEncryption: string;
      copy: boolean;
      writeToken?: string;
    };
    mez?: {
      libraryId: string;
      masterObjectId: string;
      abrProfile: AbrProfile;
    };
  }
}
