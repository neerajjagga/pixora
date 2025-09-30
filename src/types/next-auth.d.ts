import { User as PrismaUser } from '@prisma/client'
import { Plan } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: Plan;
      usageCount: number;
      usageLimit: number;
    } & DefaultSession["user"];
  }

  interface User extends PrismaUser {}
}