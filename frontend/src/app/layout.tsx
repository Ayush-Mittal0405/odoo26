import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EcoSphereProvider } from "@/context/EcoSphereContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoSphere | Enterprise ESG Management Platform",
  description: "A data-dense and gamified ESG management console for tracking environmental metrics, CSR logs, audit governance, compliance, and user XP benchmarks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg-base text-text-primary overflow-x-hidden selection:bg-accent-e/20 selection:text-text-primary">
        <EcoSphereProvider>
          {children}
        </EcoSphereProvider>
      </body>
    </html>
  );
}
