/**
 * Quick setup script to configure simulator with API key
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setupSimulator() {
  try {
    // Get first vehicle from database
    console.log('\n🔍 Finding vehicles in database...\n');
    
    const vehicle = await prisma.vehicle.findFirst({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!vehicle) {
      console.log('❌ No vehicles found in database.');
      console.log('\nPlease seed the database first:');
      console.log('   npm run seed\n');
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`✅ Found vehicle: ${vehicle.vehicleNumber}`);
    console.log(`   Owner: ${vehicle.user.name} (${vehicle.user.email})`);
    console.log(`   Model: ${vehicle.manufacturer} ${vehicle.model} (${vehicle.year})`);
    console.log(`   ID: ${vehicle.vehicleId}\n`);

    // Check if API key already exists
    const existingKey = await prisma.vehicleApiKey.findFirst({
      where: { vehicleId: vehicle.vehicleId, isActive: true }
    });

    let apiKey;
    
    if (existingKey) {
      console.log('🔑 API key already exists for this vehicle');
      apiKey = existingKey.apiKey;
    } else {
      // Generate new API key
      apiKey = 'veh_' + crypto.randomBytes(20).toString('hex');
      console.log('🔑 Generating new API key...');
      
      await prisma.vehicleApiKey.create({
        data: {
          vehicleId: vehicle.vehicleId,
          apiKey: apiKey,
          isActive: true
        }
      });
      console.log('✅ API key created in database');
    }

    // Update .env file in vehixa-edge
    const envPath = path.join(__dirname, '..', 'vehixa-edge', '.env');
    const envContent = `CLOUD_API_URL=http://localhost:5000/api/v1/telemetry
VEHICLE_ID=${vehicle.vehicleId}
VEHICLE_API_KEY=${apiKey}
SEND_INTERVAL_SECONDS=5
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Updated vehixa-edge/.env file\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        🎉 Simulator Setup Complete!                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('Now you can run the simulator:');
    console.log('   cd ../vehixa-edge');
    console.log('   npm run simulator\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupSimulator();
