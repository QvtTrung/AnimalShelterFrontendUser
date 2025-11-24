import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";
import { cleanupLocalStorage } from "./utils/localStorage-cleanup";

// Clean up old localStorage keys on app initialization
cleanupLocalStorage();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NextUIProvider>
        <main className="light text-foreground bg-background">
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 1000,
              style: {
                background: "#fff",
                color: "#363636",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              success: {
                iconTheme: {
                  primary: "#00c369",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#f31260",
                  secondary: "#fff",
                },
              },
            }}
          />
        </main>
      </NextUIProvider>
    </QueryClientProvider>
  </StrictMode>
);
