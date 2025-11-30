// Snake-Spiel in TypeScript

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
    
    private gridSize: number = 20;
    private tileCount: number = 20;
    
    private snake: Position[] = [{ x: 10, y: 10 }];
    private food: Position = { x: 15, y: 15 };
    private dx: number = 0;
    private dy: number = 0;
    private score: number = 0;
    private gameRunning: boolean = true;
    private gameStarted: boolean = false;
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
        
        this.setupEventListeners();
        this.resetFoodTimer();
        this.startCountdown();
        this.gameLoop();
    }
    
    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code === 'Space') {
                this.resetGame();
                return;
            }
            
            if (!this.gameRunning || !this.gameStarted) return;
            
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
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gameOverElement.style.display = 'none';
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
        if (!this.gameRunning || !this.gameStarted) return;
        
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
        if (!this.gameRunning || !this.gameStarted) return;
        
        this.foodTimer += deltaTime;
        
        if (this.foodTimer >= this.foodTimerMax) {
            // Futter verschwindet und erscheint an neuer Stelle
            this.generateFood();
        }
    }
    
    private endGame(): void {
        this.gameRunning = false;
        this.gameOverElement.style.display = 'block';
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

