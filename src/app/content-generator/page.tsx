import type { Metadata } from "next";
import { ContentGeneratorRoute } from "@/features/content-generator/routes/content-generator-route";

export const metadata: Metadata = {
  title: "Content Generator | HelloComp",
  description:
    "Automate TikTok hooks, SEO meta-tags and video scripts for HelloComp products.",
};

export default function ContentGeneratorPage() {
  return <ContentGeneratorRoute />;
}
