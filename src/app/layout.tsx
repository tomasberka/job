import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "HelloComp — Řídicí panel",
  description:
    "Interní dashboard HelloComp pro správu PC sestavů, tvorbu obsahu a sledování video produkce.",
  openGraph: {
    title: "HelloComp — Řídicí panel",
    description:
      "Interní dashboard HelloComp — hellocomp.cz",
    siteName: "HelloComp Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <QueryProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">{children}</div>
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
