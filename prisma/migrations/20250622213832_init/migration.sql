-- CreateTable
CREATE TABLE "bitcoin_prices" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "symbol" TEXT NOT NULL DEFAULT 'BTCUSDT',

    CONSTRAINT "bitcoin_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bitcoin_prices_timestamp_key" ON "bitcoin_prices"("timestamp");