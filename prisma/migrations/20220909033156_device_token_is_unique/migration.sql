/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `device_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");
