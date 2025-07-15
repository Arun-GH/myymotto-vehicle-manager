interface ColorfulLogoProps {
  className?: string;
}

export default function ColorfulLogo({ className = "text-2xl font-bold" }: ColorfulLogoProps) {
  return (
    <span className={className} style={{ textShadow: '0 0 10px rgba(255,255,255,0.8)' }}>
      <span style={{ color: '#ff0080', textShadow: '0 0 15px #ff0080' }}>M</span>
      <span style={{ color: '#00ff80', textShadow: '0 0 15px #00ff80' }}>y</span>
      <span style={{ color: '#00ff80', textShadow: '0 0 15px #00ff80' }}>y</span>
      <span style={{ color: '#8000ff', textShadow: '0 0 15px #8000ff' }}>m</span>
      <span style={{ color: '#ff4000', textShadow: '0 0 15px #ff4000' }}>o</span>
      <span style={{ color: '#00ffff', textShadow: '0 0 15px #00ffff' }}>t</span>
      <span style={{ color: '#00ffff', textShadow: '0 0 15px #00ffff' }}>t</span>
      <span style={{ color: '#ffff00', textShadow: '0 0 15px #ffff00' }}>o</span>
    </span>
  );
}