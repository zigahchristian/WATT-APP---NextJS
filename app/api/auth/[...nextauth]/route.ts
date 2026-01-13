import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Explicitly specify Node.js runtime to avoid edge runtime issues
export const runtime = "nodejs";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
