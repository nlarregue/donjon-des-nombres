import Phaser from 'phaser';
import { WORLDS } from '../config/worlds.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const ENEMY_COLORS = {
    goblin: 0x3d8b37, wolf: 0x8b6914, bat: 0x4a0a6b,
    skeleton: 0xd4d4d4, rat: 0x8b6020, slime: 0x2ecc71,
    gnoll: 0x8b4513, kobold: 0xe74c3c, crab: 0xe67e22,
    sahuagin: 0x1abc9c, ghost: 0x9b59b6, troll: 0x27ae60,
    werewolf: 0x7f8c8d, vampire_girl: 0x8e44ad,
    countess_vampire: 0x6c3483, demon_slime: 0x922b21,
    'gobelin-lance': 0x3d8b37, 'gobelin-hache': 0x5a4a00, 'gobelin-arc': 0x2e7d32,
    'gobelin-roi': 0xb7950b, 'gobelin-sorcier': 0x6a1b9a,
    'squelette': 0xd0d0d0, 'squelette-noir': 0x555555,
    'fantome-bleu': 0x1565c0, 'fantome-noir': 0x212121,
    'boss01': 0xb71c1c
};

// Clés qui ont un vrai spritesheet RPG-Character (32x32 ou 96x96)
const RPG_SPRITE_KEYS = new Set([
    'gobelin-lance', 'gobelin-hache', 'gobelin-arc', 'gobelin-roi', 'gobelin-sorcier',
    'squelette', 'squelette-noir', 'fantome-bleu', 'fantome-noir', 'boss01'
]);

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super('WorldScene');
    }

    init(data) {
        this.worldIndex  = data.worldIndex  ?? 0;
        this.playerData  = data.playerData  ?? this.registry.get('playerData');
        this.difficulty  = data.difficulty  ?? this.registry.get('difficulty');
        this.defeatedEnemies = data.defeatedEnemies ?? [];
        this.inCombat    = false;
    }

    create() {
        const world = WORLDS[this.worldIndex];
        const { width: W, height: H } = this.cameras.main;

        this.drawBackground(world, W, H);
        this.spawnPlayer(W / 2, H / 2);
        this.spawnEnemies(world);
        this.spawnBossIfReady(world);
        this.setupControls();
        this.setupVirtualGamepad(W, H);
        this.createHUD(W, world);

        // Listen for combat results
        this.events.on('combatEnd', this.onCombatEnd, this);
        this.scene.get('CombatScene')?.events.off('combatEnd');
    }

    drawBackground(world, W, H) {
        // Sky/background
        const bg = this.add.graphics();
        bg.fillStyle(world.bgColor);
        bg.fillRect(0, 0, W, H);

        // Ground tiles (simple grid)
        const tileSize = 64;
        const ground = this.add.graphics();
        for (let row = 0; row < Math.ceil(H / tileSize); row++) {
            for (let col = 0; col < Math.ceil(W / tileSize); col++) {
                const shade = (row + col) % 2 === 0 ? world.groundColor : Phaser.Display.Color.ValueToColor(world.groundColor).darken(15).color;
                ground.fillStyle(shade, 0.6);
                ground.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
            }
        }

        // World name watermark
        this.add.text(W / 2, H / 2, WORLDS[this.worldIndex].name, {
            fontSize: '80px', color: '#ffffff', fontFamily: 'Georgia, serif', alpha: 0.05
        }).setOrigin(0.5).setAlpha(0.05);
    }

    spawnPlayer(x, y) {
        this.player = this.physics.add.sprite(x, y, 'wizard_idle', 0);
        this.player.setCollideWorldBounds(true);
        this.player.setScale(0.8);
        this.player.setDepth(10);
        this.player.body.setSize(40, 60);
        this.player.anims.play('wizard_idle_anim');
    }

    spawnEnemies(world) {
        this.enemyGroup = this.physics.add.staticGroup();

        const positions = this.getEnemyPositions(world.enemyCount);
        const allEnemyTypes = [...world.enemies, ...world.enemies].slice(0, world.enemyCount);

        allEnemyTypes.forEach((type, i) => {
            if (this.defeatedEnemies.includes(`${type}_${i}`)) return;
            const pos = positions[i];
            this.createEnemySprite(pos.x, pos.y, type, `${type}_${i}`, false, world);
        });
    }

    spawnBossIfReady(world) {
        const allDefeated = this.enemyGroup.getChildren().length === 0 &&
            WORLDS[this.worldIndex].enemies.every((t, i) => this.defeatedEnemies.includes(`${t}_${i}`));

        if (allDefeated || this.defeatedEnemies.includes('boss_ready')) {
            this.spawnBoss(world);
        }
    }

    spawnBoss(world) {
        const { width: W, height: H } = this.cameras.main;
        this.bossEnemy = this.createEnemySprite(W - 120, H / 2, world.boss, 'boss', true, world);

        this.add.text(W - 120, H / 2 - 70, '⚠ BOSS', {
            fontSize: '14px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this.bossEnemy,
            y: H / 2 + 8,
            yoyo: true, repeat: -1, duration: 800, ease: 'Sine.easeInOut'
        });
    }

    createEnemySprite(x, y, type, id, isBoss, world) {
        const color  = ENEMY_COLORS[type] ?? 0xff4444;
        const radius = isBoss ? 36 : 24;

        let circle, label;
        if (RPG_SPRITE_KEYS.has(type)) {
            const scale = isBoss ? 2.5 : 1.8;
            circle = this.add.sprite(x, y, type, 1).setScale(scale).setDepth(5);
            circle.anims.play(`${type}_idle`);
            label = null;
        } else {
            circle = this.add.circle(x, y, radius, color).setDepth(5);
            label  = this.add.text(x, y, this.getEnemyEmoji(type), {
                fontSize: isBoss ? '28px' : '20px'
            }).setOrigin(0.5).setDepth(6);
        }

        const hpBar = this.add.rectangle(x, y - radius - 8, radius * 2, 6, 0x00ff00).setDepth(6).setOrigin(0.5);

        const zone  = this.add.zone(x, y, radius * 2.5, radius * 2.5).setDepth(5);
        this.physics.add.existing(zone, true);

        zone.enemyData = {
            id, type, isBoss,
            hp: isBoss ? (world.enemyCount * 20 + 60) : 30,
            maxHp: isBoss ? (world.enemyCount * 20 + 60) : 30,
            damage: isBoss ? 20 : 10,
            color, circle, label, hpBar, world
        };

        this.enemyGroup.add(zone);

        this.physics.add.overlap(this.player, zone, () => {
            if (!this.inCombat) this.startCombat(zone.enemyData);
        });

        return circle;
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

    getEnemyPositions(count) {
        const { width: W, height: H } = this.cameras.main;
        const margin = 80;
        const positions = [];
        for (let i = 0; i < count; i++) {
            positions.push({
                x: Phaser.Math.Between(margin, W - margin - 150),
                y: Phaser.Math.Between(margin + 50, H - margin)
            });
        }
        return positions;
    }

    startCombat(enemyData) {
        this.inCombat = true;
        this.player.setVelocity(0, 0);
        this.player.anims.play('wizard_idle_anim');

        this.scene.pause('WorldScene');
        this.scene.launch('CombatScene', {
            enemyData,
            playerData: this.playerData,
            difficulty:  this.difficulty,
            worldIndex:  this.worldIndex,
            defeatedEnemies: this.defeatedEnemies
        });

        this.scene.get('CombatScene').events.once('combatEnd', (result) => {
            this.onCombatEnd(result, enemyData);
        });
    }

    onCombatEnd(result, enemyData) {
        this.scene.resume('WorldScene');
        this.inCombat = false;

        // Update player HP from combat result
        this.playerData.hp = result.playerHp;
        this.updateHUD();

        if (result.playerDead) {
            this.scene.start('GameOverScene');
            return;
        }

        if (result.enemyDefeated) {
            // Remove enemy visuals
            enemyData.circle?.destroy();
            enemyData.label?.destroy();
            enemyData.hpBar?.destroy();

            // Find and remove the zone
            this.enemyGroup.getChildren().forEach(zone => {
                if (zone.enemyData?.id === enemyData.id) {
                    zone.destroy();
                }
            });

            this.defeatedEnemies.push(enemyData.id);

            if (enemyData.isBoss) {
                this.onBossDefeated();
                return;
            }

            // Check if all regular enemies defeated → spawn boss
            const world = WORLDS[this.worldIndex];
            const allRegularDefeated = world.enemies.every((t, i) =>
                this.defeatedEnemies.includes(`${t}_${i}`)
            );
            if (allRegularDefeated && !this.defeatedEnemies.includes('boss_ready')) {
                this.defeatedEnemies.push('boss_ready');
                this.showBossWarning(world);
            }
        }

        this.saveProgress();
    }

    onBossDefeated() {
        const world = WORLDS[this.worldIndex];
        const { width: W, height: H } = this.cameras.main;

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(30);
        const txt = this.add.text(W / 2, H / 2 - 40, `🏆 ${world.reward} !`, {
            fontSize: '28px', color: '#f0b429', fontFamily: 'Georgia, serif'
        }).setOrigin(0.5).setDepth(31);

        const nextText = this.worldIndex < WORLDS.length - 1
            ? world.unlockNext
            : 'Vous avez sauvé le royaume !';

        this.add.text(W / 2, H / 2 + 10, nextText, {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(31);

        this.time.delayedCall(2500, () => {
            overlay.destroy(); txt.destroy();
            if (this.worldIndex < WORLDS.length - 1) {
                this.scene.start('WorldScene', {
                    worldIndex:  this.worldIndex + 1,
                    playerData:  this.playerData,
                    difficulty:  this.difficulty,
                    defeatedEnemies: []
                });
            } else {
                this.scene.start('VictoryScene', { playerData: this.playerData });
            }
        });
    }

    showBossWarning(world) {
        const { width: W, height: H } = this.cameras.main;
        const warn = this.add.text(W / 2, 80, `⚠  Le Boss apparaît !`, {
            fontSize: '22px', color: '#ff4444', fontFamily: 'Arial', fontStyle: 'bold',
            backgroundColor: '#00000088', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: warn, alpha: 0, duration: 2500,
            onComplete: () => { warn.destroy(); this.spawnBoss(world); }
        });
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up:    Phaser.Input.Keyboard.KeyCodes.W,
            down:  Phaser.Input.Keyboard.KeyCodes.S,
            left:  Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        // Virtual gamepad state
        this.padState = { up: false, down: false, left: false, right: false };
    }

    setupVirtualGamepad(W, H) {
        const cx = 80, cy = H - 90;
        const size = 40;
        const gap  = 46;

        const dirs = [
            { dx: 0,    dy: -gap, dir: 'up',    label: '▲' },
            { dx: 0,    dy:  gap, dir: 'down',  label: '▼' },
            { dx: -gap, dy: 0,   dir: 'left',  label: '◀' },
            { dx:  gap, dy: 0,   dir: 'right', label: '▶' }
        ];

        dirs.forEach(({ dx, dy, dir, label }) => {
            const btn = this.add.rectangle(cx + dx, cy + dy, size, size, 0xffffff, 0.15)
                .setStrokeStyle(1, 0xffffff, 0.4)
                .setInteractive()
                .setDepth(50);
            this.add.text(cx + dx, cy + dy, label, {
                fontSize: '16px', color: '#ffffff'
            }).setOrigin(0.5).setDepth(51);

            btn.on('pointerdown', () => { this.padState[dir] = true; });
            btn.on('pointerup',   () => { this.padState[dir] = false; });
            btn.on('pointerout',  () => { this.padState[dir] = false; });
        });
    }

    createHUD(W, world) {
        this.hudContainer = this.add.container(0, 0).setDepth(40);

        // World name
        const worldName = this.add.text(W / 2, 16, world.name, {
            fontSize: '16px', color: '#f0b429', fontFamily: 'Georgia, serif'
        }).setOrigin(0.5);

        // HP bar background
        const hpBg   = this.add.rectangle(10, 10, 180, 18, 0x333333).setOrigin(0);
        this.hpBar   = this.add.rectangle(10, 10, 180, 18, 0xe74c3c).setOrigin(0);
        const hpLabel = this.add.text(14, 10, 'PV', { fontSize: '12px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0, 0.1);
        this.hpText  = this.add.text(100, 10, `${this.playerData.hp}/${this.playerData.maxHp}`, {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5, 0.1);

        this.hudContainer.add([worldName, hpBg, this.hpBar, hpLabel, this.hpText]);
    }

    updateHUD() {
        const ratio = Math.max(0, this.playerData.hp / this.playerData.maxHp);
        this.hpBar.width = 180 * ratio;
        this.hpText.setText(`${this.playerData.hp}/${this.playerData.maxHp}`);
    }

    update() {
        if (this.inCombat || !this.player) return;

        const speed = 150;
        const left  = this.cursors.left.isDown  || this.wasd.left.isDown  || this.padState.left;
        const right = this.cursors.right.isDown || this.wasd.right.isDown || this.padState.right;
        const up    = this.cursors.up.isDown    || this.wasd.up.isDown    || this.padState.up;
        const down  = this.cursors.down.isDown  || this.wasd.down.isDown  || this.padState.down;

        const vx = left ? -speed : right ? speed : 0;
        const vy = up   ? -speed : down  ? speed : 0;

        this.player.setVelocity(vx, vy);

        if (vx !== 0 || vy !== 0) {
            if (vx < 0)      { this.player.anims.play('wizard_walk_anim', true); this.player.setFlipX(true); }
            else if (vx > 0) { this.player.anims.play('wizard_walk_anim', true); this.player.setFlipX(false); }
            else if (vy < 0) { this.player.anims.play('wizard_walkb_anim', true); }
            else             { this.player.anims.play('wizard_walkf_anim', true); }
        } else {
            this.player.anims.play('wizard_idle_anim', true);
        }
    }

    saveProgress() {
        SaveSystem.save({
            worldIndex:  this.worldIndex,
            playerData:  this.playerData,
            difficulty:  this.difficulty,
            defeatedEnemies: this.defeatedEnemies
        });
    }
}
