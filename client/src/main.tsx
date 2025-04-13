import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Helmet, HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Helmet>
      <title>PackPal - Group Logistics Organizer</title>
      <meta name="description" content="PackPal helps your group coordinate packing lists for trips, events, and projects with real-time collaboration." />
    </Helmet>
    <App />
  </HelmetProvider>
);
