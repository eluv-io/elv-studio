import {observer} from "mobx-react-lite";
import {Divider, Loader, Text} from "@mantine/core";
import FormSectionTitle from "@/components/form-section-title/FormSectionTitle.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {ingestStore} from "@/stores/index.js";
import {CheckmarkIcon} from "@/assets/icons/index.jsx";

const DetailsProgress = observer(({jobId}) => {
  const iconProps = {
    width: 20,
    height: 20
  };

  return (
    <>
      <Divider mb={12} />
      <FormSectionTitle title="Progress" />

      <TextCard
        title="Uploading"
        message={
          ["finished", "failed"].includes(ingestStore.jobs[jobId].upload.runState) ? null : `${ingestStore.jobs[jobId].upload.percentage || 0}%`
        }
        rightSection={
          ingestStore.jobs[jobId].upload.runState === "failed" ?
            <Text c="elv-red.4">
              Failed
            </Text> :
            ingestStore.jobs[jobId].upload.runState === "finished" ?
              <CheckmarkIcon {...iconProps} /> : <Loader size={20} />
        }
      />

      <TextCard
        title="Converting to streaming format"
        message={
          ingestStore.jobs[jobId].ingest.runState === "failed" ? "" : ingestStore.jobs[jobId].ingest.estimatedTimeLeft || ""
        }
        rightSection={
          ingestStore.jobs[jobId].ingest.runState === "failed" ?
            <Text c="elv-red.4">
              Failed
            </Text> :
            ["ingest", "finalize"].includes(ingestStore.jobs[jobId].currentStep) &&
            (
              ingestStore.jobs[jobId].ingest.runState === "finished" ? <CheckmarkIcon {...iconProps} /> : <Loader size={20} />
            )
        }
      />

      <TextCard
        title="Finalizing"
        rightSection={
          ingestStore.jobs[jobId].finalize.runState === "failed" ?
            <Text c="elv-red.4">
              Failed
            </Text> :
            ingestStore.jobs[jobId].currentStep === "finalize" &&
            <CheckmarkIcon {...iconProps} />
        }
      />
    </>
  );
});

export default DetailsProgress;
