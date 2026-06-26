import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolao do Heitor",
  description:
    "PWA para boloes de futebol com Pix manual, apura--o autom-tica e ranking por participacao confirmada.",
  applicationName: "Bolao do Heitor",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Heitor",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
