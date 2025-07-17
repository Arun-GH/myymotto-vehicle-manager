import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import BottomNav from "@/components/bottom-nav";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

export default function ClimbingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('paused');
  const [score, setScore] = useState(0);
  const [carX, setCarX] = useState(50);
  const [carY, setCarY] = useState(250);
  const [fuel, setFuel] = useState(100);
  const [keys, setKeys] = useState({ left: false, right: false, up: false });

  // Simple render function
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with sky blue
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 400, 300);

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 280, 400, 20);

    // Draw grass
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 275, 400, 5);

    // Draw hills (simple triangles)
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(100, 280);
    ctx.lineTo(150, 220);
    ctx.lineTo(200, 280);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(250, 280);
    ctx.lineTo(300, 200);
    ctx.lineTo(350, 280);
    ctx.closePath();
    ctx.fill();

    // Draw car
    ctx.fillStyle = '#FF6B35';
    ctx.fillRect(carX - 15, carY - 8, 30, 16);
    
    // Car windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(carX - 10, carY - 6, 20, 8);
    
    // Wheels
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(carX - 10, carY + 8, 6, 0, Math.PI * 2);
    ctx.arc(carX + 10, carY + 8, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw clouds
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(100, 50, 20, 0, Math.PI * 2);
    ctx.arc(120, 50, 25, 0, Math.PI * 2);
    ctx.arc(140, 50, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(300, 80, 15, 0, Math.PI * 2);
    ctx.arc(315, 80, 20, 0, Math.PI * 2);
    ctx.arc(330, 80, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  // Game update function
  const updateGame = () => {
    if (gameState !== 'playing') return;

    // Handle input
    if (keys.left && carX > 20) {
      setCarX(prev => prev - 3);
    }
    if (keys.right && carX < 380) {
      setCarX(prev => prev + 3);
    }
    if (keys.up && fuel > 0) {
      setCarY(prev => Math.max(prev - 2, 50));
      setFuel(prev => Math.max(prev - 0.5, 0));
    } else {
      // Gravity
      setCarY(prev => Math.min(prev + 1, 250));
    }

    setScore(prev => prev + 1);
    render();
  };

  // Game loop
  useEffect(() => {
    let interval: number;
    if (gameState === 'playing') {
      interval = setInterval(updateGame, 50);
    } else {
      render();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState, keys, carX, carY, fuel]);

  // Initial render
  useEffect(() => {
    render();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }));
      if (e.key === 'ArrowUp' || e.key === ' ') setKeys(prev => ({ ...prev, up: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }));
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }));
      if (e.key === 'ArrowUp' || e.key === ' ') setKeys(prev => ({ ...prev, up: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetGame = () => {
    setCarX(50);
    setCarY(250);
    setScore(0);
    setFuel(100);
    setGameState('paused');
    render();
  };

  const toggleGame = () => {
    if (fuel <= 0 && gameState !== 'paused') {
      setGameState('gameOver');
    } else {
      setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
    }
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
              <p className="text-lg font-bold text-blue-600">{Math.round(fuel)}%</p>
            </CardContent>
          </Card>
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Position</p>
              <p className="text-lg font-bold text-green-600">{Math.round(carX)}</p>
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
            />
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={toggleGame}
            className="gradient-warm text-white"
            disabled={fuel <= 0 && gameState !== 'paused'}
          >
            {gameState === 'playing' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : fuel <= 0 ? (
              'Out of Fuel'
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
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
            <CardTitle className="text-center text-sm">Controls</CardTitle>
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
                ← Left
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onTouchStart={() => setKeys(prev => ({ ...prev, up: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, up: false }))}
                onMouseDown={() => setKeys(prev => ({ ...prev, up: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, up: false }))}
              >
                ↑ Jump
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onTouchStart={() => setKeys(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setKeys(prev => ({ ...prev, right: false }))}
                onMouseDown={() => setKeys(prev => ({ ...prev, right: true }))}
                onMouseUp={() => setKeys(prev => ({ ...prev, right: false }))}
              >
                Right →
              </Button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              Use arrow keys on desktop or touch controls on mobile
            </p>
          </CardContent>
        </Card>

        {fuel <= 0 && (
          <Card className="shadow-orange mt-4 bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-red-700 mb-2">Out of Fuel!</h3>
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