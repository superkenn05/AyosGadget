export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Step {
  title: string;
  description: string;
  imageUrl: string;
  images?: string[];
}

export interface Part {
  name: string;
  price?: string;
}

export interface Tool {
  name: string;
}

// ✅ Updated categories based on UI
export type CategoryName =
  | 'Apparel'
  | 'Appliance'
  | 'Camera'
  | 'Car and Truck'
  | 'Computer Hardware'
  | 'Electronics'
  | 'Game Console'
  | 'Household'
  | 'Mac'
  | 'Medical Device'
  | 'PC'
  | 'Phone'
  | 'Skills'
  | 'Tablet'
  | 'Tool'
  | 'Vehicle';

export interface RepairGuide {
  id: string;
  title: string;
  device: string;
  category: CategoryName;
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

// ✅ Main categories (top section UI)
export const PRIMARY_CATEGORIES = [
  { name: 'Apparel', icon: 'Shirt', hint: 'Clothing repair' },
  { name: 'Appliance', icon: 'Microwave', hint: 'Home appliance' },
  { name: 'Camera', icon: 'Camera', hint: 'Photography device' },
  { name: 'Car and Truck', icon: 'Car', hint: 'Vehicle repair' },
  { name: 'Computer Hardware', icon: 'Cpu', hint: 'PC components' },
  { name: 'Electronics', icon: 'Cpu', hint: 'Electronic devices' },
  { name: 'Game Console', icon: 'Gamepad', hint: 'Gaming systems' },
  { name: 'Household', icon: 'Home', hint: 'Home items' },
  { name: 'Mac', icon: 'Monitor', hint: 'Apple computer' },
  { name: 'Medical Device', icon: 'Activity', hint: 'Medical equipment' },
  { name: 'PC', icon: 'Monitor', hint: 'Desktop computer' },
  { name: 'Phone', icon: 'Smartphone', hint: 'Mobile devices' },
  { name: 'Skills', icon: 'Wrench', hint: 'Repair skills' },
  { name: 'Tablet', icon: 'Tablet', hint: 'Tablet devices' },
  { name: 'Tool', icon: 'Wrench', hint: 'Repair tools' },
  { name: 'Vehicle', icon: 'Bike', hint: 'Motorcycle & others' },
] as const;

// ✅ Directory list (optional counts)
export const DIRECTORY_CATEGORIES = [
  { name: 'Apparel', count: 709 },
  { name: 'Appliance', count: 1200 },
  { name: 'Camera', count: 2071 },
  { name: 'Car and Truck', count: 1800 },
  { name: 'Computer Hardware', count: 2629 },
  { name: 'Electronics', count: 6614 },
  { name: 'Game Console', count: 950 },
  { name: 'Household', count: 2139 },
  { name: 'Mac', count: 800 },
  { name: 'Medical Device', count: 400 },
  { name: 'PC', count: 2000 },
  { name: 'Phone', count: 5000 },
  { name: 'Skills', count: 332 },
  { name: 'Tablet', count: 1522 },
  { name: 'Tool', count: 900 },
  { name: 'Vehicle', count: 1100 },
] as const;

// Backward compatibility
export const REPAIR_CATEGORIES = [...PRIMARY_CATEGORIES];

export const FEATURED_REPAIRS: RepairGuide[] = [];