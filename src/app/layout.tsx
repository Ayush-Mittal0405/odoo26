import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { EcoSphereProvider } from "@/context/EcoSphereContext";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="min-h-screen bg-bg-base text-text-primary overflow-x-hidden">
        <EcoSphereProvider>
          {children}
        </EcoSphereProvider>
      </body>
    </html>
  );
}
