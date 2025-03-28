import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    // Elementos de fundo
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    // Elementos do menu
    private menuBackground: GameObjects.Image;
    private playButton: GameObjects.Image;
    private instructionsButton: GameObjects.Image;
    private enterRoomButton: GameObjects.Image;
    private createRoomButton: GameObjects.Image;
    private playText: GameObjects.Text;
    private instructionsText: GameObjects.Text;
    private enterRoomText: GameObjects.Text;
    private createRoomText: GameObjects.Text;

    constructor() {
        super('MainMenu');
        this.logoTween = null;
    }

    preload() {
        this.load.setPath('assets');

        if (!this.textures.exists('main-bg')) {
            this.load.image('main-bg', 'main-bg.png');
        }
        if (!this.textures.exists('header-button')) {
            this.load.image('header-button', 'Header2.png');
        }
        if (!this.textures.exists('dialog-box')) {
            this.load.image('dialog-box', 'DialogBox1.png');
        }
        if (!this.textures.exists('menu-background')) {
            this.load.image('menu-background', 'Menu1.png');
        }
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Adiciona o plano de fundo principal
        this.background = this.add.image(centerX, centerY, 'main-bg');
        this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Adiciona o título "Louise" na parte superior
        this.title = this.add.text(512, 100, 'Louise', {
            fontFamily: 'Love Light',
            fontSize: '150px',
            color: '#C2A385',
            stroke: '#fffffff',
            strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 },
            letterSpacing: 5
        }).setOrigin(0.5)
            .setDepth(100);

        this.logo = this.add.image(centerX, 300, 'logo').setDepth(100);
        this.logo.setAlpha(0);

        // Adiciona o fundo do menu
        this.menuBackground = this.add.image(centerX, centerY + 100, 'menu-background');
        this.menuBackground.setScale(3);

        // Ajusta a posição dos botões para ficarem centralizados
        const buttonSpacing = 80; // Espaço entre os botões

        // Botões no centro
        this.playButton = this.add
            .image(centerX - 10, centerY, 'header-button')
            .setInteractive();
        this.instructionsButton = this.add
            .image(centerX - 10, centerY + 30, 'header-button')
            .setInteractive();

        // Botões de sala
        this.enterRoomButton = this.add
            .image(centerX - 10, centerY + buttonSpacing * 2, 'dialog-box')
            .setInteractive();
        this.createRoomButton = this.add
            .image(centerX - 5, centerY + buttonSpacing, 'dialog-box')
            .setInteractive();

        // Textos dos botões
        this.playText = this.add
            .text(this.playButton.x, this.playButton.y, 'Jogar', {
                fontFamily: 'serif',
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.instructionsText = this.add
            .text(this.instructionsButton.x, this.instructionsButton.y, 'Instruções', {
                fontFamily: 'serif',
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.enterRoomText = this.add
            .text(this.enterRoomButton.x, this.enterRoomButton.y, 'Entrar na sala', {
                fontFamily: 'serif',
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.createRoomText = this.add
            .text(this.createRoomButton.x, this.createRoomButton.y, 'Crie uma sala', {
                fontFamily: 'serif',
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        // Configura os eventos de interação dos botões
        this.setupButtonInteractions(this.playButton, () => this.changeScene());
        this.setupButtonInteractions(this.instructionsButton, () => this.showInstructions());
        this.setupButtonInteractions(this.enterRoomButton, () => this.enterRoom());
        this.setupButtonInteractions(this.createRoomButton, () => this.createRoom());

        this.removePhaserText();
        this.title.setAlpha(1); // Garante que o título "Louise" permaneça visível
        EventBus.emit('current-scene-ready', this);
    }

    moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (vueCallback) {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y),
                        });
                    }
                },
            });
        }
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.scene.start('Game');
    }

    showInstructions() {
        console.log('Mostrando instruções');
    }

    enterRoom() {
        console.log('Entrando na sala');
        this.changeScene();
    }

    createRoom() {
        console.log('Criando uma sala');
        this.changeScene();
    }

    setupButtonInteractions(button: GameObjects.Image, callback: Function) {
        button.on('pointerdown', callback, this);
        button.on('pointerover', () => {
            button.setAlpha(0.8);
        });
        button.on('pointerout', () => {
            button.setAlpha(1);
        });
    }

    removePhaserText() {
        // Aqui você pode remover ou ocultar textos
        this.title.setAlpha(0); // Torna o título invisível (ou você pode removê-lo completamente)
    }
}
