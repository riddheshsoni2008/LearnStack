const STORE_ITEMS = [
  {
    id: 'theme_blue',
    name: 'Blue Profile Theme',
    type: 'theme',
    cost: 5,
    icon: '🔵',
    description: 'A calming blue gradient theme for your profile.'
  },
  {
    id: 'theme_neon',
    name: 'Neon Profile Theme',
    type: 'theme',
    cost: 5,
    icon: '⚡',
    description: 'A vibrant cyberpunk neon theme.'
  },
  {
    id: 'theme_galaxy',
    name: 'Galaxy Profile Background',
    type: 'theme',
    cost: 25,
    icon: '🌌',
    description: 'An animated starry galaxy background.'
  },
  {
    id: 'border_gold',
    name: 'Golden Profile Border',
    type: 'border',
    cost: 10,
    icon: '✨',
    description: 'A shining golden border around your avatar.'
  },
  {
    id: 'border_fire',
    name: 'Fire Avatar Frame',
    type: 'border',
    cost: 10,
    icon: '🔥',
    description: 'An animated flaming border for your profile.'
  },
  {
    id: 'title_warrior',
    name: 'Code Warrior Title',
    type: 'title',
    cost: 15,
    icon: '⚔️',
    description: 'Show everyone your fighting spirit.'
  },
  {
    id: 'title_ninja',
    name: 'Code Ninja Title',
    type: 'title',
    cost: 15,
    icon: '🥷',
    description: 'Swift, silent, and deadly with code.'
  }
];

const MYSTERY_BOX_COST = 50; // Costs 50 XP

// Shared mystery box logic (can be used by frontend too if needed, but handled securely in backend)
const MYSTERY_BOX_REWARDS = [
  // Common (60%)
  { type: 'theme', itemId: 'theme_blue', name: 'Blue Profile Theme', icon: '🔵', rarity: 'common', weight: 30 },
  { type: 'border', itemId: 'border_gold', name: 'Golden Profile Border', icon: '✨', rarity: 'common', weight: 30 },
  
  // Rare (25%)
  { type: 'diamond', amount: 1, name: '1 Diamond', icon: '💎', rarity: 'rare', weight: 15 },
  { type: 'badge', badgeCondition: 'MYSTERY_COMMON', name: 'Special Badge', icon: '🏅', rarity: 'rare', weight: 10 },
  
  // Epic (10%)
  { type: 'diamond', amount: 3, name: '3 Diamonds', icon: '💎', rarity: 'epic', weight: 4 },
  { type: 'badge', badgeCondition: 'MYSTERY_RARE', name: 'Rare Badge', icon: '⭐', rarity: 'epic', weight: 4 },
  { type: 'theme', itemId: 'theme_neon', name: 'Neon Profile Theme', icon: '⚡', rarity: 'epic', weight: 2 },
  
  // Legendary (5%)
  { type: 'diamond', amount: 10, name: '10 Diamonds', icon: '💎', rarity: 'legendary', weight: 2 },
  { type: 'title', itemId: 'title_ninja', name: 'Exclusive Title', icon: '👑', rarity: 'legendary', weight: 2 },
  { type: 'theme', itemId: 'theme_galaxy', name: 'Galaxy Background', icon: '🌌', rarity: 'legendary', weight: 1 },
];

module.exports = {
  STORE_ITEMS,
  MYSTERY_BOX_COST,
  MYSTERY_BOX_REWARDS
};
