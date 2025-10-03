'use server';

import { prisma } from "@/lib/db";
import { checkSession } from "@/lib/helper";
import { Plan } from "@prisma/client";

export async function updateUserPlan(plan: Plan) {
    try {
        const user = await checkSession();

        if (plan !== "PAID") {
            throw new Error("Invalid plan");
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                plan,
                usageLimit: 99999
            },
        });

        return updatedUser;
    } catch (err: any) {
        console.error("Failed to update plan:", err.message);
        throw new Error(err.message || "Something went wrong");
    }
}


export const checkUsage = async () => {
    try {
        const user = await checkSession();

        if (user.usageCount >= user.usageLimit) {
            return false;
        }

        return true;

    } catch (err: any) {
        console.error("Failed to check usage:", err.message);
        throw new Error(err.message || "Something went wrong");
    }
}

export const incrementUsageCount = async () => {
    try {
        const user = await checkSession();

        const updatedUser = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                usageCount: {
                    increment: 1
                }
            }
        });

        return updatedUser;

    } catch (err: any) {
        console.error("Failed to increment usage count:", err.message);
        throw new Error(err.message || "Something went wrong");
    }
}