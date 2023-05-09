import { NotificationsProvider } from "@mantine/notifications";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "./App";
import { store } from "./Store/Store";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </Provider>
  </React.StrictMode>
);

export * from './WebGL';