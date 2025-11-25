-- CreateTable
CREATE TABLE "MissedCall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "callerName" TEXT NOT NULL,
    "callerPhone" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "estimatedValue" REAL,
    CONSTRAINT "MissedCall_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AutoResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "missedCallId" TEXT NOT NULL,
    "messageSent" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateUsed" TEXT NOT NULL,
    CONSTRAINT "AutoResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "missedCallId" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasRecovered" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "CustomerResponse_missedCallId_fkey" FOREIGN KEY ("missedCallId") REFERENCES "MissedCall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "messageBody" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MessageTemplate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "twilioNumber" TEXT NOT NULL,
    "settings" TEXT
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
