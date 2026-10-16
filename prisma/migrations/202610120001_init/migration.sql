-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('profile_view', 'social_link_click');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "displayName" TEXT NOT NULL DEFAULT 'Your name',
    "username" TEXT NOT NULL DEFAULT 'yourname',
    "bio" TEXT NOT NULL DEFAULT 'A little about you goes here.',
    "status" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "musicUrl" TEXT,
    "trackTitle" TEXT,
    "trackArtist" TEXT,
    "socialLinks" JSONB NOT NULL DEFAULT '[]',
    "seoTitle" TEXT NOT NULL DEFAULT 'Personal profile',
    "seoDescription" TEXT NOT NULL DEFAULT 'A personal profile and links.',
    "publicMessages" BOOLEAN NOT NULL DEFAULT false,
    "messagesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "previewImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moderatedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pagePath" VARCHAR(100) NOT NULL,
    "linkId" VARCHAR(80),
    "visitorToken" VARCHAR(64),

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateBucket" (
    "key" VARCHAR(120) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "Theme_profileId_idx" ON "Theme"("profileId");

-- CreateIndex
CREATE INDEX "Message_status_createdAt_idx" ON "Message"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Message_profileId_createdAt_idx" ON "Message"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventType_occurredAt_idx" ON "AnalyticsEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_visitorToken_occurredAt_idx" ON "AnalyticsEvent"("visitorToken", "occurredAt");

-- CreateIndex
CREATE INDEX "RateBucket_expiresAt_idx" ON "RateBucket"("expiresAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Theme" ADD CONSTRAINT "Theme_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "one_active_theme_per_profile" ON "Theme" ("profileId") WHERE "isActive" = true;
ALTER TABLE "Profile" ADD CONSTRAINT "retention_days_range" CHECK ("retentionDays" BETWEEN 7 AND 365);
ALTER TABLE "Message" ADD CONSTRAINT "message_content_length" CHECK (char_length("content") BETWEEN 2 AND 1000);

CREATE TABLE "rateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequest" BIGINT NOT NULL,
    CONSTRAINT "rateLimit_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "rateLimit_key_key" ON "rateLimit"("key");
