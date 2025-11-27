/*
  Warnings:

  - The `settings` column on the `Business` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[twilioNumber]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,name]` on the table `MessageTemplate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Business` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MessageTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MissedCall` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AutoResponse" DROP CONSTRAINT "AutoResponse_missedCallId_fkey";

-- DropForeignKey
ALTER TABLE "CustomerResponse" DROP CONSTRAINT "CustomerResponse_missedCallId_fkey";

-- DropForeignKey
ALTER TABLE "MessageTemplate" DROP CONSTRAINT "MessageTemplate_businessId_fkey";

-- DropForeignKey
ALTER TABLE "MissedCall" DROP CONSTRAINT "MissedCall_businessId_fkey";

-- DropIndex
DROP INDEX "AutoResponse_id_key";

-- DropIndex
DROP INDEX "Business_id_key";

-- DropIndex
DROP INDEX "CustomerResponse_id_key";

-- DropIndex
DROP INDEX "MessageTemplate_id_key";

-- DropIndex
DROP INDEX "MissedCall_id_key";

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "settings",
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "MessageTemplate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MissedCall" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "AutoResponse_missedCallId_idx" ON "AutoResponse"("missedCallId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_twilioNumber_key" ON "Business"("twilioNumber");

-- CreateIndex
CREATE INDEX "MessageTemplate_businessId_idx" ON "MessageTemplate"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_businessId_name_key" ON "MessageTemplate"("businessId", "name");

-- CreateIndex
CREATE INDEX "MissedCall_businessId_idx" ON "MissedCall"("businessId");

-- CreateIndex
CREATE INDEX "MissedCall_callerPhone_idx" ON "MissedCall"("callerPhone");

-- CreateIndex
CREATE INDEX "MissedCall_status_idx" ON "MissedCall"("status");

-- AddForeignKey
ALTER TABLE "MissedCall" ADD CONSTRAINT "MissedCall_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoResponse" ADD CONSTRAINT "AutoResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerResponse" ADD CONSTRAINT "CustomerResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
