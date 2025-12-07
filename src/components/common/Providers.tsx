"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import store from "@/store";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("finboard-theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else if (stored === "light") {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      // ignore (server environments)
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </Provider>
  );
}
