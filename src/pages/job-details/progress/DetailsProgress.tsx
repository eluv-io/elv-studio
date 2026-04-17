import {observer} from "mobx-react-lite";
import {Box, Loader, SimpleGrid, Text} from "@mantine/core";
import SectionTitle from "@/components/section-title/SectionTitle.tsx";
import TextCard from "@/components/text-card/TextCard.tsx";
import {ingestStore} from "@/stores/index.js";
import {RunState} from "@/types/job.ts";
import {CheckmarkIcon} from "@/assets/icons/index.tsx";
import styles from "./DetailsProgress.module.css";

const DetailsProgress = observer(({jobId}: {jobId: string}) => {
  return (
    <Box mb={19} w="100%">
      <SectionTitle mb={19}>Progress</SectionTitle>

      <SimpleGrid cols={2} spacing={30}>
        <TextCard
          title="Upload"
          message={
            (["finished", "failed"] as RunState[]).includes(ingestStore.jobs[jobId].upload.runState as RunState) ? undefined : `... ${ingestStore.jobs[jobId].upload.percentage || 0}%`
          }
          rightSection={
            (ingestStore.jobs[jobId].upload.runState as RunState | undefined) === "failed" ?
              <Text c="elv-red.5">
                Failed
              </Text> :
              ingestStore.jobs[jobId].upload.runState === "finished" ?
                <CheckmarkIcon className={styles.itemIcon} /> : <Loader size={20} />
          }
          complete={ingestStore.jobs[jobId].upload.runState === "finished"}
          percentage={ingestStore.jobs[jobId].upload.percentage}
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing={30}>
        <TextCard
          title="Convert to streaming format"
          message={
            ingestStore.jobs[jobId].ingest.runState === "failed" ? "" : ingestStore.jobs[jobId].ingest.estimatedTimeLeft ? `... ${ingestStore.jobs[jobId].ingest.estimatedTimeLeft}` : ""
          }
          rightSection={
            (ingestStore.jobs[jobId].ingest.runState as RunState | undefined) === "failed" ?
              <Text c="elv-red.5">
                Failed
              </Text> :
              ["ingest", "finalize"].includes(ingestStore.jobs[jobId].currentStep) &&
              (
                ingestStore.jobs[jobId].ingest.runState === "finished" ? <CheckmarkIcon className={styles.itemIcon} /> : <Loader size={20} />
              )
          }
          complete={ingestStore.jobs[jobId].ingest.runState === "finished"}
        />
      </SimpleGrid>

      <SimpleGrid cols={2} spacing={30}>
        <TextCard
          title="Finalize"
          rightSection={
            (ingestStore.jobs[jobId].finalize.runState as RunState | undefined) === "failed" ?
              <Text c="elv-red.5">
                Failed
              </Text> :
              ingestStore.jobs[jobId].currentStep === "finalize" &&
              (
                ingestStore.jobs[jobId].finalize.objectId ?
                  <CheckmarkIcon className={styles.itemIcon} /> :
                  <Loader size={20} />
              )
          }
          complete={Boolean(ingestStore.jobs[jobId].finalize.objectId)}
        />
      </SimpleGrid>
    </Box>
  );
});

export default DetailsProgress;
