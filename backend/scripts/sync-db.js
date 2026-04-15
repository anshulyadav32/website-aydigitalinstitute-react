import dotenv from 'dotenv';
dotenv.config();

const syncDatabase = async () => {
  try {
    // Dynamic imports ensure dotenv.config() has already run
    const { sequelize } = await import('../config/database.js');
    await import('../models/User.js');
    await import('../models/Course.js');
    await import('../models/Inquiry.js');
    await import('../models/Setting.js');

    console.log('Connecting to Supabase Database...');
    await sequelize.authenticate();
    console.log('Connection established successfully.');

    console.log('Synchronizing models...');
    await sequelize.sync({ alter: true });
    
    console.log('Successfully synchronized all models with Supabase!');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
};

syncDatabase();
