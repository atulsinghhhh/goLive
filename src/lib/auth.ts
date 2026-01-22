import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import Credentials from "next-auth/providers/credentials"
import { clientPromise } from "@/lib/db"
import { User } from "@/model/user.model"
import dbConnect from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();
        
        try {
            const user = await User.findOne({ email: credentials.email });
            
            if (!user) {
                return null;
            }

            const isValid = await bcrypt.compare(
                credentials.password as string, 
                user.password
            );

            if (!isValid) {
                return null;
            }

            return {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                name: user.username,
                image: user.avatar
            };
        } catch (error) {
            console.error("Auth error:", error);
            return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.username = user.username;
        token.picture = user.image;
        token.bio = (user as any).bio;
      }
      
      if (trigger === "update" && session?.user) {
          token.name = session.user.name;
          token.username = session.user.username;
          token.picture = session.user.image;
          // token.bio = session.user.bio; // session.user might not have bio unless typed?
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name;
        session.user.username=token.username
        session.user.image = token.picture;
        session.user.bio = token.bio;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', 
    error: '/login',
  }

})