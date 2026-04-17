import {CreateFormData} from "@/types/create.ts";

export type JobStep = "create" | "upload" | "ingest" | "finalize";
export type RunState = "finished" | "failed";

export interface Job {
  currentStep: JobStep | "";
  create?: {
    complete?: boolean;
    runState?: RunState;
  };
  upload: {
    percentage?: number;
    complete?: boolean;
    runState?: RunState;
  };
  ingest: {
    runState?: RunState;
    estimatedTimeLeft?: string;
  };
  finalize: {
    complete?: boolean;
    runState?: RunState;
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
  error?: any;
  errorMessage?: string;
  errorLog?: string;
  _title?: string;
  _objectId?: string;
  streams?: {
    audio: boolean;
    video: boolean;
  };
  formData?: CreateFormData
}
