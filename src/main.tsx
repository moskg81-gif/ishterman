import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { AdminDashboard } from "../ishtap_app.tsx";

const Root = () => window.location.pathname === "/admin" ? <AdminDashboard /> : <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
