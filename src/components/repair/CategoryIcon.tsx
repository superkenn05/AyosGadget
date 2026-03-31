
import { Smartphone, Laptop, Tablet, Gamepad, Home } from 'lucide-react';

const icons = {
  Smartphone,
  Laptop,
  Tablet,
  Gamepad,
  Home,
};

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] || Home;
  return <Icon className={className} />;
}
