const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Crop = require('../models/Crop');
const Fertilizer = require('../models/Fertilizer');
const Rule = require('../models/Rule');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fertilizer_recommendation';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    const existingCrops = await Crop.countDocuments();
    const existingFertilizers = await Fertilizer.countDocuments();
    const existingRules = await Rule.countDocuments();

    // Only clear seed data (admin user and test user), keep other users
    if (existingUsers > 0) {
      console.log(`Found ${existingUsers} existing user(s). Preserving them...`);
      // Only delete the default seed users if they exist
      await User.deleteMany({ email: { $in: ['admin@fertilizer.com', 'farmer@test.com'] } });
    }
    
    // Handle reset flag
    const resetData = process.argv.includes('--reset');
    
    if (resetData) {
      // User explicitly wants to reset everything
      console.log('⚠️  RESET MODE: Clearing all seed data (crops, fertilizers, rules)...');
      await Crop.deleteMany({});
      await Fertilizer.deleteMany({});
      await Rule.deleteMany({});
      console.log('Cleared all seed data');
    } else {
      // Default: Preserve all existing data, only add missing seed data
      console.log('✅ DEFAULT MODE: Preserving all existing data...');
      console.log('Only adding missing seed data (crops, fertilizers, rules)...');
    }

    // Create admin user (only if doesn't exist)
    let admin = await User.findOne({ email: 'admin@fertilizer.com' });
    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = new User({
        userId: 'ADMIN001',
        name: 'Admin Agronomist',
        email: 'admin@fertilizer.com',
        passwordHash: adminPassword,
        role: 'agronomist',
        phone: '1234567890',
        location: 'Head Office'
      });
      await admin.save();
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists, skipping...');
    }

    // Create test user (only if doesn't exist)
    let user = await User.findOne({ email: 'farmer@test.com' });
    if (!user) {
      const userPassword = await bcrypt.hash('user123', 10);
      user = new User({
        userId: 'USER001',
        name: 'Test Farmer',
        email: 'farmer@test.com',
        passwordHash: userPassword,
        role: 'user',
        phone: '9876543210',
        location: 'Farm Location'
      });
      await user.save();
      console.log('Created test user');
    } else {
      console.log('Test user already exists, skipping...');
    }

    // Create fertilizers
    const fertilizers = [
      {
        fertilizerId: 'FERT001',
        name: 'Urea',
        nutrientComposition: { N: 46, P: 0, K: 0 },
        type: 'Urea',
        instructions: 'Apply in split doses. Avoid direct contact with seeds.'
      },
      {
        fertilizerId: 'FERT002',
        name: 'DAP (Diammonium Phosphate)',
        nutrientComposition: { N: 18, P: 46, K: 0 },
        type: 'DAP',
        instructions: 'Best applied at sowing or early growth stage. Mix well with soil.'
      },
      {
        fertilizerId: 'FERT003',
        name: 'MOP (Muriate of Potash)',
        nutrientComposition: { N: 0, P: 0, K: 60 },
        type: 'Other',
        instructions: 'Apply during flowering and fruiting stages. Avoid during drought.'
      },
      {
        fertilizerId: 'FERT004',
        name: 'NPK 19:19:19',
        nutrientComposition: { N: 19, P: 19, K: 19 },
        type: 'NPK',
        instructions: 'Balanced fertilizer. Apply during vegetative growth stage.'
      },
      {
        fertilizerId: 'FERT005',
        name: 'Organic Compost',
        nutrientComposition: { N: 2, P: 1, K: 1 },
        type: 'Organic',
        instructions: 'Apply before sowing. Mix thoroughly with topsoil.'
      }
    ];

    // Create fertilizers only if they don't already exist
for (const fert of fertilizers) {
    const existing = await Fertilizer.findOne({
        fertilizerId: fert.fertilizerId
    });

    if (!existing) {
        const fertilizer = new Fertilizer(fert);
        await fertilizer.save();
        console.log(`Created fertilizer: ${fert.name}`);
    } else {
        console.log(`Fertilizer ${fert.name} already exists, skipping...`);
    }
}

