/*
  Warnings:

  - Added the required column `country` to the `Formation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Simulateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Formation" ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Interaction" ALTER COLUMN "type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Simulateur" ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT,
ALTER COLUMN "firstName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
