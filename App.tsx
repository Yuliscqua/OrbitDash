import React, { useState } from "react";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { Navbar } from "./src/components/layout/Navbar";
import { DashboardLayout } from "./src/components/layout/DashboardLayout";
import { AdminView } from "./src/components/admin/AdminView";
import { useAuth } from "./src/context/AuthContext";

function AppContent() {
  const [view, setView] = useState<"dashboard" | "admin">("dashboard");
  const { isAdmin } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-base overflow-hidden">
      <Navbar view={view} onViewChange={setView} />
      <main className="flex-1 min-h-0 overflow-auto p-[var(--grid-gap)]">
        {view === "dashboard" || !isAdmin ? (
          <DashboardLayout />
        ) : (
          <AdminView />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
