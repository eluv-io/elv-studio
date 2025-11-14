import {ReactNode, useEffect} from "react";
import {observer} from "mobx-react-lite";
import {ingestStore} from "@/stores";
import {Loader} from "@mantine/core";
import {LogError} from "@/utils/errors";

interface FabricLoaderProps {
  children: ReactNode;
}

const FabricLoader = observer(({children}: FabricLoaderProps) => {
  useEffect(() => {
    const LoadDependencies = async () => {
      await ingestStore.LoadDependencies();
    };

    LoadDependencies().catch((error) => {
      LogError("Failed to load dependencies", error);
    });
  }, []);

  if(!ingestStore.loaded) {
    return <Loader />;
  }

  return children;
});

export default FabricLoader;

