import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all grades with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subject = searchParams.get("subject");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (subject) where.subject = subject;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const grades = await prisma.grading.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            course: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 },
    );
  }
}

// POST create or update grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...gradeData } = body;

    if (id) {
      // Update existing grade
      const grade = await prisma.grading.update({
        where: { id },
        data: {
          ...gradeData,
          date: new Date(gradeData.date),
        },
      });
      return NextResponse.json(grade);
    } else {
      // Create new grade
      const grade = await prisma.grading.create({
        data: {
          ...gradeData,
          date: new Date(gradeData.date),
        },
      });
      return NextResponse.json(grade);
    }
  } catch (error) {
    console.error("Error saving grade:", error);
    return NextResponse.json(
      { error: "Failed to save grade" },
      { status: 500 },
    );
  }
}

// DELETE grade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Grade ID is required" },
        { status: 400 },
      );
    }

    await prisma.grading.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 },
    );
  }
}
