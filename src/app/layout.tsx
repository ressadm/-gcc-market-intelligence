import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANgelOS",
  description: "C2 Agent-Orchestrated Dashboard for Angel Investing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