console.log('Fertilizers check complete');

    // Create crops
    const crops = [
      {
        cropId: 'CROP001',
        cropName: 'Rice',
        typicalNPK: { N: 120, P: 60, K: 60 },
        recommendedFertilizers: [
          { fertilizerId: 'FERT001', dosageRules: { low: 150, medium: 100, high: 50 } },
          { fertilizerId: 'FERT002', dosageRules: { low: 100, medium: 75, high: 50 } },
          { fertilizerId: 'FERT003', dosageRules: { low: 80, medium: 60, high: 40 } }
        ],
        notes: 'Rice requires high nitrogen. Apply in split doses during vegetative and flowering stages.'
      },
      {
        cropId: 'CROP002',
        cropName: 'Wheat',
        typicalNPK: { N: 100, P: 50, K: 50 },
        recommendedFertilizers: [
          { fertilizerId: 'FERT001', dosageRules: { low: 120, medium: 80, high: 50 } },
          { fertilizerId: 'FERT002', dosageRules: { low: 80, medium: 60, high: 40 } },
          { fertilizerId: 'FERT003', dosageRules: { low: 60, medium: 50, high: 30 } }
        ],
        notes: 'Wheat benefits from balanced nutrition. Apply DAP at sowing, Urea during tillering.'
      },
      {
        cropId: 'CROP003',
        cropName: 'Tomato',
        typicalNPK: { N: 150, P: 80, K: 200 },
        recommendedFertilizers: [
          { fertilizerId: 'FERT004', dosageRules: { low: 200, medium: 150, high: 100 } },
          { fertilizerId: 'FERT003', dosageRules: { low: 150, medium: 100, high: 75 } },
          { fertilizerId: 'FERT005', dosageRules: { low: 5000, medium: 3000, high: 2000 } }
        ],
        notes: 'Tomatoes need high potassium for fruit development. Apply during flowering and fruiting.'
      },
      {
        cropId: 'CROP004',
        cropName: 'Corn',
        typicalNPK: { N: 150, P: 60, K: 80 },
        recommendedFertilizers: [
          { fertilizerId: 'FERT001', dosageRules: { low: 180, medium: 120, high: 80 } },
          { fertilizerId: 'FERT002', dosageRules: { low: 100, medium: 75, high: 50 } },
          { fertilizerId: 'FERT003', dosageRules: { low: 80, medium: 60, high: 40 } }
        ],
        notes: 'Corn is a heavy feeder. Apply nitrogen in split doses during vegetative and tasseling stages.'
      }
    ];

    for (const crop of crops) {
      const existing = await Crop.findOne({ cropId: crop.cropId });
      if (!existing) {
        const cropDoc = new Crop(crop);
        await cropDoc.save();
        console.log(`Created crop: ${crop.cropName}`);
      } else {
        console.log(`Crop ${crop.cropName} already exists, skipping...`);
      }
    }
    console.log('Crops check complete');

    // Create rules
    const rules = [
      // Rice rules
      {
        ruleId: 'RULE001',
        cropId: 'CROP001',
        condition: {
          soilPhRange: { min: 5.5, max: 7.0 },
          NPK: { N: 'low', P: null, K: null },
          growthStage: 'vegetative'
        },
        recommendations: [
          { fertilizerId: 'FERT001', quantityPerHa: 150, timing: 'Apply now and again after 30 days' },
          { fertilizerId: 'FERT002', quantityPerHa: 100, timing: 'Apply at sowing' }
        ]
      },
      {
        ruleId: 'RULE002',
        cropId: 'CROP001',
        condition: {
          soilPhRange: { min: 5.5, max: 7.0 },
          NPK: { N: 'medium', P: null, K: null },
          growthStage: 'vegetative'
        },
        recommendations: [
          { fertilizerId: 'FERT001', quantityPerHa: 100, timing: 'Apply now' }
        ]
      },
      {
        ruleId: 'RULE003',
        cropId: 'CROP001',
        condition: {
          soilPhRange: { min: 5.5, max: 7.0 },
          NPK: { N: null, P: 'low', K: null },
          growthStage: 'sowing'
        },
        recommendations: [
          { fertilizerId: 'FERT002', quantityPerHa: 100, timing: 'Apply at sowing' }
        ]
      },
      {
        ruleId: 'RULE004',
        cropId: 'CROP001',
        condition: {
          soilPhRange: { min: 5.5, max: 7.0 },
          NPK: { N: null, P: null, K: 'low' },
          growthStage: 'flowering'
        },
        recommendations: [
          { fertilizerId: 'FERT003', quantityPerHa: 80, timing: 'Apply during flowering stage' }
        ]
      },
      // Wheat rules
      {
        ruleId: 'RULE005',
        cropId: 'CROP002',
        condition: {
          soilPhRange: { min: 6.0, max: 7.5 },
          NPK: { N: 'low', P: null, K: null },
          growthStage: 'vegetative'
        },
        recommendations: [
          { fertilizerId: 'FERT001', quantityPerHa: 120, timing: 'Apply during tillering stage' }
        ]
      },
      {
        ruleId: 'RULE006',
        cropId: 'CROP002',
        condition: {
          soilPhRange: { min: 6.0, max: 7.5 },
          NPK: { N: null, P: 'low', K: null },
          growthStage: 'sowing'
        },
        recommendations: [
          { fertilizerId: 'FERT002', quantityPerHa: 80, timing: 'Apply at sowing' }
        ]
      },
      // Tomato rules
      {
        ruleId: 'RULE007',
        cropId: 'CROP003',
        condition: {
          soilPhRange: { min: 6.0, max: 7.0 },
          NPK: { N: null, P: null, K: 'low' },
          growthStage: 'flowering'
        },
        recommendations: [
          { fertilizerId: 'FERT003', quantityPerHa: 150, timing: 'Apply during flowering and fruiting' },
          { fertilizerId: 'FERT004', quantityPerHa: 150, timing: 'Apply during vegetative growth' }
        ]
      },
      {
        ruleId: 'RULE008',
        cropId: 'CROP003',
        condition: {
          soilPhRange: { min: 6.0, max: 7.0 },
          NPK: { N: 'low', P: null, K: null },
          growthStage: 'vegetative'
        },
        recommendations: [
          { fertilizerId: 'FERT004', quantityPerHa: 200, timing: 'Apply during vegetative growth stage' }
        ]
      },
      // Corn rules
      {
        ruleId: 'RULE009',
        cropId: 'CROP004',
        condition: {
          soilPhRange: { min: 6.0, max: 7.0 },
          NPK: { N: 'low', P: null, K: null },
          growthStage: 'vegetative'
        },
        recommendations: [
          { fertilizerId: 'FERT001', quantityPerHa: 180, timing: 'Apply in split doses during vegetative and tasseling' }
        ]
      }
    ];

    for (const rule of rules) {
      const existing = await Rule.findOne({ ruleId: rule.ruleId });
      if (!existing) {
        const ruleDoc = new Rule(rule);
        await ruleDoc.save();
        console.log(`Created rule: ${rule.ruleId}`);
      } else {
        console.log(`Rule ${rule.ruleId} already exists, skipping...`);
      }
    }
    console.log('Rules check complete');

    console.log('\nSeed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin - Email: admin@fertilizer.com, Password: admin123');
    console.log('User - Email: farmer@test.com, Password: user123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedData();

