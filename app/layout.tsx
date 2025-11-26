import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import AppThemeProvider from "./theme-provider";

export const metadata: Metadata = {
  title: "Mobile Date Range Calendar",
  description: "Custom mobile-first date range picker on Next.js + MUI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
