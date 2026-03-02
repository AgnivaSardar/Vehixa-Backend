/**
 * Helper script to list available vehicles from database
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║        Available Vehicles in Database                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (vehicles.length === 0) {
      console.log('❌ No vehicles found in database.');
      console.log('\nPlease seed the database first:');
      console.log('   npm run seed\n');
    } else {
      vehicles.forEach((v, i) => {
        console.log(`${i + 1}. Vehicle: ${v.vehicleNumber}`);
        console.log(`   ID: ${v.vehicleId}`);
        console.log(`   Owner: ${v.user.name} (${v.user.email})`);
        console.log(`   Model: ${v.manufacturer} ${v.model} (${v.year})\n`);
      });

      console.log('─────────────────────────────────────────────────────────────');
      console.log('To generate API key for a vehicle, run:');
      console.log('   cd ../vehixa-edge');
      console.log('   node setup-apikey.js <VEHICLE_ID>\n');
    }

  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Backend is running');
    console.error('  2. Database is connected');
    console.error('  3. DATABASE_URL is set in .env\n');
  } finally {
    await prisma.$disconnect();
  }
}

getVehicles();
