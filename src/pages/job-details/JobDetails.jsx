import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {observer} from "mobx-react-lite";

import {ingestStore} from "@/stores";
import {ExclamationCircleIcon} from "@/assets/icons";
import JSONView from "@/components/common/json-view/JSONView.jsx";
import {
  Alert,
  Box,
  Button,
  Flex,
  Loader,
  Modal,
  Text
} from "@mantine/core";
import styles from "./JobDetails.module.css";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import DetailsProgress from "@/pages/job-details/progress/DetailsProgress.jsx";
import DetailsInfo from "@/pages/job-details/info/DetailsInfo.jsx";
import DetailsFinalizeInfo from "@/pages/job-details/finalize-info/DetailsFinalizeInfo.jsx";

const ErrorNotification = observer(({jobId, setShowErrorDialog}) => {
  if(!ingestStore.jobs[jobId].error) { return null; }

  const fallbackErrorMessage = "Unable to create media playable object.";

  return (
    <Box>
      <Alert
        variant="light"
        bg="var(--mantine-color-elv-red-0)"
        classNames={{wrapper: styles.alertWrapper}}
        icon={<ExclamationCircleIcon height={20} width={20} color="var(--mantine-color-elv-red-5)" />}
      >
        <Flex justify="space-between" align="center">
          <Text c="elv-gray.9" fw={600} fz={14}>
            { ingestStore.jobs[jobId].errorMessage || fallbackErrorMessage }
          </Text>
          {
            ingestStore.jobs[jobId].errorLog &&
            (
              <Button variant="transparent" onClick={() => setShowErrorDialog(true)} className={styles.textButton}>
                <Text c="elv-blue.3" fw={700} fz={14}>
                  Learn More
                </Text>
              </Button>
            )
          }
        </Flex>
      </Alert>
    </Box>
  );
});

const ErrorDialog = observer(({jobId, showErrorDialog, setShowErrorDialog}) => {
  if(!showErrorDialog) { return null; }

  return (
    <Modal
      opened={showErrorDialog}
      onClose={() => setShowErrorDialog(false)}
      title={`Error Log for ${ingestStore.jobs[jobId].formData?.master.title || jobId}`}
      hideCancelButton={true}
      size="lg"
      padding="24px"
      radius="6px"
      centered
      closeOnClickOutside={false}
      withCloseButton={false}
    >
      <JSONView json={ingestStore.jobs[jobId].errorLog} copyable={true} />

      <Flex mt="1.5rem" justify="flex-end">
        <Button
          variant="filled"
          onClick={() => setShowErrorDialog(false)}
        >
          Close
        </Button>
      </Flex>
    </Modal>
  );
});

const JobDetails = observer(() => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    ingestStore.SetJob(jobId);

    // StrictMode double-invokes mount effects in dev; HandleIngest is async and mutates job
    // state as it progresses, so a second invocation can see mid-flight state and kick off a
    // concurrent, incorrectly-resumed pipeline run. Only let it actually start once per mount.
    if(hasStartedRef.current) { return; }
    hasStartedRef.current = true;

    HandleIngest();
  }, []);

  const HandleIngest = async () => {
    const job = ingestStore.job;

    if(job.currentStep === "create" && job.create.runState === "finished") {
      await ingestStore.RunIngestPipeline({jobId});
    } else if(job.currentStep === "upload" && !["finished", "failed", "canceled"].includes(job.upload.runState)) {
      // A page reload kills the in-memory abort controller and any in-flight upload, but leaves
      // the job's currentStep/runState looking like it's still uploading. Reconnect a live upload
      // so there's actually something for the cancel button to abort.
      await ingestStore.RunIngestPipeline({jobId, resume: true});
    }
  };

  if(!ingestStore.job) { return <Loader />; }

  return (
    <PageContainer
      title={ingestStore.jobs[jobId].formData?.master.title || jobId}
      width="95%"
      mb={19}
      titleLeftSection={
        <Button color="elv-gray.6" onClick={() => navigate("/jobs")}>
          Back
        </Button>
      }
    >
      <DetailsInfo jobId={jobId} />
      <DetailsProgress jobId={jobId} />
      <DetailsFinalizeInfo jobId={jobId} />

      <ErrorNotification jobId={jobId} setShowErrorDialog={setShowErrorDialog} />
      <ErrorDialog
        jobId={jobId}
        showErrorDialog={showErrorDialog}
        setShowErrorDialog={setShowErrorDialog}
      />
    </PageContainer>
  );
});

export default JobDetails;
