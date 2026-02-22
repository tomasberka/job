import { NextResponse } from "next/server";
import { CONTENT_MOCK } from "@/features/content-generator/services/content-mock";

export async function GET() {
  return NextResponse.json(CONTENT_MOCK);
}
