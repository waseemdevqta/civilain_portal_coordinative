const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Citizen = require('../models/Citizen');
const Officer = require('../models/Officer');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const Upvote = require('../models/Upvote');
const connectDB = require('../config/db');

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Ensuring database connection...');
      await connectDB();
    }

    // Officer credentials sourced from .env
    const officerEmail = (process.env.SEED_OFFICER_EMAIL || 'waseemahmedbaloch2004@gmail.com').toLowerCase().trim();
    const officerPassword = process.env.SEED_OFFICER_PASSWORD || 'Officer123!';
    const officerName = process.env.SEED_OFFICER_NAME || 'Waseem Ahmed';

    // Safe upsert of Super Officer in both User and Officer collections
    let existingUser = await User.findOne({ email: officerEmail });
    if (!existingUser) {
      console.log(`[Seed] Creating Super Officer user account: ${officerEmail}`);
      existingUser = await User.create({
        name: officerName,
        email: officerEmail,
        password: officerPassword,
        role: 'officer',
        isSuperOfficer: true,
        designation: 'Chief Municipal Officer',
      });
    } else {
      existingUser.isSuperOfficer = true;
      await existingUser.save();
    }

    let existingOfficer = await Officer.findOne({ email: officerEmail });
    if (!existingOfficer) {
      console.log(`[Seed] Populating officers collection for: ${officerEmail}`);
      await Officer.create({
        _id: existingUser._id,
        name: officerName,
        email: officerEmail,
        password: officerPassword,
        role: 'officer',
        isSuperOfficer: true,
        designation: 'Chief Municipal Officer',
      });
    }

    console.log(`[Seed] Super Officer verified: ${officerEmail}`);
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
