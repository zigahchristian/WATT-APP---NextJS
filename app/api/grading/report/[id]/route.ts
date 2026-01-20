import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } },
) {
  try {
    const { studentId } = params;

    // Get student info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get all grades for student
    const grades = await prisma.grading.findMany({
      where: { studentId },
      orderBy: { date: "asc" },
    });

    // Get grade configs
    const configs = await prisma.gradeConfig.findMany();

    // Get attendance
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "asc" },
    });

    // Calculate statistics
    const subjects = [...new Set(grades.map((g) => g.subject))];
    const report = subjects.map((subject) => {
      const subjectGrades = grades.filter((g) => g.subject === subject);
      const config = configs.find((c) => c.subject === subject);

      // Group by assessment type
      const byType = subjectGrades.reduce(
        (acc, grade) => {
          if (!acc[grade.assessmentType]) {
            acc[grade.assessmentType] = [];
          }
          acc[grade.assessmentType].push(grade);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      // Calculate weighted average
      let weightedTotal = 0;
      let weightSum = 0;

      subjectGrades.forEach((grade) => {
        const percentage = (grade.score / grade.maxScore) * 100;
        weightedTotal += percentage * (grade.weight || 1);
        weightSum += grade.weight || 1;
      });

      const average = weightSum > 0 ? weightedTotal / weightSum : 0;

      // Determine grade letter
      const gradingScale = (config?.gradingScale as any) || {
        A: 90,
        B: 80,
        C: 70,
        D: 60,
        F: 0,
      };

      let gradeLetter = "F";
      for (const [letter, minScore] of Object.entries(gradingScale)) {
        if (average >= (minScore as number)) {
          gradeLetter = letter;
          break;
        }
      }

      return {
        subject,
        grades: subjectGrades,
        byType,
        average,
        gradeLetter,
        config: config || null,
        totalAssessments: subjectGrades.length,
        lastAssessment: subjectGrades[subjectGrades.length - 1]?.date || null,
      };
    });

    // Overall statistics
    const overallAverage =
      report.length > 0
        ? report.reduce((sum, subj) => sum + subj.average, 0) / report.length
        : 0;

    // Attendance statistics
    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "Present").length,
      absent: attendance.filter((a) => a.status === "Absent").length,
      late: attendance.filter((a) => a.status === "Late").length,
      excused: attendance.filter((a) => a.status === "Excused").length,
      attendanceRate:
        attendance.length > 0
          ? (attendance.filter((a) => a.status === "Present").length /
              attendance.length) *
            100
          : 0,
    };

    return NextResponse.json({
      student,
      report,
      overall: {
        average: overallAverage,
        totalSubjects: subjects.length,
        totalAssessments: grades.length,
      },
      attendance: attendanceStats,
      attendanceRecords: attendance,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
