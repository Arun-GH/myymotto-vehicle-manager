interface ColorfulLogoProps {
  className?: string;
}

export default function ColorfulLogo({ className = "text-2xl font-bold" }: ColorfulLogoProps) {
  return (
    <span className={className}>
      <span style={{ color: '#dc2626' }}>M</span>
      <span style={{ color: '#ea580c' }}>y</span>
      <span style={{ color: '#ea580c' }}>y</span>
      <span style={{ color: '#dc2626' }}>m</span>
      <span style={{ color: '#16a34a' }}>o</span>
      <span style={{ color: '#0284c7' }}>t</span>
      <span style={{ color: '#0284c7' }}>t</span>
      <span style={{ color: '#16a34a' }}>o</span>
    </span>
  );
}