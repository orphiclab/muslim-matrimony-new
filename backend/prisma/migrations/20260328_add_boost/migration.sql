-- Add boostExpiresAt to ChildProfile for profile boosting feature
ALTER TABLE "ChildProfile" ADD COLUMN IF NOT EXISTS "boostExpiresAt" TIMESTAMP WITH TIME ZONE;
