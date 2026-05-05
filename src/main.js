import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import WorldScene from './scenes/WorldScene.js';
import CombatScene from './scenes/CombatScene.js';
import ParadeScene from './scenes/ParadeScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        CharacterSelectScene,
        WorldScene,
        CombatScene,
        ParadeScene,
        GameOverScene,
        VictoryScene
    ]
};

new Phaser.Game(config);
