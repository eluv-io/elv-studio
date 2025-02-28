import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores/index.js";
import {Divider} from "@mantine/core";
import DetailRow from "@/pages/job-details/common/DetailsCommon.jsx";
import FormSectionTitle from "@/components/form-section-title/FormSectionTitle.jsx";
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
      })
    },
    {
      label: "Embeddable URL",
      value: ingestStore.jobs[jobId].embedUrl,
      href: ingestStore.jobs[jobId].embedUrl
    }
  ];

  return (
    <>
      <Divider mb={12} />
      <FormSectionTitle title="Mezzanine Object Details" />
      {
        VALUES.map(({label, value, copyable, onClick, href}) => (
          <DetailRow
            key={`row-${label}-${value}`}
            label={label}
            value={value}
            copyable={copyable}
            onClick={onClick}
            href={href}
          />
        ))
      }
    </>
  );
});

export default DetailsFinalizeInfo;
