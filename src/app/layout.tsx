import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  title: "HelloComp Social & Content Dashboard",
  description:
    "Internal dashboard for HelloComp PC lineup management, content generation and video workflow tracking.",
  openGraph: {
    title: "HelloComp Social & Content Dashboard",
    description:
      "Internal dashboard for HelloComp — hellocomp.cz",
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
