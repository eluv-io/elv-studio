import {useState} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores";
import PageContainer from "@/components/page-container/PageContainer.jsx";
import {DataTable} from "mantine-datatable";
import {useNavigate} from "react-router";
import {Box, Button, Group, Title} from "@mantine/core";

import styles from "./Jobs.module.css";
import ConfirmModal from "@/components/confirm-modal/ConfirmModal.jsx";
import CopyButton from "@/components/common/copy-button/CopyButton.jsx";
import {SortTable} from "@/utils/helpers.js";

const Jobs = observer(() => {
  const [showClearJobsDialog, setShowClearJobsDialog] = useState(false);
  const navigate = useNavigate();
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "_title",
    direction: "asc"
  });

  const JobStatus = ({
    currentStep,
    uploadPercentage,
    estimatedTimeLeft,
    runState,
    error
  }) => {
    const statusMap = {
      "upload": "Uploading",
      "ingest": "Ingesting",
      "finalize": "Finalizing"
    };

    if(runState === "finished") {
      return "Complete";
    } else if(error) {
      return "Failed";
    } else {
      let statusMessage = statusMap[currentStep];
      if(currentStep === "upload") {
        statusMessage = `${statusMessage} ${uploadPercentage ? `${uploadPercentage}%` : ""}`;
      } else if(currentStep === "ingest") {
        statusMessage = `${statusMessage} ${estimatedTimeLeft || ""}`;
      }

      return statusMessage;
    }
  };

  const records = Object.keys(ingestStore.jobs || {}).map(id => {
    const item = ingestStore.jobs[id];
    item["_title"] = item.formData?.master?.title;
    item["_objectId"] = id;
    return item;
  })
    .sort(SortTable({sortStatus}));

  return (
    <PageContainer title="Ingest Jobs">
      <Button
        variant="outline"
        onClick={() => setShowClearJobsDialog(true)}
        mb={16}
        disabled={!records || records.length === 0}
      >
        Clear Inactive Jobs
      </Button>
      {
        showClearJobsDialog &&
        <ConfirmModal
          title="Clear Jobs"
          message="Are you sure you want to clear all inactive jobs? This action cannot be undone."
          ConfirmCallback={() => ingestStore.ClearInactiveJobs()}
          show={showClearJobsDialog}
          CloseCallback={() => setShowClearJobsDialog(false)}
        />
      }
      <Box className={styles.tableWrapper}>
        <DataTable
          highlightOnHover
          idAccessor="_objectId"
          minHeight={!records || records.length === 0 ? 150 : 75}
          records={records}
          noRecordsText="No Records"
          onRowClick={({record}) => {
            navigate(record._objectId);
          }}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          rowClassName={() => styles.row}
          columns={[
            { accessor: "_title", title: "Name", sortable: true, render: record => <Title order={4} c="elv-gray.9">{ record._title }</Title> },
            {
              accessor: "_objectId",
              title: "Object ID",
              sortable: true,
              render: record => (
                <Group>
                  <CopyButton value={record._objectId} />
                </Group>
              )
            },
            {
              accessor: "_status",
              title: "Status",
              render: record => (
                <Title order={4} c="elv-gray.9">
                  {
                    JobStatus({
                      uploadPercentage: record.upload?.percentage,
                      currentStep: record.currentStep,
                      estimatedTimeLeft: record.ingest?.estimatedTimeLeft,
                      runState: record.finalize?.runState,
                      error: record.error
                    })
                  }
                </Title>
              )
            }
          ]}
        />
      </Box>
    </PageContainer>
  );
});

export default Jobs;
