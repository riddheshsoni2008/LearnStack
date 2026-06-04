const STORE_ITEMS = [
  {
    id: 'theme_blue',
    name: 'Blue Profile Theme',
    type: 'theme',
    cost: 2,
    icon: '🔵',
    description: 'A calming blue gradient theme for your profile.'
  },
  {
    id: 'theme_neon',
    name: 'Neon Profile Theme',
    type: 'theme',
    cost: 3,
    icon: '⚡',
    description: 'A vibrant cyberpunk neon theme.'
  },
  {
    id: 'theme_galaxy',
    name: 'Galaxy Profile Background',
    type: 'theme',
    cost: 10,
    icon: '🌌',
    description: 'An animated starry galaxy background.'
  },
  {
    id: 'border_gold',
    name: 'Golden Profile Border',
    type: 'border',
    cost: 5,
    icon: '✨',
    description: 'A shining golden border around your avatar.'
  },
  {
    id: 'border_fire',
    name: 'Fire Avatar Frame',
    type: 'border',
    cost: 6,
    icon: '🔥',
    description: 'An animated flaming border for your profile.'
  },
  {
    id: 'title_warrior',
    name: 'Code Warrior Title',
    type: 'title',
    cost: 7,
    icon: '⚔️',
    description: 'Show everyone your fighting spirit.'
  },
  {
    id: 'title_ninja',
    name: 'Code Ninja Title',
    type: 'title',
    cost: 8,
    icon: '🥷',
    description: 'Swift, silent, and deadly with code.'
  }
];

const MYSTERY_BOX_COST = 5;

// Shared mystery box logic (can be used by frontend too if needed, but handled securely in backend)
const MYSTERY_BOX_REWARDS = [
  { type: 'xp', amount: 1, name: '+1 XP', icon: '💎', rarity: 'common', weight: 30 },
  { type: 'xp', amount: 2, name: '+2 XP', icon: '💎', rarity: 'common', weight: 25 },
  { type: 'xp', amount: 3, name: '+3 XP', icon: '💎', rarity: 'common', weight: 15 },
  { type: 'badge', badgeCondition: 'MYSTERY_COMMON', name: 'Special Badge', icon: '🏅', rarity: 'rare', weight: 15 },
  { type: 'badge', badgeCondition: 'MYSTERY_RARE', name: 'Rare Badge', icon: '⭐', rarity: 'rare', weight: 10 },
  { type: 'theme', itemId: 'theme_neon', name: 'Neon Profile Theme', icon: '⚡', rarity: 'epic', weight: 2 },
  { type: 'border', itemId: 'border_fire', name: 'Fire Avatar Frame', icon: '🔥', rarity: 'epic', weight: 2 },
  { type: 'title', itemId: 'title_ninja', name: 'Exclusive Title', icon: '👑', rarity: 'epic', weight: 1 },
];

module.exports = {
  STORE_ITEMS,
  MYSTERY_BOX_COST,
  MYSTERY_BOX_REWARDS
};
