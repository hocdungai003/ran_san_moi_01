import { useState, useEffect, useCallback } from 'react';
import { Trophy, Play } from 'lucide-react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
`;

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameStatus = 'PLAYING' | 'GAME_OVER' | 'IDLE';
type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

interface DifficultySettings {
  gridSize: number;
  speed: number;
  obstacles: Position[];
}

const generateObstacles = (count: number): Position[] => {
  const obstacles: Position[] = [];
  const maxGridSize = 40;
  while (obstacles.length < count) {
    const obstacle = {
      x: Math.floor(Math.random() * maxGridSize),
      y: Math.floor(Math.random() * maxGridSize),
    };
    if (!obstacles.some(o => o.x === obstacle.x && o.y === obstacle.y)) {
      obstacles.push(obstacle);
    }
  }
  return obstacles;
};

const DIFFICULTY_LEVELS: Record<DifficultyLevel, DifficultySettings> = {
  1: { gridSize: 20, speed: 250, obstacles: [] },
  2: { gridSize: 25, speed: 200, obstacles: [] },
  3: { gridSize: 30, speed: 150, obstacles: generateObstacles(5) },
  4: { gridSize: 35, speed: 120, obstacles: generateObstacles(10) },
  5: { gridSize: 40, speed: 80, obstacles: generateObstacles(15) },
};

function App() {
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const { gridSize, speed, obstacles: initialObstacles } = DIFFICULTY_LEVELS[level];
  
  // Tính toán cellSize dựa trên chiều rộng màn hình
  const [cellSize, setCellSize] = useState(22); // Giá trị mặc định
  const INITIAL_SNAKE: Position[] = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];

  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [obstacles, setObstacles] = useState<Position[]>(initialObstacles);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Điều chỉnh cellSize theo kích thước màn hình
  useEffect(() => {
    const updateCellSize = () => {
      const screenWidth = window.innerWidth;
      const maxBoardSize = Math.min(screenWidth - 20, 600); // Giới hạn tối đa 600px
      const newCellSize = Math.floor(maxBoardSize / gridSize);
      setCellSize(newCellSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [gridSize]);

  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
    return snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y)
      ? generateFood()
      : newFood;
  }, [snake, obstacles, gridSize]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameStatus !== 'PLAYING') return;
      updateDirection(e.key);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStatus]);

  useEffect(() => {
    if (gameStatus !== 'PLAYING') return;

    const moveSnake = () => {
      const head = snake[0];
      const newHead = { ...head };

      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      if (
        newHead.x < 0 ||
        newHead.x >= gridSize ||
        newHead.y < 0 ||
        newHead.y >= gridSize ||
        snake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
        obstacles.some(obstacle => obstacle.x === newHead.x && obstacle.y === newHead.y)
      ) {
        setGameStatus('GAME_OVER');
        return;
      }

      const newSnake = [newHead];
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 1);
        setFood(generateFood());
        newSnake.push(...snake);
      } else {
        newSnake.push(...snake.slice(0, -1));
      }
      setSnake(newSnake);
    };

    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [snake, direction, food, gameStatus, generateFood, gridSize, speed, obstacles]);

  useEffect(() => {
    if (gameStatus === 'GAME_OVER' && score > highScore) {
      setHighScore(score);
    }
  }, [gameStatus, score, highScore]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection('UP');
    setFood(generateFood());
    setObstacles(DIFFICULTY_LEVELS[level].obstacles);
    setScore(0);
    setGameStatus('PLAYING');
  };

  const updateDirection = (key: string) => {
    switch (key) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 flex flex-col items-center justify-center p-4 sm:p-6 font-[Poppins]">
      <style>{styles}</style>
      <div className="w-full max-w-3xl">
        {/* Score and Level Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 text-white">
            <span className="text-lg sm:text-xl font-bold tracking-tight">Score: {score}</span>
          </div>
          <div className="flex items-center gap-3 text-amber-400">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-lg sm:text-xl font-bold tracking-tight">High: {highScore}</span>
          </div>
          {(gameStatus === 'IDLE' || gameStatus === 'GAME_OVER') && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {([1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all duration-200 ${
                    level === lvl
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div
          className="relative bg-gray-800/90 rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden mx-auto w-full max-w-[90vw] sm:max-w-[600px] aspect-square"
          style={{
            width: gridSize * cellSize,
            height: gridSize * cellSize,
            background: 'linear-gradient(135deg, #2d3748, #1a202c)',
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute rounded-full transition-all duration-100 ease-in-out ${
                index === 0
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_8px_rgba(16,185,129,0.8)] border border-emerald-400/50'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]'
              }`}
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                left: segment.x * cellSize,
                top: segment.y * cellSize,
                transform: 'translate(1px, 1px)',
              }}
            />
          ))}
          <div
            className="absolute bg-gradient-to-br from-rose-500 to-pink-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.7)] border border-rose-400/50"
            style={{
              width: cellSize - 2,
              height: cellSize - 2,
              left: food.x * cellSize,
              top: food.y * cellSize,
              transform: 'translate(1px, 1px)',
            }}
          />
          {obstacles.map((obstacle, index) => (
            <div
              key={`obstacle-${index}`}
              className="absolute bg-gray-600/80 rounded-sm shadow-inner border border-gray-500/50"
              style={{
                width: cellSize - 2,
                height: cellSize - 2,
                left: obstacle.x * cellSize,
                top: obstacle.y * cellSize,
                transform: 'translate(1px, 1px)',
              }}
            />
          ))}
        </div>

        {/* Controls and Status */}
        <div className="mt-6 sm:mt-8">
          {gameStatus !== 'PLAYING' ? (
            <div className="text-center space-y-4 sm:space-y-6">
              <button
                onClick={startGame}
                className="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-[200px] sm:max-w-xs mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Play size={20} />
                {gameStatus === 'GAME_OVER' ? 'Play Again' : 'Start Game'}
              </button>
              {gameStatus === 'GAME_OVER' && (
                <p className="text-rose-400 font-bold text-xl sm:text-2xl animate-bounce drop-shadow-md">Game Over!</p>
              )}
              {gameStatus === 'IDLE' && (
                <div className="text-gray-300 text-xs sm:text-sm space-y-1">
                  <p className="font-semibold">Level: {level}</p>
                  <p>Use WASD or Arrow keys to move</p>
                  <p>Eat the red food to grow, avoid obstacles!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-[200px] sm:max-w-xs mx-auto">
              <div></div>
              <button
                onClick={() => updateDirection('ArrowUp')}
                className="bg-gray-700 hover:bg-gray-600 p-3 sm:p-4 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl shadow-md transition-all duration-200 hover:scale-110"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => updateDirection('ArrowLeft')}
                className="bg-gray-700 hover:bg-gray-600 p-3 sm:p-4 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl shadow-md transition-all duration-200 hover:scale-110"
              >
                ←
              </button>
              <div></div>
              <button
                onClick={() => updateDirection('ArrowRight')}
                className="bg-gray-700 hover:bg-gray-600 p-3 sm:p-4 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl shadow-md transition-all duration-200 hover:scale-110"
              >
                →
              </button>
              <div></div>
              <button
                onClick={() => updateDirection('ArrowDown')}
                className="bg-gray-700 hover:bg-gray-600 p-3 sm:p-4 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl shadow-md transition-all duration-200 hover:scale-110"
              >
                ↓
              </button>
              <div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;