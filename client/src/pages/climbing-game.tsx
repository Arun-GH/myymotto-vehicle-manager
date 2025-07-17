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

  // Sports car designs with realistic styling
  const sportsCars = [
    {
      name: "Ferrari",
      color: "#DC143C",
      accent: "#8B0000",
      style: "supercar" // Low, sleek profile
    },
    {
      name: "Lamborghini", 
      color: "#FFD700",
      accent: "#FF8C00",
      style: "angular" // Sharp, angular design
    },
    {
      name: "McLaren",
      color: "#FF4500",
      accent: "#FF6347",
      style: "modern" // Smooth, modern curves
    },
    {
      name: "Porsche",
      color: "#32CD32",
      accent: "#228B22",
      style: "classic" // Classic sports car profile
    },
    {
      name: "Bugatti",
      color: "#4169E1",
      accent: "#191970",
      style: "luxury" // Luxury hypercar design
    }
  ];

  const currentCar = sportsCars[currentCarIndex];

  // Initialize puzzle
  const initializePuzzle = () => {
    const newPieces: PuzzlePiece[] = [];
    
    // Create pieces 0-7 (piece 8 is the empty space)
    for (let i = 0; i < 8; i++) {
      newPieces.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isEmpty: false
      });
    }
    
    // Add empty piece
    newPieces.push({
      id: 8,
      currentPosition: 8,
      correctPosition: 8,
      isEmpty: true
    });
    
    shufflePuzzle(newPieces);
    setPieces(newPieces);
    setMoves(0);
    setTimer(0);
    setGameState('ready');
  };

  // Shuffle puzzle pieces
  const shufflePuzzle = (puzzlePieces: PuzzlePiece[]) => {
    // Create a solvable shuffle by doing random valid moves
    let currentEmpty = 8;
    
    for (let i = 0; i < 200; i++) {
      const emptyRow = Math.floor(currentEmpty / 3);
      const emptyCol = currentEmpty % 3;
      
      // Find adjacent positions
      const adjacentPositions = [];
      if (emptyRow > 0) adjacentPositions.push(currentEmpty - 3); // Above
      if (emptyRow < 2) adjacentPositions.push(currentEmpty + 3); // Below
      if (emptyCol > 0) adjacentPositions.push(currentEmpty - 1); // Left
      if (emptyCol < 2) adjacentPositions.push(currentEmpty + 1); // Right
      
      // Pick random adjacent position to swap with empty
      const randomAdjacent = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
      
      // Find piece at that position and swap with empty
      const pieceToMove = puzzlePieces.find(p => p.currentPosition === randomAdjacent);
      if (pieceToMove) {
        pieceToMove.currentPosition = currentEmpty;
        currentEmpty = randomAdjacent;
      }
    }
    
    setEmptyPosition(currentEmpty);
  };

  // Draw realistic sports car based on style
  const drawCarSection = (ctx: CanvasRenderingContext2D, x: number, y: number, correctRow: number, correctCol: number) => {
    const style = currentCar.style;
    
    ctx.save();
    
    // Different car styles based on brand
    switch (style) {
      case "supercar": // Ferrari - low and sleek
        drawFerrariSection(ctx, x, y, correctRow, correctCol);
        break;
      case "angular": // Lamborghini - sharp edges
        drawLamborghiniSection(ctx, x, y, correctRow, correctCol);
        break;
      case "modern": // McLaren - smooth curves
        drawMcLarenSection(ctx, x, y, correctRow, correctCol);
        break;
      case "classic": // Porsche - classic sports car
        drawPorscheSection(ctx, x, y, correctRow, correctCol);
        break;
      case "luxury": // Bugatti - luxury hypercar
        drawBugattiSection(ctx, x, y, correctRow, correctCol);
        break;
      default:
        drawFerrariSection(ctx, x, y, correctRow, correctCol);
    }
    
    ctx.restore();
  };

  // Ferrari - Sleek supercar design
  const drawFerrariSection = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    if (row === 0) { // Top row - front section
      if (col === 0) { // Front left
        ctx.fillStyle = currentCar.color;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 80);
        ctx.quadraticCurveTo(x + 20, y + 20, x + 80, y + 60);
        ctx.lineTo(x + 100, y + 100);
        ctx.lineTo(x, y + 100);
        ctx.closePath();
        ctx.fill();
        // Headlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 25, y + 70, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (col === 1) { // Front center - hood
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y + 60, 100, 40);
        // Hood lines
        ctx.strokeStyle = currentCar.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 70);
        ctx.lineTo(x + 80, y + 70);
        ctx.stroke();
      } else { // Front right
        ctx.fillStyle = currentCar.color;
        ctx.beginPath();
        ctx.moveTo(x + 90, y + 80);
        ctx.quadraticCurveTo(x + 80, y + 20, x + 20, y + 60);
        ctx.lineTo(x, y + 100);
        ctx.lineTo(x + 100, y + 100);
        ctx.closePath();
        ctx.fill();
        // Headlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 75, y + 70, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (row === 1) { // Middle row - cabin
      if (col === 0) { // Left door
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 100);
        ctx.fillStyle = currentCar.accent;
        ctx.fillRect(x + 10, y + 20, 80, 60);
        // Door handle
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 80, y + 45, 8, 15);
      } else if (col === 1) { // Windshield/roof
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 100);
        // Windshield
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 10);
        ctx.lineTo(x + 85, y + 10);
        ctx.lineTo(x + 75, y + 50);
        ctx.lineTo(x + 25, y + 50);
        ctx.closePath();
        ctx.fill();
      } else { // Right door
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 100);
        ctx.fillStyle = currentCar.accent;
        ctx.fillRect(x + 10, y + 20, 80, 60);
        // Door handle
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(x + 12, y + 45, 8, 15);
      }
    } else { // Bottom row - rear section
      if (col === 0) { // Rear left wheel
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 60);
        // Wheel
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 25, y + 80, 18, 0, Math.PI * 2);
        ctx.fill();
        // Rim
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(x + 25, y + 80, 12, 0, Math.PI * 2);
        ctx.fill();
      } else if (col === 1) { // Rear center
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 60);
        // Rear spoiler
        ctx.fillStyle = currentCar.accent;
        ctx.fillRect(x + 20, y + 10, 60, 8);
      } else { // Rear right wheel
        ctx.fillStyle = currentCar.color;
        ctx.fillRect(x, y, 100, 60);
        // Wheel
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 75, y + 80, 18, 0, Math.PI * 2);
        ctx.fill();
        // Rim
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        ctx.arc(x + 75, y + 80, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Lamborghini - Angular design
  const drawLamborghiniSection = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    if (row === 0) { // Front section - angular nose
      if (col === 0 || col === 2) {
        ctx.fillStyle = currentCar.color;
        ctx.beginPath();
        ctx.moveTo(x + 10, y + 90);
        ctx.lineTo(x + 50, y + 30);
        ctx.lineTo(x + 90, y + 70);
        ctx.lineTo(x + 90, y + 100);
        ctx.lineTo(x, y + 100);
        ctx.closePath();
        ctx.fill();
        // Sharp headlight
        ctx.fillStyle = '#FFFFFF';
        const hx = col === 0 ? x + 20 : x + 80;
        ctx.beginPath();
        ctx.moveTo(hx, y + 70);
        ctx.lineTo(hx + 15, y + 65);
        ctx.lineTo(hx + 15, y + 75);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = currentCar.color;
        ctx.beginPath();
        ctx.moveTo(x, y + 70);
        ctx.lineTo(x + 30, y + 20);
        ctx.lineTo(x + 70, y + 20);
        ctx.lineTo(x + 100, y + 70);
        ctx.lineTo(x + 100, y + 100);
        ctx.lineTo(x, y + 100);
        ctx.closePath();
        ctx.fill();
      }
    } else if (row === 1) {
      drawFerrariSection(ctx, x, y, row, col); // Similar cabin structure
    } else {
      drawFerrariSection(ctx, x, y, row, col); // Similar rear structure
    }
  };

  // McLaren - Modern curves
  const drawMcLarenSection = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    if (row === 0) { // Smooth curved front
      ctx.fillStyle = currentCar.color;
      ctx.beginPath();
      ctx.moveTo(x, y + 100);
      ctx.quadraticCurveTo(x + 50, y + 40, x + 100, y + 100);
      ctx.lineTo(x, y + 100);
      ctx.closePath();
      ctx.fill();
      if (col === 0 || col === 2) {
        // Modern LED headlights
        ctx.fillStyle = '#FFFFFF';
        const hx = col === 0 ? x + 25 : x + 75;
        ctx.fillRect(hx - 8, y + 75, 16, 4);
      }
    } else {
      drawFerrariSection(ctx, x, y, row, col);
    }
  };

  // Porsche - Classic sports car
  const drawPorscheSection = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    if (row === 0) { // Classic rounded front
      ctx.fillStyle = currentCar.color;
      ctx.beginPath();
      ctx.arc(x + 50, y + 100, 50, Math.PI, 0);
      ctx.lineTo(x + 100, y + 100);
      ctx.lineTo(x, y + 100);
      ctx.closePath();
      ctx.fill();
      if (col === 0 || col === 2) {
        // Round headlights
        ctx.fillStyle = '#FFFFFF';
        const hx = col === 0 ? x + 25 : x + 75;
        ctx.beginPath();
        ctx.arc(hx, y + 75, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      drawFerrariSection(ctx, x, y, row, col);
    }
  };

  // Bugatti - Luxury hypercar
  const drawBugattiSection = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    if (row === 0) { // Distinctive Bugatti horseshoe grille
      ctx.fillStyle = currentCar.color;
      if (col === 1) {
        ctx.fillRect(x, y + 60, 100, 40);
        // Horseshoe grille
        ctx.fillStyle = currentCar.accent;
        ctx.beginPath();
        ctx.arc(x + 50, y + 100, 30, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 50, y + 100, 20, Math.PI, 0);
        ctx.fill();
      } else {
        drawFerrariSection(ctx, x, y, row, col);
      }
    } else {
      drawFerrariSection(ctx, x, y, row, col);
    }
  };

  // Main draw function
  const drawSportsCar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with road texture
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.7, '#98FB98'); // Light green
    gradient.addColorStop(1, '#696969'); // Road gray
    ctx.fillStyle = gradient;
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

      // Draw the car section
      drawCarSection(ctx, x, y, correctRow, correctCol);

      // Draw piece number
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x + 2, y + 2, 16, 16);
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(`${piece.correctPosition + 1}`, x + 6, y + 14);
    });

    // Highlight empty space
    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyCol = emptyPosition % 3;
    const emptyX = emptyCol * pieceWidth;
    const emptyY = emptyRow * pieceHeight;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(emptyX + 2, emptyY + 2, pieceWidth - 4, pieceHeight - 4);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(emptyX + 2, emptyY + 2, pieceWidth - 4, pieceHeight - 4);
    ctx.setLineDash([]);
  };

  // Handle piece click
  const handlePieceClick = (clickedPosition: number) => {
    if (gameState !== 'playing') return;

    // Don't allow clicking on empty space
    if (clickedPosition === emptyPosition) return;

    const clickedRow = Math.floor(clickedPosition / 3);
    const clickedCol = clickedPosition % 3;
    const emptyRow = Math.floor(emptyPosition / 3);
    const emptyCol = emptyPosition % 3;

    // Check if clicked piece is adjacent to empty space
    const isAdjacent = 
      (Math.abs(clickedRow - emptyRow) === 1 && clickedCol === emptyCol) ||
      (Math.abs(clickedCol - emptyCol) === 1 && clickedRow === emptyRow);

    if (!isAdjacent) {
      console.log(`Piece at ${clickedPosition} is not adjacent to empty space at ${emptyPosition}`);
      return;
    }

    console.log(`Moving piece from ${clickedPosition} to ${emptyPosition}`);

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
    // Auto-start game on first click
    if (gameState === 'ready') {
      setGameState('playing');
      setTimer(0);
      setMoves(0);
    }

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

    console.log(`Canvas clicked at (${x}, ${y}) -> grid position ${clickedPosition}`);

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
              className="w-full h-auto border-2 border-orange-200 rounded-lg cursor-pointer touch-manipulation"
              onClick={handleCanvasClick}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Auto-start game on first touch
                if (gameState === 'ready') {
                  setGameState('playing');
                  setTimer(0);
                  setMoves(0);
                }

                const scaleX = 300 / rect.width;
                const scaleY = 300 / rect.height;
                const canvasX = x * scaleX;
                const canvasY = y * scaleY;

                const col = Math.floor(canvasX / 100);
                const row = Math.floor(canvasY / 100);
                const clickedPosition = row * 3 + col;

                console.log(`Touch at (${x}, ${y}) -> grid position ${clickedPosition}`);

                if (clickedPosition >= 0 && clickedPosition < 9) {
                  handlePieceClick(clickedPosition);
                }
              }}
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