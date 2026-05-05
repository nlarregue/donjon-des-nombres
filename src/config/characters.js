export const CHARACTERS = {
    wizard: {
        key: 'wizard',
        name: 'Sorcier',
        description: 'Puissant mais fragile',
        hp: 60,
        maxHp: 60,
        damage: 40,
        color: 0x8E44AD,
        available: true,
        animations: {
            idle: { key: 'wizard_idle', frameRate: 8, repeat: -1 },
            walk: { key: 'wizard_walk', frameRate: 8, repeat: -1 },
            attack: { key: 'wizard_attack', frameRate: 10, repeat: 0 },
            hurt: { key: 'wizard_hurt', frameRate: 8, repeat: 0 },
            death: { key: 'wizard_death', frameRate: 8, repeat: 0 }
        }
    },
    archer: {
        key: 'archer',
        name: 'Archer',
        description: 'Equilibré et agile',
        hp: 80,
        maxHp: 80,
        damage: 25,
        color: 0x27AE60,
        available: false,
        comingSoon: true
    },
    knight: {
        key: 'knight',
        name: 'Chevalier',
        description: 'Solide et résistant',
        hp: 120,
        maxHp: 120,
        damage: 15,
        color: 0x2980B9,
        available: false,
        comingSoon: true
    }
};
