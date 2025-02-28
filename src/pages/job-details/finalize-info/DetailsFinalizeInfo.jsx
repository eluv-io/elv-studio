import {observer} from "mobx-react-lite";
import {ingestStore, rootStore} from "@/stores/index.js";
import {Title} from "@mantine/core";
import JobDetailsCard from "@/pages/job-details/card/JobDetailsCard.jsx";

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

  return (
    <>
      <Title order={5} mt={16} mb={16}>Mezzanine Object Details</Title>
      <JobDetailsCard
        label="Hash"
        value={ingestStore.jobs[jobId].finalize.mezzanineHash}
        secondary
        type="COPY"
      />
      <JobDetailsCard
        label="ID"
        value={ingestStore.jobs[jobId].finalize.objectId}
        secondary
        type="ACTION"
        onClick={() => OpenObjectLink({
          libraryId: ingestStore.jobs[jobId].formData?.mez.libraryId,
          objectId: ingestStore.jobs[jobId].finalize.objectId
        })}
      />
      <JobDetailsCard
        label="Embeddable URL"
        value={ingestStore.jobs[jobId].embedUrl}
        secondary
        type="LINK"
      />
    </>
  );
});

export default DetailsFinalizeInfo;
