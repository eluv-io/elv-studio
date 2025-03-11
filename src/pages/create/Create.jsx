import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import {observer} from "mobx-react-lite";
import PrettyBytes from "pretty-bytes";

import {ingestStore, tenantStore, rootStore} from "@/stores";
import {s3Regions} from "@/utils";
import {abrProfileClear, abrProfileBoth} from "@/utils/ABR";
import {CircleInfoIcon, CloseIcon, ExclamationCircleIcon, UploadIcon} from "@/assets/icons";

import PageContainer from "@/components/page-container/PageContainer.jsx";
import FabricLoader from "@/components/FabricLoader";
import styles from "./Create.module.css";

import {
  Box,
  Radio,
  Select,
  Stack,
  TextInput,
  Checkbox,
  Textarea,
  Button,
  Flex,
  Text,
  ActionIcon,
  Group,
  Divider,
  UnstyledButton,
  SimpleGrid,
  Tooltip,
  Title,
  JsonInput
} from "@mantine/core";
import SectionTitle from "@/components/section-title/SectionTitle.jsx";
import {Dropzone} from "@mantine/dropzone";

const HandleRemove = ({index, files, SetFilesCallback}) => {
  const newFiles = files
    .slice(0, index)
    .concat(files.slice(index + 1));

  if(SetFilesCallback && typeof SetFilesCallback === "function") {
    SetFilesCallback(newFiles);
  }
};

const Permissions = ({permission, setPermission}) => {
  const permissionLevels = rootStore.client.permissionLevels;

  return (
    <Select
      label="Permission"
      description="Content object permission level."
      tooltip={
        Object.values(rootStore.client.permissionLevels).map(({short, description}) =>
          <div key={`permission-info-${short}`} className="form__permission-tooltip-item">
            <div className="form__permission-tooltip-title">{ short }:</div>
            <div>{ description }</div>
          </div>
        )
      }
      value={permission}
      onChange={value => setPermission(value)}
      data={
        Object.keys(permissionLevels || []).map(permissionName => (
          {
            label: permissionLevels[permissionName].short,
            value: permissionName
          }
        ))
      }
    />
  );
};

const S3Access = ({
  s3UseAKSecret,
  s3Url,
  s3AccessKey,
  s3Secret,
  s3PresignedUrl,
  s3Region
}) => {
  let cloudCredentials;
  let bucket;
  if(s3UseAKSecret && s3Url) {
    const s3PrefixRegex = /^s3:\/\/([^/]+)\//i; // for matching and extracting bucket name when full s3:// path is specified
    const s3PrefixMatch = (s3PrefixRegex.exec(s3Url));

    bucket = s3PrefixMatch[1];
    cloudCredentials = {
      access_key_id: s3AccessKey,
      secret_access_key: s3Secret
    };
  } else if(s3PresignedUrl) {
    const httpsPrefixRegex = /^https:\/\/([^/]+)\//i;
    const httpsPrefixMatch = (httpsPrefixRegex.exec(s3PresignedUrl));
    bucket = httpsPrefixMatch[1].split(".")[0];

    cloudCredentials = {
      signed_url: s3PresignedUrl
    };
  }

  return [{
    path_matchers: [".*"],
    remote_access: {
      protocol: "s3",
      platform: "aws",
      path: `${bucket}/`,
      storage_endpoint: {
        region: s3Region
      },
      cloud_credentials: cloudCredentials
    }
  }];
};

