/*
  Warnings:

  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email_verified",
ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL DEFAULT 'IMAGE',
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "providerKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transformed_media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "parentMediaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transformed_media_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."media" ADD CONSTRAINT "media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transformed_media" ADD CONSTRAINT "transformed_media_parentMediaId_fkey" FOREIGN KEY ("parentMediaId") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
