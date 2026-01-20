import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all attendance configurations
export async function GET() {
  try {
    const configs = await prisma.attendanceConfig.findMany({
      orderBy: [{ subject: "asc" }, { dayOfWeek: "asc" }],
    });
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching attendance configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance configurations" },
      { status: 500 },
    );
  }
}

// POST create or update attendance configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...configData } = body;

    if (id) {
      // Update existing config
      const config = await prisma.attendanceConfig.update({
        where: { id },
        data: configData,
      });
      return NextResponse.json(config);
    } else {
      // Create new config
      const config = await prisma.attendanceConfig.create({
        data: configData,
      });
      return NextResponse.json(config);
    }
  } catch (error: any) {
    console.error("Error saving attendance config:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Configuration already exists for this subject and day" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to save attendance configuration" },
      { status: 500 },
    );
  }
}

// DELETE attendance configuration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Configuration ID is required" },
        { status: 400 },
      );
    }

    await prisma.attendanceConfig.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance config:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance configuration" },
      { status: 500 },
    );
  }
}
