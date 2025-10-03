'use server';
import { prisma } from "@/lib/db";
import { checkSession } from "@/lib/helper";
import { MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";

type CreateMediaData = {
    url: string,
    type: MediaType,
    height: number,
    width: number,
    size: number,
    providerKey: string,
}

export const createMedia = async (data: CreateMediaData) => {
    try {
        const user = await checkSession();

        const [media] = await prisma.$transaction([
            prisma.media.create({
                data: {
                    ...data,
                    userId: user.id
                }
            }),
            // update the usage count
            prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    usageCount: {
                        increment: 1
                    }
                }
            })
        ]);

        revalidatePath('/studio');

        return media;

    } catch (err: any) {
        console.error("Failed to create media:", err.message);
        throw new Error(err.message || "Somethg went wrong");
    }
}

export const getUserMedia = async () => {
    try {
        const user = await checkSession();

        const media = await prisma.media.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return media;

    } catch (err: any) {
        console.error("Failed to get media:", err.message);
        throw new Error(err.message || "Something went wrong");
    }
}