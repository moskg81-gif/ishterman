import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { AdminDashboard } from "../ishtap_app.tsx";

const isAdmin = window.location.pathname === "/admin";
if (!isAdmin) {
  document.documentElement.classList.add("app-shell");
  document.body.classList.add("app-shell");
}

const Root = () => isAdmin ? <AdminDashboard /> : <App />;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
