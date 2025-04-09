import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Play } from 'lucide-react';

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameStatus = 'PLAYING' | 'GAME_OVER' | 'IDLE';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const GAME_SPEED = 150;

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Generate random food position
  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // Ensure food doesn't spawn on snake
    return snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
      ? generateFood()
      : newFood;
  }, [snake]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStatus]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const moveSnake = () => {
      const head = snake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP':
          newHead.y -= 1;
          break;
        case 'DOWN':
          newHead.y += 1;
          break;
        case 'LEFT':
          newHead.x -= 1;
          break;
        case 'RIGHT':
          newHead.x += 1;
          break;
      }

      // Check collision with walls
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameStatus('GAME_OVER');
        return;
      }

      // Check collision with self
      if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameStatus('GAME_OVER');
        return;
      }

      const newSnake = [newHead];

      // Check if snake ate food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
        newSnake.push(...snake);
      } else {
        newSnake.push(...snake.slice(0, -1));
      }

      setSnake(newSnake);
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameStatus, generateFood]);

  // Update high score when game ends
  useEffect(() => {
    if (gameStatus === 'GAME_OVER' && score > highScore) {
      setHighScore(score);
    }
  }, [gameStatus, score, highScore]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setScore(0);
    setGameStatus('PLAYING');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl">Score: {score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            <span className="text-xl">High Score: {highScore}</span>
          </div>
        </div>

        <div 
          className="relative bg-gray-800 border-2 border-gray-700"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? 'bg-green-500' : 'bg-green-400'} rounded-sm`}
              style={{
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
            }}
          />
        </div>

        {gameStatus !== 'PLAYING' && (
          <div className="text-center">
            <button
              onClick={startGame}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <Play size={20} />
              {gameStatus === 'GAME_OVER' ? 'Play Again' : 'Start Game'}
            </button>
            {gameStatus === 'GAME_OVER' && (
              <p className="mt-4 text-red-500 font-bold text-xl">Game Over!</p>
            )}
            {gameStatus === 'IDLE' && (
              <div className="mt-4 text-gray-400">
                <p>Use arrow keys or WASD to control the snake</p>
                <p>Eat the red food to grow and score points</p>
                <p>Don't hit the walls or yourself!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;