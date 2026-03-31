export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Step {
  title: string;
  description: string;
  imageUrl: string;
}

export interface Part {
  name: string;
  price?: string;
}

export interface Tool {
  name: string;
}

export interface RepairGuide {
  id: string;
  title: string;
  device: string;
  category: 'Smartphones' | 'Laptops' | 'Tablets' | 'Consoles' | 'Appliances';
  difficulty: Difficulty;
  timeEstimate: string;
  description: string;
  thumbnail: string;
  tools: Tool[];
  parts: Part[];
  steps: Step[];
  rating: number;
  reviewsCount: number;
}

export const REPAIR_CATEGORIES = [
  { name: 'Smartphones', icon: 'Smartphone' },
  { name: 'Laptops', icon: 'Laptop' },
  { name: 'Tablets', icon: 'Tablet' },
  { name: 'Consoles', icon: 'Gamepad' },
  { name: 'Appliances', icon: 'Home' },
] as const;

export const FEATURED_REPAIRS: RepairGuide[] = [];
