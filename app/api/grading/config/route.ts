import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all grade configs
export async function GET() {
  try {
    const configs = await prisma.gradeConfig.findMany();
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching grade configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch grade configs" },
      { status: 500 },
    );
  }
}

// POST update grade config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject } = body;

    const config = await prisma.gradeConfig.upsert({
      where: { subject },
      update: body,
      create: body,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving grade config:", error);
    return NextResponse.json(
      { error: "Failed to save grade config" },
      { status: 500 },
    );
  }
}
