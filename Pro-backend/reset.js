import mongoose from 'mongoose';
import { seedDatabase } from './src/utils/seedData.js';
import db from './src/config/db.js';

const resetDatabase = async () => {
  try {
    console.log('🔄 Resetting SkillBridge Database...\n');

    // Connect to database
    await db();

    // Drop the entire database
    console.log('🗑️  Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully');

    // Re-seed the database
    console.log('\n🌱 Re-seeding database...');
    const result = await seedDatabase();

    console.log('\n🎊 Database reset and seeding completed!');
    console.log('📊 Summary:', result);

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Database reset failed:', error.message);
    process.exit(1);
  }
};

resetDatabase();
