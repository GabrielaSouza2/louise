// Complete Game class with all logic including UI, music, random letter sequence puzzle, and transitions
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { WebSocketService, webSocketService } from '../../services/websocket';
import { riddlesService } from '../../services/riddles';
import { roundsService } from '../../services/rounds';
import { brailleService } from '../../services/braille';
import { Riddle } from '../../interfaces/riddle.interface';
import { characters } from '../../helpers/caracteres';
import { brailleMap } from '../../helpers/brailleMap';
import { roomService } from '../../services/room';
import { Subscription } from 'rxjs';

export class Game extends Scene {
    private _background!: Phaser.GameObjects.Image;
    private _titleLouise!: Phaser.GameObjects.Text;
    private _timerText!: Phaser.GameObjects.Text;
    private _player1Text!: Phaser.GameObjects.Text;
    private _player2Text!: Phaser.GameObjects.Text;
    private _header!: Phaser.GameObjects.Graphics;
    private _leftClueText!: Phaser.GameObjects.Text;
    private _dotsPuzzle!: Phaser.GameObjects.Graphics;
    private _asciiPuzzleText!: Phaser.GameObjects.Text;
    private _finishPhaseBtn!: Phaser.GameObjects.Text;
    private _checkSolutionBtn!: Phaser.GameObjects.Text;
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;
    private _boxLouise!: Phaser.GameObjects.Image;
    private _boxTimer!: Phaser.GameObjects.Image;
    private _boxPlayer1!: Phaser.GameObjects.Image;
    private _boxPlayer2!: Phaser.GameObjects.Image;
    private readonly _player1Progress!: Phaser.GameObjects.Graphics;
    private readonly _player2Progress!: Phaser.GameObjects.Graphics;
    private readonly _boxProgress1!: Phaser.GameObjects.Image;
    private readonly _boxProgress2!: Phaser.GameObjects.Image;
    private readonly player1ProgressValue: number = 0;
    private readonly player2ProgressValue: number = 0;
    private _boxClueText!: Phaser.GameObjects.Image;
    private _boxPuzzle!: Phaser.GameObjects.Image;
    private _boxBraille!: Phaser.GameObjects.Image;
    private _bgMusic!: Phaser.Sound.BaseSound;
    private resultPopupContainer?: Phaser.GameObjects.Container;
    private gameOverTriggered = false;

    private _puzzleBoard: { id: number, hasDot: boolean }[] = [];
    private _puzzleGroup!: Phaser.GameObjects.Container;
  
    private readonly minMoves: { [key: string]: number} = {
        'A': 9, 'B': 8, 'C': 13, 'D': 3, 'E': 11, 'F': 6, 'G': 10, 'H': 7, 'I': 10, 'J': 3, 'K': 7, 'L': 9, 'M': 5, 
        'N': 7, 'O': 7, 'P': 7, 'Q': 3, 'R': 3, 'S': 6, 'T': 3, 'U': 7, 'V': 2, 'W': 4, 'X': 5, 'Y': 1, 'Z': 1
    };

    private readonly charSequence: string[] = [];
    private currentCharIndex: number = 0;
    private currentChar: string = '';
    private moveCount: number = 0;
    private points: number = 0;

    private _puzzleSequence: string[] = [];
    private _brailleArray: string[] = [];
    private _originalBrailleArray: string[] = [];
    private readonly missingBraillePositions: { [key: string]: number } = {};

    private chosenClue: string = '';
    private brailleTranslation: string = '';

    private _tryAgainText!: Phaser.GameObjects.Text;
    private _clueTextGroup!: Phaser.GameObjects.Container;
    private readonly socket: WebSocketService;
    private readonly propagateStopSub?: Subscription;

    constructor() {
        super('Game');
        this.socket = webSocketService;
        this.initSocket();
    }

    // Getters e setters para as propriedades
    get background() { return this._background; }
    set background(value) { this._background = value; }

    get titleLouise() { return this._titleLouise; }
    set titleLouise(value) { this._titleLouise = value; }

