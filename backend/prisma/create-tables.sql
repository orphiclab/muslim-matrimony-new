DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterestStatus') THEN
    CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "InterestRequest" (
  "id" TEXT NOT NULL,
  "senderProfileId" TEXT NOT NULL,
  "receiverProfileId" TEXT NOT NULL,
  "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterestRequest_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InterestRequest_sender_receiver_key" UNIQUE ("senderProfileId", "receiverProfileId"),
  CONSTRAINT "InterestRequest_sender_fkey" FOREIGN KEY ("senderProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "InterestRequest_receiver_fkey" FOREIGN KEY ("receiverProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProfileView" (
  "id" TEXT NOT NULL,
  "viewerProfileId" TEXT NOT NULL,
  "targetProfileId" TEXT NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfileView_viewer_target_key" UNIQUE ("viewerProfileId", "targetProfileId"),
  CONSTRAINT "ProfileView_viewer_fkey" FOREIGN KEY ("viewerProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "ProfileView_target_fkey" FOREIGN KEY ("targetProfileId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE
);
