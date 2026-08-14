-- AlterTable
ALTER TABLE "group_invitations" ADD COLUMN     "token" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "group_invitations_token_key" ON "group_invitations"("token");

