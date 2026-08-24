import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore, tenantStore} from "@/stores/index.js";
import {Loader} from "@mantine/core";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    if(!tenantStore.loaded) { return; }

    ingestStore.LoadJobs();
  }, [tenantStore.loaded]);

  if(!ingestStore.jobs) { return <Loader />; }

  return children;
});

export default JobsWrapper;
