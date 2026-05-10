import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlycemiBot Portal Clínico",
  description: "Painel de monitoramento de pacientes para médicos e clínicas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full bg-slate-50">{children}</body>
    </html>
  );
}
