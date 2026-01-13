"use server";
import * as z from "zod";
import { LoginSchema } from "@/schemas";
// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const loginUser = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid Fields." };
    }

    const { email, password } = validatedFields.data;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user || !user.password) return null;

    const isValid = await compare(password, user.password);
    if (!isValid) return null;

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
