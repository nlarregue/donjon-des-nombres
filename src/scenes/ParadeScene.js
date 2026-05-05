import Phaser from 'phaser';

export default class ParadeScene extends Phaser.Scene {
    constructor() {
        super('ParadeScene');
    }

    init(data) {
        this.enemyDamage = data.enemyDamage ?? 10;
        this.difficulty  = data.difficulty  ?? 'easy';
    }

    create() {
        const { width: W, height: H } = this.cameras.main;

        // Dark overlay
        this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.85);

        // Panel
        this.add.rectangle(W / 2, H / 2, 540, 240, 0x1a1a2e, 0.98)
            .setStrokeStyle(3, 0xe74c3c);

        this.add.text(W / 2, H / 2 - 90, `⚔  Contre-attaque !  -${this.enemyDamage} PV`, {
            fontSize: '22px', color: '#e74c3c', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 - 55, 'Appuie sur ESPACE (ou le bouton) quand le curseur est dans le vert !', {
            fontSize: '13px', color: '#aaaaaa', fontFamily: 'Arial', wordWrap: { width: 480 }
        }).setOrigin(0.5);

        // Parade bar
        const barX = W / 2 - 200;
        const barY = H / 2;
        const barW = 400;
        const barH = 34;

        this.add.rectangle(barX + barW / 2, barY, barW, barH, 0xe74c3c).setOrigin(0.5);

        // Green zone (random position and size based on difficulty)
        const greenSize = this.getGreenZoneSize();
        const maxOffset  = barW - greenSize;
        const greenStart = Phaser.Math.Between(10, maxOffset - 10);

        this.add.rectangle(barX + greenStart + greenSize / 2, barY, greenSize, barH, 0x27ae60).setOrigin(0.5);

        // Bar border
        this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x000000, 0)
            .setStrokeStyle(2, 0xffffff, 0.6).setOrigin(0.5);

        // Cursor
        this.cursor = this.add.rectangle(barX, barY, 8, barH + 8, 0xffffff).setOrigin(0.5);

        // Store bar info for collision check
        this.barLeft    = barX;
        this.greenLeft  = barX + greenStart;
        this.greenRight = barX + greenStart + greenSize;

        // Animate cursor
        const duration = this.getCursorSpeed();
        this.cursorTween = this.tweens.add({
            targets: this.cursor,
            x: barX + barW,
            duration,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });

        // Input: SPACE or tap
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.once('keydown-SPACE', this.onAction, this);

        // Touch/tap button for tablet
        const tapBtn = this.add.rectangle(W / 2, H / 2 + 70, 200, 50, 0x27ae60, 0.9)
            .setStrokeStyle(2, 0x27ae60)
            .setInteractive({ useHandCursor: true });
        this.add.text(W / 2, H / 2 + 70, 'PARER  🛡', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        tapBtn.once('pointerdown', this.onAction, this);

        // Auto-fail after 4 seconds if no input
        this.time.delayedCall(4000, () => {
            if (this.scene.isActive()) this.endParade(false);
        });
    }

    getGreenZoneSize() {
        const sizes = { easy: 120, medium: 90, hard: 60, hell: 40 };
        return sizes[this.difficulty] ?? 80;
    }

    getCursorSpeed() {
        const speeds = { easy: 2000, medium: 1500, hard: 1100, hell: 800 };
        return speeds[this.difficulty] ?? 1500;
    }

    onAction() {
        if (!this.cursor) return;
        const cx = this.cursor.x;
        const success = cx >= this.greenLeft && cx <= this.greenRight;
        this.endParade(success);
    }

    endParade(success) {
        if (this.cursorTween) this.cursorTween.stop();
        this.input.keyboard.off('keydown-SPACE');

        const { width: W, height: H } = this.cameras.main;
        const msg = success ? '🛡  Parade réussie !' : '💥  Touché !';
        const col = success ? '#27ae60' : '#e74c3c';

        this.add.text(W / 2, H / 2 - 10, msg, {
            fontSize: '28px', color: col, fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.time.delayedCall(900, () => {
            this.events.emit('paradeEnd', { success });
        });
    }
}
