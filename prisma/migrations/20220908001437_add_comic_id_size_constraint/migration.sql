/*
  Warnings:

  - A unique constraint covering the columns `[comic_id,size]` on the table `comic_imgs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "comic_imgs" DROP CONSTRAINT "comic_imgs_comic_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "comic_imgs_comic_id_size_key" ON "comic_imgs"("comic_id", "size");

-- AddForeignKey
ALTER TABLE "comic_imgs" ADD CONSTRAINT "comic_imgs_comic_id_fkey" FOREIGN KEY ("comic_id") REFERENCES "comics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
