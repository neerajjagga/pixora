import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id
            }

            const freshUser = await prisma.user.findUnique({
                where: {
                    id: token.id
                }
            });
            if (freshUser) {
                token.email = freshUser.email;
                token.image = freshUser.image;
                token.plan = freshUser.plan;
                token.usageCount = freshUser.usageCount;
                token.usageLimit = freshUser.usageLimit;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.image = token.image;
            session.user.plan = token.plan;
            session.user.usageCount = token.usageCount;
            session.user.usageLimit = token.usageLimit;
            return session;
        },
    },
    pages: {
        signIn: "/"
    }
}