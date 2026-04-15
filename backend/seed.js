import User from './models/User.js';
import Setting from './models/Setting.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@aydigital.com',
    username: 'admin',
    password: 'password123',
    role: 'admin',
    phone: '9999999999'
  },
  {
    name: 'Anshul Yadav',
    email: 'anshul@example.com',
    username: 'anshul32',
    password: 'password123',
    role: 'student',
    phone: '8888888888',
    courseInterested: 'Advanced Diploma in Computer Applications (ADCA)'
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    username: 'rahul_dev',
    password: 'password123',
    role: 'student',
    phone: '7777777777',
    courseInterested: 'Web Development (HTML, CSS, JS, React)'
  },
  {
    name: 'Priya Singh',
    email: 'priya@example.com',
    username: 'priya_digital',
    password: 'password123',
    role: 'student',
    phone: '6666666666',
    courseInterested: 'Digital Marketing'
  },
  {
    name: 'Vikram Kumar',
    email: 'vikram@example.com',
    username: 'vikram_k',
    password: 'password123',
    role: 'student',
    phone: '5555555555',
    courseInterested: 'Python Programming'
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding users...');
    for (const u of users) {
      const exists = await User.findOne({ where: { email: u.email } });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Created: ${u.name} (${u.role})`);
      } else {
        console.log(`ℹ️ Already exists: ${u.email}`);
      }
    }

    console.log('🌱 Seeding settings...');
    const defaultSettings = [
      { key: 'contact_phone', value: '+91-XXXXXXXXXX' },
      { key: 'contact_email', value: 'info@aydigitalinstitute.com' },
      { key: 'contact_address', value: 'Gauri Bazar, Deoria, UP - 274202' },
      { key: 'whatsapp_number', value: '+91XXXXXXXXXX' },
      { key: 'opening_hours', value: 'Mon - Sat: 9:00 AM - 6:00 PM' }
    ];

    for (const s of defaultSettings) {
      const exists = await Setting.findOne({ where: { key: s.key } });
      if (!exists) {
        await Setting.create(s);
        console.log(`✅ Created setting: ${s.key}`);
      }
    }

    console.log('\n✨ Seeding complete! You can now log in with these users.');
    console.log('🔑 Default password for all: password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
