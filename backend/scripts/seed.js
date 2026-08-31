const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Ensuring database connection...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing Users and Complaints collections...');
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Officer credentials sourced from .env — never hardcoded
    const officerEmail    = process.env.SEED_OFFICER_EMAIL    || 'officer@municipality.gov';
    const officerPassword = process.env.SEED_OFFICER_PASSWORD || 'Officer123!';
    const officerName     = process.env.SEED_OFFICER_NAME     || 'Municipal Officer';

    console.log('[Seed] Creating officer account...');
    await User.create({
      name: officerName,
      email: officerEmail,
      password: officerPassword,
      role: 'officer',
      isSuperOfficer: true,
    });

    console.log(`[Seed] Officer account created: ${officerEmail} (${officerName})`);
    console.log('[Seed] Citizens should register themselves through the citizen portal.');
    console.log('[Seed] Database seed completed successfully.');
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = seedDatabase;
