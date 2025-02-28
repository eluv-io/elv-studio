import {observer} from "mobx-react-lite";
import {Divider, Loader, Text} from "@mantine/core";
import FormSectionTitle from "@/components/form-section-title/FormSectionTitle.jsx";
import TextCard from "@/components/text-card/TextCard.jsx";
import {ingestStore} from "@/stores/index.js";
import {CheckmarkIcon} from "@/assets/icons/index.jsx";
import styles from "./DetailsProgress.module.css";

// TODO: Revamp each item without requiring a percentage value
// const ProgressItem = observer(({label, percentage, rightSection}) => {
//   return (
//     <Box w="100%" mb={20}>
//       <Grid>
//         <Grid.Col span={4}>
//           <Text fw={500} fz={16}>
//             { label }
//           </Text>
//         </Grid.Col>
//         <Grid.Col span={8}>
//           <Group>
//             <Progress value={percentage} w={390} />
//             {
//               rightSection ?
//                 (
//                   <Flex ml={36} align="center">
//                     { rightSection }
//                   </Flex>
//                 ) :
//                 null
//             }
//           </Group>
//         </Grid.Col>
//       </Grid>
//     </Box>
//   );
// });

const DetailsProgress = observer(({jobId}) => {
  return (
    <>
      <Divider mb={12} />
      <FormSectionTitle title="Progress" />

      <TextCard
        title="Upload"
        message={
          ["finished", "failed"].includes(ingestStore.jobs[jobId].upload.runState) ? null : `${ingestStore.jobs[jobId].upload.percentage || 0}%`
        }
        rightSection={
          ingestStore.jobs[jobId].upload.runState === "failed" ?
            <Text c="elv-red.4">
              Failed
            </Text> :
            ingestStore.jobs[jobId].upload.runState === "finished" ?
              <CheckmarkIcon className={styles.itemIcon} /> : <Loader size={20} />
        }
      />

      <TextCard
        title="Convert to streaming format"
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
              ingestStore.jobs[jobId].ingest.runState === "finished" ? <CheckmarkIcon className={styles.itemIcon} /> : <Loader size={20} />
            )
        }
      />

      <TextCard
        title="Finalize"
        rightSection={
          ingestStore.jobs[jobId].finalize.runState === "failed" ?
            <Text c="elv-red.4">
              Failed
            </Text> :
            ingestStore.jobs[jobId].currentStep === "finalize" &&
            <CheckmarkIcon className={styles.itemIcon} />
        }
      />
    </>
  );
});

export default DetailsProgress;
