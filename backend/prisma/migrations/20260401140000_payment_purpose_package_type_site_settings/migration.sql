-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('SUBSCRIPTION', 'BOOST');

-- AlterTable Payment: purpose, package reference fields (align with schema.prisma)
ALTER TABLE "Payment" ADD COLUMN "purpose" "PaymentPurpose" NOT NULL DEFAULT 'SUBSCRIPTION';
ALTER TABLE "Payment" ADD COLUMN "packageId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "packageDurationDays" INTEGER DEFAULT 30;

-- AlterTable Package: type + discount fields
ALTER TABLE "Package" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'SUBSCRIPTION';
ALTER TABLE "Package" ADD COLUMN "discountPct" DOUBLE PRECISION;
ALTER TABLE "Package" ADD COLUMN "originalPrice" DOUBLE PRECISION;

-- CreateTable SiteSettings (singleton row created by app on first read)
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "siteDiscountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "siteDiscountLabel" TEXT NOT NULL DEFAULT '',
    "siteDiscountActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
