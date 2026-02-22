import { NextResponse, NextRequest } from "next/server";
import { CONTENT_MOCK } from "@/features/content-generator/services/content-mock";
import { CreateContentItemSchema } from "@/features/content-generator/types/content-item";

export async function GET() {
  return NextResponse.json(CONTENT_MOCK);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreateContentItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newItem = {
    id: `cg-${Date.now()}`,
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  CONTENT_MOCK.push(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
