import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { schema } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

// Get the base URL for callback
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.APP_URL || 'http://localhost:3000';
};

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      scope: ["profile", "email"],
      profile: {
        name: "name",
        email: "email",
        image: "picture",
      },
    },
  },
  cookies: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  plugins: [nextCookies()],
});
