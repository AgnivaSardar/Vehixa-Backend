-- CreateTable
CREATE TABLE "VehicleApiKey" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleApiKey_apiKey_key" ON "VehicleApiKey"("apiKey");

-- CreateIndex
CREATE INDEX "VehicleApiKey_vehicleId_idx" ON "VehicleApiKey"("vehicleId");

-- AddForeignKey
ALTER TABLE "VehicleApiKey" ADD CONSTRAINT "VehicleApiKey_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicleId") ON DELETE CASCADE ON UPDATE CASCADE;
