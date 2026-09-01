const User = require('../models/User');
const Citizen = require('../models/Citizen');
const Officer = require('../models/Officer');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const Upvote = require('../models/Upvote');

/**
 * Synchronize and ensure all 5 collections (citizens, officers, staff, complaints, upvotes)
 * are populated and segregated in MongoDB Atlas.
 */
async function syncCollections() {
  try {
    console.log('[DB Sync] Verifying MongoDB collection segregation...');

    // 1. Sync Citizens
    const citizenUsers = await User.find({ role: 'citizen' });
    for (const u of citizenUsers) {
      const exists = await Citizen.findById(u._id);
      if (!exists) {
        await Citizen.create({
          _id: u._id,
          name: u.name,
          email: u.email,
          password: u.password || 'Citizen123!',
          role: 'citizen',
          phone: u.phone || '',
          area: u.area || '',
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        });
      }
    }

    // 2. Sync Officers
    const officerUsers = await User.find({ role: 'officer' });
    for (const o of officerUsers) {
      const exists = await Officer.findById(o._id);
      if (!exists) {
        await Officer.create({
          _id: o._id,
          name: o.name,
          email: o.email,
          password: o.password || 'Officer123!',
          role: 'officer',
          isSuperOfficer: Boolean(o.isSuperOfficer || (process.env.SEED_OFFICER_EMAIL && o.email?.toLowerCase() === process.env.SEED_OFFICER_EMAIL?.toLowerCase())),
          designation: o.designation || 'Municipal Officer',
          department: o.department || 'Public Works & Municipal Services',
          phone: o.phone || '',
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        });
      }
    }

    // 3. Sync Staff / Technicians
    const technicianUsers = await User.find({ role: 'technician' });
    for (const t of technicianUsers) {
      const exists = await Staff.findById(t._id);
      if (!exists) {
        await Staff.create({
          _id: t._id,
          name: t.name,
          email: t.email,
          password: t.password || 'Pass123!',
          role: 'technician',
          designation: t.designation || 'Field Technician',
          phone: t.phone || '',
          assignedOfficer: t.assignedOfficer || null,
          crewType: t.crewType || 'general',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
        });
      }
    }

    // 4. Sync Upvotes from existing complaints
    const complaints = await Complaint.find({ upvotedBy: { $exists: true, $not: { $size: 0 } } });
    for (const comp of complaints) {
      if (Array.isArray(comp.upvotedBy)) {
        for (const userId of comp.upvotedBy) {
          const upvoteExists = await Upvote.findOne({ complaint: comp._id, user: userId });
          if (!upvoteExists) {
            await Upvote.create({
              complaint: comp._id,
              user: userId,
              userModel: 'Citizen',
              createdAt: comp.createdAt,
            }).catch(() => {}); // ignore duplicate index errors safely
          }
        }
      }
    }

    const [citizensCount, officersCount, staffCount, complaintsCount, upvotesCount] = await Promise.all([
      Citizen.countDocuments({}),
      Officer.countDocuments({}),
      Staff.countDocuments({}),
      Complaint.countDocuments({}),
      Upvote.countDocuments({}),
    ]);

    console.log(`[DB Collections Ready]:
  - citizens:    ${citizensCount} records
  - officers:    ${officersCount} records
  - staff:       ${staffCount} records
  - complaints:  ${complaintsCount} records
  - upvotes:     ${upvotesCount} records`);
  } catch (err) {
    console.error('[DB Sync Error]:', err.message);
  }
}

module.exports = syncCollections;
