import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
