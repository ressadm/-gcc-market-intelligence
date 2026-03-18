import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
