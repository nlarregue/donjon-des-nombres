export const WORLDS = [
    {
        id: 'forest',
        index: 0,
        name: 'La Forêt',
        bgColor: 0x1a3a0a,
        groundColor: 0x2d5a1b,
        enemies: ['goblin', 'wolf', 'bat'],
        enemyCount: 5,
        boss: 'troll',
        reward: 'Clé de la Forêt',
        rewardIcon: '🗝️',
        unlockNext: 'Le Donjon vous attend...'
    },
    {
        id: 'dungeon',
        index: 1,
        name: 'Le Donjon',
        bgColor: 0x0d0d0d,
        groundColor: 0x3d2b1f,
        enemies: ['skeleton', 'rat', 'slime'],
        enemyCount: 6,
        boss: 'werewolf',
        reward: 'Portail du Donjon',
        rewardIcon: '🌀',
        unlockNext: 'La Montagne vous appelle...'
    },
    {
        id: 'mountain',
        index: 2,
        name: 'La Montagne',
        bgColor: 0x1a1a2e,
        groundColor: 0x4a4a6a,
        enemies: ['gnoll', 'kobold', 'crab'],
        enemyCount: 6,
        boss: 'vampire_girl',
        reward: 'Porte de la Montagne',
        rewardIcon: '🚪',
        unlockNext: 'Le Château se dévoile...'
    },
    {
        id: 'castle',
        index: 3,
        name: 'Le Château',
        bgColor: 0x1a0e0a,
        groundColor: 0x5c3d11,
        enemies: ['ghost', 'goblin', 'skeleton'],
        enemyCount: 7,
        boss: 'countess_vampire',
        reward: 'Chemin du Volcan',
        rewardIcon: '🔥',
        unlockNext: 'Le Volcan vous attend...'
    },
    {
        id: 'volcano',
        index: 4,
        name: 'Le Volcan',
        bgColor: 0x2a0a00,
        groundColor: 0x8b1a00,
        enemies: ['sahuagin', 'slime', 'kobold'],
        enemyCount: 8,
        boss: 'demon_slime',
        reward: 'Victoire !',
        rewardIcon: '🏆',
        unlockNext: null
    }
];
