import type { Metadata } from "next";
import { VideoWorkflowRoute } from "@/features/video-workflow/routes/video-workflow-route";

export const metadata: Metadata = {
  title: "Video produkce | HelloComp",
  description:
    "Sledování exportů DaVinci Resolve a správa video produkce HelloComp.",
};

export default function VideoWorkflowPage() {
  return <VideoWorkflowRoute />;
}
