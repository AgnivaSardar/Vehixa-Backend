-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID', 'CNG', 'LPG', 'HYDROGEN');

-- CreateEnum
CREATE TYPE "EngineType" AS ENUM ('INLINE', 'V_TYPE', 'BOXER', 'ROTARY', 'ELECTRIC_MOTOR');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'COUPE', 'CONVERTIBLE', 'WAGON', 'MINIVAN', 'MOTORCYCLE', 'SCOOTER', 'PICKUP_TRUCK', 'LIGHT_TRUCK', 'HEAVY_TRUCK', 'TRAILER', 'BUS', 'SCHOOL_BUS', 'DELIVERY_VAN', 'ELECTRIC', 'HYBRID', 'PLUG_IN_HYBRID', 'CONSTRUCTION', 'AGRICULTURAL', 'EMERGENCY', 'MILITARY', 'FLEET_VEHICLE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'SEVERE');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('INSPECT', 'REPLACE', 'SERVICE', 'MONITOR', 'CALIBRATE', 'UPDATE_SOFTWARE');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TelemetrySource" AS ENUM ('MANUAL_ENTRY', 'SIMULATOR', 'OBD_DEVICE', 'API_PUSH', 'DIGITAL_TWIN');

-- CreateEnum
CREATE TYPE "VehicleOperationalStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleNumber" TEXT,
    "model" TEXT,
    "manufacturer" TEXT,
    "year" INTEGER,
    "vehicleType" "VehicleType",
    "vin" TEXT,
    "engineType" "EngineType",
    "fuelType" "FuelType" NOT NULL,
    "registrationDate" TIMESTAMP(3),
    "status" "VehicleOperationalStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("vehicleId")
);

-- CreateTable
CREATE TABLE "Telemetry" (
    "telemetryId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "source" "TelemetrySource",
    "engineTemp" DOUBLE PRECISION,
    "batteryVoltage" DOUBLE PRECISION,
    "rpm" INTEGER,
    "oilPressure" DOUBLE PRECISION,
    "mileage" DOUBLE PRECISION,
    "vibrationLevel" DOUBLE PRECISION,
    "fuelEfficiency" DOUBLE PRECISION,
    "errorCodesCount" INTEGER,
    "ambientTemperature" DOUBLE PRECISION,
    "coolantLevel" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("telemetryId")
);

-- CreateTable
CREATE TABLE "HealthPrediction" (
    "predictionId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "telemetryId" TEXT NOT NULL,
    "healthScore" DOUBLE PRECISION NOT NULL,
    "status" "HealthStatus" NOT NULL,
    "failureProbability" DOUBLE PRECISION,
    "riskLevel" "RiskLevel",
    "predictedFailureDays" INTEGER,
    "confidenceScore" DOUBLE PRECISION,
    "modelVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthPrediction_pkey" PRIMARY KEY ("predictionId")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "recommendationId" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "priority" "RecommendationPriority",
    "actionType" "ActionType",
    "actionDueDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("recommendationId")
);

-- CreateTable
CREATE TABLE "Alert" (
    "alertId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "alertType" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userUserId" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alertId")
);

-- CreateTable
CREATE TABLE "ModelMetadata" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "algorithm" TEXT,
    "accuracy" DOUBLE PRECISION,
    "precisionScore" DOUBLE PRECISION,
    "recallScore" DOUBLE PRECISION,
    "f1Score" DOUBLE PRECISION,
    "trainingDatasetSize" INTEGER,
    "featuresUsed" TEXT,
    "trainedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModelMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Vehicle_userId_idx" ON "Vehicle"("userId");

-- CreateIndex
CREATE INDEX "Telemetry_vehicleId_recordedAt_idx" ON "Telemetry"("vehicleId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HealthPrediction_telemetryId_key" ON "HealthPrediction"("telemetryId");

-- CreateIndex
CREATE INDEX "HealthPrediction_vehicleId_idx" ON "HealthPrediction"("vehicleId");

-- CreateIndex
CREATE INDEX "HealthPrediction_status_idx" ON "HealthPrediction"("status");

-- CreateIndex
CREATE INDEX "Recommendation_predictionId_idx" ON "Recommendation"("predictionId");

-- CreateIndex
CREATE INDEX "Alert_vehicleId_idx" ON "Alert"("vehicleId");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ModelMetadata_version_key" ON "ModelMetadata"("version");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetry" ADD CONSTRAINT "Telemetry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthPrediction" ADD CONSTRAINT "HealthPrediction_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthPrediction" ADD CONSTRAINT "HealthPrediction_telemetryId_fkey" FOREIGN KEY ("telemetryId") REFERENCES "Telemetry"("telemetryId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "HealthPrediction"("predictionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "HealthPrediction"("predictionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
