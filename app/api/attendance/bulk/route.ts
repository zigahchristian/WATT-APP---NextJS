import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST bulk attendance creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, subject, records } = body;

    if (!date || !subject || !Array.isArray(records)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const attendanceDate = new Date(date);

    // Process each record
    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        // Check if record already exists
        const existing = await prisma.attendance.findUnique({
          where: {
            studentId_date_subject: {
              studentId: record.studentId,
              date: attendanceDate,
              subject: subject,
            },
          },
        });

        if (existing) {
          // Update existing record
          const updated = await prisma.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              remarks: record.remarks,
            },
          });
          results.push(updated);
        } else {
          // Create new record
          const created = await prisma.attendance.create({
            data: {
              studentId: record.studentId,
              date: attendanceDate,
              subject: subject,
              status: record.status,
              remarks: record.remarks,
            },
          });
          results.push(created);
        }
      } catch (error: any) {
        errors.push({
          studentId: record.studentId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Attendance recorded for ${results.length} students`,
    });
  } catch (error) {
    console.error("Error saving bulk attendance:", error);
    return NextResponse.json(
      { error: "Failed to save bulk attendance" },
      { status: 500 },
    );
  }
}
