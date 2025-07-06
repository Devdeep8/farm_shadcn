/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable turbo/no-undeclared-env-vars */
import NextAuth, { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer"
import { createTransport } from "nodemailer";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
// Import prisma from the shared database package
import { prisma } from "@deva/db";
// Extend types
declare module "next-auth" {
  interface Session {
    user: {
      user_id: string;
      name?: string | null;
      email: string;
      googleId?: string;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    googleId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user_id: string;
    name?: string | null;
    email: string;
    googleId?: string;
    image?: string | null;
  }
}



// Extend types


export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST!,
        port: Number(process.env.EMAIL_SERVER_PORT!),
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier, url, provider }) {
        const transport = createTransport(provider.server);
        const { host } = new URL(url);
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: `Sign in to ${host}\n${url}\n\n`,
          html: `<p>Sign in to <strong>${host}</strong></p><p><a href="${url}">Click here to sign in</a></p>`,
        });
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: any;
      profile: {
        sub: string;
        name?: string;
        email?: string;
        picture?: string;
        [key: string]: any;
      };
    }) {
      if (account?.provider === "google") {
        // Attempt to link existing email user with Google account
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser && !existingUser.googleId) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              googleId: profile.sub,
              name: profile.name,
              image: profile.picture,
            },
          });

          // Link Google account to existing user
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: profile.sub,
              },
            },
            update: {},
            create: {
              userId: existingUser.id,
              provider: "google",
              providerAccountId: profile.sub,
              type: "oauth",
              access_token: account.access_token,
              refresh_token: account.refresh_token ?? null,
              expires_at: account.expires_at ?? null,
              id_token: account.id_token ?? null,
              scope: account.scope ?? null,
              token_type: account.token_type ?? null,
              session_state: account.session_state ?? null,
            },
          });

          return true;
        }
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.user_id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.googleId = user.googleId;
        token.image = user.image;
      } else if (token?.user_id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.user_id },
          select: {
            id: true,
            name: true,
            email: true,
            googleId: true,
            image: true,
          },
        });

        if (dbUser) {
          token.user_id = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.googleId = dbUser.googleId ?? undefined;
          token.image = dbUser.image;
        }
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.user_id = token.user_id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.googleId = token.googleId;
        session.user.image = token.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // redirect error to same login page
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.AUTH_SECRET,
};


export const {
  handlers,
  auth,
  signIn,
  signOut,
}: {
  handlers: any;
  auth: any;
  signIn: any;
  signOut: any;
} = NextAuth(authOptions as NextAuthConfig);