    get timerText() { return this._timerText; }
    set timerText(value) { this._timerText = value; }

    get player1Text() { return this._player1Text; }
    set player1Text(value) { this._player1Text = value; }

    get player2Text() { return this._player2Text; }
    set player2Text(value) { this._player2Text = value; }

    get header() { return this._header; }
    set header(value) { this._header = value; }

    get leftClueText() { return this._leftClueText; }
    set leftClueText(value) { this._leftClueText = value; }

    get dotsPuzzle() { return this._dotsPuzzle; }
    set dotsPuzzle(value) { this._dotsPuzzle = value; }

    get asciiPuzzleText() { return this._asciiPuzzleText; }
    set asciiPuzzleText(value) { this._asciiPuzzleText = value; }

    get finishPhaseBtn() { return this._finishPhaseBtn; }
    set finishPhaseBtn(value) { this._finishPhaseBtn = value; }

    get checkSolutionBtn() { return this._checkSolutionBtn; }
    set checkSolutionBtn(value) { this._checkSolutionBtn = value; }

    get boxLouise() { return this._boxLouise; }
    set boxLouise(value) { this._boxLouise = value; }

    get boxTimer() { return this._boxTimer; }
    set boxTimer(value) { this._boxTimer = value; }

    get boxPlayer1() { return this._boxPlayer1; }
    set boxPlayer1(value) { this._boxPlayer1 = value; }

    get boxPlayer2() { return this._boxPlayer2; }
    set boxPlayer2(value) { this._boxPlayer2 = value; }

    get boxClueText() { return this._boxClueText; }
    set boxClueText(value) { this._boxClueText = value; }

    get boxPuzzle() { return this._boxPuzzle; }
    set boxPuzzle(value) { this._boxPuzzle = value; }

    get boxBraille() { return this._boxBraille; }
    set boxBraille(value) { this._boxBraille = value; }

    get bgMusic() { return this._bgMusic; }
    set bgMusic(value) { this._bgMusic = value; }

    get puzzleBoard() { return this._puzzleBoard; }
    set puzzleBoard(value) { this._puzzleBoard = value; }

    get puzzleGroup() { return this._puzzleGroup; }
    set puzzleGroup(value) { this._puzzleGroup = value; }

    get puzzleSequence() { return this._puzzleSequence; }
    set puzzleSequence(value) { this._puzzleSequence = value; }

    get brailleArray() { return this._brailleArray; }
    set brailleArray(value) { this._brailleArray = value; }

    get originalBrailleArray() { return this._originalBrailleArray; }
    set originalBrailleArray(value) { this._originalBrailleArray = value; }

    get tryAgainText() { return this._tryAgainText; }
    set tryAgainText(value) { this._tryAgainText = value; }

    get clueTextGroup() { return this._clueTextGroup; }
    set clueTextGroup(value) { this._clueTextGroup = value; }

    initSocket() {
        this.socket.connect('ws://localhost:3000');
    }

