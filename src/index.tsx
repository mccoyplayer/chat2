import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import LMChatClient from "@likeminds.community/chat-js";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

export const myClient: LMChatClient = LMChatClient.setApiKey(
  process.env.REACT_APP_API_KEY || ""
)
  .setPlatformCode(process.env.REACT_APP_XPLATFORM_CODE!)
  .setVersionCode(parseInt(process.env.REACT_APP_XVERSION_CODE!))
  .build();

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
