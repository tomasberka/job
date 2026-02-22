import { NextResponse, NextRequest } from "next/server";
import { PC_INVENTORY_MOCK } from "@/features/pc-inventory/services/pc-inventory-mock";
import { CreatePCProductSchema } from "@/features/pc-inventory/types/pc-product";

export async function GET() {
  return NextResponse.json(PC_INVENTORY_MOCK);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = CreatePCProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newProduct = {
    id: `hc-${Date.now()}`,
    ...parsed.data,
    currency: "CZK" as const,
    imageUrl: parsed.data.imageUrl || undefined,
    createdAt: now,
    updatedAt: now,
  };

  PC_INVENTORY_MOCK.push(newProduct);
  return NextResponse.json(newProduct, { status: 201 });
}
