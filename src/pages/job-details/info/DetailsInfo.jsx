import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores/index.js";
import PrettyBytes from "pretty-bytes";
import {Box, Divider} from "@mantine/core";
import DetailRow from "@/pages/job-details/common/DetailsCommon.jsx";
import SectionTitle from "@/components/section-title/SectionTitle.jsx";

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
    <Box w="100%" mb={19}>
      <SectionTitle mb={19}>Details</SectionTitle>
      {
        infoValues
          .filter(item => !item.hidden)
          .map(({label, value, copyable, indent, id}) => (
            <DetailRow
              key={`job-details-${id}`}
              indent={indent}
              label={label}
              copyable={copyable}
              value={value}
            />
          ))
      }
      <Divider mb={19} mt={19} />
    </Box>
  );
});

export default DetailsInfo;
