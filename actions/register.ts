// app/api/auth/register/route.ts
import * as z from "zod";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/schemas";

export async function POST(values: z.infer<typeof RegisterSchema>) {
  try {
    console.log(values);
    // Validate Input Fields
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    // Extract Validated Values
    const { email, password, firstname, lastname } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { user: user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
