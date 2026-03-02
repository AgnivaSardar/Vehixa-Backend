import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.alert.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.healthPrediction.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.vehicleApiKey.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.modelMetadata.deleteMany();

  console.log("Cleared existing data");

  // Hash passwords
  const hashedPassword1 = await bcrypt.hash("Demo@12345", 10);
  const hashedPassword2 = await bcrypt.hash("Admin@12345", 10);

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      password: hashedPassword1,
      role: "USER",
      isActive: true,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword2,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Created users:", { user1, adminUser });

  // Create vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      userId: user1.userId,
      vehicleNumber: "DL-01-AB-1234",
      model: "Model S",
      manufacturer: "Tesla",
      year: 2023,
      vehicleType: "SEDAN",
      vin: "WVWZZZ3CZ2E123456",
      engineType: "ELECTRIC_MOTOR",
      fuelType: "ELECTRIC",
      registrationDate: new Date("2023-01-15"),
      status: "ACTIVE",
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      userId: user1.userId,
      vehicleNumber: "MH-02-CD-5678",
      model: "City",
      manufacturer: "Honda",
      year: 2022,
      vehicleType: "SEDAN",
      vin: "HTHBS5H05CA789012",
      engineType: "INLINE",
      fuelType: "PETROL",
      registrationDate: new Date("2022-06-20"),
      status: "ACTIVE",
    },
  });

  console.log("Created vehicles:", { vehicle1, vehicle2 });

  // Create API Keys for vehicles
  const apiKey1 = await prisma.vehicleApiKey.create({
    data: {
      vehicleId: vehicle1.vehicleId,
      apiKey: `vehixa_api_key_${vehicle1.vehicleId.substring(0, 8)}`,
      isActive: true,
    },
  });

  const apiKey2 = await prisma.vehicleApiKey.create({
    data: {
      vehicleId: vehicle2.vehicleId,
      apiKey: `vehixa_api_key_${vehicle2.vehicleId.substring(0, 8)}`,
      isActive: true,
    },
  });

  console.log("Created API keys");

  // Create telemetry data
  const telemetry1 = await prisma.telemetry.create({
    data: {
      vehicleId: vehicle1.vehicleId,
      source: "OBD_DEVICE",
      engineTemp: 94.5,
      batteryVoltage: 12.6,
      rpm: 2500,
      oilPressure: 45.2,
      mileage: 42850,
      vibrationLevel: 0.3,
      fuelEfficiency: 8.5,
      errorCodesCount: 0,
      ambientTemperature: 28.5,
      coolantLevel: 95,
      recordedAt: new Date(),
    },
  });

  const telemetry2 = await prisma.telemetry.create({
    data: {
      vehicleId: vehicle2.vehicleId,
      source: "OBD_DEVICE",
      engineTemp: 87.2,
      batteryVoltage: 13.2,
      rpm: 1800,
      oilPressure: 50.5,
      mileage: 35420,
      vibrationLevel: 0.2,
      fuelEfficiency: 12.8,
      errorCodesCount: 0,
      ambientTemperature: 26.0,
      coolantLevel: 98,
      recordedAt: new Date(),
    },
  });

  console.log("Created telemetry data");

  // Create health predictions
  const healthPred1 = await prisma.healthPrediction.create({
    data: {
      vehicleId: vehicle1.vehicleId,
      telemetryId: telemetry1.telemetryId,
      healthScore: 85,
      status: "HEALTHY",
      failureProbability: 0.05,
      riskLevel: "LOW",
      predictedFailureDays: 120,
      confidenceScore: 0.92,
      modelVersion: "vehixa-heuristic-v1",
    },
  });

  const healthPred2 = await prisma.healthPrediction.create({
    data: {
      vehicleId: vehicle2.vehicleId,
      telemetryId: telemetry2.telemetryId,
      healthScore: 78,
      status: "WARNING",
      failureProbability: 0.15,
      riskLevel: "MODERATE",
      predictedFailureDays: 45,
      confidenceScore: 0.88,
      modelVersion: "vehixa-heuristic-v1",
    },
  });

  console.log("Created health predictions");

  // Create alerts
  const alert1 = await prisma.alert.create({
    data: {
      vehicleId: vehicle1.vehicleId,
      predictionId: healthPred1.predictionId,
      alertType: "warning",
      severity: "LOW",
      title: "Routine Maintenance",
      message: "Vehicle is due for routine maintenance. Schedule service within next 30 days.",
      isResolved: false,
      userUserId: user1.userId,
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      vehicleId: vehicle2.vehicleId,
      predictionId: healthPred2.predictionId,
      alertType: "warning",
      severity: "MEDIUM",
      title: "Engine Oil Change",
      message: "Engine oil level is low. Schedule an oil change within 3 days.",
      isResolved: false,
      userUserId: user1.userId,
    },
  });

  console.log("Created alerts");

  // Create recommendations
  const rec1 = await prisma.recommendation.create({
    data: {
      predictionId: healthPred1.predictionId,
      title: "Oil Filter Replacement",
      description: "Replace oil filter during routine maintenance",
      priority: "MEDIUM",
      actionType: "REPLACE",
      actionDueDays: 30,
    },
  });

  const rec2 = await prisma.recommendation.create({
    data: {
      predictionId: healthPred2.predictionId,
      title: "Engine Oil Change",
      description: "Change engine oil to maintain optimal engine performance",
      priority: "HIGH",
      actionType: "SERVICE",
      actionDueDays: 3,
    },
  });

  console.log("Created recommendations");

  // Create model metadata
  const modelMetadata = await prisma.modelMetadata.create({
    data: {
      version: "vehixa-heuristic-v1",
      algorithm: "Random Forest + Gradient Boosting",
      accuracy: 0.92,
      precisionScore: 0.89,
      recallScore: 0.91,
      f1Score: 0.90,
      trainingDatasetSize: 50000,
      featuresUsed:
        "engineTemp,oilPressure,batteryVoltage,rpm,mileage,vibrationLevel,fuelEfficiency,errorCodesCount",
      trainedOn: new Date("2025-12-01"),
    },
  });

  console.log("Created model metadata");

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 DEMO USER CREDENTIALS:");
  console.log("================================");
  console.log(`User ID: ${user1.userId}`);
  console.log(`Email: ${user1.email}`);
  console.log(`Password: Demo@12345`);
  console.log(`Role: USER`);
  console.log("\n📋 ADMIN USER CREDENTIALS:");
  console.log("================================");
  console.log(`User ID: ${adminUser.userId}`);
  console.log(`Email: ${adminUser.email}`);
  console.log(`Password: Admin@12345`);
  console.log(`Role: ADMIN`);
  console.log("\n🚗 VEHICLES CREATED:");
  console.log("================================");
  console.log(`Vehicle 1: ${vehicle1.vehicleNumber} (Tesla Model S)`);
  console.log(`  Health Score: 85 (HEALTHY)`);
  console.log(`  API Key: ${apiKey1.apiKey}`);
  console.log(`Vehicle 2: ${vehicle2.vehicleNumber} (Honda City)`);
  console.log(`  Health Score: 78 (WARNING)`);
  console.log(`  API Key: ${apiKey2.apiKey}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
