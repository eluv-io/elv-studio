import {flow, makeAutoObservable} from "mobx";
import {ValidateLibrary} from "@eluvio/elv-client-js/src/Validation";
import UrlJoin from "url-join";
import {FileInfo} from "Utils/Files";
import Path from "path";
import {rootStore} from "./index";
const ABR = require("@eluvio/elv-abr-profile");
const defaultOptions = require("@eluvio/elv-lro-status/defaultOptions");
const enhanceLROStatus = require("@eluvio/elv-lro-status/enhanceLROStatus");

class IngestStore {
  libraries;
  accessGroups;
  loaded;
  jobs;
  job;

  constructor(rootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  get client() {
    return this.rootStore.client;
  }

  get libraries() {
    return this.libraries;
  }

  GetLibrary = (libraryId) => {
    return this.libraries[libraryId];
  }

  SetJob(jobId) {
    this.job = this.jobs[jobId];
  }

  UpdateIngestJobs({jobs}) {
    this.jobs = jobs;
  }

  UpdateIngestObject = ({id, data}) => {
    if(!this.jobs) { this.jobs = {}; }

    if(!this.jobs[id]) {
      this.jobs[id] = {
        currentStep: "",
        upload: {},
        ingest: {},
        finalize: {}
      };
    }

    this.jobs[id] = Object.assign(
      this.jobs[id],
      data
    );
    localStorage.setItem(
      "elv-jobs",
      btoa(JSON.stringify(this.jobs))
    );

    this.UpdateIngestJobs({jobs: this.jobs});
  }

  ClearJobs = () => {
    this.jobs = {};
    localStorage.removeItem("elv-jobs");
  }

  WaitForPublish = flow (function * ({hash, objectId}) {
    let publishFinished = false;
    let latestObjectHash;
    while(!publishFinished) {
      try {
        latestObjectHash = yield this.client.LatestVersionHash({
          objectId
        });

        if(latestObjectHash === hash) {
          publishFinished = true;
        } else {
          yield new Promise(resolve => setTimeout(resolve, 15000));
        }
      } catch(error) {
        console.error(`Waiting for master object publishing hash:${hash}. Retrying.`, error);
        yield new Promise(resolve => setTimeout(resolve, 7000));
      }
    }
  });

  GenerateEmbedUrl = ({versionHash, objectId}) => {
    const networkInfo = rootStore.networkInfo;
    let embedUrl = new URL("https://embed.v3.contentfabric.io");
    const networkName = networkInfo.name === "demov3" ? "demo" : (networkInfo.name === "test" && networkInfo.id === 955205) ? "testv4" : networkInfo.name;

    embedUrl.searchParams.set("p", "");
    embedUrl.searchParams.set("lp", "");
    embedUrl.searchParams.set("net", networkName);
    embedUrl.searchParams.set("ct", "s");

    if(versionHash) {
      embedUrl.searchParams.set("vid", versionHash);
    } else {
      embedUrl.searchParams.set("oid", objectId);
    }

    return embedUrl.toString();
  };

  HandleError = ({id, step, error, errorMessage}) => {
    this.UpdateIngestObject({
      id,
      data: {
        ...this.jobs[id],
        [step]: {
          ...this.jobs[id][step],
          runState: "failed"
        },
        error: true,
        errorMessage
      }
    });

    console.error(errorMessage, error);
  }

  LoadLibraries = flow(function * () {
    try {
      if(!this.libraries) {
        this.libraries = {};

        const libraryIds = yield this.client.ContentLibraries() || [];
        yield Promise.all(
          libraryIds.map(async libraryId => {
            const response = (await this.client.ContentObjectMetadata({
              libraryId,
              objectId: libraryId.replace(/^ilib/, "iq__"),
              select: [
                "public/name",
                "abr",
                "elv/media/drm/fps/cert"
              ]
            }));

            if(!response) { return; }

            this.libraries[libraryId] = {
              libraryId,
              name: response.public && response.public.name || libraryId,
              abr: response.abr,
              drmCert: response.elv &&
                response.elv.media &&
                response.elv.media.drm &&
                response.elv.media.drm.fps &&
                response.elv.media.drm.fps.cert
            };
          })
        );
      }
    } catch(error) {
      console.error("Failed to load libraries", error);
    } finally {
      this.loaded = true;
    }
  });

  LoadAccessGroups = flow(function * () {
    try {
      if(!this.accessGroups) {
        this.accessGroups = {};
        const accessGroups = yield this.client.ListAccessGroups() || [];
        accessGroups.map(async accessGroup => {
          if(accessGroup.meta["name"]){
            this.accessGroups[accessGroup.meta["name"]] = accessGroup;
          } else {
            this.accessGroups[accessGroup.id] = accessGroup;
          }
        });
      }
    } catch(error) {
      console.error("Failed to load access groups", error);
    }
  });

  CreateContentObject = flow(function * ({libraryId, mezContentType, formData}) {
    const result = yield rootStore.WrapApiCall({
      api: this.client.CreateContentObject({
        libraryId,
        options: mezContentType ? { type: mezContentType } : {}
      })
    });
    const createResponse = result.returnVal;

    if(result.ok) {
      const visibilityResult = yield rootStore.WrapApiCall({
        api: this.client.SetVisibility({
          id: result.returnVal.id,
          visibility: 0
        })
      });

      if(visibilityResult.ok) {
        formData.master.writeToken = createResponse.write_token;

        this.UpdateIngestObject({
          id: createResponse.id,
          data: {
            currentStep: "create",
            formData,
            create: {
              complete: true,
              runState: "finished"
            }
          }
        });

        return createResponse;
      } else {
        console.error("Unable to set visibility.", visibilityResult.error);
      }
    } else {
      console.error("Failed to create content object.", result.error);
    }
  });

  CreateProductionMaster = flow(function * ({
    libraryId,
    files,
    title,
    abr,
    accessGroupAddress,
    playbackEncryption="both",
    description,
    s3Url,
    access=[],
    copy,
    masterObjectId,
    writeToken
  }) {
    ValidateLibrary(libraryId);

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "upload"
      }
    });

