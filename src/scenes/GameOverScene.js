import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillStyle(0x1a0000);
        bg.fillRect(0, 0, W, H);

        this.add.text(W / 2, H / 2 - 100, '💀', { fontSize: '80px' }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 - 10, 'GAME OVER', {
            fontSize: '48px', color: '#e74c3c', fontFamily: 'Georgia, serif',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 + 60, 'Tu as été vaincu... mais tu peux réessayer !', {
            fontSize: '18px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Retry button
        this.createBtn(W / 2, H / 2 + 130, '↺  Recommencer depuis ce monde', 0x2980b9, () => {
            const save = SaveSystem.load();
            if (save) {
                save.playerData.hp = save.playerData.maxHp;
                this.scene.start('WorldScene', { ...save, defeatedEnemies: [] });
            } else {
                this.scene.start('MenuScene');
            }
        });

        // Return to menu
        this.createBtn(W / 2, H / 2 + 195, '🏠  Menu principal', 0x555555, () => {
            SaveSystem.clear();
            this.scene.start('MenuScene');
        });
    }

    createBtn(x, y, label, color, cb) {
        const btn = this.add.rectangle(x, y, 340, 50, color, 0.8)
            .setStrokeStyle(2, color)
            .setInteractive({ useHandCursor: true });
        this.add.text(x, y, label, {
            fontSize: '17px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);
        btn.on('pointerover', () => btn.setFillStyle(color, 1));
        btn.on('pointerout',  () => btn.setFillStyle(color, 0.8));
        btn.on('pointerdown', cb);
    }
}
