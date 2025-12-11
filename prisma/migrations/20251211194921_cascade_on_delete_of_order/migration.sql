-- DropForeignKey
ALTER TABLE "OilChangeReminder" DROP CONSTRAINT "OilChangeReminder_orderId_fkey";

-- AddForeignKey
ALTER TABLE "OilChangeReminder" ADD CONSTRAINT "OilChangeReminder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
