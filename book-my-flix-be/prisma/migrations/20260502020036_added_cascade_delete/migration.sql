-- DropForeignKey
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_theaterId_fkey";

-- DropForeignKey
ALTER TABLE "screens" DROP CONSTRAINT "screens_theaterId_fkey";

-- DropForeignKey
ALTER TABLE "seats" DROP CONSTRAINT "seats_screenId_fkey";

-- DropForeignKey
ALTER TABLE "shows" DROP CONSTRAINT "shows_movieId_fkey";

-- DropForeignKey
ALTER TABLE "shows" DROP CONSTRAINT "shows_screenId_fkey";

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "theaters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shows" ADD CONSTRAINT "shows_screenId_fkey" FOREIGN KEY ("screenId") REFERENCES "screens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
