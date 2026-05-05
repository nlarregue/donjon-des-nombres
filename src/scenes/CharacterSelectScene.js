import Phaser from 'phaser';
import { CHARACTERS } from '../config/characters.js';

const CHAR_KEYS = ['wizard', 'archer', 'knight'];

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
        this.selected = null;
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0f3460, 0x0f3460, 0x1a1a2e, 0x1a1a2e, 1);
        bg.fillRect(0, 0, W, H);

        this.add.text(W / 2, 60, 'Choisis ton héros', {
            fontSize: '32px', color: '#f0b429', fontFamily: 'Georgia, serif',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        const difficulty = this.registry.get('difficulty');
        this.add.text(W / 2, 100, `Difficulté : ${this.getDifficultyName(difficulty)}`, {
            fontSize: '16px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0.5);

        CHAR_KEYS.forEach((key, i) => {
            const char = CHARACTERS[key];
            const x = 160 + i * 240;
            this.createCharCard(x, 320, char);
        });

        // Start button (disabled until selection)
        this.startBtn = this.add.text(W / 2, H - 60, 'Commencer l\'aventure  ▶', {
            fontSize: '20px', color: '#888888', fontFamily: 'Arial',
            backgroundColor: '#333333', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setAlpha(0.5);

        // Auto-select wizard (only available one)
        this.selectCharacter('wizard');
    }

    createCharCard(x, y, char) {
        const card = this.add.container(x, y);
        const available = char.available;

        const bg = this.add.rectangle(0, 0, 200, 260, available ? 0x1a3a5a : 0x2a2a2a, 0.8)
            .setStrokeStyle(2, available ? char.color : 0x555555);

        // Character avatar (colored circle placeholder)
        const avatar = this.add.circle(0, -60, 50, char.color, available ? 1 : 0.3);
        const initial = this.add.text(0, -60, char.name[0], {
            fontSize: '36px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(available ? 1 : 0.4);

        const nameText = this.add.text(0, 10, char.name, {
            fontSize: '20px', color: available ? '#ffffff' : '#666666',
            fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        const descText = this.add.text(0, 38, char.description, {
            fontSize: '13px', color: '#aaaaaa', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Stats bars
        this.createStatBar(card, -70, 70, 'PV', char.hp / 120, 0x4CAF50, available);
        this.createStatBar(card, -70, 95, 'ATK', char.damage / 40, 0xF44336, available);

        if (!available) {
            const soon = this.add.text(0, 118, 'Prochainement', {
                fontSize: '12px', color: '#f0b429', fontFamily: 'Arial'
            }).setOrigin(0.5);
            card.add(soon);
        }

        card.add([bg, avatar, initial, nameText, descText]);

        if (available) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover',  () => bg.setFillStyle(0x2a5a8a, 0.9));
            bg.on('pointerout',   () => {
                bg.setFillStyle(this.selected === char.key ? 0x2a6aaa : 0x1a3a5a, 0.8);
            });
            bg.on('pointerdown', () => this.selectCharacter(char.key));
        }

        this.add.existing(card);
        char._card = card;
        char._bg = bg;
    }

    createStatBar(card, x, y, label, ratio, color, active) {
        const labelT = this.add.text(x, y, label, {
            fontSize: '11px', color: active ? '#cccccc' : '#555555', fontFamily: 'Arial'
        }).setOrigin(0, 0.5);

        const barBg = this.add.rectangle(x + 22, y, 90, 8, 0x333333).setOrigin(0, 0.5);
        const bar   = this.add.rectangle(x + 22, y, Math.round(90 * ratio), 8, active ? color : 0x444444).setOrigin(0, 0.5);

        card.add([labelT, barBg, bar]);
    }

    selectCharacter(key) {
        this.selected = key;

        // Reset all card backgrounds
        CHAR_KEYS.forEach(k => {
            const char = CHARACTERS[k];
            if (char._bg && char.available) {
                char._bg.setFillStyle(0x1a3a5a, 0.8);
                char._bg.setStrokeStyle(2, char.color);
            }
        });

        // Highlight selected
        const selChar = CHARACTERS[key];
        if (selChar._bg) {
            selChar._bg.setFillStyle(0x2a6aaa, 0.9);
            selChar._bg.setStrokeStyle(3, 0xffffff);
        }

        // Enable start button
        this.startBtn.setColor('#f0b429').setAlpha(1);
        this.startBtn.setInteractive({ useHandCursor: true });
        this.startBtn.off('pointerdown');
        this.startBtn.on('pointerdown', () => this.startGame());
        this.startBtn.on('pointerover', () => this.startBtn.setAlpha(0.8));
        this.startBtn.on('pointerout',  () => this.startBtn.setAlpha(1));
    }

    startGame() {
        const char = CHARACTERS[this.selected];
        const playerData = {
            characterKey: this.selected,
            hp: char.hp,
            maxHp: char.hp,
            damage: char.damage,
            inventory: [],
            worldIndex: 0
        };
        this.registry.set('playerData', playerData);
        this.scene.start('WorldScene', { worldIndex: 0, playerData });
    }

    getDifficultyName(key) {
        const names = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile', hell: 'Enfer' };
        return names[key] || key;
    }
}
