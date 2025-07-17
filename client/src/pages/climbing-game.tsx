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

  // Ferrari Logo - Realistic Prancing Horse Shield
  const drawFerrariLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Classic Ferrari yellow background
    ctx.fillStyle = '#FFEF00';
    ctx.fillRect(0, 0, 300, 300);
    
    // Ferrari shield shape - authentic proportions
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 80);
    ctx.lineTo(centerX - 50, centerY - 60);
    ctx.lineTo(centerX - 50, centerY + 40);
    ctx.quadraticCurveTo(centerX - 50, centerY + 70, centerX - 30, centerY + 80);
    ctx.quadraticCurveTo(centerX, centerY + 90, centerX + 30, centerY + 80);
    ctx.quadraticCurveTo(centerX + 50, centerY + 70, centerX + 50, centerY + 40);
    ctx.lineTo(centerX + 50, centerY - 60);
    ctx.closePath();
    ctx.fill();
    
    // Realistic prancing horse - detailed silhouette
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // Horse head and neck
    ctx.moveTo(centerX - 25, centerY - 20);
    ctx.quadraticCurveTo(centerX - 30, centerY - 35, centerX - 15, centerY - 40);
    ctx.quadraticCurveTo(centerX - 5, centerY - 45, centerX + 5, centerY - 35);
    // Horse body
    ctx.quadraticCurveTo(centerX + 15, centerY - 25, centerX + 20, centerY - 10);
    ctx.lineTo(centerX + 25, centerY + 5);
    // Back legs
    ctx.lineTo(centerX + 15, centerY + 20);
    ctx.lineTo(centerX + 20, centerY + 35);
    ctx.lineTo(centerX + 10, centerY + 35);
    ctx.lineTo(centerX + 5, centerY + 20);
    // Front legs
    ctx.lineTo(centerX - 5, centerY + 35);
    ctx.lineTo(centerX - 15, centerY + 35);
    ctx.lineTo(centerX - 10, centerY + 20);
    ctx.lineTo(centerX - 20, centerY + 5);
    // Tail
    ctx.quadraticCurveTo(centerX - 30, centerY - 5, centerX - 25, centerY - 20);
    ctx.fill();
    
    // Ferrari text - authentic styling
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('FERRARI', centerX, centerY + 65);
    
    // Italian flag colors at top
    ctx.fillStyle = '#009246'; // Green
    ctx.fillRect(centerX - 15, centerY - 75, 10, 8);
    ctx.fillStyle = '#FFF'; // White  
    ctx.fillRect(centerX - 5, centerY - 75, 10, 8);
    ctx.fillStyle = '#CE2B37'; // Red
    ctx.fillRect(centerX + 5, centerY - 75, 10, 8);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Lamborghini Logo - Realistic Raging Bull
  const drawLamborghiniLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Classic Lamborghini black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 300, 300);
    
    // Gold shield outline - authentic Lamborghini style
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 85);
    ctx.lineTo(centerX - 55, centerY - 65);
    ctx.lineTo(centerX - 55, centerY + 35);
    ctx.quadraticCurveTo(centerX - 55, centerY + 65, centerX - 35, centerY + 75);
    ctx.quadraticCurveTo(centerX, centerY + 85, centerX + 35, centerY + 75);
    ctx.quadraticCurveTo(centerX + 55, centerY + 65, centerX + 55, centerY + 35);
    ctx.lineTo(centerX + 55, centerY - 65);
    ctx.closePath();
    ctx.fill();
    
    // Inner black area
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 75);
    ctx.lineTo(centerX - 45, centerY - 55);
    ctx.lineTo(centerX - 45, centerY + 25);
    ctx.quadraticCurveTo(centerX - 45, centerY + 55, centerX - 25, centerY + 65);
    ctx.quadraticCurveTo(centerX, centerY + 75, centerX + 25, centerY + 65);
    ctx.quadraticCurveTo(centerX + 45, centerY + 55, centerX + 45, centerY + 25);
    ctx.lineTo(centerX + 45, centerY - 55);
    ctx.closePath();
    ctx.fill();
    
    // Realistic raging bull head - detailed and fierce
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    // Bull's head outline
    ctx.moveTo(centerX - 25, centerY - 15);
    // Left horn - curved and sharp
    ctx.lineTo(centerX - 35, centerY - 35);
    ctx.quadraticCurveTo(centerX - 30, centerY - 40, centerX - 25, centerY - 30);
    // Head top
    ctx.lineTo(centerX - 15, centerY - 25);
    ctx.lineTo(centerX - 5, centerY - 30);
    ctx.lineTo(centerX + 5, centerY - 30);
    ctx.lineTo(centerX + 15, centerY - 25);
    // Right horn - curved and sharp
    ctx.lineTo(centerX + 25, centerY - 30);
    ctx.quadraticCurveTo(centerX + 30, centerY - 40, centerX + 35, centerY - 35);
    ctx.lineTo(centerX + 25, centerY - 15);
    // Right side of head
    ctx.lineTo(centerX + 20, centerY);
    ctx.lineTo(centerX + 15, centerY + 10);
    // Nose/snout
    ctx.lineTo(centerX + 8, centerY + 15);
    ctx.lineTo(centerX - 8, centerY + 15);
    // Left side of head
    ctx.lineTo(centerX - 15, centerY + 10);
    ctx.lineTo(centerX - 20, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Bull's eyes - fierce expression
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 12, centerY - 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // LAMBORGHINI text - authentic font
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 11px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAMBORGHINI', centerX, centerY + 55);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // McLaren Logo - Realistic Speedmark
  const drawMcLarenLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // McLaren signature white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 300, 300);
    
    // McLaren orange speedmark - authentic design
    const gradient = ctx.createLinearGradient(centerX - 80, centerY - 40, centerX + 80, centerY + 40);
    gradient.addColorStop(0, '#FF8000');
    gradient.addColorStop(0.5, '#FF6600');
    gradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = gradient;
    
    // Iconic McLaren speedmark swoosh
    ctx.beginPath();
    ctx.moveTo(centerX - 75, centerY + 10);
    ctx.quadraticCurveTo(centerX - 40, centerY - 50, centerX + 10, centerY - 30);
    ctx.quadraticCurveTo(centerX + 50, centerY - 15, centerX + 80, centerY + 5);
    ctx.quadraticCurveTo(centerX + 70, centerY + 25, centerX + 40, centerY + 20);
    ctx.quadraticCurveTo(centerX, centerY + 15, centerX - 30, centerY + 25);
    ctx.quadraticCurveTo(centerX - 60, centerY + 30, centerX - 75, centerY + 10);
    ctx.fill();
    
    // Additional speedmark elements for depth
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(centerX - 65, centerY + 5);
    ctx.quadraticCurveTo(centerX - 30, centerY - 40, centerX + 20, centerY - 25);
    ctx.quadraticCurveTo(centerX + 60, centerY - 10, centerX + 70, centerY);
    ctx.quadraticCurveTo(centerX + 60, centerY + 15, centerX + 30, centerY + 10);
    ctx.quadraticCurveTo(centerX - 10, centerY + 5, centerX - 40, centerY + 15);
    ctx.quadraticCurveTo(centerX - 55, centerY + 20, centerX - 65, centerY + 5);
    ctx.fill();
    
    // McLaren text - official styling
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 18px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('McLaren', centerX, centerY + 60);
    
    // Racing heritage elements
    ctx.strokeStyle = '#FF8000';
    ctx.lineWidth = 2;
    // Speed lines
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 70 + i * 8, centerY - 60 + i * 2);
      ctx.lineTo(centerX - 60 + i * 8, centerY - 50 + i * 2);
      ctx.stroke();
    }
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Porsche Logo - Realistic Coat of Arms
  const drawPorscheLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Porsche cream/beige background
    ctx.fillStyle = '#F4F1E8';
    ctx.fillRect(0, 0, 300, 300);
    
    // Outer circle - authentic Porsche crest
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#F4F1E8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Inner circle border
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.stroke();
    
    // Top section - Württemberg coat of arms (red and black)
    ctx.fillStyle = '#DC143C'; // Red
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20, 50, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    
    // Black stripes on red (Württemberg pattern)
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(centerX - 40 + i * 25, centerY - 65, 10, 45);
    }
    
    // Bottom section - Stuttgart coat of arms (yellow with black horse)
    ctx.fillStyle = '#FFD700'; // Gold/Yellow
    ctx.beginPath();
    ctx.arc(centerX, centerY + 20, 50, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    
    // Stuttgart horse - detailed and realistic
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    // Horse head and neck
    ctx.moveTo(centerX - 20, centerY + 10);
    ctx.quadraticCurveTo(centerX - 25, centerY - 5, centerX - 15, centerY - 10);
    ctx.quadraticCurveTo(centerX - 5, centerY - 15, centerX + 5, centerY - 10);
    ctx.quadraticCurveTo(centerX + 15, centerY - 5, centerX + 20, centerY + 10);
    // Horse body
    ctx.lineTo(centerX + 15, centerY + 25);
    ctx.lineTo(centerX + 10, centerY + 40);
    ctx.lineTo(centerX + 5, centerY + 40);
    ctx.lineTo(centerX, centerY + 25);
    ctx.lineTo(centerX - 5, centerY + 40);
    ctx.lineTo(centerX - 10, centerY + 40);
    ctx.lineTo(centerX - 15, centerY + 25);
    ctx.closePath();
    ctx.fill();
    
    // Horse mane details
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, centerY - 8);
    ctx.lineTo(centerX - 12, centerY - 5);
    ctx.moveTo(centerX - 5, centerY - 12);
    ctx.lineTo(centerX - 8, centerY - 8);
    ctx.moveTo(centerX + 5, centerY - 12);
    ctx.lineTo(centerX + 8, centerY - 8);
    ctx.moveTo(centerX + 8, centerY - 8);
    ctx.lineTo(centerX + 12, centerY - 5);
    ctx.stroke();
    
    // PORSCHE text - official styling
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PORSCHE', centerX, centerY + 90);
    
    // Stuttgart text (smaller)
    ctx.font = '10px "Times New Roman", serif';
    ctx.fillText('STUTTGART', centerX, centerY + 60);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Bugatti Logo - Realistic EB Oval
  const drawBugattiLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Bugatti signature deep red background
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(0, 0, 300, 300);
    
    // Main white oval - authentic Bugatti proportions
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 70, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Red oval border - elegant and thick
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 70, 45, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner border detail
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 62, 37, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // EB letters - classic Bugatti style
    ctx.fillStyle = '#8B0000';
    ctx.font = 'bold 36px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('EB', centerX, centerY + 12);
    
    // Signature pearl/dot border - authentic Bugatti detail
    ctx.fillStyle = '#FFFFFF';
    const numDots = 52; // Authentic number of pearls
    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * Math.PI * 2;
      const dotX = centerX + Math.cos(angle) * 82;
      const dotY = centerY + Math.sin(angle) * 57;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fill();
      // Pearl highlight
      ctx.fillStyle = '#F5F5F5';
      ctx.beginPath();
      ctx.arc(dotX - 1, dotY - 1, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
    }
    
    // BUGATTI text - official styling
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUGATTI', centerX, centerY + 75);
    
    // Ettore Bugatti signature elements (small decorative lines)
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY - 55);
    ctx.lineTo(centerX + 30, centerY - 55);
    ctx.moveTo(centerX - 30, centerY + 55);
    ctx.lineTo(centerX + 30, centerY + 55);
    ctx.stroke();
    
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