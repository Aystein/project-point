import { NotificationsProvider } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { App } from "./App";
import { store } from "./Store/Store";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root") as HTMLElement
);




export * from "./calculator";
