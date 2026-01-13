import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}

// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * The OAuth account returned from the provider
   */
  interface Account {
    provider: string;
    type: "oauth" | "email" | "credentials";
    providerAccountId: string;
    access_token?: string;
    token_type?: string;
    id_token?: string;
    refresh_token?: string;
    scope?: string;
    expires_at?: number;
    session_state?: string;
  }

  /**
   * Extended User type with firstname/lastname
   */
  interface User {
    id: string;
    firstname?: string | null;
    lastname?: string | null;
    email: string;
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }

  /**
   * Extended Session type
   */
  interface Session {
    user: {
      id: string;
      firstname?: string | null;
      lastname?: string | null;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT type
   */
  interface JWT {
    id: string;
    firstname?: string | null;
    lastname?: string | null;
    image?: string | null;
    name?: string | null;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

// ========== PROFILE TYPES ==========

/**
 * Generic Profile interface for OAuth providers
 */
export interface OAuthProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  [key: string]: any;
}

/**
 * Google-specific profile type
 */
export interface GoogleProfile extends OAuthProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale?: string;
  hd?: string;
}

/**
 * GitHub-specific profile type
 */
export interface GithubProfile extends OAuthProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username?: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists?: number;
  total_private_repos?: number;
  owned_private_repos?: number;
  disk_usage?: number;
  collaborators?: number;
  two_factor_authentication: boolean;
  plan?: {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
  };
}

/**
 * Facebook-specific profile type
 */
export interface FacebookProfile extends OAuthProfile {
  id: string;
  name: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  name_format?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
  short_name?: string;
}

/**
 * Twitter-specific profile type
 */
export interface TwitterProfile extends OAuthProfile {
  id: string;
  name: string;
  screen_name: string;
  email?: string;
  profile_image_url: string;
  profile_image_url_https: string;
  verified: boolean;
}

/**
 * LinkedIn-specific profile type
 */
export interface LinkedInProfile extends OAuthProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  picture: string;
  locale: string;
}

/**
 * Custom credentials profile type
 */
export interface CredentialsProfile {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

// ========== CALLBACK PARAMETER TYPES ==========

/**
 * SignIn callback parameters
 */
export interface SignInCallbackParams {
  user: NextAuth.User;
  account: NextAuth.Account | null;
  profile?: OAuthProfile | GoogleProfile | GithubProfile | any;
  email?: { verificationRequest?: boolean };
  credentials?: Record<string, any>;
}

/**
 * JWT callback parameters
 */
export interface JWTCallbackParams {
  token: NextAuth.JWT;
  user?: NextAuth.User;
  account?: NextAuth.Account | null;
  profile?: OAuthProfile | GoogleProfile | GithubProfile | any;
  trigger?: "signIn" | "signUp" | "update";
  session?: any;
  isNewUser?: boolean;
}

/**
 * Session callback parameters
 */
export interface SessionCallbackParams {
  session: NextAuth.Session;
  token: NextAuth.JWT;
  user: NextAuth.User;
}

/**
 * Redirect callback parameters
 */
export interface RedirectCallbackParams {
  url: string;
  baseUrl: string;
}

// ========== PRISMA DATABASE TYPES ==========

/**
 * Prisma User model type
 */
export type PrismaUser = {
  id: string;
  name?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;
  accounts: PrismaAccount[];
  sessions: PrismaSession[];
};

/**
 * Prisma Account model type
 */
export type PrismaAccount = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
  user: PrismaUser;
};

/**
 * Prisma Session model type
 */
export type PrismaSession = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: PrismaUser;
};

/**
 * Prisma VerificationToken model type
 */
export type PrismaVerificationToken = {
  identifier: string;
  token: string;
  expires: Date;
};

// ========== AUTH CONFIGURATION TYPES ==========

/**
 * Extended auth options with our custom types
 */
export interface CustomAuthOptions extends NextAuth.Options {
  providers: any[];
}

/**
 * Social provider configuration
 */
export interface SocialProviderConfig {
  clientId: string;
  clientSecret: string;
  scope?: string;
  authorization?: {
    params: {
      scope: string;
      [key: string]: any;
    };
  };
  profile?: (profile: GoogleProfile | GithubProfile | any) => any;
}

/**
 * Auth session state for client components
 */
export interface AuthState {
  user: NextAuth.User | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: (data?: any) => Promise<void>;
}

/**
 * SignIn function parameters
 */
export interface SignInParams {
  provider?: string;
  email?: string;
  password?: string;
  redirect?: boolean;
  callbackUrl?: string;
}

/**
 * SignOut function parameters
 */
export interface SignOutParams {
  redirect?: boolean;
  callbackUrl?: string;
}

// ========== COMPONENT PROP TYPES ==========

/**
 * Props for authentication components
 */
export interface AuthComponentProps {
  className?: string;
  variant?: "default" | "minimal" | "icon" | "text";
  redirectUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Props for protected route components
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: string;
}

/**
 * Props for user menu components
 */
export interface UserMenuProps {
  user: NextAuth.User;
  onSignOut?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

// ========== ERROR TYPES ==========

/**
 * Authentication error types
 */
export type AuthErrorType =
  | "OAuthAccountNotLinked"
  | "CredentialsSignin"
  | "OAuthSignin"
  | "OAuthCallback"
  | "OAuthCreateAccount"
  | "EmailSignin"
  | "Callback"
  | "SessionRequired"
  | "Default";

/**
 * Authentication error response
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  code?: string;
  provider?: string;
}

// ========== UTILITY TYPES ==========

/**
 * Type for social provider names
 */
export type SocialProvider =
  | "google"
  | "github"
  | "facebook"
  | "twitter"
  | "linkedin";

/**
 * Type for authentication methods
 */
export type AuthMethod = "credentials" | SocialProvider;

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  name?: string;
}

/**
 * User profile update data
 */
export interface ProfileUpdateData {
  firstname?: string;
  lastname?: string;
  name?: string;
  image?: string;
  email?: string;
}

// ========== API RESPONSE TYPES ==========

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Auth API response
 */
export interface AuthResponse {
  user: NextAuth.User;
  session: NextAuth.Session;
  isNewUser?: boolean;
}

/**
 * Profile API response
 */
export interface ProfileResponse {
  user: NextAuth.User;
}

// ========== RE-EXPORTS FOR CONVENIENCE ==========

export type {
  // NextAuth core types
  DefaultSession,
  DefaultUser,
  DefaultJWT,
} from "next-auth";

export type {
  // NextAuth JWT types
  JWT as NextAuthJWT,
} from "next-auth/jwt";
