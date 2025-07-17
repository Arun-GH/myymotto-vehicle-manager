import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import BottomNav from "@/components/bottom-nav";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface Car {
  x: number;
  y: number;
  angle: number;
  speed: number;
  fuel: number;
}

interface Hill {
  points: { x: number; y: number }[];
}

export default function ClimbingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('paused');
  const [score, setScore] = useState(0);
  const [car, setCar] = useState<Car>({ x: 50, y: 300, angle: 0, speed: 0, fuel: 100 });
  const [keys, setKeys] = useState({ left: false, right: false, up: false });
  const animationRef = useRef<number>();

  // Generate hill terrain
  const generateHill = (): Hill => {
    const points = [];
    for (let x = 0; x <= 800; x += 20) {
      const y = 350 + Math.sin(x * 0.01) * 50 + Math.sin(x * 0.005) * 30;
      points.push({ x, y });
    }
    return { points };
  };

  const [hill] = useState<Hill>(generateHill());

  // Game physics
  const updateGame = () => {
    if (gameState !== 'playing') return;

    setCar(prevCar => {
      let newCar = { ...prevCar };

      // Handle input
      if (keys.up && newCar.fuel > 0) {
        newCar.speed += 0.3;
        newCar.fuel -= 0.5;
      }
      if (keys.left) {
        newCar.angle -= 2;
      }
      if (keys.right) {
        newCar.angle += 2;
      }

      // Apply physics
      newCar.speed *= 0.98; // friction
      newCar.x += Math.cos(newCar.angle * Math.PI / 180) * newCar.speed;
      newCar.y += Math.sin(newCar.angle * Math.PI / 180) * newCar.speed;

      // Gravity
      newCar.y += 2;

      // Collision with ground
      const groundY = getGroundHeight(newCar.x);
      if (newCar.y >= groundY) {
        newCar.y = groundY;
        newCar.speed *= 0.7;
        if (Math.abs(newCar.angle) > 45) {
          setGameState('gameOver');
        }
      }

      // Boundary checks
      if (newCar.x < 0) newCar.x = 0;
      if (newCar.fuel <= 0) {
        newCar.fuel = 0;
        newCar.speed *= 0.95;
      }

      return newCar;
    });

    setScore(prev => prev + 1);
  };

  const getGroundHeight = (x: number): number => {
    const point1 = hill.points.find(p => p.x >= x);
    const point2 = hill.points.find(p => p.x <= x);
    if (!point1 || !point2) return 350;
    return point1.y;
  };

  // Render game
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    hill.points.forEach(point => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    hill.points.forEach(point => {
      ctx.lineTo(point.x, point.y - 5);
    });
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw car
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle * Math.PI / 180);
    
    // Car body
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(-15, -8, 30, 16);
    
    // Car windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(-10, -6, 20, 8);
    
    // Wheels
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-10, 8, 6, 0, Math.PI * 2);
    ctx.arc(10, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    } else {
      render();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, car, keys]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({
        ...prev,
        left: e.key === 'ArrowLeft' || prev.left,
        right: e.key === 'ArrowRight' || prev.right,
        up: e.key === 'ArrowUp' || e.key === ' ' || prev.up
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({
        ...prev,
        left: e.key === 'ArrowLeft' ? false : prev.left,
        right: e.key === 'ArrowRight' ? false : prev.right,
        up: (e.key === 'ArrowUp' || e.key === ' ') ? false : prev.up
      }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetGame = () => {
    setCar({ x: 50, y: 300, angle: 0, speed: 0, fuel: 100 });
    setScore(0);
    setGameState('paused');
  };

  const toggleGame = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient-border border-4 border-red-500 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:bg-red-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img 
                src={logoImage} 
                alt="Myymotto Logo" 
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <ColorfulLogo />
                <p className="text-sm text-red-600">Hill Climb Racing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20 bg-warm-pattern">
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-lg font-bold text-orange-600">{score}</p>
            </CardContent>
          </Card>
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Fuel</p>
              <p className="text-lg font-bold text-blue-600">{Math.round(car.fuel)}%</p>
            </CardContent>
          </Card>
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Speed</p>
              <p className="text-lg font-bold text-green-600">{Math.round(car.speed)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Canvas */}
        <Card className="shadow-orange mb-4">
          <CardContent className="p-0">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-auto border-2 border-orange-200 rounded-lg"
              style={{ background: '#87CEEB' }}
            />
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={toggleGame}
            className="gradient-warm text-white"
            disabled={gameState === 'gameOver'}
          >
            {gameState === 'playing' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                {gameState === 'gameOver' ? 'Game Over' : 'Start'}
              </>
            )}
          </Button>
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Mobile Controls */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="text-center text-sm">Mobile Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="h-12"
                onTouchStart={() => setKeys(prev => ({ ...prev, left: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, left: false }))}
                onMouseDown={() => setKeys(prev => ({ ...prev, left: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, left: false }))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onTouchStart={() => setKeys(prev => ({ ...prev, up: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, up: false }))}
                onMouseDown={() => setKeys(prev => ({ ...prev, up: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, up: false }))}
              >
                GAS
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onTouchStart={() => setKeys(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, right: false }))}
                onMouseDown={() => setKeys(prev => ({ ...prev, right: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, right: false }))}
              >
                →
              </Button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Use arrow keys on desktop or touch controls on mobile
            </p>
          </CardContent>
        </Card>

        {gameState === 'gameOver' && (
          <Card className="shadow-orange mt-4 bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-red-700 mb-2">Game Over!</h3>
              <p className="text-sm text-red-600 mb-3">Final Score: {score}</p>
              <Button
                onClick={resetGame}
                className="gradient-warm text-white"
              >
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav currentPath="/" />
    </div>
  );
}