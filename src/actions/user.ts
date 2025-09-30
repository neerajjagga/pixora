'use server';

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Plan } from "@prisma/client";
import { getServerSession } from "next-auth";

export async function updateUserPlan(plan: Plan) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            throw new Error("Unauthorized");
        };
        
        if (plan !== "PAID") {
            throw new Error("Invalid plan");
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { plan },
        });

        return updatedUser;
    } catch (err: any) {
        console.error("Failed to update plan:", err.message);
        throw new Error(err.message || "Something went wrong");
    }
}