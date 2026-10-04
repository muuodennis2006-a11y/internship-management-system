-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'SUPERVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('SUBMITTED', 'REVIEWED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentNumber" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupervisorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "organization" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupervisorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "placementId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "activities" TEXT NOT NULL,
    "skillsLearned" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'SUBMITTED',
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentNumber_key" ON "StudentProfile"("studentNumber");

-- CreateIndex
CREATE INDEX "StudentProfile_studentNumber_idx" ON "StudentProfile"("studentNumber");

-- CreateIndex
CREATE INDEX "StudentProfile_department_idx" ON "StudentProfile"("department");

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorProfile_userId_key" ON "SupervisorProfile"("userId");

-- CreateIndex
CREATE INDEX "SupervisorProfile_department_idx" ON "SupervisorProfile"("department");

-- CreateIndex
CREATE UNIQUE INDEX "Track_name_key" ON "Track"("name");

-- CreateIndex
CREATE INDEX "Placement_studentId_idx" ON "Placement"("studentId");

-- CreateIndex
CREATE INDEX "Placement_supervisorId_idx" ON "Placement"("supervisorId");

-- CreateIndex
CREATE INDEX "Placement_trackId_idx" ON "Placement"("trackId");

-- CreateIndex
CREATE INDEX "Placement_status_idx" ON "Placement"("status");

-- CreateIndex
CREATE INDEX "Placement_startDate_endDate_idx" ON "Placement"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "WeeklyReport_placementId_idx" ON "WeeklyReport"("placementId");

-- CreateIndex
CREATE INDEX "WeeklyReport_studentId_idx" ON "WeeklyReport"("studentId");

-- CreateIndex
CREATE INDEX "WeeklyReport_status_idx" ON "WeeklyReport"("status");

-- CreateIndex
CREATE INDEX "WeeklyReport_reviewedById_idx" ON "WeeklyReport"("reviewedById");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_studentId_weekNumber_key" ON "WeeklyReport"("studentId", "weekNumber");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorProfile" ADD CONSTRAINT "SupervisorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "SupervisorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "Placement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
