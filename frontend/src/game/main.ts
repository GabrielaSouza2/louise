import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { CreateRoom } from './scenes/CreateRoom';
import { WaitingRoom } from './scenes/WaitingRoom';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 720,
    transparent: true, // <-- ESSENCIAL
    backgroundColor: undefined, // ou 'rgba(0,0,0,0)'
    parent: 'game-container',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        CreateRoom,
        WaitingRoom
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
