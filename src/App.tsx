import {BrowserRouter} from "react-router";
import {observer} from "mobx-react-lite";
import AppRoutes from "./Routes.js";

import SideNavigation from "@/components/side-navigation/SideNavigation.tsx";
import ConfirmModal from "@/components/confirm-modal/ConfirmModal.tsx";
import JobsWrapper from "@/pages/jobs/wrapper/JobsWrapper.tsx";
import {ingestStore, rootStore, uiStore} from "@/stores/index.js";
import MantineTheme from "@/assets/MantineTheme.js";

import {AppShell, Loader, MantineProvider} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "mantine-datatable/styles.css";
import "./assets/GlobalStyles.css";

const App = observer(() => {
  return (
    <MantineProvider withCssVariables theme={{colorScheme: uiStore.theme, ...MantineTheme}}>
      <BrowserRouter>
        <AppShell
          padding={0}
          navbar={{width: 200, breakpoint: "sm"}}
        >
          <SideNavigation />
          <AppShell.Main>
            {
              rootStore.loaded ?
                (
                  <JobsWrapper>
                    <AppRoutes />
                  </JobsWrapper>
                ) : <Loader />
            }
            <ConfirmModal
              show={ingestStore.showDialog}
              title={ingestStore.dialog.title}
              message={ingestStore.dialog.description}
              confirmText="Yes"
              cancelText="No"
              CloseCallback={() => ingestStore.HideWarningDialog("NO")}
              ConfirmCallback={() => ingestStore.HideWarningDialog("YES")}
            />
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
});

export default App;
