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

  // Draw brand logo section
  const drawLogoSection = (ctx: CanvasRenderingContext2D, x: number, y: number, correctRow: number, correctCol: number) => {
    const style = currentCar.style;
    
    ctx.save();
    
    // Different logos based on brand
    switch (style) {
      case "supercar": // Ferrari
        drawFerrariLogo(ctx, x, y, correctRow, correctCol);
        break;
      case "angular": // Lamborghini
        drawLamborghiniLogo(ctx, x, y, correctRow, correctCol);
        break;
      case "modern": // McLaren
        drawMcLarenLogo(ctx, x, y, correctRow, correctCol);
        break;
      case "classic": // Porsche
        drawPorscheLogo(ctx, x, y, correctRow, correctCol);
        break;
      case "luxury": // Bugatti
        drawBugattiLogo(ctx, x, y, correctRow, correctCol);
        break;
      default:
        drawFerrariLogo(ctx, x, y, correctRow, correctCol);
    }
    
    ctx.restore();
  };

  // Ferrari Logo - Prancing Horse Shield
  const drawFerrariLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    // Calculate the complete logo coordinates (300x300 canvas)
    const logoStartX = 0;
    const logoStartY = 0;
    const logoWidth = 300;
    const logoHeight = 300;
    
    // Yellow background for this piece
    ctx.fillStyle = '#FFE135';
    ctx.fillRect(x, y, 100, 100);
    
    // Draw the portion of the Ferrari shield that belongs to this piece
    ctx.fillStyle = '#DC143C';
    
    // Calculate shield boundaries
    const shieldCenterX = logoStartX + logoWidth / 2;
    const shieldCenterY = logoStartY + logoHeight / 2;
    const shieldWidth = 180;
    const shieldHeight = 200;
    
    // Draw shield portion for this piece
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100); // Clip to this piece
    ctx.clip();
    
    // Draw complete shield
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(shieldCenterX, shieldCenterY - shieldHeight/2);
    ctx.lineTo(shieldCenterX - shieldWidth/2, shieldCenterY - shieldHeight/2 + 40);
    ctx.lineTo(shieldCenterX - shieldWidth/2, shieldCenterY + shieldHeight/2 - 60);
    ctx.quadraticCurveTo(shieldCenterX, shieldCenterY + shieldHeight/2, shieldCenterX + shieldWidth/2, shieldCenterY + shieldHeight/2 - 60);
    ctx.lineTo(shieldCenterX + shieldWidth/2, shieldCenterY - shieldHeight/2 + 40);
    ctx.closePath();
    ctx.fill();
    
    // Prancing horse silhouette
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(shieldCenterX - 30, shieldCenterY);
    ctx.quadraticCurveTo(shieldCenterX - 10, shieldCenterY - 30, shieldCenterX + 10, shieldCenterY);
    ctx.quadraticCurveTo(shieldCenterX + 30, shieldCenterY + 10, shieldCenterX, shieldCenterY + 40);
    ctx.lineTo(shieldCenterX - 40, shieldCenterY + 40);
    ctx.closePath();
    ctx.fill();
    
    // Ferrari text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('FERRARI', shieldCenterX, shieldCenterY + shieldHeight/2 - 20);
    
    ctx.restore();
    ctx.textAlign = 'left'; // Reset
  };

  // Lamborghini Logo - Bull Shield
  const drawLamborghiniLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    // Black background
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 100, 100);
    
    const shieldCenterX = 150;
    const shieldCenterY = 150;
    const shieldWidth = 160;
    const shieldHeight = 180;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Gold shield
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(shieldCenterX, shieldCenterY - shieldHeight/2);
    ctx.lineTo(shieldCenterX - shieldWidth/2, shieldCenterY - shieldHeight/2 + 30);
    ctx.lineTo(shieldCenterX - shieldWidth/2, shieldCenterY + shieldHeight/2 - 50);
    ctx.quadraticCurveTo(shieldCenterX, shieldCenterY + shieldHeight/2, shieldCenterX + shieldWidth/2, shieldCenterY + shieldHeight/2 - 50);
    ctx.lineTo(shieldCenterX + shieldWidth/2, shieldCenterY - shieldHeight/2 + 30);
    ctx.closePath();
    ctx.fill();
    
    // Bull head with horns
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(shieldCenterX - 20, shieldCenterY - 10);
    ctx.lineTo(shieldCenterX - 35, shieldCenterY - 25); // Left horn
    ctx.lineTo(shieldCenterX - 25, shieldCenterY - 15);
    ctx.lineTo(shieldCenterX, shieldCenterY + 5);
    ctx.lineTo(shieldCenterX + 25, shieldCenterY - 15);
    ctx.lineTo(shieldCenterX + 35, shieldCenterY - 25); // Right horn
    ctx.lineTo(shieldCenterX + 20, shieldCenterY - 10);
    ctx.quadraticCurveTo(shieldCenterX, shieldCenterY + 30, shieldCenterX - 20, shieldCenterY - 10);
    ctx.fill();
    
    // Lamborghini text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAMBORGHINI', shieldCenterX, shieldCenterY + shieldHeight/2 - 15);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // McLaren Logo - Orange Swoosh
  const drawMcLarenLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    // White background
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x, y, 100, 100);
    
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Orange swoosh - McLaren's signature element
    ctx.fillStyle = '#FF8000';
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY);
    ctx.quadraticCurveTo(centerX - 40, centerY - 60, centerX, centerY - 20);
    ctx.quadraticCurveTo(centerX + 40, centerY + 10, centerX + 80, centerY - 10);
    ctx.quadraticCurveTo(centerX + 60, centerY + 20, centerX + 20, centerY + 20);
    ctx.quadraticCurveTo(centerX - 20, centerY + 40, centerX - 80, centerY);
    ctx.fill();
    
    // McLaren text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('McLaren', centerX, centerY + 60);
    
    // Speed marks (racing elements)
    ctx.strokeStyle = '#FF8000';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 60 + i * 15, centerY - 40);
      ctx.lineTo(centerX - 40 + i * 15, centerY - 50);
      ctx.stroke();
    }
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Porsche Logo - Coat of Arms
  const drawPorscheLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    // Cream background
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x, y, 100, 100);
    
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Outer circle (traditional Porsche crest)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner shield sections
    // Top section - Württemberg coat of arms
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 75, 0, Math.PI * 2);
    ctx.fill();
    
    // Stuttgart horse in center
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(centerX - 25, centerY - 10);
    ctx.quadraticCurveTo(centerX - 10, centerY - 30, centerX + 10, centerY - 10);
    ctx.quadraticCurveTo(centerX + 25, centerY, centerX + 15, centerY + 25);
    ctx.lineTo(centerX - 15, centerY + 25);
    ctx.quadraticCurveTo(centerX - 25, centerY, centerX - 25, centerY - 10);
    ctx.fill();
    
    // Porsche text
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('PORSCHE', centerX, centerY + 65);
    
    // Red stripes (Württemberg colors)
    ctx.fillStyle = '#DC143C';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(centerX - 70 + i * 25, centerY - 60, 8, 40);
      ctx.fillRect(centerX - 70 + i * 25, centerY + 20, 8, 40);
    }
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Bugatti Logo - EB Oval
  const drawBugattiLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    // Deep red background
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x, y, 100, 100);
    
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Main white oval
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 70, 50, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Red oval border
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 70, 50, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // EB letters
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 40px serif';
    ctx.textAlign = 'center';
    ctx.fillText('EB', centerX, centerY + 15);
    
    // Signature pearl dots around the border
    ctx.fillStyle = '#FFF';
    const numDots = 60;
    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * Math.PI * 2;
      const dotX = centerX + Math.cos(angle) * 85;
      const dotY = centerY + Math.sin(angle) * 60;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Bugatti text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 12px serif';
    ctx.fillText('BUGATTI', centerX, centerY + 75);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Main draw function
  const drawBrandLogos = () => {
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

      // Draw the appropriate brand logo
      switch (currentCarIndex) {
        case 0:
          drawFerrariLogo(ctx, x, y, correctRow, correctCol);
          break;
        case 1:
          drawLamborghiniLogo(ctx, x, y, correctRow, correctCol);
          break;
        case 2:
          drawMcLarenLogo(ctx, x, y, correctRow, correctCol);
          break;
        case 3:
          drawPorscheLogo(ctx, x, y, correctRow, correctCol);
          break;
        case 4:
          drawBugattiLogo(ctx, x, y, correctRow, correctCol);
          break;
        default:
          drawFerrariLogo(ctx, x, y, correctRow, correctCol);
      }

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
    drawBrandLogos();
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