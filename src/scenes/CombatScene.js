import Phaser from 'phaser';
import { generateQuestion, generateChoices } from '../systems/MathEngine.js';
import { DIFFICULTIES } from '../config/difficulties.js';

const RPG_SPRITE_KEYS = new Set([
    'gobelin-lance', 'gobelin-hache', 'gobelin-arc', 'gobelin-roi', 'gobelin-sorcier',
    'squelette', 'squelette-noir', 'fantome-bleu', 'fantome-noir', 'boss01'
]);

export default class CombatScene extends Phaser.Scene {
    constructor() {
        super('CombatScene');
    }

    init(data) {
        this.enemyData       = data.enemyData;
        this.playerData      = { ...data.playerData };
        this.difficulty      = data.difficulty;
        this.worldIndex      = data.worldIndex;
        this.defeatedEnemies = data.defeatedEnemies;
        this.enemyHp         = this.enemyData.hp;
        this.questionCount   = 0;
        this.inputLocked     = false;
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        this.drawBackground(W, H);
        this.drawCombatUI(W, H);
        this.askQuestion();
    }

    drawBackground(W, H) {
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a1a, 0.95);
        bg.fillRect(0, 0, W, H);

        // Decorative border
        const panel = this.add.graphics();
        panel.lineStyle(2, 0xf0b429, 0.6);
        panel.strokeRect(20, 20, W - 40, H - 40);
    }

    drawCombatUI(W, H) {
        // Enemy side (right)
        const enemyColor = this.enemyData.color ?? 0xff4444;
        const isBoss = this.enemyData.isBoss;

        const type = this.enemyData.type;

        if (type === 'demon_slime' && this.textures.exists('demon_slime')) {
            this.enemySprite = this.add.sprite(W - 160, 175, 'demon_slime', 0)
                .setScale(0.6).setFlipX(true);
            this.enemySprite.anims.play('slime_boss_idle');
        } else if (RPG_SPRITE_KEYS.has(type)) {
            const scale = type === 'boss01' ? 3.5 : 4.5;
            this.enemySprite = this.add.sprite(W - 160, 165, type, 1)
                .setScale(scale).setFlipX(true);
            this.enemySprite.anims.play(`${type}_idle`);
        } else {
            this.enemySprite = this.add.circle(W - 160, 160, isBoss ? 70 : 55, enemyColor);
            this.add.text(W - 160, 160, this.getEnemyEmoji(type), {
                fontSize: isBoss ? '52px' : '40px'
            }).setOrigin(0.5);
        }

        // Enemy name
        this.add.text(W - 160, isBoss ? 260 : 230, this.enemyData.isBoss ? '⚠ BOSS' : this.enemyData.type, {
            fontSize: '14px', color: isBoss ? '#ff4444' : '#ffffff',
            fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Enemy HP bar
        this.enemyHpBg  = this.add.rectangle(W - 240, 285, 160, 14, 0x333333).setOrigin(0);
        this.enemyHpBar = this.add.rectangle(W - 240, 285, 160, 14, 0xe74c3c).setOrigin(0);
        this.enemyHpTxt = this.add.text(W - 160, 302, `${this.enemyHp}/${this.enemyData.hp}`, {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Player side (left)
        const playerColor = 0x8E44AD;
        this.add.circle(160, 160, 55, playerColor);
        this.add.text(160, 160, '🧙', { fontSize: '40px' }).setOrigin(0.5);

        this.add.text(160, 228, 'Sorcier', {
            fontSize: '14px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.playerHpBg  = this.add.rectangle(80, 245, 160, 14, 0x333333).setOrigin(0);
        this.playerHpBar = this.add.rectangle(80, 245, 160, 14, 0x27ae60).setOrigin(0);
        this.playerHpTxt = this.add.text(160, 262, `${this.playerData.hp}/${this.playerData.maxHp}`, {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // VS text
        this.add.text(W / 2, 170, 'VS', {
            fontSize: '28px', color: '#f0b429', fontFamily: 'Georgia', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Question area (bottom half)
        this.questionPanel = this.add.rectangle(W / 2, H / 2 + 60, W - 60, 280, 0x1a1a2e, 0.9)
            .setStrokeStyle(1, 0x4444aa);

        this.questionText = this.add.text(W / 2, H / 2 + 10, '', {
            fontSize: '36px', color: '#f0b429', fontFamily: 'Georgia, serif', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.feedbackText = this.add.text(W / 2, H / 2 + 60, '', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Answer area (created per question)
        this.answerContainer = this.add.container(0, 0);
    }

    askQuestion() {
        if (this.inputLocked) return;
        this.inputLocked = false;

        this.answerContainer.removeAll(true);
        this.feedbackText.setText('');

        const { text, answer } = generateQuestion(this.difficulty);
        this.currentAnswer = answer;
        this.questionText.setText(text + ' = ?');

        const mode = DIFFICULTIES[this.difficulty].inputMode;

        if (mode === 'choice') {
            this.showChoiceButtons(answer);
        } else {
            this.showTextInput();
        }
    }

    showChoiceButtons(answer) {
        const { width: W, height: H } = this.cameras.main;
        const choices = generateChoices(answer);
        const colors  = [0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad];

        choices.forEach((choice, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = W / 2 - 110 + col * 220;
            const y = H / 2 + 100 + row * 70;

            const btn = this.add.rectangle(x, y, 190, 52, colors[i], 0.8)
                .setStrokeStyle(2, colors[i])
                .setInteractive({ useHandCursor: true });

            const txt = this.add.text(x, y, String(choice), {
                fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.on('pointerover', () => btn.setFillStyle(colors[i], 1));
            btn.on('pointerout',  () => btn.setFillStyle(colors[i], 0.8));
            btn.on('pointerdown', () => {
                if (!this.inputLocked) this.submitAnswer(choice);
            });

            this.answerContainer.add([btn, txt]);
        });
    }

    showTextInput() {
        const { width: W, height: H } = this.cameras.main;

        this.typedAnswer = '';
        this.typedDisplay = this.add.text(W / 2, H / 2 + 95, '_', {
            fontSize: '36px', color: '#f0b429', fontFamily: 'Arial', fontStyle: 'bold',
            backgroundColor: '#1a1a3a', padding: { x: 20, y: 8 }
        }).setOrigin(0.5);

        const confirmBtn = this.add.rectangle(W / 2, H / 2 + 160, 160, 44, 0x27ae60, 0.9)
            .setStrokeStyle(2, 0x27ae60)
            .setInteractive({ useHandCursor: true });

        const confirmTxt = this.add.text(W / 2, H / 2 + 160, 'Valider ✓', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.answerContainer.add([this.typedDisplay, confirmBtn, confirmTxt]);

        this.input.keyboard.off('keydown');
        this.input.keyboard.on('keydown', (e) => {
            if (this.inputLocked) return;
            if (e.key >= '0' && e.key <= '9' && this.typedAnswer.length < 4) {
                this.typedAnswer += e.key;
            } else if (e.key === 'Backspace') {
                this.typedAnswer = this.typedAnswer.slice(0, -1);
            } else if (e.key === 'Enter' && this.typedAnswer.length > 0) {
                this.submitAnswer(parseInt(this.typedAnswer));
            }
            this.typedDisplay.setText(this.typedAnswer || '_');
        });

        confirmBtn.on('pointerdown', () => {
            if (!this.inputLocked && this.typedAnswer.length > 0) {
                this.submitAnswer(parseInt(this.typedAnswer));
            }
        });

        // Virtual numpad for tablet
        this.createVirtualNumpad(W, H);
    }

    createVirtualNumpad(W, H) {
        const nums = ['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
        const startX = W / 2 - 90;
        const startY = H / 2 + 88;

        nums.forEach((n, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = startX + col * 62;
            const y = startY + row * 52;

            const btn = this.add.rectangle(x, y, 54, 44, 0x2c3e50, 0.9)
                .setStrokeStyle(1, 0x5d6d7e)
                .setInteractive({ useHandCursor: true });

            const t = this.add.text(x, y, n, {
                fontSize: n === 'OK' ? '14px' : '20px',
                color: n === 'OK' ? '#27ae60' : n === '⌫' ? '#e74c3c' : '#ffffff',
                fontFamily: 'Arial', fontStyle: 'bold'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => {
                if (this.inputLocked) return;
                if (n === '⌫') {
                    this.typedAnswer = this.typedAnswer.slice(0, -1);
                } else if (n === 'OK') {
                    if (this.typedAnswer.length > 0) this.submitAnswer(parseInt(this.typedAnswer));
                    return;
                } else if (this.typedAnswer.length < 4) {
                    this.typedAnswer += n;
                }
                this.typedDisplay.setText(this.typedAnswer || '_');
            });

            this.answerContainer.add([btn, t]);
        });
    }

    submitAnswer(value) {
        this.inputLocked = true;
        const correct = value === this.currentAnswer;

        if (correct) {
            this.onCorrectAnswer();
        } else {
            this.feedbackText.setText(`✗  Mauvaise réponse ! (${this.currentAnswer})`).setColor('#e74c3c');
            this.onWrongAnswer();
        }
    }

    onCorrectAnswer() {
        const { width: W } = this.cameras.main;
        const dmg = this.playerData.damage;
        this.enemyHp = Math.max(0, this.enemyHp - dmg);

        this.feedbackText.setText(`✓  Correct !  -${dmg} PV`).setColor('#27ae60');
        this.updateEnemyHpBar();

        this.cameras.main.shake(150, 0.005);

        if (this.enemySprite?.anims) {
            this.enemySprite.anims.play('slime_boss_hit', true);
            this.enemySprite.once('animationcomplete', () => this.enemySprite.anims.play('slime_boss_idle'));
        }

        this.time.delayedCall(800, () => {
            if (this.enemyHp <= 0) {
                this.endCombat(true);
            } else {
                this.inputLocked = false;
                this.askQuestion();
            }
        });
    }

    onWrongAnswer() {
        this.scene.pause('CombatScene');
        this.scene.launch('ParadeScene', {
            enemyDamage: this.enemyData.damage,
            difficulty:  this.difficulty
        });

        this.scene.get('ParadeScene').events.once('paradeEnd', (paradeResult) => {
            this.scene.resume('CombatScene');
            this.scene.stop('ParadeScene');

            const actualDmg = paradeResult.success ? 0 : this.enemyData.damage;
            if (actualDmg > 0) {
                this.playerData.hp = Math.max(0, this.playerData.hp - actualDmg);
                this.updatePlayerHpBar();
                this.feedbackText.setText(`Touché ! -${actualDmg} PV`).setColor('#e74c3c');
            } else {
                this.feedbackText.setText('Parade réussie !').setColor('#f0b429');
            }

            this.time.delayedCall(700, () => {
                if (this.playerData.hp <= 0) {
                    this.endCombat(false);
                } else {
                    this.inputLocked = false;
                    this.askQuestion();
                }
            });
        });
    }

    updateEnemyHpBar() {
        const ratio = this.enemyHp / this.enemyData.hp;
        this.enemyHpBar.width = 160 * Math.max(0, ratio);
        this.enemyHpTxt.setText(`${this.enemyHp}/${this.enemyData.hp}`);
    }

    updatePlayerHpBar() {
        const ratio = this.playerData.hp / this.playerData.maxHp;
        this.playerHpBar.width = 160 * Math.max(0, ratio);
        this.playerHpTxt.setText(`${this.playerData.hp}/${this.playerData.maxHp}`);
    }

    endCombat(enemyDefeated) {
        this.input.keyboard.off('keydown');
        this.events.emit('combatEnd', {
            enemyDefeated,
            playerDead: this.playerData.hp <= 0,
            playerHp:   this.playerData.hp
        });
        this.scene.stop('CombatScene');
    }

    getEnemyEmoji(type) {
        const map = {
            goblin: '👺', wolf: '🐺', bat: '🦇', skeleton: '💀',
            rat: '🐀', slime: '💚', gnoll: '🐗', kobold: '🦎',
            crab: '🦀', sahuagin: '🐟', ghost: '👻', troll: '👹',
            werewolf: '🐺', vampire_girl: '🧛', countess_vampire: '🧛',
            demon_slime: '👾'
        };
        return map[type] ?? '👹';
    }
}
