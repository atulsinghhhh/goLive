import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import type { Session, User as NextAuthUser } from "next-auth"
import type { AdapterUser } from "next-auth/adapters"
import type { JWT } from "next-auth/jwt"

import dbConnect from "@/lib/db"
import { User } from "@/model/user.model"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.username,
          username: user.username,
          image: user.avatar ?? null,
          bio: user.bio ?? null,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }: { 
      token: JWT & { id?: string; username?: string | null; bio?: string | null; picture?: string | null; name?: string | null }; 
      user?: (NextAuthUser | AdapterUser) & { username?: string | null; bio?: string | null; image?: string | null }; 
      trigger?: "signIn" | "signUp" | "update"; 
      session?: Session & { user: { name?: string | null; username?: string | null; bio?: string | null; image?: string | null } } 
    }) {
      if (user) {
        token.id = user.id
        token.username = user.username ?? null
        token.bio = user.bio ?? null
        token.picture = user.image ?? null
        token.name = user.name ?? user.username ?? null
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name
        token.username = session.user.username
        token.bio = session.user.bio
        token.picture = session.user.image
      }

      return token
    },

    async session({ session, token }: { 
      session: Session & { user?: { id?: string; username?: string | null; bio?: string | null; image?: string | null } }; 
      token: JWT & { id?: string; username?: string | null; bio?: string | null; picture?: string | null; name?: string | null } 
    }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id
        }
        session.user.username = token.username ?? undefined
        session.user.bio = token.bio ?? undefined
        session.user.image = token.picture ?? undefined
        session.user.name = token.name ?? undefined
      }

      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
})
