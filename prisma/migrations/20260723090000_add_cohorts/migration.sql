-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('UPCOMING', 'ENROLLMENT_OPEN', 'ONGOING', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "cohortId" TEXT;

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "enrollmentDeadline" TIMESTAMP(3),
    "orientationDate" TIMESTAMP(3),
    "capacity" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "schedule" TEXT NOT NULL DEFAULT '',
    "status" "CohortStatus" NOT NULL DEFAULT 'UPCOMING',
    "instructorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cohort_courseSlug_idx" ON "Cohort"("courseSlug");

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

