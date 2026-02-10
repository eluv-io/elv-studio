import {ReactNode, useEffect} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore, rootStore} from "@/stores/index.js";
import {Loader} from "@mantine/core";

const JobsWrapper = observer(({children}: {children: ReactNode}) => {
  useEffect(() => {
    const localStorageJobs = localStorage.getItem("elv-jobs");
    if(localStorageJobs) {
      const parsedJobs = JSON.parse(rootStore.Decode(localStorageJobs) ?? "");

      ingestStore.UpdateIngestJobs({jobs: parsedJobs});
    } else {
      ingestStore.UpdateIngestJobs({jobs: {}});
    }
  }, []);

  if(!ingestStore.jobs) { return <Loader />; }

  return children;
});

export default JobsWrapper;
