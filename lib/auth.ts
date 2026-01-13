import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import GithubProvider, { GithubProfile } from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// ---------- Extend Built-in NextAuth Types ----------
declare module "next-auth" {
  interface User {
    id: string; // Ensure all 'id' declarations are consistent
    firstname?: string | null;
    lastname?: string | null;
    email: string;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string; // Ensure all 'id' declarations are consistent
      firstname?: string | null;
      lastname?: string | null;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    firstname?: string;
    lastname?: string;
    image?: string;
  }
}

// ---------- Auth Configuration ----------
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // --- Google OAuth ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile", // Ensure we request profile scope
        },
      },
      profile(profile: GoogleProfile) {
        const firstname =
          profile.given_name || profile.name?.split(" ")[0] || "";
        const lastname =
          profile.family_name ||
          profile.name?.split(" ").slice(1).join(" ") ||
          null;

        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          firstname,
          lastname,
          image: profile.picture,
        };
      },
    }),

    // --- GitHub OAuth ---
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email", // Ensure we request user data scope
        },
      },
      profile(profile: GithubProfile) {
        const nameParts = profile.name?.split(" ") || [];
        const firstname = nameParts[0] || profile.login || "";
        const lastname = nameParts.slice(1).join(" ") || null;

        const email =
          profile.email || `${profile.login}@users.noreply.github.com`;

        return {
          id: String(profile.id),
          email: email,
          name: profile.name || profile.login,
          firstname,
          lastname,
          image: profile.avatar_url,
        };
      },
    }),

    // --- Credentials (Email/Password) ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user) throw new Error("No user found with this email");

          if (!user.password) {
            throw new Error(
              "This account uses social login. Please sign in with Google or GitHub."
            );
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) throw new Error("Invalid password");

          return {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  // --- Sessions ---
  session: { strategy: "jwt" },

  // --- Callbacks ---
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Initial sign-in - this should work for all providers
      if (user) {
        token.id = user.id;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
        token.image = user.image;

        // Set name with proper fallbacks
        if (user.firstname && user.lastname) {
          token.name = `${user.firstname} ${user.lastname}`;
        } else {
          token.name = user.name || null;
        }
      }

      // Handle OAuth providers specifically
      if (account) {
        if (account.provider === "google" && profile) {
          const googleProfile = profile as GoogleProfile;

          token.firstname =
            googleProfile.given_name || googleProfile.name?.split(" ")[0] || "";
          token.lastname =
            googleProfile.family_name ||
            googleProfile.name?.split(" ").slice(1).join(" ") ||
            null;
          token.image = googleProfile.picture;
          token.name = googleProfile.name;
        }

        if (account.provider === "github" && profile) {
          const githubProfile = profile as GithubProfile;
          const name = githubProfile.name || githubProfile.login || "";
          const nameParts = name.split(" ");

          token.firstname = nameParts[0] || "";
          token.lastname = nameParts.slice(1).join(" ") || null;
          token.image = githubProfile.avatar_url;
          token.name = name;
        }
      }

      // Profile update from client
      if (trigger === "update" && session?.user) {
        token.firstname = session.user.firstname;
        token.lastname = session.user.lastname;
        token.image = session.user.image;
        token.name = session.user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.firstname = token.firstname ?? null;
        session.user.lastname = token.lastname ?? null;
        session.user.image = token.image ?? null;

        // Build name from firstname/lastname or fallback to token.name
        if (token.firstname || token.lastname) {
          session.user.name = [token.firstname, token.lastname]
            .filter(Boolean)
            .join(" ");
        } else {
          session.user.name = token.name ?? null;
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle relative URLs
      if (url.startsWith("/")) {
        const allowedRoutes = ["/", "/profile", "/settings"];
        const targetUrl = `${baseUrl}${url}`;

        // Redirect to dashboard for auth pages or unknown routes
        if (
          url.includes("/auth/") ||
          !allowedRoutes.some((route) => url.startsWith(route))
        ) {
          return `${baseUrl}/`;
        }

        return targetUrl;
      }

      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default to dashboard
      return `${baseUrl}/`;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/",
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
