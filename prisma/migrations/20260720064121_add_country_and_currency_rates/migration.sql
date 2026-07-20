-- AlterTable
ALTER TABLE "User" ADD COLUMN "country" TEXT;

-- CreateTable
CREATE TABLE "CurrencyRate" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
