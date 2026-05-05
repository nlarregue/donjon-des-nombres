import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        this.createLoadingBar();

        // Wizard spritesheets (93x77 px per frame)
        this.load.spritesheet('wizard_idle',   'assets/sprites/wizard/Wizard_Idle.png',       { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_walk',   'assets/sprites/wizard/Wizard_Side_Walk.png',  { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_walkf',  'assets/sprites/wizard/Wizard_Front_Walk.png', { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_walkb',  'assets/sprites/wizard/Wizard_Back_Walk.png',  { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_attack', 'assets/sprites/wizard/Wizard_1Attack.png',    { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_hurt',   'assets/sprites/wizard/Wizard_Hurt.png',       { frameWidth: 93, frameHeight: 77 });
        this.load.spritesheet('wizard_death',  'assets/sprites/wizard/Wizard_Death.png',      { frameWidth: 93, frameHeight: 77 });

        // Boss demon slime spritesheet (288x160 per frame, 22 cols x 5 rows)
        this.load.spritesheet('demon_slime', 'assets/sprites/boss/demon_slime.png', { frameWidth: 288, frameHeight: 160 });

        // Monster images (loaded as full images, displayed in combat)
        const monsters = ['goblin', 'skeleton', 'slime', 'wolf', 'bat', 'troll',
                          'rat', 'werewolf', 'gnoll', 'kobold', 'crab', 'sahuagin'];
        monsters.forEach(m => this.load.image(m, `assets/sprites/monsters/${m}.png`));

        // Vampire bosses
        this.load.image('vampire_girl',      'assets/sprites/vampires/vampire_girl.png');
        this.load.image('countess_vampire',  'assets/sprites/vampires/countess_vampire.png');
    }

    create() {
        this.createAnimations();
        this.scene.start('MenuScene');
    }

    createLoadingBar() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.text(w / 2, h / 2 - 60, 'Le Donjon des Nombres', {
            fontSize: '28px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const barBg = this.add.rectangle(w / 2, h / 2, 400, 20, 0x333333);
        const bar   = this.add.rectangle(w / 2 - 200, h / 2, 0, 20, 0xf0b429).setOrigin(0, 0.5);

        this.load.on('progress', v => { bar.width = 400 * v; });

        this.add.text(w / 2, h / 2 + 40, 'Chargement...', {
            fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    createAnimations() {
        // Wizard animations
        const wizardAnims = [
            { key: 'wizard_idle_anim',   texture: 'wizard_idle',   frames: 7,  frameRate: 8,  repeat: -1 },
            { key: 'wizard_walk_anim',   texture: 'wizard_walk',   frames: 8,  frameRate: 10, repeat: -1 },
            { key: 'wizard_walkf_anim',  texture: 'wizard_walkf',  frames: 8,  frameRate: 10, repeat: -1 },
            { key: 'wizard_walkb_anim',  texture: 'wizard_walkb',  frames: 8,  frameRate: 10, repeat: -1 },
            { key: 'wizard_attack_anim', texture: 'wizard_attack', frames: 11, frameRate: 12, repeat: 0  },
            { key: 'wizard_hurt_anim',   texture: 'wizard_hurt',   frames: 4,  frameRate: 10, repeat: 0  },
            { key: 'wizard_death_anim',  texture: 'wizard_death',  frames: 11, frameRate: 8,  repeat: 0  }
        ];
        wizardAnims.forEach(a => {
            if (!this.anims.exists(a.key)) {
                this.anims.create({
                    key: a.key,
                    frames: this.anims.generateFrameNumbers(a.texture, { start: 0, end: a.frames - 1 }),
                    frameRate: a.frameRate,
                    repeat: a.repeat
                });
            }
        });

        // Demon slime boss animations (frame layout: idle=0-5, walk=6-17, cleave=18-32, hit=33-37, death=38-59)
        const slimeAnims = [
            { key: 'slime_boss_idle',   start: 0,  end: 5  },
            { key: 'slime_boss_walk',   start: 6,  end: 17 },
            { key: 'slime_boss_attack', start: 18, end: 32 },
            { key: 'slime_boss_hit',    start: 33, end: 37 },
            { key: 'slime_boss_death',  start: 38, end: 59 }
        ];
        slimeAnims.forEach(a => {
            if (!this.anims.exists(a.key)) {
                this.anims.create({
                    key: a.key,
                    frames: this.anims.generateFrameNumbers('demon_slime', { start: a.start, end: a.end }),
                    frameRate: 8,
                    repeat: a.key.includes('idle') || a.key.includes('walk') ? -1 : 0
                });
            }
        });
    }
}
