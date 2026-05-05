import Phaser from 'phaser';
import { DIFFICULTIES } from '../config/difficulties.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const DIFF_KEYS = ['easy', 'medium', 'hard', 'hell'];

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        // Background gradient
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
        bg.fillRect(0, 0, W, H);

        // Title
        this.add.text(W / 2, 80, 'Le Donjon', {
            fontSize: '52px', color: '#f0b429', fontFamily: 'Georgia, serif',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);
        this.add.text(W / 2, 140, 'des Nombres', {
            fontSize: '38px', color: '#ffffff', fontFamily: 'Georgia, serif',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(W / 2, 200, 'Choisis ta difficulté :', {
            fontSize: '20px', color: '#cccccc', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Difficulty buttons
        DIFF_KEYS.forEach((key, i) => {
            const diff = DIFFICULTIES[key];
            const y = 270 + i * 72;
            this.createDiffButton(W / 2, y, diff);
        });

        // Continue button if save exists
        if (SaveSystem.hasSave()) {
            this.createTextButton(W / 2, H - 50, '▶  Continuer la partie', '#4CAF50', () => {
                const save = SaveSystem.load();
                this.scene.start('WorldScene', save);
            });
        }

        // Decorative stars
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const r = Phaser.Math.FloatBetween(1, 2.5);
            this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
        }
    }

    createDiffButton(x, y, diff) {
        const btn = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 360, 58, diff.color, 0.15)
            .setStrokeStyle(2, diff.color, 0.8)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(-130, 0, diff.name, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const desc = this.add.text(-130, 18, diff.description, {
            fontSize: '12px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0, 0.5);

        const stars = this.add.text(130, 0, diff.emoji, {
            fontSize: '20px'
        }).setOrigin(1, 0.5);

        btn.add([bg, label, desc, stars]);

        bg.on('pointerover', () => {
            bg.setFillStyle(diff.color, 0.4);
            this.tweens.add({ targets: btn, scaleX: 1.03, scaleY: 1.03, duration: 100 });
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(diff.color, 0.15);
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
        });
        bg.on('pointerdown', () => {
            this.registry.set('difficulty', diff.key);
            SaveSystem.clear();
            this.scene.start('CharacterSelectScene');
        });
    }

    createTextButton(x, y, text, color, callback) {
        const t = this.add.text(x, y, text, {
            fontSize: '18px', color, fontFamily: 'Arial',
            backgroundColor: '#ffffff22', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        t.on('pointerover', () => t.setAlpha(0.8));
        t.on('pointerout',  () => t.setAlpha(1));
        t.on('pointerdown', callback);
    }
}
