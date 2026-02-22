import type { Metadata } from "next";
import { VideoWorkflowRoute } from "@/features/video-workflow/routes/video-workflow-route";

export const metadata: Metadata = {
  title: "Video produkce | HelloComp",
  description:
    "Sledování exportů a správa video produkce HelloComp.",
  openGraph: {
    images: [
      { url: "https://hellocomp.cz/images/og-video.jpg", alt: "HelloComp Video produkce" },
    ],
  },
};

export default function VideoWorkflowPage() {
  return <VideoWorkflowRoute />;
}
