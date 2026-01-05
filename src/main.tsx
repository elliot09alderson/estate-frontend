import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { store } from './store';
import App from "./App.tsx";
import { HelmetProvider } from 'react-helmet-async';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </Provider>
);
