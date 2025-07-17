import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Play, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import BottomNav from "@/components/bottom-nav";
import ColorfulLogo from "@/components/colorful-logo";
import logoImage from "@/assets/Mymotto_Logo_Green_Revised_1752603344750.png";

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isEmpty: boolean;
}

export default function ClimbingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'completed'>('ready');
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [emptyPosition, setEmptyPosition] = useState(8);

  // Sports car images using CSS gradients and shapes
  const sportsCars = [
    {
      name: "Ferrari",
      color: "#DC143C",
      accent: "#8B0000"
    },
    {
      name: "Lamborghini", 
      color: "#FFD700",
      accent: "#FF8C00"
    },
    {
      name: "McLaren",
      color: "#FF4500",
      accent: "#FF6347"
    },
    {
      name: "Porsche",
      color: "#32CD32",
      accent: "#228B22"
    },
    {
      name: "Bugatti",
      color: "#4169E1",
      accent: "#191970"
    }
  ];

  const currentCar = sportsCars[currentCarIndex];

  // Initialize puzzle
  const initializePuzzle = () => {
    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < 9; i++) {
      newPieces.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isEmpty: i === 8
      });
    }
    shufflePuzzle(newPieces);
    setPieces(newPieces);
    setMoves(0);
    setTimer(0);
    setGameState('ready');
  };

  // Shuffle puzzle pieces
  const shufflePuzzle = (puzzlePieces: PuzzlePiece[]) => {
    const shuffledPositions = Array.from({ length: 8 }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
    }
    
    // Assign shuffled positions
    puzzlePieces.forEach((piece, index) => {
      if (index < 8) {
        piece.currentPosition = shuffledPositions[index];
      }
    });
    
    setEmptyPosition(8);
  };

  // Draw sports car on canvas
  const drawSportsCar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 300, 300);

    const pieceWidth = 100;
    const pieceHeight = 100;

    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pieceWidth, 0);
      ctx.lineTo(i * pieceWidth, 300);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * pieceHeight);
      ctx.lineTo(300, i * pieceHeight);
      ctx.stroke();
    }

    // Draw puzzle pieces
    pieces.forEach((piece) => {
      if (piece.isEmpty) return;

      const row = Math.floor(piece.currentPosition / 3);
      const col = piece.currentPosition % 3;
      const x = col * pieceWidth;
      const y = row * pieceHeight;

      const correctRow = Math.floor(piece.correctPosition / 3);
      const correctCol = piece.correctPosition % 3;

      // Draw piece of the car based on correct position
      ctx.save();
      ctx.fillStyle = currentCar.color;
      
      // Main car body section
      if (correctRow === 0 && correctCol === 1) {
        // Top center - roof
        ctx.fillRect(x + 20, y + 30, 60, 40);
        ctx.fillStyle = currentCar.accent;
        ctx.fillRect(x + 25, y + 35, 50, 30);
      } else if (correctRow === 1) {
        // Middle row - main body
        ctx.fillRect(x + 10, y + 20, 80, 60);
        if (correctCol === 0) {
          // Left door
          ctx.fillStyle = currentCar.accent;
          ctx.fillRect(x + 15, y + 30, 30, 40);
        } else if (correctCol === 1) {
          // Center - windshield
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(x + 30, y + 25, 40, 30);
        } else {
          // Right door
          ctx.fillStyle = currentCar.accent;
          ctx.fillRect(x + 55, y + 30, 30, 40);
        }
      } else if (correctRow === 2) {
        // Bottom row - wheels and bumper
        ctx.fillRect(x + 5, y + 10, 90, 50);
        if (correctCol === 0 || correctCol === 2) {
          // Wheels
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x + 25, y + 70, 15, 0, Math.PI * 2);
          ctx.fill();
          if (correctCol === 2) {
            ctx.beginPath();
            ctx.arc(x + 75, y + 70, 15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        // Top corners
        if (correctCol === 0) {
          // Top left - headlight
          ctx.fillRect(x + 20, y + 60, 60, 30);
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(x + 30, y + 75, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Top right - headlight
          ctx.fillRect(x + 20, y + 60, 60, 30);
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(x + 70, y + 75, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      // Draw piece number for debugging
      ctx.fillStyle = '#FFF';
      ctx.font = '12px Arial';
      ctx.fillText(`${piece.correctPosition + 1}`, x + 5, y + 15);
    });

    // Highlight empty space
    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyCol = emptyPosition % 3;
    const emptyX = emptyCol * pieceWidth;
    const emptyY = emptyRow * pieceHeight;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(emptyX + 2, emptyY + 2, pieceWidth - 4, pieceHeight - 4);
  };

  // Handle piece click
  const handlePieceClick = (clickedPosition: number) => {
    if (gameState !== 'playing') return;

    const clickedRow = Math.floor(clickedPosition / 3);
    const clickedCol = clickedPosition % 3;
    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyCol = emptyPosition % 3;

    // Check if clicked piece is adjacent to empty space
    const isAdjacent = 
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);

    if (!isAdjacent) return;

    // Move piece to empty position
    const newPieces = pieces.map(piece => {
      if (piece.currentPosition === clickedPosition) {
        return { ...piece, currentPosition: emptyPosition };
      }
      return piece;
    });

    setPieces(newPieces);
    setEmptyPosition(clickedPosition);
    setMoves(prev => prev + 1);

    // Check if puzzle is solved
    const isSolved = newPieces.every(piece => 
      piece.isEmpty || piece.currentPosition === piece.correctPosition
    );

    if (isSolved) {
      setGameState('completed');
    }
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const col = Math.floor(canvasX / 100);
    const row = Math.floor(canvasY / 100);
    const clickedPosition = row * 3 + col;

    if (clickedPosition >= 0 && clickedPosition < 9) {
      handlePieceClick(clickedPosition);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);

  // Draw effect
  useEffect(() => {
    drawSportsCar();
  }, [pieces, currentCarIndex, emptyPosition]);

  // Initialize on mount
  useEffect(() => {
    initializePuzzle();
  }, [currentCarIndex]);

  const startGame = () => {
    setGameState('playing');
    setTimer(0);
    setMoves(0);
  };

  const newPuzzle = () => {
    const nextCarIndex = (currentCarIndex + 1) % sportsCars.length;
    setCurrentCarIndex(nextCarIndex);
  };

  const resetPuzzle = () => {
    initializePuzzle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                <p className="text-sm text-red-600">Car Puzzle Game</p>
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
              <p className="text-sm text-gray-600">Car</p>
              <p className="text-sm font-bold" style={{ color: currentCar.color }}>
                {currentCar.name}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Moves</p>
              <p className="text-lg font-bold text-blue-600">{moves}</p>
            </CardContent>
          </Card>
          <Card className="shadow-orange">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-lg font-bold text-green-600">{formatTime(timer)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Game Canvas */}
        <Card className="shadow-orange mb-4">
          <CardContent className="p-4">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="w-full h-auto border-2 border-orange-200 rounded-lg cursor-pointer"
              onClick={handleCanvasClick}
            />
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={gameState === 'ready' ? startGame : resetPuzzle}
            className="gradient-warm text-white"
          >
            {gameState === 'ready' ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </>
            )}
          </Button>
          <Button
            onClick={newPuzzle}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            New Car
          </Button>
        </div>

        {/* Instructions */}
        <Card className="shadow-orange">
          <CardHeader>
            <CardTitle className="text-center text-sm">How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 text-center mb-2">
              Tap pieces next to the empty space to move them. Arrange all pieces to complete the {currentCar.name} sports car image!
            </p>
            <p className="text-xs text-gray-500 text-center">
              Numbers show correct positions. Try different cars for variety!
            </p>
          </CardContent>
        </Card>

        {gameState === 'completed' && (
          <Card className="shadow-orange mt-4 bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <h3 className="text-lg font-bold text-green-700 mb-2">Puzzle Completed!</h3>
              <p className="text-sm text-green-600 mb-3">
                {currentCar.name} completed in {moves} moves and {formatTime(timer)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={newPuzzle}
                  className="gradient-warm text-white"
                >
                  Try New Car
                </Button>
                <Button
                  onClick={resetPuzzle}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Play Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav currentPath="/" />
    </div>
  );
}