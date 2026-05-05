import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export default class VictoryScene extends Phaser.Scene {
    constructor() {
        super('VictoryScene');
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0d2137, 0x0d2137, 0x1a4a2e, 0x1a4a2e, 1);
        bg.fillRect(0, 0, W, H);

        // Fireworks effect
        for (let i = 0; i < 30; i++) {
            this.time.delayedCall(i * 100, () => {
                const x = Phaser.Math.Between(50, W - 50);
                const y = Phaser.Math.Between(50, H - 50);
                const star = this.add.text(x, y, '⭐', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0);
                this.tweens.add({
                    targets: star, alpha: 1, scaleX: 1.5, scaleY: 1.5,
                    duration: 300, yoyo: true,
                    onComplete: () => star.destroy()
                });
            });
        }

        this.add.text(W / 2, 100, '🏆', { fontSize: '80px' }).setOrigin(0.5);

        this.add.text(W / 2, 200, 'VICTOIRE !', {
            fontSize: '54px', color: '#f0b429', fontFamily: 'Georgia, serif',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, 275, 'Tu as sauvé le royaume !', {
            fontSize: '24px', color: '#ffffff', fontFamily: 'Georgia, serif'
        }).setOrigin(0.5);

        this.add.text(W / 2, 320, 'Le Seigneur des Ténèbres est vaincu.\nTon courage et tes calculs ont tout changé !', {
            fontSize: '17px', color: '#cccccc', fontFamily: 'Arial',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        this.createBtn(W / 2, 430, '↺  Rejouer', 0xf0b429, () => {
            SaveSystem.clear();
            this.scene.start('MenuScene');
        });

        this.createBtn(W / 2, 500, '🔥  Mode Enfer', 0x8e44ad, () => {
            SaveSystem.clear();
            this.registry.set('difficulty', 'hell');
            this.scene.start('CharacterSelectScene');
        });
    }

    createBtn(x, y, label, color, cb) {
        const btn = this.add.rectangle(x, y, 240, 50, color, 0.85)
            .setStrokeStyle(2, color)
            .setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontSize: '18px', color: '#000000', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setAlpha(0.7));
        btn.on('pointerout',  () => btn.setAlpha(1));
        btn.on('pointerdown', cb);
    }
}
