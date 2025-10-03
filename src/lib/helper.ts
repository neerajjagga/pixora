import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export const checkSession = async () => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    };

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}