const Create = observer(() => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const [masterObjectId, setMasterObjectId] = useState("");
  const [uploadMethod, setUploadMethod] = useState("LOCAL");
  const [files, setFiles] = useState([]);

  const [abrProfile, setAbrProfile] = useState(null);
  const [masterLibrary, setMasterLibrary] = useState("");
  const [accessGroup, setAccessGroup] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permission, setPermission] = useState("editable");

  const [mezLibrary, setMezLibrary] = useState("");
  const [mezContentType, setMezContentType] = useState("");

  const [displayTitle, setDisplayTitle] = useState("");
  const [playbackEncryption, setPlaybackEncryption] = useState("");
  const [useMasterAsMez, setUseMasterAsMez] = useState(true);

  const [hasDrmCert, setHasDrmCert] = useState(false);
  const [disableDrmAll, setDisableDrmAll] = useState(true);
  const [disableDrmPublic, setDisableDrmPublic] = useState(true);
  const [disableDrmRestricted, setDisableDrmRestricted] = useState(true);
  const [disableClear, setDisableClear] = useState(true);

  const [s3Url, setS3Url] = useState("");
  const [s3Region, setS3Region] = useState("");
  const [s3AccessKey, setS3AccessKey] = useState("");
  const [s3Secret, setS3Secret] = useState("");
  const [s3Copy, setS3Copy] = useState(false);
  const [s3PresignedUrl, setS3PresignedUrl] = useState("");
  const [s3UseAKSecret, setS3UseAKSecret] = useState(false);

  // Custom errors
  const [s3UrlFieldError, setS3UrlFieldError] = useState(null);
  const [nameFieldError, setNameFieldError] = useState(null);

  const ENCRYPTION_OPTIONS = [
    {id: "drm-public", value: "drm-public", label: "DRM - Public Access", disabled: disableDrmPublic, title: "Playout Formats: Dash Widevine, HLS Sample AES, HLS AES-128"},
    {id: "drm-all", value: "drm-all", label: "DRM - All Formats", disabled: disableDrmAll, title: "Playout Formats: Dash Widevine, HLS Sample AES, HLS AES-128, HLS Fairplay, HLS Widevine, HLS PlayReady"},
    {id: "drm-restricted", value: "drm-restricted", label: "DRM - Widevine and Fairplay", disabled: disableDrmRestricted, title: "Playout Formats: Dash Widevine, HLS Fairplay"},
    {id: "clear", value: "clear", label: "Clear", disabled: disableClear, title: "Playout Formats - HLS Clear, Dash Clear"},
    {id: "custom", value: "custom", label: "Custom", title: "Define a custom ABR profile"}
  ];

  useEffect(() => {
    if(tenantStore.loaded) {
      if(tenantStore.titleContentType) {
        setMezContentType(tenantStore.titleContentType);
      } else {
        const defaultType = Object.keys(ingestStore.contentTypes || {})
          .find(id => {
            if(
              ingestStore.contentTypes[id] &&
              ingestStore.contentTypes[id].name.toLowerCase().includes("title")
            ) {
              return id;
            }
          });

        if(defaultType) {
          setMezContentType(defaultType);
        }
      }
    }
  }, [ingestStore.contentTypes, tenantStore.loaded, tenantStore.titleContentType]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(masterLibrary)) { return; }

    SetPlaybackSettings({
      libraryId: masterLibrary,
      type: "MASTER"
    });
  }, [masterLibrary]);

  useEffect(() => {
    if(!ingestStore.libraries || !ingestStore.GetLibrary(mezLibrary)) { return; }

    SetPlaybackSettings({
      libraryId: mezLibrary,
      type: "MEZ"
    });
  }, [mezLibrary]);

  useEffect(() => {
    if(permission === "owner") {
      setDisableDrmAll(true);
      setDisableDrmPublic(true);
      setDisableDrmRestricted(true);
    } else {
      if(
        !ingestStore.libraries ||
        (!ingestStore.GetLibrary(mezLibrary) &&
        !ingestStore.GetLibrary(masterLibrary))
      ) {
        return;
      }

      SetPlaybackSettings({
        libraryId: mezLibrary || masterLibrary,
        type: mezLibrary ? "MEZ" : "MASTER"
      });
    }
  }, [permission]);


  useEffect(() => {
    if(playbackEncryption === "custom" && !abrProfile) {
      SetAbrProfile({
        profile: {default_profile: hasDrmCert ? abrProfileBoth : abrProfileClear},
        stringify: true
      });
    }
  }, [playbackEncryption]);

  const SetAbrProfile = ({profile, stringify=true}) => {
    const abr = stringify ? JSON.stringify(profile, null, 2) || "" : profile;
    setAbrProfile(abr);
  };

  const SetMezContentType = async ({type}) => {
    let contentType;

    if(!type) {
      contentType = mezContentType || "";
    } else if(type.startsWith("iq__")) {
      contentType = type;
    } else if(type.startsWith("hq__")) {
      contentType = (await ingestStore.ContentType({versionHash: type})).id || "";
    } else if(type.length > 0) {
      contentType = (await ingestStore.ContentType(({name: type}))).id || "";
    }

    setMezContentType(contentType);
  };

  const SetPlaybackSettings = ({
    libraryId,
    type
  }) => {
    const library = ingestStore.GetLibrary(libraryId);
    const libraryHasCert = !!library.drmCert;
    setHasDrmCert(libraryHasCert);

    if(type === "MASTER" && useMasterAsMez || type === "MEZ") {
      const profile = library.abr && library.abr.default_profile;

      SetMezContentType({
        type: library.abr && library.abr.mez_content_type || ""
      });

      if(!profile || Object.keys(profile).length === 0) {
        SetAbrProfile({
          profile: {default_profile: libraryHasCert ? abrProfileBoth : abrProfileClear},
          stringify: true
        });

        setDisableDrmAll(!libraryHasCert || permission === "owner");
        setDisableDrmPublic(!libraryHasCert || permission === "owner");
        setDisableDrmRestricted(!libraryHasCert || permission === "owner");
        setDisableClear(false);
      } else {
        SetAbrProfile({profile: library.abr, stringify: true});

        setDisableClear(!library.abrProfileSupport.clear);
        setDisableDrmAll(!libraryHasCert || !library.abrProfileSupport.drmAll || permission === "owner");
        setDisableDrmPublic(!libraryHasCert || !library.abrProfileSupport.drmPublic || permission === "owner");
        setDisableDrmRestricted(!libraryHasCert || !library.abrProfileSupport.drmRestricted || permission === "owner");
      }

      setPlaybackEncryption("");
    }
  };

  const ValidForm = () => {
    // Check for JSON validation errors first
    try {
      JSON.parse(abrProfile);
    } catch(_error) {
      return false;
    }

    if(
      uploadMethod === "LOCAL" && files.length === 0 ||
      !masterLibrary ||
      !name ||
      !playbackEncryption ||
      playbackEncryption === "custom" && !abrProfile ||
      // Check for invalid files
      (files.length > 0 && files.some(item => item.errors)) ||
      !mezContentType ||
      //  Check for input errors
      nameFieldError
    ) {
      return false;
    }

    if(uploadMethod === "S3") {
      if(s3UseAKSecret) {
        if(
          !s3Region ||
          !s3Url ||
          !s3AccessKey ||
          !s3Secret ||
          // Input error
          s3UrlFieldError
        ) {
          return false;
        }
      } else {
        if(!s3PresignedUrl) {
          return false;
        }
      }
    }

    return true;
  };

  const ValidS3Url = ({value}) => {
    return !value || value.startsWith("s3://");
  };

  const ValidName = ({value}) => {
    const trimmedValue = value.trim();

    if(value && trimmedValue.length < 3) {
      return false;
    } else {
      return true;
    }
  };

  const HandleSubmit = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    let access = [];
    try {
      if(uploadMethod === "S3") {
        access = S3Access({
          s3UseAKSecret,
          s3Url,
          s3AccessKey,
          s3Secret,
          s3PresignedUrl,
          s3Region
        });
      }

      let accessGroupAddress = ingestStore.accessGroups[accessGroup] ? ingestStore.accessGroups[accessGroup].address : undefined;

      let abrMetadata;
      let type;
      if(playbackEncryption === "custom") {
        abrMetadata = JSON.stringify({
          ...JSON.parse(abrProfile),
          mez_content_type: mezContentType
        }, null, 2);

        type = JSON.parse(abrMetadata).mez_content_type;
      } else {
        abrMetadata = abrProfile;
        type = mezContentType;
      }

      let createParams = {
        libraryId: masterLibrary,
        mezContentType: type,
        formData: {
          master: {
            libraryId: masterLibrary,
            accessGroup: accessGroupAddress,
            files: uploadMethod === "LOCAL" ? files : undefined,
            title: name,
            description: description,
            s3Url: uploadMethod === "S3" ? s3Url : undefined,
            playbackEncryption,
            access: JSON.stringify(access, null, 2) || "",
            copy: s3Copy,
            abr: abrMetadata
          },
          mez: {
            libraryId: useMasterAsMez ? masterLibrary : mezLibrary,
            accessGroup: accessGroupAddress,
            name: name,
            description: description,
            displayTitle,
            newObject: !useMasterAsMez,
            permission: permission
          }
        }
      };

      const createResponse = await ingestStore.CreateContentObject(createParams) || {};

      if(createResponse.error) {
        setError({
          title: "Unable to create content object",
          message: createResponse.error
        });
      } else if(createResponse.id) {
        setMasterObjectId(createResponse.id);
      }
    } finally {
      setIsCreating(false);
    }
  };

  if(masterObjectId) {
    return <Navigate to={`/jobs/${masterObjectId}`} replace />;
  }

  return (
    <PageContainer title="Create" error={error}>
      <FabricLoader>
        <form onSubmit={HandleSubmit} className={styles.form}>
          <SectionTitle mb={2}>Upload New Media</SectionTitle>
          <Radio.Group
            name="uploadMethod"
            value={uploadMethod}
            onChange={value => setUploadMethod(value)}
            mb={29}
          >
            <Stack mt={20} gap={18}>
              <Radio
                value="LOCAL"
                label="Local File"
                description="Select a file from your device. Ideal for quick uploads from your computer."
              />
              <Radio
                value="S3"
                label="S3 Bucket"
                description="Choose a file from an existing S3 bucket. Ensure you have the correct permissions to access it."
              />
            </Stack>
          </Radio.Group>
          {
            uploadMethod === "LOCAL" &&
              <>
                <Dropzone
                  accept={{"audio/*": [], "video/*": [], "application/mxf": []}}
                  id="main-dropzone"
                  onDrop={files => setFiles(files)}
                  onReject={fileRejections => {
                    const fileObjects = fileRejections.map(item => (
                      {
                        ...item.file,
                        errors: item.errors
                      }
                    ));
                    setFiles(fileObjects);
                  }}
                  multiple={false}
                  validator={(file) => {
                    if(file.size === 0) {
                      return {
                        code: "size-empty",
                        message: "This file contains no data"
                      };
                    }

                    return null;
                  }}
                  mb={16}
                >
                  <Flex p="65 70" direction="column" justify="center" gap={0}>
                    <Flex justify="center" mb={7}>
                      <Dropzone.Accept>
                        <UploadIcon />
                      </Dropzone.Accept>
                      <Dropzone.Reject>
                        <CloseIcon
                          style={{ width: "8rem", height: "8rem", color: "var(--mantine-color-red-6)" }}
                          stroke={1.5}
                        />
                      </Dropzone.Reject>
                      <Dropzone.Idle>
                        <UploadIcon color="elv-neutral.4" />
                      </Dropzone.Idle>
                    </Flex>

                    <Stack justify="center" gap={0} align="center">
                      <Title c="elv-gray.9" order={4} mb={7}>Drag and Drop a Video or Audio File</Title>
                      <UnstyledButton variant="transparent" p={0} size="xs" h={15}>
                        <Text fz={14} c="elv-blue.2" fw={500}>Upload a File</Text>
                      </UnstyledButton>
                    </Stack>
                  </Flex>
                </Dropzone>
                {
                  files.length > 0 &&
                  <Text mb={8} c="elv-gray.9">Files:</Text>
                }
                <Flex direction="column" gap={0} mb={29}>
                  {
                    files.map((file, index) => (
                      <Box
                        key={`${file.name || file.path}-${index}`}
                        bg="elv-gray.0"
                        p={16}
                        bd={file.errors ? "2px solid elv-red.4" : "1px solid transparent"}
                      >
                        <Stack>
                          <Flex
                            direction="row"
                            align="center"
                            justify="space-between"
                          >
                            <Group gap={5}>
                              {
                                file.errors &&
                                <ExclamationCircleIcon color="var(--mantine-color-elv-red-4)" />
                              }
                              <Text c="elv-gray.9">{file.name || file.path}</Text>
                              <Text c="elv-gray.9">- {PrettyBytes(file.size || 0)}</Text>
                            </Group>
                            <ActionIcon
                              title="Remove file"
                              size="md"
                              variant="transparent"
                              ml={16}
                              onClick={() => HandleRemove({index, files, SetFilesCallback: setFiles})}
                            >
                              <CloseIcon />
                            </ActionIcon>
                          </Flex>
                          {
                            file.errors ?
                              (
                                <>
                                  <Divider />
                                  <Text c="elv-red.4">
                                    { file.errors.map(item => item.message).join(", ") || "This file cannot be ingested" }
                                  </Text>
                                </>
                              ) : null
                          }
                        </Stack>
                      </Box>
                    ))
                  }
                </Flex>
              </>
          }

          {/* S3 Details */}
          {
            uploadMethod === "S3" && <>
              {
                !s3UseAKSecret &&
                <Textarea
                  label="Presigned URL"
                  name="presignedUrl"
                  placeholder="https://example-bucket.region.amazonaws.com/path-to-media"
                  description="Enter a presigned URL to securely access your S3 object."
                  value={s3PresignedUrl}
                  onChange={event => setS3PresignedUrl(event.target.value)}
                  required={uploadMethod === "S3" && !s3UseAKSecret}
                  mb={16}
                />
              }

              <SimpleGrid cols={2} spacing={150} mb={18}>
                <Select
                  label="Region"
                  name="s3Region"
                  data={
                    s3Regions.map(({value, name}) => (
                      {value, label: name}
                    ))
                  }
                  placeholder="Select Region"
                  description="Select the AWS region where your S3 bucket is hosted."
                  onChange={value => setS3Region(value)}
                  required={s3UseAKSecret}
                />
              </SimpleGrid>

              <Checkbox
                label="Use access key and secret"
                name="s3UseAKSecret"
                checked={s3UseAKSecret}
                onChange={event => setS3UseAKSecret(event.target.checked)}
                mb={18}
              />

              {
                s3UseAKSecret &&
                  <>
                    <TextInput
                      label="S3 URI"
                      name="s3Url"
                      value={s3Url}
                      placeholder="s3://example-bucket/path-to-file.mp4"
                      description="Enter a presigned URL to securely fetch your S3 object for this request."
                      onChange={event => {
                        setS3Url(event.target.value);
                      }}
                      error={s3UrlFieldError}
                      onBlur={() => {
                        if(ValidS3Url({value: s3Url})) {

                          if(s3UrlFieldError) {
                            setS3UrlFieldError(null);
                          }
                        } else {
                          setS3UrlFieldError("Invalid S3 URI. It should begin with 's3://'. Example: 's3://example-bucket/path-to-file.mp4.'");
                        }
                      }}
                      required={uploadMethod === "S3"}
                      mb={18}
                    />
                    <TextInput
                      label="Access key"
                      name="s3AccessKey"
                      placeholder="Enter your AWS access key"
                      description="Provide your AWS access key for authentication."
                      value={s3AccessKey}
                      onChange={event => setS3AccessKey(event.target.value)}
                      type="password"
                      required={uploadMethod === "S3"}
                      mb={18}
                    />

                    <TextInput
                      label="Secret"
                      name="s3Secret"
                      value={s3Secret}
                      placeholder="Enter your AWS secret key"
                      description="Enter the AWS secret key to sign this request securely."
                      onChange={event => setS3Secret(event.target.value)}
                      type="password"
                      required={uploadMethod === "S3"}
                      mb={18}
                    />
                  </>
              }

              <Checkbox
                label="Copy file onto the fabric"
                name="s3Copy"
                checked={s3Copy}
                onChange={event => setS3Copy(event.target.checked)}
                mb={29}
              />
            </>
          }

          <Divider mb={29} />
          <SectionTitle mb={10}>General</SectionTitle>

          <SimpleGrid cols={2} spacing={150} mb={18}>
            <TextInput
              label="Name"
              name="name"
              placeholder="Enter content name"
              onChange={event => setName(event.target.value)}
              onBlur={() => {
                if(ValidName({value: name})) {
                  if(nameFieldError) {
                    setNameFieldError(null);
                  }
                } else {
                  setNameFieldError("Name must be at least 3 characters long.");
                }
              }}
              error={nameFieldError}
              value={name}
              required
            />
            <TextInput
              label="Display Title"
              name="displayTitle"
              placeholder="Enter a title"
              onChange={event => setDisplayTitle(event.target.value)}
              value={displayTitle}
            />
          </SimpleGrid>

          <TextInput
            label="Description"
            name="description"
            placeholder="Enter a description"
            description="Enter a description to provide more details and context."
            onChange={event => setDescription(event.target.value)}
            value={description}
            mb={18}
          />

          <SimpleGrid cols={2} spacing={150} mb={18}>
            <Select
              label={useMasterAsMez ? "Library" : "Master Library"}
              description={useMasterAsMez ? "Select the library where your master and mezzanine object will be stored." : "Select the library where your master object will be stored."}
              name="masterLibrary"
              required={true}
              data={
                Object.keys(ingestStore.libraries || {}).map(libraryId => (
                  {
                    label: ingestStore.libraries[libraryId].name || "",
                    value: libraryId
                  }
                ))
              }
              placeholder="Select Library"
              onChange={value => setMasterLibrary(value)}
            />
            {
              !useMasterAsMez &&
              <Select
                label="Mezzanine Library"
                description="This is the library where your mezzanine object will be created."
                name="mezLibrary"
                required={true}
                data={
                  Object.keys(ingestStore.libraries || {}).map(libraryId => (
                    {
                      label: ingestStore.libraries[libraryId].name || "",
                      value: libraryId
                    }
                  ))
                }
                placeholder="Select Library"
                onChange={value => setMezLibrary(value)}
                value={mezLibrary}
              />
            }
          </SimpleGrid>
          <Checkbox
            label="Use Master Object as Mezzanine Object"
            checked={useMasterAsMez}
            onChange={event => {
              setMezLibrary(masterLibrary);
              setUseMasterAsMez(event.target.checked);
            }}
            name="masterAsMez"
            mb={18}
          />

          <SimpleGrid cols={2} spacing={150} mb={29}>
            <Select
              label="Mezzanine Content Type"
              description="Select a content type for the mezzanine object."
              name="mezContentType"
              required={true}
              data={Object.keys(ingestStore.contentTypes || {}).map(typeId => (
                {value: typeId, label: ingestStore.contentTypes[typeId].name}
              ))}
              placeholder="Select Content Type"
              value={mezContentType}
              onChange={value => setMezContentType(value)}
            />
          </SimpleGrid>

          <Divider mb={29} />
          <SectionTitle mb={10}>Access</SectionTitle>

          <SimpleGrid cols={2} spacing={150} mb={29}>
            <Select
              label="Access Group"
              description="The Access Group that will manage your master object."
              name="accessGroup"
              data={
                Object.keys(ingestStore.accessGroups || {}).map(groupName => (
                  {value: groupName, label: groupName}
                ))
              }
              placeholder="Select Access Group"
              value={accessGroup}
              onChange={(value) => setAccessGroup(value)}
              allowDeselect={false}
            />
            <Permissions permission={permission} setPermission={setPermission} />
          </SimpleGrid>

          <Divider mb={29} />
          <SectionTitle mb={10}>Playback & Streaming</SectionTitle>

          <SimpleGrid cols={2} spacing={150} mb={10}>
            <Select
              description="Select a playback encryption option. Enable Clear or Digital Rights Management (DRM) copy protection during playback."
              name="encryption"
              data={ENCRYPTION_OPTIONS}
              placeholder="Select Encryption"
              mb={16}
              value={playbackEncryption}
              onChange={value => setPlaybackEncryption(value)}
              required
              label={
                <Flex align="center" gap={6}>
                  Playback Encryption
                  <Tooltip
                    multiline
                    w={460}
                    label={
                      ENCRYPTION_OPTIONS.map(({label, title, id}) =>
                        <Flex
                          key={`encryption-info-${id}`}
                          gap="1rem"
                          lh={1.25}
                          pb={5}
                        >
                          <Flex flex="0 0 35%">{label}:</Flex>
                          <Text fz="sm">{title}</Text>
                        </Flex>
                      )
                    }
                  >
                    <Flex w={16}>
                      <CircleInfoIcon color="var(--mantine-color-elv-gray-8)"/>
                    </Flex>
                  </Tooltip>
                </Flex>
              }
            />
          </SimpleGrid>

          {
            playbackEncryption === "custom" &&
            <JsonInput
              name="abrProfile"
              label="ABR Profile Metadata"
              value={abrProfile}
              onChange={value => setAbrProfile(value)}
              required={playbackEncryption === "custom"}
              defaultValue={{default_profile: {}}}
              validationError="Invalid JSON"
              autosize
              minRows={6}
              maxRows={10}
              formatOnBlur
            />
          }

          <Button
            type="submit"
            disabled={isCreating || !ValidForm()}
            mt={25}
          >
            { isCreating ? "Submitting..." : "Create" }
          </Button>
        </form>
      </FabricLoader>
    </PageContainer>
  );
});

export default Create;
