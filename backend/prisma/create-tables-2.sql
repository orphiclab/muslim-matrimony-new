CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");

CREATE TABLE IF NOT EXISTS "BlockedProfile" (
  "id" TEXT NOT NULL,
  "blockerProfileId" TEXT NOT NULL,
  "blockedProfileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlockedProfile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BlockedProfile_blocker_blocked_key" UNIQUE ("blockerProfileId", "blockedProfileId"),
  CONSTRAINT "BlockedProfile_blocker_fkey" FOREIGN KEY ("blockerProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "BlockedProfile_blocked_fkey" FOREIGN KEY ("blockedProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL,
  "reporterProfileId" TEXT NOT NULL,
  "reportedProfileId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "details" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Report_reporter_fkey" FOREIGN KEY ("reporterProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "Report_reported_fkey" FOREIGN KEY ("reportedProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE
);
