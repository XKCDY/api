-- CreateTable
CREATE TABLE "comic_imgs" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "sourceUrl" VARCHAR(255) NOT NULL,
    "size" VARCHAR(255) NOT NULL,
    "comic_id" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comics" (
    "id" INTEGER NOT NULL,
    "publishedAt" TIMESTAMPTZ(6) NOT NULL,
    "news" TEXT NOT NULL,
    "safeTitle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "sourceUrl" VARCHAR(255) NOT NULL,
    "explainUrl" VARCHAR(255) NOT NULL,
    "interactiveUrl" VARCHAR(255),

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "token" VARCHAR(255) NOT NULL,
    "version" VARCHAR(255),
    "lastComicIdSent" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "comic_imgs_comic_id" ON "comic_imgs"("comic_id");

-- AddForeignKey
ALTER TABLE "comic_imgs" ADD FOREIGN KEY ("comic_id") REFERENCES "comics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
