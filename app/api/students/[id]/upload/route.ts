"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const imageData = await req.json();

    // Get existing student
    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Update student
    await prisma.student.update({
      where: { id },
      data: {
        imageUrl: imageData.data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    );
  }
}
