import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Group, Loader, SimpleGrid, Text, Tooltip} from "@mantine/core";
import SectionTitle from "@/components/section-title/SectionTitle.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {ingestStore} from "@/stores/index.js";
import {CheckmarkIcon, CloseIcon} from "@/assets/icons/index.jsx";
import styles from "./DetailsProgress.module.css";
import {IconRefresh} from "@tabler/icons-react";

const DetailsProgress = observer(({jobId}) => {
  const uploadRunState = ingestStore.jobs[jobId].upload.runState;

  return (
    <Box mb={19} w="100%">
      <SectionTitle mb={19}>Progress</SectionTitle>

      <SimpleGrid cols={2} spacing={30}>
        <TextCard
          title="Upload"
          message={
            ["finished", "failed", "canceled"].includes(uploadRunState) ? null : `... ${ingestStore.jobs[jobId].upload.percentage || 0}%`
          }
          rightSection={
            ["failed", "canceled"].includes(uploadRunState) ?
              <Group>
                <Text c={uploadRunState === "failed" ? "elv-red.5" : "elv-gray.6"}>
                  { uploadRunState === "failed" ? "Failed" : "Canceled" }
                </Text>
                <Tooltip
                  label="Retry upload"
                  position="bottom"
                >
                  <ActionIcon
                    variant="transparent"
                    c="elv-gray.8"
                    size={20}
                    onClick={() => ingestStore.RunIngestPipeline({jobId, resume: true})}
                  >
                    <IconRefresh size={20} />
                  </ActionIcon>
                </Tooltip>
              </Group> :
              uploadRunState === "finished" ?
                <CheckmarkIcon className={styles.itemIcon} /> :
                <Group>
                  <Loader size={20} />
                  <Tooltip
                    label="Cancel upload"
                    position="bottom"
                  >
                    <ActionIcon
                      variant="transparent"
                      c="elv-gray.8"
                      size={20}
                      onClick={() => ingestStore.CancelUpload({jobId})}
                    >
                      <CloseIcon width={16} height={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
          }
          complete={uploadRunState === "finished"}
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
            ingestStore.jobs[jobId].ingest.runState === "failed" ?
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
            ingestStore.jobs[jobId].finalize.runState === "failed" ?
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
          complete={ingestStore.jobs[jobId].finalize.objectId}
        />
      </SimpleGrid>
    </Box>
  );
});

export default DetailsProgress;
