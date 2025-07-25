interface ColorfulLogoProps {
  className?: string;
}

export default function ColorfulLogo({ className = "text-xl font-bold" }: ColorfulLogoProps) {
  return (
    <h1 className={className}>
      <span className="text-blue-900">M</span>
      <span className="text-yellow-500">y</span>
      <span className="text-yellow-500">y</span>
      <span className="text-blue-900">m</span>
      <span className="text-green-500">o</span>
      <span className="text-red-600">t</span>
      <span className="text-red-600">t</span>
      <span className="text-green-500">o</span>
    </h1>
  );
}