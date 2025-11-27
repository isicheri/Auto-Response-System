-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('pending', 'responded', 'recovered', 'lost');

-- CreateEnum
CREATE TYPE "MessageScenario" AS ENUM ('standard', 'afterHours', 'emergency');

-- CreateTable
CREATE TABLE "MissedCall" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CallStatus" NOT NULL DEFAULT 'pending',
    "estimatedValue" DOUBLE PRECISION,

    CONSTRAINT "MissedCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutoResponse" (
    "id" TEXT NOT NULL,
    "missedCallId" TEXT NOT NULL,
    "messageSent" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateUsed" TEXT NOT NULL,

    CONSTRAINT "AutoResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerResponse" (
    "id" TEXT NOT NULL,
    "missedCallId" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasRecovered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomerResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "messageBody" TEXT NOT NULL,
    "scenario" "MessageScenario" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "twilioNumber" TEXT NOT NULL,
    "settings" TEXT,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissedCall_id_key" ON "MissedCall"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutoResponse_id_key" ON "AutoResponse"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerResponse_id_key" ON "CustomerResponse"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerResponse_missedCallId_key" ON "CustomerResponse"("missedCallId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_id_key" ON "MessageTemplate"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_id_key" ON "Business"("id");

-- AddForeignKey
ALTER TABLE "MissedCall" ADD CONSTRAINT "MissedCall_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoResponse" ADD CONSTRAINT "AutoResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerResponse" ADD CONSTRAINT "CustomerResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
