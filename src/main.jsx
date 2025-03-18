import {StrictMode} from "react";
import ReactDOM from "react-dom/client";

import App from "./../src/App.jsx";

const rootElement = ReactDOM.createRoot(document.getElementById("root"));

rootElement.render(
  <StrictMode>
    <App />
  </StrictMode>
);
