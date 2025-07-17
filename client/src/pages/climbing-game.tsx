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

  // Ferrari Logo - Ultra Detailed Prancing Horse Shield
  const drawFerrariLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Classic Ferrari yellow background with gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    bgGradient.addColorStop(0, '#FFEF00');
    bgGradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Ferrari shield shape with 3D effect
    const shieldGradient = ctx.createLinearGradient(centerX - 50, centerY - 80, centerX + 50, centerY + 80);
    shieldGradient.addColorStop(0, '#FF0000');
    shieldGradient.addColorStop(0.3, '#DC143C');
    shieldGradient.addColorStop(0.7, '#8B0000');
    shieldGradient.addColorStop(1, '#600000');
    ctx.fillStyle = shieldGradient;
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
    
    // Shield border highlight
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Extremely detailed prancing horse
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // Horse head with detailed features
    ctx.moveTo(centerX - 25, centerY - 15);
    ctx.quadraticCurveTo(centerX - 32, centerY - 30, centerX - 20, centerY - 35);
    ctx.lineTo(centerX - 18, centerY - 40); // Ear
    ctx.lineTo(centerX - 15, centerY - 38);
    ctx.quadraticCurveTo(centerX - 10, centerY - 42, centerX - 5, centerY - 40);
    ctx.quadraticCurveTo(centerX, centerY - 43, centerX + 5, centerY - 40);
    ctx.quadraticCurveTo(centerX + 10, centerY - 42, centerX + 15, centerY - 38);
    ctx.lineTo(centerX + 18, centerY - 40); // Ear
    ctx.lineTo(centerX + 20, centerY - 35);
    ctx.quadraticCurveTo(centerX + 32, centerY - 30, centerX + 25, centerY - 15);
    // Neck and mane
    ctx.lineTo(centerX + 22, centerY - 10);
    ctx.quadraticCurveTo(centerX + 28, centerY - 5, centerX + 25, centerY);
    // Back and rump
    ctx.lineTo(centerX + 20, centerY + 10);
    ctx.quadraticCurveTo(centerX + 18, centerY + 15, centerX + 15, centerY + 18);
    // Tail details
    ctx.quadraticCurveTo(centerX + 10, centerY + 25, centerX + 5, centerY + 30);
    ctx.quadraticCurveTo(centerX, centerY + 35, centerX - 5, centerY + 32);
    // Hind legs with detail
    ctx.lineTo(centerX + 8, centerY + 35);
    ctx.lineTo(centerX + 10, centerY + 40);
    ctx.lineTo(centerX + 6, centerY + 40);
    ctx.lineTo(centerX + 4, centerY + 35);
    ctx.lineTo(centerX - 2, centerY + 38);
    ctx.lineTo(centerX - 6, centerY + 40);
    ctx.lineTo(centerX - 10, centerY + 40);
    ctx.lineTo(centerX - 8, centerY + 35);
    // Front legs with hooves
    ctx.lineTo(centerX - 12, centerY + 25);
    ctx.lineTo(centerX - 15, centerY + 38);
    ctx.lineTo(centerX - 19, centerY + 40);
    ctx.lineTo(centerX - 23, centerY + 40);
    ctx.lineTo(centerX - 21, centerY + 35);
    ctx.lineTo(centerX - 18, centerY + 20);
    // Chest and front
    ctx.lineTo(centerX - 25, centerY + 5);
    ctx.quadraticCurveTo(centerX - 30, centerY - 5, centerX - 25, centerY - 15);
    ctx.fill();
    
    // Horse eye detail
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 25, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Mane details
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.moveTo(centerX - 15 + i * 3, centerY - 35 + i);
      ctx.lineTo(centerX - 12 + i * 3, centerY - 30 + i);
    }
    ctx.stroke();
    
    // FERRARI text with shadow effect
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 16px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('FERRARI', centerX + 1, centerY + 66);
    ctx.fillStyle = '#000';
    ctx.fillText('FERRARI', centerX, centerY + 65);
    
    // Italian flag with details
    ctx.fillStyle = '#009246';
    ctx.fillRect(centerX - 18, centerY - 75, 12, 10);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(centerX - 6, centerY - 75, 12, 10);
    ctx.fillStyle = '#CE2B37';
    ctx.fillRect(centerX + 6, centerY - 75, 12, 10);
    
    // Flag border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(centerX - 18, centerY - 75, 36, 10);
    
    // "SF" letters (Scuderia Ferrari)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('SF', centerX + 35, centerY - 50);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Lamborghini Logo - Ultra Detailed Raging Bull
  const drawLamborghiniLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Deep black background with subtle texture
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Gold shield with metallic gradient
    const goldGradient = ctx.createLinearGradient(centerX - 55, centerY - 85, centerX + 55, centerY + 85);
    goldGradient.addColorStop(0, '#FFD700');
    goldGradient.addColorStop(0.3, '#D4AF37');
    goldGradient.addColorStop(0.7, '#B8860B');
    goldGradient.addColorStop(1, '#DAA520');
    ctx.fillStyle = goldGradient;
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
    
    // Shield border with metallic shine
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner shield highlight
    ctx.strokeStyle = '#FFFACD';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 2, centerY - 80);
    ctx.lineTo(centerX - 50, centerY - 60);
    ctx.lineTo(centerX - 50, centerY + 30);
    ctx.stroke();
    
    // Inner black area with gradient
    const innerGradient = ctx.createRadialGradient(centerX, centerY - 20, 0, centerX, centerY, 60);
    innerGradient.addColorStop(0, '#333333');
    innerGradient.addColorStop(1, '#000000');
    ctx.fillStyle = innerGradient;
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
    
    // Extremely detailed raging bull
    const bullGradient = ctx.createLinearGradient(centerX - 40, centerY - 40, centerX + 40, centerY + 20);
    bullGradient.addColorStop(0, '#FFD700');
    bullGradient.addColorStop(0.5, '#D4AF37');
    bullGradient.addColorStop(1, '#B8860B');
    ctx.fillStyle = bullGradient;
    
    // Bull head with muscular details
    ctx.beginPath();
    ctx.moveTo(centerX - 30, centerY - 10);
    // Left horn with curve details
    ctx.lineTo(centerX - 40, centerY - 30);
    ctx.quadraticCurveTo(centerX - 42, centerY - 35, centerX - 38, centerY - 38);
    ctx.quadraticCurveTo(centerX - 35, centerY - 42, centerX - 30, centerY - 35);
    // Forehead and skull detail
    ctx.lineTo(centerX - 20, centerY - 30);
    ctx.quadraticCurveTo(centerX - 15, centerY - 35, centerX - 10, centerY - 32);
    ctx.lineTo(centerX - 5, centerY - 35);
    ctx.lineTo(centerX + 5, centerY - 35);
    ctx.lineTo(centerX + 10, centerY - 32);
    ctx.quadraticCurveTo(centerX + 15, centerY - 35, centerX + 20, centerY - 30);
    // Right horn with curve details
    ctx.lineTo(centerX + 30, centerY - 35);
    ctx.quadraticCurveTo(centerX + 35, centerY - 42, centerX + 38, centerY - 38);
    ctx.quadraticCurveTo(centerX + 42, centerY - 35, centerX + 40, centerY - 30);
    ctx.lineTo(centerX + 30, centerY - 10);
    // Face muscles and jawline
    ctx.quadraticCurveTo(centerX + 25, centerY - 5, centerX + 22, centerY + 2);
    ctx.lineTo(centerX + 18, centerY + 8);
    // Nose and nostrils
    ctx.lineTo(centerX + 12, centerY + 12);
    ctx.quadraticCurveTo(centerX + 8, centerY + 18, centerX + 4, centerY + 16);
    ctx.lineTo(centerX + 2, centerY + 20);
    ctx.lineTo(centerX - 2, centerY + 20);
    ctx.lineTo(centerX - 4, centerY + 16);
    ctx.quadraticCurveTo(centerX - 8, centerY + 18, centerX - 12, centerY + 12);
    // Left side face
    ctx.lineTo(centerX - 18, centerY + 8);
    ctx.lineTo(centerX - 22, centerY + 2);
    ctx.quadraticCurveTo(centerX - 25, centerY - 5, centerX - 30, centerY - 10);
    ctx.fill();
    
    // Bull's fierce eyes with detail
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(centerX - 15, centerY - 12, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 15, centerY - 12, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(centerX - 15, centerY - 12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 15, centerY - 12, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(centerX - 14, centerY - 13, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 16, centerY - 13, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Nostril details
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(centerX - 3, centerY + 16, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 3, centerY + 16, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Horn ridges and texture
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 35 + i, centerY - 32 - i * 2);
      ctx.lineTo(centerX - 33 + i, centerY - 30 - i * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX + 35 - i, centerY - 32 - i * 2);
      ctx.lineTo(centerX + 33 - i, centerY - 30 - i * 2);
      ctx.stroke();
    }
    
    // LAMBORGHINI text with shadow
    ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.font = 'bold 13px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAMBORGHINI', centerX + 1, centerY + 56);
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('LAMBORGHINI', centerX, centerY + 55);
    
    // Additional decorative elements
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY + 40);
    ctx.lineTo(centerX + 40, centerY + 40);
    ctx.stroke();
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // McLaren Logo - Ultra Detailed Racing Speedmark
  const drawMcLarenLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // McLaren signature white background with subtle gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    bgGradient.addColorStop(0, '#FFFFFF');
    bgGradient.addColorStop(1, '#F8F8F8');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Main McLaren speedmark with complex gradient
    const speedGradient = ctx.createLinearGradient(centerX - 80, centerY - 50, centerX + 80, centerY + 30);
    speedGradient.addColorStop(0, '#FF4500');
    speedGradient.addColorStop(0.2, '#FF6600');
    speedGradient.addColorStop(0.5, '#FF8000');
    speedGradient.addColorStop(0.8, '#FFA500');
    speedGradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = speedGradient;
    
    // Primary speedmark swoosh - highly detailed
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY + 15);
    ctx.quadraticCurveTo(centerX - 60, centerY - 20, centerX - 30, centerY - 35);
    ctx.quadraticCurveTo(centerX - 10, centerY - 45, centerX + 15, centerY - 40);
    ctx.quadraticCurveTo(centerX + 40, centerY - 35, centerX + 65, centerY - 20);
    ctx.quadraticCurveTo(centerX + 85, centerY - 5, centerX + 85, centerY + 10);
    ctx.quadraticCurveTo(centerX + 80, centerY + 20, centerX + 70, centerY + 25);
    ctx.quadraticCurveTo(centerX + 50, centerY + 30, centerX + 25, centerY + 25);
    ctx.quadraticCurveTo(centerX, centerY + 20, centerX - 25, centerY + 25);
    ctx.quadraticCurveTo(centerX - 50, centerY + 30, centerX - 70, centerY + 25);
    ctx.quadraticCurveTo(centerX - 80, centerY + 20, centerX - 80, centerY + 15);
    ctx.fill();
    
    // Secondary speedmark layer for depth
    const innerGradient = ctx.createLinearGradient(centerX - 70, centerY - 40, centerX + 70, centerY + 20);
    innerGradient.addColorStop(0, '#FFA500');
    innerGradient.addColorStop(0.5, '#FF8000');
    innerGradient.addColorStop(1, '#FF6600');
    ctx.fillStyle = innerGradient;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 70, centerY + 10);
    ctx.quadraticCurveTo(centerX - 50, centerY - 15, centerX - 20, centerY - 30);
    ctx.quadraticCurveTo(centerX, centerY - 35, centerX + 25, centerY - 30);
    ctx.quadraticCurveTo(centerX + 50, centerY - 25, centerX + 75, centerY - 10);
    ctx.quadraticCurveTo(centerX + 75, centerY + 5, centerX + 65, centerY + 15);
    ctx.quadraticCurveTo(centerX + 45, centerY + 20, centerX + 20, centerY + 15);
    ctx.quadraticCurveTo(centerX - 5, centerY + 10, centerX - 30, centerY + 15);
    ctx.quadraticCurveTo(centerX - 55, centerY + 20, centerX - 70, centerY + 10);
    ctx.fill();
    
    // Core speedmark element - the heart of McLaren design
    const coreGradient = ctx.createRadialGradient(centerX + 10, centerY - 15, 0, centerX + 10, centerY - 15, 40);
    coreGradient.addColorStop(0, '#FFFF00');
    coreGradient.addColorStop(0.3, '#FFA500');
    coreGradient.addColorStop(1, '#FF4500');
    ctx.fillStyle = coreGradient;
    
    ctx.beginPath();
    ctx.moveTo(centerX - 60, centerY + 5);
    ctx.quadraticCurveTo(centerX - 40, centerY - 10, centerX - 10, centerY - 25);
    ctx.quadraticCurveTo(centerX + 10, centerY - 30, centerX + 35, centerY - 25);
    ctx.quadraticCurveTo(centerX + 60, centerY - 20, centerX + 65, centerY - 5);
    ctx.quadraticCurveTo(centerX + 60, centerY + 10, centerX + 35, centerY + 10);
    ctx.quadraticCurveTo(centerX + 10, centerY + 5, centerX - 15, centerY + 10);
    ctx.quadraticCurveTo(centerX - 40, centerY + 15, centerX - 60, centerY + 5);
    ctx.fill();
    
    // Speedmark highlights and reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY - 10);
    ctx.quadraticCurveTo(centerX - 20, centerY - 25, centerX + 10, centerY - 25);
    ctx.quadraticCurveTo(centerX + 40, centerY - 20, centerX + 55, centerY - 10);
    ctx.quadraticCurveTo(centerX + 45, centerY - 5, centerX + 25, centerY - 5);
    ctx.quadraticCurveTo(centerX, centerY - 10, centerX - 25, centerY - 5);
    ctx.quadraticCurveTo(centerX - 45, centerY, centerX - 50, centerY - 10);
    ctx.fill();
    
    // McLaren text with sophisticated typography
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.font = 'bold 20px "Helvetica", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('McLaren', centerX + 1, centerY + 61);
    ctx.fillStyle = '#000000';
    ctx.fillText('McLaren', centerX, centerY + 60);
    
    // Racing heritage speed lines with varying opacity
    ctx.strokeStyle = '#FF8000';
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.3 + (i * 0.1);
      ctx.lineWidth = 1 + i * 0.3;
      ctx.beginPath();
      ctx.moveTo(centerX - 75 + i * 6, centerY - 65 + i * 3);
      ctx.lineTo(centerX - 65 + i * 6, centerY - 55 + i * 3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Formula 1 racing dots pattern
    ctx.fillStyle = '#FF6600';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dotX = centerX + Math.cos(angle) * 90;
      const dotY = centerY + Math.sin(angle) * 90;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Papaya orange accent elements
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.moveTo(centerX - 85, centerY + 40);
    ctx.lineTo(centerX + 85, centerY + 40);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Racing number styling
    ctx.fillStyle = '#FF4500';
    ctx.font = 'bold 12px "Arial", sans-serif';
    ctx.fillText('RACING', centerX, centerY + 80);
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Porsche Logo - Ultra Detailed Coat of Arms
  const drawPorscheLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Porsche classic cream background with aged texture
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    bgGradient.addColorStop(0, '#FAF7F0');
    bgGradient.addColorStop(1, '#F0EDE6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Outer circle with aged metal effect
    const metalGradient = ctx.createLinearGradient(centerX - 80, centerY - 80, centerX + 80, centerY + 80);
    metalGradient.addColorStop(0, '#C0C0C0');
    metalGradient.addColorStop(0.3, '#A8A8A8');
    metalGradient.addColorStop(0.7, '#808080');
    metalGradient.addColorStop(1, '#696969');
    ctx.strokeStyle = metalGradient;
    ctx.lineWidth = 4;
    ctx.fillStyle = '#F4F1E8';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 78, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Inner decorative circle
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 72, 0, Math.PI * 2);
    ctx.stroke();
    
    // Top section - Württemberg coat of arms with realistic gradient
    const redGradient = ctx.createLinearGradient(centerX - 50, centerY - 70, centerX + 50, centerY - 20);
    redGradient.addColorStop(0, '#FF0000');
    redGradient.addColorStop(0.5, '#DC143C');
    redGradient.addColorStop(1, '#B22222');
    ctx.fillStyle = redGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 57, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    
    // Württemberg black stripes with 3D effect
    const blackGradient = ctx.createLinearGradient(centerX - 45, centerY - 70, centerX + 45, centerY - 20);
    blackGradient.addColorStop(0, '#000000');
    blackGradient.addColorStop(0.5, '#1a1a1a');
    blackGradient.addColorStop(1, '#000000');
    ctx.fillStyle = blackGradient;
    
    for (let i = 0; i < 3; i++) {
      const stripeX = centerX - 35 + i * 22;
      ctx.fillRect(stripeX, centerY - 70, 8, 55);
      // Stripe highlights
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(stripeX, centerY - 70, 2, 55);
      ctx.fillStyle = blackGradient;
    }
    
    // Antler details for Württemberg
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const antlerX = centerX - 30 + i * 20;
      ctx.beginPath();
      ctx.moveTo(antlerX, centerY - 60);
      ctx.lineTo(antlerX - 3, centerY - 65);
      ctx.moveTo(antlerX, centerY - 60);
      ctx.lineTo(antlerX + 3, centerY - 65);
      ctx.stroke();
    }
    
    // Bottom section - Stuttgart coat of arms with golden gradient
    const goldGradient = ctx.createLinearGradient(centerX - 50, centerY + 15, centerX + 50, centerY + 75);
    goldGradient.addColorStop(0, '#FFD700');
    goldGradient.addColorStop(0.5, '#FFA500');
    goldGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = goldGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 15, 57, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    
    // Extremely detailed Stuttgart horse
    const horseGradient = ctx.createLinearGradient(centerX - 25, centerY - 5, centerX + 25, centerY + 45);
    horseGradient.addColorStop(0, '#000000');
    horseGradient.addColorStop(0.5, '#1a1a1a');
    horseGradient.addColorStop(1, '#000000');
    ctx.fillStyle = horseGradient;
    
    // Horse head with detailed anatomy
    ctx.beginPath();
    ctx.moveTo(centerX - 22, centerY + 8);
    // Detailed ear
    ctx.lineTo(centerX - 25, centerY + 2);
    ctx.lineTo(centerX - 20, centerY - 2);
    ctx.lineTo(centerX - 18, centerY);
    // Head profile with realistic curves
    ctx.quadraticCurveTo(centerX - 15, centerY - 8, centerX - 10, centerY - 12);
    ctx.quadraticCurveTo(centerX - 5, centerY - 15, centerX, centerY - 14);
    ctx.quadraticCurveTo(centerX + 5, centerY - 15, centerX + 10, centerY - 12);
    ctx.quadraticCurveTo(centerX + 15, centerY - 8, centerX + 18, centerY);
    // Right ear
    ctx.lineTo(centerX + 20, centerY - 2);
    ctx.lineTo(centerX + 25, centerY + 2);
    ctx.lineTo(centerX + 22, centerY + 8);
    // Neck muscles
    ctx.quadraticCurveTo(centerX + 20, centerY + 12, centerX + 18, centerY + 18);
    // Back and rump
    ctx.lineTo(centerX + 15, centerY + 28);
    ctx.quadraticCurveTo(centerX + 12, centerY + 35, centerX + 8, centerY + 40);
    // Hind legs with realistic proportions
    ctx.lineTo(centerX + 12, centerY + 45);
    ctx.lineTo(centerX + 8, centerY + 50);
    ctx.lineTo(centerX + 4, centerY + 50);
    ctx.lineTo(centerX, centerY + 45);
    ctx.lineTo(centerX - 2, centerY + 48);
    ctx.lineTo(centerX - 6, centerY + 50);
    ctx.lineTo(centerX - 10, centerY + 50);
    ctx.lineTo(centerX - 8, centerY + 45);
    // Front legs with hooves
    ctx.lineTo(centerX - 12, centerY + 40);
    ctx.quadraticCurveTo(centerX - 15, centerY + 35, centerX - 18, centerY + 28);
    // Chest and front neck
    ctx.lineTo(centerX - 20, centerY + 18);
    ctx.quadraticCurveTo(centerX - 22, centerY + 12, centerX - 22, centerY + 8);
    ctx.fill();
    
    // Horse eye detail
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 8, centerY - 5, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Mane details with flowing lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const maneX = centerX - 12 + i * 2;
      const maneY = centerY - 10 + i;
      ctx.moveTo(maneX, maneY);
      ctx.quadraticCurveTo(maneX - 2, maneY + 3, maneX + 1, maneY + 6);
    }
    ctx.stroke();
    
    // Nostril details
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 8, 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // PORSCHE text with embossed effect
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 16px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PORSCHE', centerX + 1, centerY + 91);
    ctx.fillStyle = '#000000';
    ctx.fillText('PORSCHE', centerX, centerY + 90);
    
    // Stuttgart text with smaller emboss
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 11px "Times New Roman", serif';
    ctx.fillText('STUTTGART', centerX + 0.5, centerY + 66);
    ctx.fillStyle = '#8B4513';
    ctx.fillText('STUTTGART', centerX, centerY + 65);
    
    // Decorative corner elements
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    const corners = [
      [centerX - 65, centerY - 65],
      [centerX + 65, centerY - 65],
      [centerX - 65, centerY + 65],
      [centerX + 65, centerY + 65]
    ];
    
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x - 5, y);
      ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    });
    
    ctx.restore();
    ctx.textAlign = 'left';
  };

  // Bugatti Logo - Ultra Luxurious EB Oval with Pearl Border
  const drawBugattiLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, row: number, col: number) => {
    const centerX = 150;
    const centerY = 150;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, 100, 100);
    ctx.clip();
    
    // Bugatti deep red background with luxury gradient
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    bgGradient.addColorStop(0, '#A0522D');
    bgGradient.addColorStop(0.5, '#8B0000');
    bgGradient.addColorStop(1, '#5C0000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Outer decorative border ring
    const outerRing = ctx.createLinearGradient(centerX - 90, centerY - 60, centerX + 90, centerY + 60);
    outerRing.addColorStop(0, '#FFD700');
    outerRing.addColorStop(0.5, '#FFA500');
    outerRing.addColorStop(1, '#FF8C00');
    ctx.strokeStyle = outerRing;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 85, 60, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Main white oval with pearl-like sheen
    const ovalGradient = ctx.createRadialGradient(centerX - 20, centerY - 15, 0, centerX, centerY, 80);
    ovalGradient.addColorStop(0, '#FFFFFF');
    ovalGradient.addColorStop(0.3, '#F8F8FF');
    ovalGradient.addColorStop(0.7, '#F0F0F0');
    ovalGradient.addColorStop(1, '#E6E6E6');
    ctx.fillStyle = ovalGradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 72, 47, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Red oval border with metallic finish
    const redBorder = ctx.createLinearGradient(centerX - 72, centerY - 47, centerX + 72, centerY + 47);
    redBorder.addColorStop(0, '#DC143C');
    redBorder.addColorStop(0.3, '#B22222');
    redBorder.addColorStop(0.7, '#8B0000');
    redBorder.addColorStop(1, '#A0522D');
    ctx.strokeStyle = redBorder;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 72, 47, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner silver border detail
    const silverBorder = ctx.createLinearGradient(centerX - 64, centerY - 39, centerX + 64, centerY + 39);
    silverBorder.addColorStop(0, '#C0C0C0');
    silverBorder.addColorStop(0.5, '#A8A8A8');
    silverBorder.addColorStop(1, '#808080');
    ctx.strokeStyle = silverBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 64, 39, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Extremely detailed pearl border - Bugatti's signature
    const numPearls = 60; // Even more authentic detail
    for (let i = 0; i < numPearls; i++) {
      const angle = (i / numPearls) * Math.PI * 2;
      const pearlX = centerX + Math.cos(angle) * 84;
      const pearlY = centerY + Math.sin(angle) * 59;
      
      // Pearl base with gradient
      const pearlGradient = ctx.createRadialGradient(pearlX - 1, pearlY - 1, 0, pearlX, pearlY, 4);
      pearlGradient.addColorStop(0, '#FFFFFF');
      pearlGradient.addColorStop(0.5, '#F5F5F5');
      pearlGradient.addColorStop(1, '#E0E0E0');
      ctx.fillStyle = pearlGradient;
      ctx.beginPath();
      ctx.arc(pearlX, pearlY, 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Pearl highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pearlX - 1.2, pearlY - 1.2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Pearl shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(pearlX + 1, pearlY + 1, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // EB letters with luxury 3D effect
    const letterGradient = ctx.createLinearGradient(centerX - 30, centerY - 20, centerX + 30, centerY + 20);
    letterGradient.addColorStop(0, '#8B0000');
    letterGradient.addColorStop(0.3, '#A0522D');
    letterGradient.addColorStop(0.7, '#8B0000');
    letterGradient.addColorStop(1, '#5C0000');
    
    // Letter shadow for 3D effect
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 40px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('EB', centerX + 2, centerY + 14);
    
    // Main letters
    ctx.fillStyle = letterGradient;
    ctx.fillText('EB', centerX, centerY + 12);
    
    // Letter highlights
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 38px "Times New Roman", serif';
    ctx.fillText('EB', centerX - 1, centerY + 11);
    
    // Decorative elements around EB
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY);
    ctx.lineTo(centerX - 25, centerY);
    ctx.moveTo(centerX + 25, centerY);
    ctx.lineTo(centerX + 40, centerY);
    ctx.stroke();
    
    // BUGATTI text with embossed luxury effect
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 14px "Arial", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BUGATTI', centerX + 1, centerY + 76);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('BUGATTI', centerX, centerY + 75);
    
    // Ettore Bugatti signature flourishes
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Top flourish
    ctx.moveTo(centerX - 35, centerY - 60);
    ctx.quadraticCurveTo(centerX, centerY - 65, centerX + 35, centerY - 60);
    // Bottom flourish
    ctx.moveTo(centerX - 35, centerY + 60);
    ctx.quadraticCurveTo(centerX, centerY + 65, centerX + 35, centerY + 60);
    ctx.stroke();
    
    // Corner decorative elements for luxury feel
    const decorativePositions = [
      [centerX - 50, centerY - 30],
      [centerX + 50, centerY - 30],
      [centerX - 50, centerY + 30],
      [centerX + 50, centerY + 30]
    ];
    
    ctx.fillStyle = '#FFD700';
    decorativePositions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      // Small cross pattern
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.moveTo(x, y - 3);
      ctx.lineTo(x, y + 3);
      ctx.stroke();
    });
    
    // Final luxury accent - horseshoe pattern reference
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 25, 15, 0.2 * Math.PI, 0.8 * Math.PI);
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

        {/* Instructions */}
        <Card className="shadow-orange mb-4">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Target Order</h3>
              <p className="text-sm text-gray-600 mb-3">Arrange the numbered pieces in this order:</p>
              <div className="grid grid-cols-3 gap-2 w-32 mx-auto mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 0].map((num) => (
                  <div 
                    key={num} 
                    className={`w-9 h-9 border-2 ${num === 0 ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-400'} rounded-lg flex items-center justify-center text-sm font-bold ${num === 0 ? 'text-gray-400' : 'text-blue-700'} shadow-sm`}
                  >
                    {num === 0 ? '✨' : num}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Numbers 1-8 in sequence, bottom-right space empty</p>
            </div>
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