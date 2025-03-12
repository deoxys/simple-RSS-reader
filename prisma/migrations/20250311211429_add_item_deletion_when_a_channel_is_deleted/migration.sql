-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_channelId_fkey";

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
