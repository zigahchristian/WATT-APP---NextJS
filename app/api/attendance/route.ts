import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all attendance records with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const subject = searchParams.get("subject");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: any = {};

    if (studentId) where.studentId = studentId;
    if (subject) where.subject = subject;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const attendance = await prisma.attendance.findMany({
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

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 },
    );
  }
}

// POST create or update attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...attendanceData } = body;

    // Validate required fields
    if (
      !attendanceData.studentId ||
      !attendanceData.date ||
      !attendanceData.subject ||
      !attendanceData.status
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (id) {
      // Update existing attendance
      const attendance = await prisma.attendance.update({
        where: { id },
        data: {
          ...attendanceData,
          date: new Date(attendanceData.date),
        },
      });
      return NextResponse.json(attendance);
    } else {
      // Check for duplicate attendance record
      const existing = await prisma.attendance.findUnique({
        where: {
          studentId_date_subject: {
            studentId: attendanceData.studentId,
            date: new Date(attendanceData.date),
            subject: attendanceData.subject,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error:
              "Attendance record already exists for this student, date, and subject",
          },
          { status: 409 },
        );
      }

      // Create new attendance record
      const attendance = await prisma.attendance.create({
        data: {
          ...attendanceData,
          date: new Date(attendanceData.date),
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              studentId: true,
            },
          },
        },
      });
      return NextResponse.json(attendance);
    }
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Attendance record already exists for this student, date, and subject",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to save attendance record" },
      { status: 500 },
    );
  }
}

// DELETE attendance record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Attendance record ID is required" },
        { status: 400 },
      );
    }

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance record" },
      { status: 500 },
    );
  }
}
