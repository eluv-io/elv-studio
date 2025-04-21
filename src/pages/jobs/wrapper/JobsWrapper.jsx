import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores/index.js";
import {Loader} from "@mantine/core";

const JobsWrapper = observer(({children}) => {
  useEffect(() => {
    ingestStore.LoadJobs();
  }, []);

  if(!ingestStore.jobs) { return <Loader />; }

  return children;
});

export default JobsWrapper;
