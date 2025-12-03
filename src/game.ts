// Snake-Spiel in TypeScript

import { HighscoreManager, HighscoreEntry } from './highscore.js';

interface Position {
    x: number;
    y: number;
}

class SnakeGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private scoreElement: HTMLElement;
    private gameOverElement: HTMLElement;
    private countdownOverlay: HTMLElement;
    private pauseOverlay: HTMLElement;
    private pauseBtn: HTMLButtonElement;
    private resetBtn: HTMLButtonElement;
    private resetHighscoreBtn: HTMLButtonElement;
    private highscoreList: HTMLElement;
    private highscoreManager: HighscoreManager;
    
    private gridSize: number = 20;
    private tileCount: number = 20;
    
    private snake: Position[] = [{ x: 10, y: 10 }];
    private food: Position = { x: 15, y: 15 };
    private dx: number = 0;
    private dy: number = 0;
    private score: number = 0;
    private gameRunning: boolean = true;
    private gameStarted: boolean = false;
    private isPaused: boolean = false;
    private foodTimer: number = 0;
    private foodTimerMax: number = 0;
    private countdown: number = 3;
    private countdownInterval: number | undefined = undefined;
    
    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.scoreElement = document.getElementById('score')!;
        this.gameOverElement = document.getElementById('gameOver')!;
        this.countdownOverlay = document.getElementById('countdownOverlay')!;
        this.pauseOverlay = document.getElementById('pauseOverlay')!;
        this.pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
        this.resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;
        this.resetHighscoreBtn = document.getElementById('resetHighscoreBtn') as HTMLButtonElement;
        this.highscoreList = document.getElementById('highscoreList')!;
        this.highscoreManager = new HighscoreManager();
        
        this.initHighscores();
        this.setupEventListeners();
        this.resetFoodTimer();
        this.startCountdown();
        this.gameLoop();
    }
    
    private async initHighscores(): Promise<void> {
        try {
            await this.highscoreManager.init();
            await this.updateHighscoreDisplay();
        } catch (error) {
            console.error('Fehler beim Initialisieren der Highscores:', error);
        }
    }
    
    private async updateHighscoreDisplay(): Promise<void> {
        try {
            const scores = await this.highscoreManager.getTopScores(5);
            this.highscoreList.innerHTML = '';
            
            if (scores.length === 0) {
                const emptyEntry = document.createElement('div');
                emptyEntry.className = 'highscore-entry';
                emptyEntry.innerHTML = `
                    <span class="highscore-rank">-</span>
                    <span class="highscore-score">Keine Scores vorhanden</span>
                    <span class="highscore-date"></span>
                `;
                this.highscoreList.appendChild(emptyEntry);
            } else {
                scores.forEach((entry, index) => {
                    const entryElement = document.createElement('div');
                    entryElement.className = 'highscore-entry';
                    
                    // Stelle sicher, dass date ein Date-Objekt ist
                    const date = entry.date instanceof Date ? entry.date : new Date(entry.date);
                    const dateStr = date.toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const timeStr = date.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    entryElement.innerHTML = `
                        <span class="highscore-rank">${index + 1}.</span>
                        <span class="highscore-score">${entry.score} Punkte</span>
                        <span class="highscore-date">${dateStr} ${timeStr}</span>
                    `;
                    this.highscoreList.appendChild(entryElement);
                });
            }
        } catch (error) {
            console.error('Fehler beim Laden der Highscores:', error);
        }
    }
    
    private setupEventListeners(): void {
        // Tastatursteuerung
        document.addEventListener('keydown', (e) => {
            // Pause/Play mit P-Taste
            if (e.key === 'p' || e.key === 'P') {
                this.togglePause();
                return;
            }
            
            // Reset mit R-Taste
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
                return;
            }
            
            // Neustart nach Game Over mit Leertaste
            if (!this.gameRunning && e.code === 'Space') {
                this.resetGame();
                return;
            }
            
            if (!this.gameRunning || !this.gameStarted || this.isPaused) return;
            
            switch (e.key) {
                case 'ArrowUp':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
            }
        });
        
        // Button-Event-Listener
        this.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
        
        this.resetHighscoreBtn.addEventListener('click', async () => {
            if (confirm('Möchten Sie wirklich alle Highscores zurücksetzen?')) {
                try {
                    await this.highscoreManager.clearAllScores();
                    await this.updateHighscoreDisplay();
                } catch (error) {
                    console.error('Fehler beim Zurücksetzen der Highscores:', error);
                    alert('Fehler beim Zurücksetzen der Highscores');
                }
            }
        });
    }
    
    private togglePause(): void {
        // Pause nur möglich, wenn Spiel läuft und gestartet wurde
        if (!this.gameRunning || !this.gameStarted) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseOverlay.classList.add('visible');
            this.pauseBtn.textContent = 'Weiter (P)';
        } else {
            this.pauseOverlay.classList.remove('visible');
            this.pauseBtn.textContent = 'Pause (P)';
        }
    }
    
    private startCountdown() {
        if(this.countdownInterval !== undefined) //Erlaube keinen erneuten Start, wenn der Countdown bereits läuft
            return;

        this.gameStarted = false;
        this.countdown = 3;
        this.countdownOverlay.classList.remove('hidden');
        this.countdownOverlay.textContent = this.countdown.toString();
        
        // Animation neu starten (damit die CSS Animation ausgeführt wird)
        this.countdownOverlay.style.animation = 'none';
        setTimeout(() => {
            this.countdownOverlay.style.animation = '';
        }, 10);
        
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            
            if (this.countdown > 0) {
                this.countdownOverlay.textContent = this.countdown.toString();
                // Animation bei jedem Zahlwechsel neu starten
                this.countdownOverlay.style.animation = 'none';
                setTimeout(() => {
                    this.countdownOverlay.style.animation = '';
                }, 10);
            } else if (this.countdown <= 0) {
                this.countdownOverlay.textContent = 'LOS!';
                // Animation für "LOS!" neu starten
                this.countdownOverlay.style.animation = 'none';
                setTimeout(() => {
                    this.countdownOverlay.style.animation = '';
                }, 10);
                setTimeout(() => {
                    this.countdownOverlay.classList.add('hidden');
                    this.gameStarted = true;
                    this.dx = 1;
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = undefined;
                }, 500);
            }
        }, 1000);
    }
    
    private resetGame(): void {
        // Wird nach Game Over aufgerufen (mit Leertaste)
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.isPaused = false;
        this.gameOverElement.style.display = 'none';
        this.pauseOverlay.classList.remove('visible');
        this.pauseBtn.textContent = 'Pause (P)';
        this.updateScore();
        this.resetFoodTimer();
        this.startCountdown();
    }
    
    private updateScore(): void {
        this.scoreElement.textContent = `Punkte: ${this.score}`;
    }
    
    private drawGame(): void {
        // Canvas leeren
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Snake zeichnen
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Kopf etwas dunkler
                this.ctx.fillStyle = '#157019';
            } else {
                this.ctx.fillStyle = '#4CAF50';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Futter zeichnen - als Kreis mit Schattierung
        const centerX = this.food.x * this.gridSize + this.gridSize / 2;
        const centerY = this.food.y * this.gridSize + this.gridSize / 2;
        const radius = (this.gridSize - 4) / 2;

        // Kreis mit Farbverlauf
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, radius * 0.3,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, "#ff7961");
        gradient.addColorStop(1, "#f44336");
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Highlight für Glanz-Effekt
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius * 0.4, centerY - radius * 0.4, radius * 0.25, 0, 2 * Math.PI);
        this.ctx.fillStyle = "rgba(255,255,255,0.7)";
        this.ctx.fill();
        this.ctx.fillStyle = '#f44336';

        const foodTimerLeft = (Math.ceil((this.foodTimerMax - this.foodTimer) / 1000)).toString();
        const fontSize = 12;
        this.ctx.font = "bold " + fontSize + "px Arial";
        this.ctx.fillStyle = '#000000ff';
        const space = (this.gridSize - fontSize) / 2
        this.ctx.fillText(foodTimerLeft, this.food.x * this.gridSize + 7, this.food.y * this.gridSize + 14);
        // <span id="foodTimerLeft">
        // this.ctx.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    }
    
    private moveSnake(): void {
        if (!this.gameRunning || !this.gameStarted || this.isPaused) return;
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Kollisionsprüfung mit dem Spielrand
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Kollisionsprüfung mit sich selbst
        if (this.snake.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)) {
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // Futter gefressen?
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.updateScore();
            this.generateFood();
        } else {
            // Schwanz entfernen, wenn kein Futter gefressen wurde
            this.snake.pop();
        }
    }
    
    private generateFood(): void {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
        this.resetFoodTimer();
    }
    
    private resetFoodTimer(): void {
        // Zufällige Zeit (in Millisekunden)
        const minTime = 1000;
        const maxTime = 5000;
        this.foodTimerMax = Math.floor(Math.random() * (maxTime - minTime) + minTime);
        this.foodTimer = 0;
    }
    
    private updateFoodTimer(deltaTime: number): void {
        if (!this.gameRunning || !this.gameStarted || this.isPaused) return;
        
        this.foodTimer += deltaTime;
        
        if (this.foodTimer >= this.foodTimerMax) {
            // Futter verschwindet und erscheint an neuer Stelle
            this.generateFood();
        }
    }
    
    private async endGame(): Promise<void> {
        this.gameRunning = false;
        this.gameOverElement.style.display = 'block';
        
        // Speichere Score als Highscore
        if (this.score > 0) {
            try {
                await this.highscoreManager.addScore(this.score);
                await this.updateHighscoreDisplay();
            } catch (error) {
                console.error('Fehler beim Speichern des Highscores:', error);
            }
        }
    }
    
    private gameLoop(): void {
        const frameTime = 150; // Millisekunden pro Frame
        
        if (this.gameRunning) {
            this.moveSnake();
            this.updateFoodTimer(frameTime);
        }
        this.drawGame();
        setTimeout(() => this.gameLoop(), frameTime);
    }
}

// Spiel starten, wenn die Seite geladen ist
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

