import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolao do Heitor | Copa do Mundo 2026",
  description:
    "PWA do Bolao do Heitor para a Copa do Mundo 2026, com Pix manual, jogos da football-data.org e ranking por participacao confirmada.",
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
