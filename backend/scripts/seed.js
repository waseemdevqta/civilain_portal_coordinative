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

    console.log('[Seed] Creating demo users...');

    // 1. Create Officer Account
    const officer = await User.create({
      name: 'Waseem Ahmed',
      email: 'waseemahmedbaloch2004@gmail.com',
      password: 'Officer123!',
      role: 'officer',
    });

    // 2. Create Citizen Accounts
    const citizen1 = await User.create({
      name: 'Ahmed Khan',
      email: 'ahmed@civicfix.demo',
      password: 'Citizen123!',
      role: 'citizen',
    });

    const citizen2 = await User.create({
      name: 'Fatima Ali',
      email: 'fatima@civicfix.demo',
      password: 'Citizen123!',
      role: 'citizen',
    });

    const citizen3 = await User.create({
      name: 'Bilal Ahmed',
      email: 'bilal@civicfix.demo',
      password: 'Citizen123!',
      role: 'citizen',
    });

    console.log(`[Seed] Created 1 officer and 3 citizens:`);
    console.log(`  - Officer: waseemahmedbaloch2004@gmail.com / Officer123! (Waseem Ahmed)`);
    console.log(`  - Citizens: ahmed@civicfix.demo, fatima@civicfix.demo, bilal@civicfix.demo / Citizen123!`);

    console.log('[Seed] Creating demo complaints with visual evidence...');

    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };

    const complaintsData = [
      {
        title: 'Massive pothole causing traffic jams near University gate',
        description: 'A deep crater has opened up right before the main university intersection, damaging vehicles and causing heavy delays during rush hour.',
        category: 'road',
        area: 'University Road',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
        status: 'in-progress',
        createdBy: citizen1._id,
        upvotes: 18,
        upvotedBy: [citizen1._id, citizen2._id, citizen3._id],
        officerRemark: 'Road maintenance unit #4 dispatched for asphalt leveling.',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
      },
      {
        title: 'Overflowing commercial dumpster blocking sidewalk',
        description: 'Garbage has not been lifted for 5 days near the fruit market. Waste is spilling onto the street attracting stray animals and creating severe odor.',
        category: 'garbage',
        area: 'Jinnah Road',
        imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen2._id,
        upvotes: 16,
        upvotedBy: [citizen1._id, citizen2._id],
        officerRemark: '',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        title: 'Burst main water pipeline flooding residential lane',
        description: 'Clean drinking water pipe ruptured 2 days ago. Potable water is going to waste while street #3 is submerged.',
        category: 'water',
        area: 'Satellite Town',
        imageUrl: 'https://images.unsplash.com/photo-1542010589005-d10adc383ceb?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen3._id,
        upvotes: 12,
        upvotedBy: [citizen2._id, citizen3._id],
        officerRemark: '',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        title: 'Dangling high voltage power line near school',
        description: 'High tension cable broke loose from pole #12 and is hanging within reach of pedestrians right outside the girls high school.',
        category: 'electricity',
        area: 'Sariab Road',
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
        status: 'in-progress',
        createdBy: citizen1._id,
        upvotes: 22,
        upvotedBy: [citizen1._id, citizen2._id, citizen3._id],
        officerRemark: 'Emergency electrical team on-site with bucket truck.',
        createdAt: daysAgo(4),
        updatedAt: daysAgo(2),
      },
      {
        title: 'Open manhole posing severe hazard to motorists',
        description: 'Manhole cover was stolen over the weekend. Temporary branches placed by locals are barely visible at night.',
        category: 'road',
        area: 'Brewery Road',
        imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
        status: 'resolved',
        createdBy: citizen2._id,
        upvotes: 14,
        upvotedBy: [citizen1._id, citizen2._id],
        officerRemark: 'Heavy duty concrete cover installed and sealed.',
        feedbackGiven: true,
        feedbackPending: false,
        feedbackRating: 5,
        feedbackComment: 'Fixed within 24 hours. Excellent response from the municipal team!',
        resolvedAt: daysAgo(1),
        createdAt: daysAgo(5),
        updatedAt: daysAgo(1),
      },
      {
        title: 'Streetlights malfunctioning throughout block 4',
        description: 'The entire block has been in complete darkness for over a week, leading to security concerns.',
        category: 'electricity',
        area: 'Satellite Town',
        imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen3._id,
        upvotes: 6,
        upvotedBy: [citizen3._id],
        officerRemark: '',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        title: 'Illegal construction debris dumped along green belt',
        description: 'Several truckloads of concrete rubble dumped on the median green belt opposite the petrol pump.',
        category: 'garbage',
        area: 'Airport Road',
        imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
        status: 'in-progress',
        createdBy: citizen1._id,
        upvotes: 4,
        upvotedBy: [citizen1._id],
        officerRemark: 'Sanitation notice issued to adjacent contractor; removal scheduled.',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(0),
      },
      {
        title: 'Contaminated tap water with sewage smell',
        description: 'Tap water coming into homes in sector B has sewage contamination and pungent smell since yesterday morning.',
        category: 'water',
        area: 'Brewery Road',
        imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen2._id,
        upvotes: 19,
        upvotedBy: [citizen1._id, citizen2._id, citizen3._id],
        officerRemark: '',
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      {
        title: 'Traffic signal failure at main junction',
        description: 'Traffic lights blinking yellow continuously, creating gridlock during school and office hours.',
        category: 'other',
        area: 'Jinnah Road',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df57046475a?w=800&auto=format&fit=crop&q=80',
        resolutionImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
        status: 'resolved',
        createdBy: citizen1._id,
        upvotes: 8,
        upvotedBy: [citizen1._id, citizen3._id],
        officerRemark: 'Traffic controller circuit board replaced and calibrated.',
        feedbackGiven: true,
        feedbackPending: false,
        feedbackRating: 4,
        feedbackComment: 'Signal is operating normally again.',
        resolvedAt: daysAgo(2),
        createdAt: daysAgo(6),
        updatedAt: daysAgo(2),
      },
      {
        title: 'Stray dog pack menace near central public park',
        description: 'Pack of aggressive stray dogs harassing morning walkers and children visiting the park.',
        category: 'other',
        area: 'Cantt',
        imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen3._id,
        upvotes: 3,
        upvotedBy: [citizen3._id],
        officerRemark: '',
        createdAt: daysAgo(0),
        updatedAt: daysAgo(0),
      },
      {
        title: 'Garbage container missing after road widening work',
        description: 'The community dumpster was removed during road construction and never replaced, forcing residents to throw garbage in the open.',
        category: 'garbage',
        area: 'Satellite Town',
        imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
        status: 'pending',
        createdBy: citizen2._id,
        upvotes: 7,
        upvotedBy: [citizen1._id, citizen2._id],
        officerRemark: '',
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      {
        title: 'Damaged speed breaker causing vehicle undercarriage scraping',
        description: 'Asphalt speed hump has disintegrated leaving sharp metal reinforcing rods exposed on the road.',
        category: 'road',
        area: 'University Road',
        imageUrl: 'https://images.unsplash.com/photo-1545158826-646e7f12e75e?w=800&auto=format&fit=crop&q=80',
        status: 'in-progress',
        createdBy: citizen3._id,
        upvotes: 11,
        upvotedBy: [citizen2._id, citizen3._id],
        officerRemark: 'Road crew scheduled for weekend re-paving.',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(1),
      },
    ];

    await Complaint.insertMany(complaintsData);
    console.log(`[Seed] Successfully inserted ${complaintsData.length} complaints!`);
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
