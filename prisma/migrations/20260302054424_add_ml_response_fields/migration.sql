-- AlterTable
ALTER TABLE "HealthPrediction" ADD COLUMN     "diagnosticAnalysis" TEXT,
ADD COLUMN     "topInfluentialFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[];
