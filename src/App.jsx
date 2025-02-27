import {HashRouter} from "react-router-dom";
import JobsWrapper from "@/pages/jobs/JobsWrapper.jsx";
import {observer} from "mobx-react-lite";
import LeftNavigation from "@/components/left-navigation/LeftNavigation.jsx";
import WarningDialog from "@/components/WarningDialog.jsx";
import {rootStore} from "@/stores/index.js";
import AppRoutes from "./Routes.jsx";
import {AppShell, Loader, MantineProvider} from "@mantine/core";
import "@mantine/core/styles.css";
import MantineTheme from "@/assets/MantineTheme.js";

const App = observer(() => {
  return (
    <MantineProvider withCssVariables theme={{...MantineTheme}}>
      <HashRouter>
        <AppShell
          padding="0"
          navbar={{width: 200, breakpoint: "sm"}}
        >
          <LeftNavigation />
          <AppShell.Main>
            {
              rootStore.loaded ?
                (
                  <JobsWrapper>
                    <AppRoutes />
                  </JobsWrapper>
                ) : <Loader />
            }
            <WarningDialog />
          </AppShell.Main>
        </AppShell>
      </HashRouter>
    </MantineProvider>
  );
});

export default App;
