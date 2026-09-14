import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { AuthProvider } from "@/auth/AuthContext";
import { TenantProvider } from "@/tenant/TenantContext";
import { ThemeProvider } from "@/theme/ThemeProvider";

// Le provider pilote l'initialisation et affiche l'état de chargement aux routes protégées.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <TenantProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </TenantProvider>
    </AuthProvider>
  </StrictMode>,
);
