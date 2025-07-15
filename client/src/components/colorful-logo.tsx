interface ColorfulLogoProps {
  className?: string;
}

export default function ColorfulLogo({ className = "text-2xl font-bold" }: ColorfulLogoProps) {
  return (
    <span className={className}>
      <span style={{ color: '#1e3a8a' }}>M</span>
      <span style={{ color: '#eab308' }}>y</span>
      <span style={{ color: '#eab308' }}>y</span>
      <span style={{ color: '#1e3a8a' }}>m</span>
      <span style={{ color: '#16a34a' }}>o</span>
      <span style={{ color: '#0284c7' }}>t</span>
      <span style={{ color: '#0284c7' }}>t</span>
      <span style={{ color: '#16a34a' }}>o</span>
    </span>
  );
}