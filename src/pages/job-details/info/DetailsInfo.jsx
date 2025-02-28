import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores/index.js";
import PrettyBytes from "pretty-bytes";
import {ActionIcon, Box, CopyButton, Flex, Text, Tooltip} from "@mantine/core";
import {CopyIcon} from "@/assets/icons/index.jsx";

const DetailsInfo = observer(({jobId}) => {
  const separateMasterMez = ingestStore.jobs[jobId].formData?.mez.newObject;

  const idPrefix = separateMasterMez ? "master" : "master-mez";

  const masterValues = [
    {
      label: separateMasterMez ? "Master" : "Master + Mezzanine",
      id: `${idPrefix}-header`,
      value: ""
    },
    {
      label: "Object ID",
      id: `${idPrefix}-id`,
      value: jobId,
      indent: true
    },
    {
      label: "Library ID",
      id: `${idPrefix}-library-id`,
      value: ingestStore.jobs[jobId].masterLibraryId || "",
      indent: true
    },
    {
      label: "Write Token",
      id: `${idPrefix}-write-token`,
      value: ingestStore.jobs[jobId].masterWriteToken || "",
      copyable: true,
      indent: true
    },
    {
      label: "Node URL",
      id: `${idPrefix}-node-url`,
      value: ingestStore.jobs[jobId].masterNodeUrl || "",
      indent: true
    }
  ];

  const mezValues = [
    {
      label: "Mezzanine",
      id: "mez-header",
      value: ""
    },
    {
      label: "Object ID",
      id: "mez-id",
      value: ingestStore.jobs[jobId].mezObjectId || "",
      indent: true
    },
    {
      label: "Library ID",
      id: "mez-library-id",
      value: ingestStore.jobs[jobId].mezLibraryId || "",
      indent: true
    },
    {
      label: "Write Token",
      id: "mez-write-token",
      value: ingestStore.jobs[jobId].mezWriteToken || "",
      copyable: true,
      indent: true
    },
    {
      label: "Node URL",
      id: "mez-node-url",
      value: ingestStore.jobs[jobId].mezNodeUrl || "",
      indent: true,
      hidden: !ingestStore.jobs[jobId].mezNodeUrl
    }
  ];

  let infoValues = [
    {
      label: "Total File Size",
      id: "object-total-size",
      value: PrettyBytes(ingestStore.jobs[jobId].size || 0),
      hidden: ingestStore.jobs[jobId].size === undefined
    },
    {
      label: "Content Type",
      id: "object-content-type",
      value: ingestStore.jobs[jobId].contentType || ""
    },
    ...masterValues
  ];

  if(separateMasterMez) {
    infoValues = infoValues.concat(mezValues);
  }

  return (
    <Box w="100%" mb={12}>
      {
        infoValues
          .filter(item => !item.hidden)
          .map(({label, value, copyable, indent, id}) => (
            <Flex
              key={`job-details-${id}`}
              gap={8}
              style={{marginLeft: indent ? "1.5rem" : 0, width: indent ? "calc(100% - 1.5rem)" : "100%"}}
              mb={8}
            >
              <Text
                fw={700}
                fz={14}
                pr="0.5rem"
                wrap="no-wrap"
                style={{whiteSpace: "nowrap"}}
              >
                { `${label}:` }
              </Text>
              <Text truncate="end" fz={14} fw={400}>{ value || "" }</Text>
              {
                copyable && value &&
                <CopyButton value={value}>
                  {({copied, copy}) => (
                    <Tooltip
                      label={copied ? "Copied" : "Copy"}
                      withArrow
                      position="right"
                    >
                      <ActionIcon
                        onClick={copy}
                        size="xs"
                        variant="transparent"
                        color="elv-gray.1"
                      >
                        <CopyIcon color="var(--mantine-color-elv-neutral-5)" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              }
            </Flex>
          ))
      }
    </Box>
  );
});

export default DetailsInfo;
