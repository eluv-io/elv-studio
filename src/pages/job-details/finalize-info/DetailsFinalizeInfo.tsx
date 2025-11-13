import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores/index.js";
import {Divider} from "@mantine/core";
import DetailRow from "@/pages/job-details/common/DetailsCommon.tsx";
import SectionTitle from "@/components/section-title/SectionTitle.tsx";
import {rootStore} from "@/stores/index.js";

const DetailsFinalizeInfo = observer(({jobId}) => {
  if(!ingestStore.jobs[jobId].finalize.mezzanineHash) { return null; }

  const OpenObjectLink = ({libraryId, objectId}) => {
    rootStore.client.SendMessage({
      options: {
        operation: "OpenLink",
        libraryId,
        objectId
      },
      noResponse: true
    });
  };

  const VALUES = [
    {
      label: "Hash",
      value: ingestStore.jobs[jobId].finalize.mezzanineHash,
      copyable: true
    },
    {
      label: "ID",
      value: ingestStore.jobs[jobId].finalize.objectId,
      onClick: () => OpenObjectLink({
        libraryId: ingestStore.jobs[jobId].formData?.mez.libraryId,
        objectId: ingestStore.jobs[jobId].finalize.objectId
      }),
      clickTitle: "Open in Fabric Browser"
    },
    {
      label: "Embeddable URL",
      value: ingestStore.jobs[jobId].embedUrl,
      href: ingestStore.jobs[jobId].embedUrl
    }
  ];

  return (
    <>
      <Divider mb={19} />
      <SectionTitle mb={19}>Mezzanine Object Details</SectionTitle>
      {
        VALUES.map(({label, value, copyable, onClick, href, clickTitle}) => (
          <DetailRow
            key={`row-${label}-${value}`}
            label={label}
            value={value}
            copyable={copyable}
            onClick={onClick}
            clickTitle={clickTitle}
            href={href}
          />
        ))
      }
    </>
  );
});

export default DetailsFinalizeInfo;
