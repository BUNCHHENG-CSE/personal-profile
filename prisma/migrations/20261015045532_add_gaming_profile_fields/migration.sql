-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "discordId" TEXT,
ADD COLUMN     "favoriteGames" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "gamingSetup" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "steamId" TEXT;
