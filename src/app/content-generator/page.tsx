import type { Metadata } from "next";
import { ContentGeneratorRoute } from "@/features/content-generator/routes/content-generator-route";

export const metadata: Metadata = {
  title: "Generátor obsahu | HelloComp",
  description:
    "Automatizace TikTok hooků, SEO meta tagů a video skriptů pro produkty HelloComp.",
};

export default function ContentGeneratorPage() {
  return <ContentGeneratorRoute />;
}
