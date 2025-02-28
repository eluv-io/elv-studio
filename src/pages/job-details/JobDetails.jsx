import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {observer} from "mobx-react-lite";

import {ingestStore} from "@/stores";
import {ExclamationCircleIcon} from "@/assets/icons";
import Dialog from "@/components/common/Dialog";
import JSONView from "@/components/common/JSONView";
import {
  Alert,
  Box,
  Button,
  Flex,
  Loader
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
        color="var(--mantine-color-elv-red-8)"
        classNames={{wrapper: styles.alertWrapper}}
        icon={<ExclamationCircleIcon />}
      >
        <Flex justify="space-between" align="center">
          { ingestStore.jobs[jobId].errorMessage || fallbackErrorMessage }
          {
            ingestStore.jobs[jobId].errorLog &&
            (
              <Button variant="transparent" onClick={() => setShowErrorDialog(true)} className={styles.textButton}>
                Learn More
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
    <Dialog
      open={showErrorDialog}
      onOpenChange={() => setShowErrorDialog(false)}
      title={`Error Log for ${ingestStore.jobs[jobId].formData?.master.title || jobId}`}
      hideCancelButton={true}
      confirmText="Close"
      size="MD"
    >
      <JSONView json={ingestStore.jobs[jobId].errorLog} copyable={true} />
    </Dialog>
  );
});

const JobDetails = observer(() => {
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const params = useParams();
  const jobId = params.id;
  const navigate = useNavigate();

  useEffect(() => {
    ingestStore.SetJob(jobId);

    HandleIngest();
  }, []);

  const HandleIngest = async () => {
    if(ingestStore.job.currentStep !== "create" || ingestStore.job.create.runState !== "finished") { return; }

    const {abr, access, copy, files, libraryId, title, accessGroup, description, s3Url, writeToken, playbackEncryption} = ingestStore.job.formData.master;
    const mezFormData = ingestStore.job.formData.mez;
    const {contentType} = ingestStore.job.formData;

    const response = await ingestStore.CreateProductionMaster({
      libraryId,
      files,
      title,
      description,
      s3Url,
      abr: abr ? JSON.parse(abr) : undefined,
      accessGroupAddress: accessGroup,
      access: JSON.parse(access),
      copy,
      masterObjectId: jobId,
      writeToken,
      playbackEncryption,
      displayTitle: mezFormData.displayTitle
    });

    if(!response) { return; }

    await new Promise(resolve => setTimeout(resolve, 2000));

    await ingestStore.WaitForPublish({
      hash: response.hash,
      objectId: jobId,
      libraryId: libraryId
    });

    await ingestStore.CreateABRMezzanine({
      libraryId: mezFormData.libraryId,
      masterObjectId: response.id,
      masterVersionHash: response.hash,
      abrProfile: response.abrProfile,
      type: contentType,
      name: mezFormData.name,
      accessGroupAddress: mezFormData.accessGroup,
      description: mezFormData.description,
      displayTitle: mezFormData.displayTitle,
      newObject: mezFormData.newObject,
      access: JSON.parse(access),
      permission: mezFormData.permission
    });
  };

  if(!ingestStore.job) { return <Loader />; }

  return (
    <PageContainer
      title={ingestStore.jobs[jobId].formData?.master.title || jobId}
      width="810px"
      BackLinkCallback={() => navigate("/jobs")}
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
