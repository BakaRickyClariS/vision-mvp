-- CreateTable
CREATE TABLE "VisionResult" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "resultJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisionResult_pkey" PRIMARY KEY ("id")
);
