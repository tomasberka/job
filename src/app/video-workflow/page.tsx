import type { Metadata } from "next";
import { VideoWorkflowRoute } from "@/features/video-workflow/routes/video-workflow-route";

export const metadata: Metadata = {
  title: "Video Workflow | HelloComp",
  description:
    "Track DaVinci Resolve export status and manage video production workflow.",
};

export default function VideoWorkflowPage() {
  return <VideoWorkflowRoute />;
}
