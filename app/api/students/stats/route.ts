// app/api/students/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get total students count
    const total = await prisma.student.count();

    // Get counts by gender
    const maleCount = await prisma.student.count({
      where: { gender: "MALE" },
    });

    const femaleCount = await prisma.student.count({
      where: { gender: "FEMALE" },
    });

    // Get counts by status
    const activeCount = await prisma.student.count({
      where: { status: "ACTIVE" },
    });

    const inactiveCount = await prisma.student.count({
      where: { status: "INACTIVE" },
    });

    const graduatedCount = await prisma.student.count({
      where: { status: "GRADUATED" },
    });

    const suspendedCount = await prisma.student.count({
      where: { status: "SUSPENDED" },
    });

    return NextResponse.json({
      total,
      male: maleCount,
      female: femaleCount,
      active: activeCount,
      inactive: inactiveCount,
      graduated: graduatedCount,
      suspended: suspendedCount,
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch student statistics" },
      { status: 500 }
    );
  }
}
