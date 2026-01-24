// src/app/api/quiz/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function generateQuizCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST: Create new quiz
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  try {
    const { title, description, timeLimit, questions } = await request.json();

    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = generateQuizCode();

    const quiz = await prisma.quiz.create({
      data: {
        code,
        title,
        description,
        timeLimit,
        createdById: user.id,
        questions: {
          create: questions.map((q: any, index: number) => ({
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: index,
          })),
        },
      },
    });

    return NextResponse.json({ code, id: quiz.id });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 },
    );
  }
}

// GET: Get quiz by code
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Quiz code is required" },
      { status: 400 },
    );
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { code },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 },
    );
  }
}
