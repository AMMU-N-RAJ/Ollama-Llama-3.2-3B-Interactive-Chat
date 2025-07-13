// GitHub Contributions Snake Game

class SnakeGame {
    constructor() {
        this.gridWidth = 53;
        this.gridHeight = 7;
        this.grid = [];
        this.snake = [];
        this.food = null;
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.gameRunning = false;
        this.gameLoop = null;
        this.speed = 200; // milliseconds between moves
        
        this.initializeGrid();
        this.bindEvents();
        this.generateContributionPattern();
    }
    
    initializeGrid() {
        const gridContainer = document.getElementById('contributionsGrid');
        gridContainer.innerHTML = '';
        
        // Create grid cells
        for (let row = 0; row < this.gridHeight; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridWidth; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridContainer.appendChild(cell);
                this.grid[row][col] = cell;
            }
        }
    }
    
    generateContributionPattern() {
        // Generate a realistic contribution pattern
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                // Random contribution level (0-4) with weighted distribution
                const random = Math.random();
                let level = 0;
                
                if (random > 0.7) level = 1;
                if (random > 0.85) level = 2;
                if (random > 0.95) level = 3;
                if (random > 0.98) level = 4;
                
                this.grid[row][col].className = `grid-cell level-${level}`;
                this.grid[row][col].dataset.originalLevel = level;
            }
        }
    }
    
    bindEvents() {
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(event) {
        if (!this.gameRunning) return;
        
        const key = event.key.toLowerCase();
        let newDirection = { ...this.direction };
        
        // Arrow keys and WASD controls
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.direction.y !== 1) newDirection = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y !== -1) newDirection = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x !== 1) newDirection = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x !== -1) newDirection = { x: 1, y: 0 };
                break;
        }
        
        this.direction = newDirection;
        event.preventDefault();
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        // Initialize snake
        this.snake = [
            { x: 5, y: 3 },
            { x: 4, y: 3 },
            { x: 3, y: 3 }
        ];
        
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.updateScore();
        this.spawnFood();
        this.gameRunning = true;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;
        
        this.updateGameStatus('Game started! Use arrow keys or WASD to control the snake.');
        this.gameLoop = setInterval(() => this.update(), this.speed);
        
        this.renderSnake();
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        this.updateGameStatus('Game paused. Press START to continue.');
    }
    
    resetGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Clear snake and food from grid
        this.clearSnake();
        this.clearFood();
        
        // Reset game state
        this.snake = [];
        this.food = null;
        this.direction = { x: 1, y: 0 };
        this.score = 0;
        this.updateScore();
        
        // Reset buttons
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('resetBtn').disabled = true;
        
        // Regenerate contribution pattern
        this.generateContributionPattern();
        
        this.updateGameStatus('Press START to begin the snake game!');
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Calculate new head position
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.clearFood();
            this.spawnFood();
            
            // Increase speed slightly
            if (this.speed > 100) {
                this.speed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
        
        this.renderSnake();
    }
    
    spawnFood() {
        let foodPosition;
        let attempts = 0;
        
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            attempts++;
        } while (
            this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y) &&
            attempts < 100
        );
        
        this.food = foodPosition;
        this.grid[this.food.y][this.food.x].classList.add('food');
    }
    
    clearFood() {
        if (this.food) {
            this.grid[this.food.y][this.food.x].classList.remove('food');
        }
    }
    
    renderSnake() {
        // Clear previous snake
        this.clearSnake();
        
        // Render new snake
        this.snake.forEach((segment, index) => {
            const cell = this.grid[segment.y][segment.x];
            if (index === 0) {
                cell.classList.add('snake-head');
            } else {
                cell.classList.add('snake-body');
            }
        });
    }
    
    clearSnake() {
        // Remove snake classes from all cells
        for (let row = 0; row < this.gridHeight; row++) {
            for (let col = 0; col < this.gridWidth; col++) {
                this.grid[row][col].classList.remove('snake-head', 'snake-body');
            }
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        this.updateGameStatus(`Game Over! Final Score: ${this.score}. Press RESET to play again.`);
        
        // Show game over modal
        this.showGameOverModal();
    }
    
    showGameOverModal() {
        const modal = document.createElement('div');
        modal.className = 'game-over';
        modal.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Your Score: ${this.score}</p>
                <p>Snake Length: ${this.snake.length}</p>
                <button onclick="this.parentElement.parentElement.remove(); snakeGame.resetGame();">Play Again</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Auto-remove modal after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateGameStatus(message) {
        document.getElementById('gameStatus').querySelector('p').textContent = message;
    }
}

// Initialize the game when the page loads
let snakeGame;

document.addEventListener('DOMContentLoaded', () => {
    snakeGame = new SnakeGame();
    
    // Add some helpful tooltips
    document.getElementById('contributionsGrid').addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('grid-cell')) {
            const row = e.target.dataset.row;
            const col = e.target.dataset.col;
            e.target.title = `Row: ${row}, Column: ${col}`;
        }
    });
    
    // Add keyboard shortcut info
    console.log('🐍 GitHub Contributions Snake Game Controls:');
    console.log('↑ W: Move Up');
    console.log('↓ S: Move Down');
    console.log('← A: Move Left');
    console.log('→ D: Move Right');
    console.log('Good luck! 🎮');
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}