    // Create encryption conk
    try {
      yield this.client.CreateEncryptionConk({
        libraryId: libraryId,
        objectId: masterObjectId,
        writeToken,
        createKMSConk: true
      });
    } catch(error) {
      return this.HandleError({
        step: "upload",
        errorMessage: "Unable to create encryption conk.",
        error,
        id: masterObjectId
      });
    }

    try {
      const UploadCallback = (progress) => {
        let uploadSum = 0;
        let totalSum = 0;
        Object.values(progress).forEach(fileProgress => {
          uploadSum += fileProgress.uploaded;
          totalSum += fileProgress.total;
        });

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            upload: {
              percentage: Math.round((uploadSum / totalSum) * 100)
            }
          }
        });
      };

      // Upload files
      if(access.length > 0) {
        const s3Reference = access[0];
        const region = s3Reference.remote_access.storage_endpoint.region;
        const bucket = s3Reference.remote_access.path.replace(/\/$/, "");
        const accessKey = s3Reference.remote_access.cloud_credentials.access_key_id;
        const secret = s3Reference.remote_access.cloud_credentials.secret_access_key;
        const signedUrl = s3Reference.remote_access.cloud_credentials.signed_url;
        const baseName = decodeURIComponent(Path.basename(
          s3Url ? s3Url : signedUrl.split("?")[0]
        ));
        // should be full path when using AK/Secret
        const source = s3Url ? s3Url : baseName;

        yield this.client.UploadFilesFromS3({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo: [{
            path: baseName,
            source
          }],
          region,
          bucket,
          accessKey,
          secret,
          signedUrl,
          copy,
          encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
        });
      } else {
        const fileInfo = yield FileInfo("", files);

        yield this.client.UploadFiles({
          libraryId,
          objectId: masterObjectId,
          writeToken,
          fileInfo,
          callback: UploadCallback,
          encryption: ["both", "drm"].includes(playbackEncryption) ? "cgck" : "none"
        });
      }
    } catch(error) {
      return this.HandleError({
        step: "upload",
        errorMessage: "Unable to upload files.",
        error,
        id: masterObjectId
      });
    }

    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        upload: {
          ...this.jobs[masterObjectId].upload,
          complete: true,
          runState: "finished"
        },
        currentStep: "ingest"
      }
    });

    // Bitcode method
    let logs;
    let warnings;
    let errors;
    try {
      const response = yield this.client.CallBitcodeMethod({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        method: UrlJoin("media", "production_master", "init"),
        body: {
          access
        },
        constant: false
      });
      logs = response.logs;
      warnings = response.warnings;
      errors = response.errors;

      if(errors) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to get media information from production master.",
          id: masterObjectId
        });
      }
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to get media information from production master.",
        error,
        id: masterObjectId
      });
    }

    // Check if audio and video streams
    try {
      const streams = (yield this.client.ContentObjectMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadataSubtree: UrlJoin("production_master", "variants", "default", "streams")
      }));

      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          upload: {
            ...this.jobs[masterObjectId].upload,
            streams: Object.keys(streams || {})
          }
        }
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to get streams from production master.",
        error,
        id: masterObjectId
      });
    }

    // Merge metadata
    try {
      yield this.client.MergeMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadata: {
          public: {
            name: `${title} [ingest: uploading] MASTER`,
            description,
            asset_metadata: {
              display_title: `${title} [ingest: uploading] MASTER`
            }
          },
          reference: true,
          elv_created_at: new Date().getTime()
        },
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to update metadata with uploading state.",
        error,
        id: masterObjectId
      });
    }

    // Create ABR Ladder
    let {abrProfile, contentTypeId} = yield this.CreateABRLadder({
      libraryId,
      objectId: masterObjectId,
      writeToken,
      abr
    });

    // Update name to remove [ingest: uploading]
    try {
      yield this.client.MergeMetadata({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        metadata: {
          public: {
            name: `${title} MASTER`,
            description,
            asset_metadata: {
              display_title: `${title} MASTER`
            }
          },
          reference: true,
          elv_created_at: new Date().getTime()
        },
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to update metadata after uploading.",
        error,
        id: masterObjectId
      });
    }

    // Finalize object
    let finalizeResponse;
    try {
      finalizeResponse = yield this.client.FinalizeContentObject({
        libraryId,
        objectId: masterObjectId,
        writeToken,
        commitMessage: "Create master object",
        awaitCommitConfirmation: false
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to finalize production master.",
        error,
        id: masterObjectId
      });
    }

    if(accessGroupAddress) {
      try {
        yield this.client.AddContentObjectGroupPermission({objectId: masterObjectId, groupAddress: accessGroupAddress, permission: "manage"});
      } catch(error) {
        return this.HandleError({
          step: "ingest",
          errorMessage: `Unable to add group permission for group: ${accessGroupAddress}`,
          error,
          id: masterObjectId
        });
      }
    }

    if(playbackEncryption !== "custom") {
      let abrProfileExclude;

      if(playbackEncryption.includes("drm")) {
        abrProfileExclude = ABR.ProfileExcludeClear(abrProfile);
      } else if(playbackEncryption === "clear") {
        abrProfileExclude = ABR.ProfileExcludeDRM(abrProfile);
      }

      if(abrProfileExclude.ok) {
        abrProfile = abrProfileExclude.result;
      } else {
        return this.HandleError({
          step: "ingest",
          errorMessage: "ABR Profile has no relevant playout formats.",
          error: abrProfileExclude,
          id: masterObjectId
        });
      }
    }

    return Object.assign(
      finalizeResponse, {
        abrProfile,
        contentTypeId,
        access,
        errors: errors || [],
        logs: logs || [],
        warnings: warnings || []
      }
    );
  });

  CreateABRMezzanine = flow(function * ({
    libraryId,
    masterObjectId,
    accessGroupAddress,
    abrProfile,
    name,
    description,
    displayName,
    masterVersionHash,
    type,
    newObject=false,
    variant="default",
    offeringKey="default",
    access=[]
  }) {
    let createResponse;
    try {
      createResponse = yield this.client.CreateABRMezzanine({
        libraryId,
        objectId: newObject ? undefined : masterObjectId,
        type,
        name: `${name} [ingest: transcoding] MEZ`,
        masterVersionHash,
        abrProfile,
        variant,
        offeringKey
      });
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to create mezzanine object.",
        error,
        id: masterObjectId
      });
    }
    const objectId = createResponse.id;

    yield this.WaitForPublish({
      hash: createResponse.hash,
      libraryId,
      objectId
    });

    let writeToken;
    let hash;
    try {
      const response = yield this.client.StartABRMezzanineJobs({
        libraryId,
        objectId,
        access
      });

      writeToken = response.writeToken;
      hash = response.hash;
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to start ABR mezzanine jobs.",
        error,
        id: masterObjectId
      });
    }

    yield this.WaitForPublish({
      hash,
      libraryId,
      objectId
    });

    let done;
    let error;
    let statusIntervalId;
    while(!done && !error) {
      let status = yield this.client.LROStatus({
        libraryId,
        objectId
      });

      if(status === undefined) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Received no job status information from server.",
          id: masterObjectId
        });
      }

      if(statusIntervalId) clearInterval(statusIntervalId);
      statusIntervalId = setInterval( async () => {
        const options = Object.assign(
          defaultOptions(),
          {currentTime: new Date()}
        );
        const enhancedStatus = enhanceLROStatus(options, status);

        if(!enhancedStatus.ok) {
          clearInterval(statusIntervalId);
          error = true;

          return this.HandleError({
            step: "ingest",
            errorMessage: "Unable to transcode selected file.",
            id: masterObjectId
          });
        }

        const {estimated_time_left_seconds, estimated_time_left_h_m_s, run_state} = enhancedStatus.result.summary;

        this.UpdateIngestObject({
          id: masterObjectId,
          data: {
            ...this.jobs[masterObjectId],
            mezObjectId: objectId,
            ingest: {
              runState: run_state,
              estimatedTimeLeft:
              (!estimated_time_left_seconds && run_state === "running") ? "Calculating..." : estimated_time_left_h_m_s ? `${estimated_time_left_h_m_s} remaining` : ""
            },
            formData: {
              ...this.jobs[masterObjectId].formData,
              mez: {
                libraryId,
                masterObjectId,
                abrProfile,
                accessGroup : accessGroupAddress,
                name,
                description,
                displayName,
                masterVersionHash,
                type,
                newObject,
                variant,
                offeringKey,
                access
              }
            }
          }
        });

        if(run_state !== "running") {
          clearInterval(statusIntervalId);
          done = true;

          const embedUrl = this.GenerateEmbedUrl({
            objectId: masterObjectId
          });

          try {
            await this.client.MergeMetadata({
              libraryId,
              objectId,
              writeToken,
              metadata: {
                public: {
                  name: `${name} MEZ`,
                  description,
                  asset_metadata: {
                    display_title: `${name} MEZ`,
                    nft: {
                      name,
                      display_name: displayName,
                      description,
                      created_at: new Date(),
                      playable: true,
                      has_audio: this.jobs[masterObjectId].upload.streams.includes("audio"),
                      embed_url: embedUrl,
                      external_url: embedUrl
                    }
                  }
                }
              }
            });
          } catch(error) {
            return this.HandleError({
              step: "ingest",
              errorMessage: "Unable to update metadata with NFT details.",
              error,
              id: masterObjectId
            });
          }

          this.FinalizeABRMezzanine({
            libraryId,
            objectId,
            masterObjectId
          });

          if(accessGroupAddress) {
            try {
              await this.client.AddContentObjectGroupPermission({objectId, groupAddress: accessGroupAddress, permission: "manage"});
            } catch(error) {
              return this.HandleError({
                step: "ingest",
                errorMessage: `Unable to add group permission for group: ${accessGroupAddress}`,
                error,
                id: masterObjectId
              });
            }
          }
        }
      }, 1000);

      yield new Promise(resolve => setTimeout(resolve, 15000));
    }
  });

  CreateABRLadder = flow(function * ({
    libraryId,
    objectId,
    writeToken,
    abr
  }) {
    try {
      const {production_master} = yield this.client.ContentObjectMetadata({
        libraryId,
        objectId,
        writeToken,
        select: [
          "production_master/sources",
          "production_master/variants/default"
        ]
      });

      if(!production_master || !production_master.sources || !production_master.variants || !production_master.variants.default) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to create ABR profile.",
          id: objectId
        });
      }

      const generatedProfile = ABR.ABRProfileForVariant(
        production_master.sources,
        production_master.variants.default,
        abr.default_profile
      );

      if(!generatedProfile.ok) {
        return this.HandleError({
          step: "ingest",
          errorMessage: "Unable to create ABR profile.",
          error: generatedProfile,
          id: objectId
        });
      }

      return {
        abrProfile: generatedProfile.result,
        contentTypeId: abr.mez_content_type
      };
    } catch(error) {
      return this.HandleError({
        step: "ingest",
        errorMessage: "Unable to create ABR profile.",
        error,
        id: objectId
      });
    }
  });

  FinalizeABRMezzanine = flow(function * ({libraryId, objectId, masterObjectId}) {
    this.UpdateIngestObject({
      id: masterObjectId,
      data: {
        ...this.jobs[masterObjectId],
        currentStep: "finalize"
      }
    });

    try {
      const finalizeAbrResponse = yield this.client.FinalizeABRMezzanine({
        libraryId,
        objectId
      });

      this.UpdateIngestObject({
        id: masterObjectId,
        data: {
          ...this.jobs[masterObjectId],
          finalize: {
            complete: true,
            runState: "finished",
            mezzanineHash: finalizeAbrResponse.hash,
            objectId: finalizeAbrResponse.id
          }
        }
      });
    } catch(error) {
      return this.HandleError({
        step: "finalize",
        errorMessage: "Unable to finalize mezzanine object.",
        error,
        id: objectId
      });
    }
  });
}

export default IngestStore;
