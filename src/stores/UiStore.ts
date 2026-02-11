// Class that handles main visual treatments
import {makeAutoObservable} from "mobx";
import type {RootStore} from "@/stores/index";

class UiStore {
  rootStore: RootStore;
  theme = "light";
  errorMessage: string = "";

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);

    this.rootStore = rootStore;
  }

  SetTheme = ({theme}: {theme: "dark" | "light"}) => {
    this.theme = theme;
  };

  SetErrorMessage(message: string) {
    this.errorMessage = message;
  }
}

export default UiStore;
