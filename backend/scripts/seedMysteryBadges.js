const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Badge = require('../models/Badge');

dotenv.config({ path: path.join(__dirname, '../.env') });

const mysteryBadges = [
  {
    name: 'Special Badge',
    icon: '🏅',
    description: 'A special badge found inside a Mystery Box.',
    rarity: 'rare',
    condition: 'MYSTERY_COMMON',
    xpBonus: 50
  },
  {
    name: 'Rare Badge',
    icon: '⭐',
    description: 'An exceptionally rare badge discovered in a Mystery Box.',
    rarity: 'rare',
    condition: 'MYSTERY_RARE',
    xpBonus: 100
  }
];

async function seedMysteryBadges() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding Mystery Badges');

    for (const badge of mysteryBadges) {
      const existing = await Badge.findOne({ condition: badge.condition });
      if (!existing) {
        await Badge.create(badge);
        console.log(`✨ Created ${badge.name}`);
      } else {
        console.log(`👍 ${badge.name} already exists`);
      }
    }

    console.log('✅ Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
}

seedMysteryBadges();
