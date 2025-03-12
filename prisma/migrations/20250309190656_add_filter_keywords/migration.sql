-- CreateEnum
CREATE TYPE "KeywordType" AS ENUM ('Title', 'Content');

-- CreateTable
CREATE TABLE "Keyword" (
    "id" SERIAL NOT NULL,
    "type" "KeywordType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);