    // DESIGN
    preload() {
        // this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        // this.load.image('background', 'assets/background.png');
        // this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        // this.load.image('header1', 'assets/Header1.png');
        // this.load.image('header2', 'assets/Header2.png');
        // this.load.image('Behind', 'assets/Behind 1.png');
        // this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        // this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        // this.load.image('Menu2', 'assets/Menu2.png');
        // this.load.image('Menu1', 'assets/Menu1.png');
        // this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        // this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {

        console.log('entrou aqui')

        this.events.once('destroy', () => {
            this.propagateStopSub?.unsubscribe();
          });

        this.points = 0;
        this.timeLeft = 60;


        if (this.resultPopupContainer) {
            this.resultPopupContainer.destroy(true);
            this.resultPopupContainer = undefined;
        }

        this.background = this.add.image(512, 384, 'background');
        this.bgMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.1 });
        this.bgMusic.play();

        this.header = this.add.graphics();
        const headerWidth = 1080, headerHeight = 100, dotSpacing = 10, dotRadius = 3;
        const rows = Math.floor(headerHeight / dotSpacing);
        const startColor = new Phaser.Display.Color(200, 150, 100);
        const endColor = new Phaser.Display.Color(111, 78, 55);
        for (let y = dotSpacing / 2, rowIndex = 0; y < headerHeight; y += dotSpacing, rowIndex++) {
            const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, rows - 1, rowIndex);
            const colorHex = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
            const alpha = Phaser.Math.Linear(1, 0, rowIndex / (rows - 1));
            for (let x = dotSpacing / 2; x < headerWidth; x += dotSpacing) {
                this.header.fillStyle(colorHex, alpha);
                this.header.fillCircle(x, y, dotRadius);
            }
        }
        this.header.setPosition(0, 0);

        this.titleLouise = this.add.text(512, 100, 'Louise', {
            fontFamily: 'Love Light', fontSize: '150px', color: '#C2A385', stroke: '#ffffff', strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 }, letterSpacing: 5
        }).setOrigin(0.5);

        this.boxTimer = this.add.image(512, 200, 'header1').setDisplaySize(192, 60).setOrigin(0.5);
        this.timerText = this.add.text(512, 200, '01:00', {
            fontFamily: 'Love Light', fontSize: '50px', color: '#000000' }).setOrigin(0.5);
        this.startTimer();

        this.boxPlayer1 = this.add.image(124, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player1Text = this.add.text(124, 30, 'Jogador 1', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);

        this.boxPlayer2 = this.add.image(924, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player2Text = this.add.text(924, 30, 'Jogador 2', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);


 
        this.tryAgainText = this.add.text(512, 290, 'Try again!', {
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5).setVisible(false).setDepth(10); // Make sure it's higher than the image's depth
        ;

        const riddle = riddlesService.getCurrentRiddle(
            roundsService.currentRound - 1
        )

        if(!riddle) {
            throw new Error('Riddle not found');
        }

        this.chosenClue = riddle.text;
    
        //this.generateCharSequence();
   
        // Generate Braille translation, removing spaces and line breaks
        this.brailleTranslation = this.translateToBraille(riddle);
    
        // Render images first to set up the layout
        this.boxClueText = this.add.image(200, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
        this.boxPuzzle = this.add.image(512, 375, 'Menu2').setDisplaySize(209.3, 247.8).setOrigin(0.5);
        this.boxBraille = this.add.image(844, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
    

        this.renderBrailleTranslation();
        this.currentChar = this.puzzleSequence[0];
        this.renderClueText();

        // Initialize first puzzle
        this.initializePuzzleBoard();
        this.renderPuzzleBoard();

        EventBus.emit('current-scene-ready', this);

        webSocketService.listenOnce('propagate-stop', (result: any) => {
            this.showMatchResultPopup(this.points, result);
        });

        this.gameOverTriggered = false

        webSocketService.listenOnce('propagate-continue', (result: any) => {
            console.log('propagate-continue');
            console.log( 'já foi chamado', this.gameOverTriggered)
            
            this.gameover()
            this.gameOverTriggered = true;
        });

    }

    // makes the text translation to braille, keeping an original array and creating an empty slots one
    private translateToBraille(riddle: Riddle): string {

        this.originalBrailleArray = brailleService.translate(riddle.text);
        this.brailleArray = brailleService.translate(riddle.riddle_easy);  

        this.puzzleSequence = riddle.riddle_easy
        .split('')
        .map((char, index) => char === '_' ? riddle.text[index].toUpperCase() : null)
        .filter((char): char is string => char !== null);
    
        return this.brailleArray.join('');
    }
    
    // sentence text space
    private renderClueText(): void {
        // Remove existing text if any
        if (this.clueTextGroup) {
            this.clueTextGroup.destroy(true);
        }
        
        // Create new container
        this.clueTextGroup = this.add.container(0, 0);
        
        // Get dimensions from the background image
        const boxWidth = this.boxClueText.displayWidth;
        const boxHeight = this.boxClueText.displayHeight;
        const padding = 30; // Padding from edges
        const maxWidth = boxWidth - (padding * 2);
        
        // Split the clue into words
        const words = this.chosenClue.split(' ');
        const lineHeight = 40;
        const letterSpacing = 10;
        const wordSpacing = 15;
        
        let x = 0;
        let y = 0;
        let lineWidth = 0;
        let lines = 1;
        
        // Calculate how many characters we can fit per line
        const charsPerLine = Math.floor(maxWidth / letterSpacing);
        
        // Track absolute character index for the entire text
        let charIndex = 0;
        
        // Get the position of the current character we're trying to solve
        const currentCharPosition = this.missingBraillePositions[this.currentChar];
        console.log(currentCharPosition);
        
        // Process each word
        for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
            const word = words[wordIndex].toUpperCase();
            const wordWidth = word.length * letterSpacing;
            
            // Check if we need to start a new line
            if ((lineWidth + wordWidth) > maxWidth) {
                x = 0;
                y += lineHeight;
                lineWidth = 0;
                lines++;
            }
            
            // Process each letter in the word
            for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
                const letter = word[letterIndex];
                
                // Check if this letter is the current puzzle character (direct position comparison)
                const isCurrentPuzzleLetter = charIndex === currentCharPosition;
                
                // Create text object for this letter with appropriate color
                const letterText = this.add.text(x, y, letter, {
                    color: isCurrentPuzzleLetter ? '#FF0000' : '#000000', // Orange highlight or black
                });
                
                // Add to container
                this.clueTextGroup.add(letterText);
                
                // Update position for next letter
                x += letterSpacing;
                lineWidth += letterSpacing;
                
                // Increment character index
                charIndex++;
            }
            
            // Add space after word (except for last word)
            if (wordIndex < words.length - 1) {
                x += wordSpacing - letterSpacing;
                lineWidth += wordSpacing - letterSpacing;
                charIndex++; // Account for space character
            }
        }
        
        // Center the text container within the background box
        const totalHeight = lines * lineHeight;
        this.clueTextGroup.setPosition(
            this.boxClueText.x - (maxWidth / 2),
            this.boxClueText.y - (totalHeight / 2) + 10 // Small vertical adjustment
        );
    }
    
    // braille text space
    private renderBrailleTranslation(): void {
        const startX = 755, startY = 250, charWidth = 25, charHeight = 40;
        const maxColumns = 8;
        const brailleChars = this.brailleTranslation.split('');
    
        for (const char of brailleChars) {
            const index = brailleChars.indexOf(char);
            const x = startX + (index % maxColumns) * charWidth;
            const y = startY + Math.floor(index / maxColumns) * charHeight;
    
            this.add.text(x, y, char, {
                fontSize: '18px',
                color: char === ' ' ? '#888888' : '#000000',
                fontFamily: 'Love Light'
            }).setOrigin(0.5);
        }
    }
    
    // puzzle board styling
    private renderPuzzleBoard(): void {
        if (this.puzzleGroup) this.puzzleGroup.destroy(true);
        this.puzzleGroup = this.add.container(this.boxPuzzle.x - 50, this.boxPuzzle.y - 60);
        const tileWidth = 40, tileHeight = 40, gap = 5;

        for (const dot of this.puzzleBoard) {
            const col = dot.id % 2, row = Math.floor(dot.id / 2);
            const x = col * (tileWidth + gap), y = row * (tileHeight + gap);
            
            const isEmpty = dot.id === 0;

            if (!isEmpty) {
                const rect = this.add.rectangle(x + tileWidth / 2, y + tileHeight / 2, tileWidth, tileHeight, 0xC2A385).setOrigin(0.5);
                rect.setInteractive().on('pointerdown', () => this.movePuzzleTile(dot.id));
                this.puzzleGroup.add(rect);
                
                if (dot.hasDot) {
                    const dotText = this.add.text(x + tileWidth / 2, y + tileHeight / 2, '●', { fontSize: '24px', color: '#000000' }).setOrigin(0.5);
                    this.puzzleGroup.add(dotText);
                }
            }
        }
    }

    // Loads the puzzle board for the current CHAR
    private initializePuzzleBoard(): void {
        this.moveCount = 0;
        console.log('Current char:', this.currentChar);     
        console.log('Current char index:', characters[this.currentChar].length);
        const dots = this.boardSelectionPuzzle(characters[this.currentChar].length);
        this.puzzleBoard = Array.from({ length: 6 }, (_, index) => ({ id: index, hasDot: dots.includes(index) }));
    }

    // Array of valid moves and calculation of movements made by the player in each CHAR
    private movePuzzleTile(index: number): void {
        const emptyIndex = this.puzzleBoard.findIndex(tile => tile.id === 0);
        const validMoves: { [key: number]: number[] } = {
            0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2, 5], 4: [2, 5], 5: [3, 4]
        };
    
        if (validMoves[emptyIndex].includes(index)) {
            [this.puzzleBoard[emptyIndex], this.puzzleBoard[index]] = 
            [this.puzzleBoard[index], this.puzzleBoard[emptyIndex]];
    
            this.moveCount++;    
            this.renderPuzzleBoard();
        }

        this.checkPuzzleSolution();
    }    

    private checkSuccess(): boolean {

        const correct = characters[this.currentChar] ? [...characters[this.currentChar]].sort((a, b) => a - b) : [];

        // current board
        const current = this.puzzleBoard
            .map((t, i) => (t.hasDot ? i : -1))
            .filter(i => i !== -1)
            .sort((a, b) => a - b);

        return correct.length === current.length && correct.every((val, idx) => val === current[idx]);
    }

    // Check the puzzle solution
    private checkPuzzleSolution(): void {    
   
        // check if correct = current
        const success = this.checkSuccess();
    
        // correct = current
        if (success) {

            roomService.getRoom().addPointToUser(1);

            // takes possible try again text off the screen
            this.tryAgainText.setVisible(false);
    
            // remakes the braille array to fill the current empty char
            for (let i = 0; i < this.brailleArray.length; i++) {
                if (this.brailleArray[i] === '_' && this.originalBrailleArray[i] === brailleMap[this.currentChar]) {
                    this.brailleArray[i] = this.originalBrailleArray[i];
                    this.brailleTranslation = this.brailleArray.join('');
                    break;
                }
            }
            this.renderBrailleTranslation();
    
            // Add the points for solving the char, being the time left/amount of moves made over the minimum amount
            this.points += 1;

            // loads the next char if there is any
            if (this.currentCharIndex < (this.puzzleSequence.length - 1)) {
                this.currentCharIndex++;
                this.currentChar = this.puzzleSequence[this.currentCharIndex];
    
                this.initializePuzzleBoard();
                this.renderPuzzleBoard();
                this.renderClueText();
            
            // No next char, end of game
            } else {
                // PUXAR CODIGO DE FIM DE JOGO
                this.checkSolutionBtn.setText('Complete!');
                this.checkSolutionBtn.disableInteractive();
            
            }
        // wrong solution, try again text is displayed
        } else {
            this.tryAgainText.setVisible(true);
        }
    }
    

    // Puzzle board generation based on the amount of Dots there is in the CHAR
    private boardSelectionPuzzle(size: number): number[] {
        switch (size) {
            case 1: return [5];
            case 2: return [4, 5];
            case 3: return [1, 3, 5];
            case 4: return [2, 3, 4, 5];
            case 5: return [1, 2, 3, 4, 5];
            default: return [];
        }
    }  

    private startTimer(): void
    {
        this.timeLeft = 120;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                this.updateTimerText();
            },
            callbackScope: this,
            loop: true
        });
    }

    private updateTimerText(): void
    {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText(formatted);
    }

    

    override update () {
        // Simulação de progresso dos jogadores
      
        // Verifica se o jogo terminou
        const room = roomService.getRoom();
        if (room?.finished) {
            this.endGame();
        }
    }

    private finishPhase(): void
    {
        this.timerEvent.remove(false);
        this.bgMusic.stop();

        webSocketService.emit('stop', this.points, () => {})
        
    }

    private showMatchResultPopup(userPoints: number, adversaryPoints: number): void {
   
        let title = '';
        let subtitle = '';
        let color = '';
    
        if (userPoints > adversaryPoints) {
            title = 'Parabéns!';
            subtitle = `Você ganhou essa partida, você fez ${userPoints} ponto${userPoints === 1 ? '' : 's'} e seu adversário ${adversaryPoints}.`;
            color = '#006400'; // verde escuro

            roomService.getRoom().addPointToUser(1);
        } else if (userPoints < adversaryPoints) {
            title = 'Que pena, você perdeu =(';
            subtitle = `Você fez ${userPoints} ponto${userPoints === 1 ? '' : 's'} e seu adversário ${adversaryPoints}.`;
            color = '#8B0000'; // vermelho escuro
            roomService.getRoom().addPointsToAdversary(1);
        } else {
            title = 'Nossa, deu empate!';
            subtitle = `Você e seu adversário fizeram ${userPoints} ponto${userPoints === 1 ? '' : 's'}!`;
            color = '#444444'; // cinza
        }
    
        this.resultPopupContainer = this.add.container(0, 0);
    
        const box = this.add.rectangle(512, 384, 580, 280, 0xffffff, 1)
            .setStrokeStyle(4, 0xffffff)
            .setDepth(100)
            .setOrigin(0.5);
    
        const titleText = this.add.text(512, 320, title, {
            fontSize: '46px',
            fontFamily: 'Love Light',
            color,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(101);
    
        const subText = this.add.text(512, 375, subtitle, {
            fontSize: '22px',
            fontFamily: 'Jacques Francois',
            color: '#333333',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(101);
    
        const continueBtn = this.add.text(512, 440, roundsService.isLastRound() ? 'Visualizar Resultado' : "Continuar", {
            fontSize: '22px',
            fontFamily: 'Jacques Francois',
            color: '#ffffff',
            backgroundColor: '#6f4e37',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
          .setInteractive({ useHandCursor: true })
          .setDepth(101)
          .on('pointerover', () => continueBtn.setStyle({ backgroundColor: '#8c6451' }))
          .on('pointerout', () => continueBtn.setStyle({ backgroundColor: '#6f4e37' }))
          .on('pointerdown', () => {
            webSocketService.emit('continue', () => {
                console.log('emitiu continue');
            });

            this.gameover()
          } );
    
        this.resultPopupContainer.add([box, titleText, subText, continueBtn]);
    }

    private readonly gameover = () => {

        if (this.gameOverTriggered) return;
            
        if (this.resultPopupContainer) {
            this.resultPopupContainer.setVisible(false);
            this.resultPopupContainer.destroy(true);
            this.resultPopupContainer = undefined;
        }
        
        if(roundsService.isLastRound()) {

            this.scene.stop('Game');

            setTimeout(() => {

                this.scene.start('GameOver');
            }, 200)

        } else {
            roundsService.incrementRound();

            this.scene.stop('Game');

            setTimeout(() => {
                if(roomService.created) {
                    this.scene.start('WaitingRoom');
                } else {
                    this.scene.start('WaitingEnterRoom');
                }

            }, 200)

        }
    }

    // Método para finalizar o jogo e ir para a tela de Game Over
    private endGame() {
        if (!this.gameOverTriggered) {
            this.gameOverTriggered = true;
            
            // Obter os dados dos jogadores
            const room = roomService.getRoom();
            const gameData = {
                players: room?.players || []
            };

            // Emitir os dados do jogo para a cena de Game Over
            EventBus.emit('game-data', gameData);
            
            // Mudar para a cena de Game Over
            this.scene.start('GameOver');
        }
    }
}
