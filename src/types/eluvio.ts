import {s3Regions} from "@/utils";

/**
 * Type definitions for @eluvio/elv-client-js SDK
 */

export interface ContentObjectMetadataParams {
  libraryId: string;
  objectId: string;
  select?: string[];
}

export interface Library {
  libraryId: string;
  name?: string;
  abr?: any;
  drm?: {
    fps?: {
      cert?: string;
    };
  };
}

export interface PermissionLevel {
  short: string;
  description: string;
  settings: {
    visibility: 0 | 1 | 10;
    statusCode: 0 | -1;
    kmsConk: boolean;
  }
}

export interface PermissionLevels {
  owner: PermissionLevel;
  editable: PermissionLevel;
  viewable: PermissionLevel;
  listable: PermissionLevel;
  public: PermissionLevel;
}

export type Permission = keyof PermissionLevels;

export type S3RegionName = typeof s3Regions[number]["name"];
