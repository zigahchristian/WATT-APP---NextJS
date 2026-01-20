import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET attendance statistics
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

    const attendance = await prisma.attendance.findMany({
      where,
      select: {
        status: true,
        date: true,
        studentId: true,
        subject: true,
      },
    });

    // Calculate statistics
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "Present").length;
    const absent = attendance.filter((a) => a.status === "Absent").length;
    const late = attendance.filter((a) => a.status === "Late").length;
    const excused = attendance.filter((a) => a.status === "Excused").length;

    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    // Get unique students and subjects
    const uniqueStudents = new Set(attendance.map((a) => a.studentId)).size;
    const uniqueSubjects = new Set(attendance.map((a) => a.subject)).size;

    // Monthly trend
    const monthlyTrend = attendance.reduce(
      (acc, record) => {
        const month = new Date(record.date).toLocaleString("default", {
          month: "short",
        });
        if (!acc[month]) {
          acc[month] = { present: 0, total: 0 };
        }
        acc[month].total++;
        if (record.status === "Present") {
          acc[month].present++;
        }
        return acc;
      },
      {} as Record<string, { present: number; total: number }>,
    );

    // Convert monthly trend to array
    const monthlyTrendArray = Object.entries(monthlyTrend)
      .map(([month, data]) => ({
        month,
        rate: (data.present / data.total) * 100,
        present: data.present,
        total: data.total,
      }))
      .sort((a, b) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Subject-wise statistics
    const subjectStats = attendance.reduce(
      (acc, record) => {
        if (!acc[record.subject]) {
          acc[record.subject] = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: 0,
          };
        }
        acc[record.subject].total++;
        acc[record.subject][
          record.status.toLowerCase() as keyof (typeof acc)[string]
        ]++;
        return acc;
      },
      {} as Record<
        string,
        {
          present: number;
          absent: number;
          late: number;
          excused: number;
          total: number;
        }
      >,
    );

    // Convert subject stats to array
    const subjectStatsArray = Object.entries(subjectStats).map(
      ([subject, stats]) => ({
        subject,
        ...stats,
        rate: (stats.present / stats.total) * 100,
      }),
    );

    return NextResponse.json({
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate,
        uniqueStudents,
        uniqueSubjects,
      },
      monthlyTrend: monthlyTrendArray,
      subjectStats: subjectStatsArray,
    });
  } catch (error) {
    console.error("Error fetching attendance statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance statistics" },
      { status: 500 },
    );
  }
}
