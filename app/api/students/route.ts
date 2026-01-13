import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { studentSchema } from "@/lib/validation/student.schema";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        fees: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error retrieving students:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve students" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const studentData = await req.json();

    // Validate input
    const validatedData = studentSchema.parse(studentData);

    // Check if email already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: validatedData.email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: "A student with this email already exists" },
        { status: 400 }
      );
    }

    const {
      studentId,
      firstName,
      lastName,
      gender,
      dob,
      email,
      phone,
      address,
      course,
      enrollmentdate,
      emergencyContactName,
      emergencyContactPhone,
      status,
      imageUrl,
    } = validatedData;
    // Create student
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        gender,
        dob,
        email,
        phone,
        address,
        course,
        enrollmentdate,
        emergencyContactName,
        emergencyContactPhone,
        status,
        imageUrl,
      },
      include: {
        fees: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: student,
      message: "Student created successfully",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    );
  }
}

/*
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No student IDs provided' },
        { status: 400 }
      )
    }
    
    // Get students to delete their images
    const students = await prisma.student.findMany({
      where: { id: { in: ids } },
      select: { profileImage: true }
    })
    
    // Delete profile images
    for (const student of students) {
      if (student.profileImage) {
        await deleteFile(student.profileImage)
      }
    }
    
    // Delete students (fees will cascade delete)
    const deleted = await prisma.student.deleteMany({
      where: { id: { in: ids } }
    })
    
    return NextResponse.json({
      success: true,
      data: { count: deleted.count },
      message: `Successfully deleted ${deleted.count} students`
    })
  } catch (error) {
    console.error('Error deleting students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete students' },
      { status: 500 }
    )
  }
} */
