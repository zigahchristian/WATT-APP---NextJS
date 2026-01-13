"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//import { deleteFile } from "@/lib/upload";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        fees: {
          orderBy: { dueDate: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const studentData = await req.json();

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
        ...studentData,
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

/*
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get student to delete image
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Delete profile image if exists
    if (student.profileImage) {
      await deleteFile(student.profileImage);
    }

    // Delete student (fees will cascade delete)
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
*/
