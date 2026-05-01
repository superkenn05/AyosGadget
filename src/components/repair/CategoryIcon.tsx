import { Smartphone, Laptop, Tablet, Gamepad, Home, Headphones, Camera, Monitor, Car, Wrench, Activity, Shirt, Box, Cpu, Music, Lightbulb, BookOpen } from 'lucide-react';

const icons = {
  Smartphone,
  Laptop,
  Tablet,
  Gamepad,
  Home,
  Headphones,
  Camera,
  Monitor,
  Car,
  Wrench,
  Activity,
  Shirt,
  Box,
  Cpu,
  Music,
  Lightbulb,
  BookOpen,
};

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] || Box;
  return <Icon className={className} />;
}
