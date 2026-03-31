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

export type CategoryName = 'Smartphones' | 'Laptops' | 'Tablets' | 'Consoles' | 'Appliances' | 'Audio' | 'Cameras' | 'Desktop PCs' | 'Mac' | 'PC' | 'Car and Truck' | 'Medical Device' | 'Power Tool' | 'Household' | 'Electronics' | 'Skills';

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

export const PRIMARY_CATEGORIES = [
  { name: 'Mac', icon: 'Monitor', hint: 'Apple computer' },
  { name: 'Smartphones', icon: 'Smartphone', hint: 'Mobile phone' },
  { name: 'Consoles', icon: 'Gamepad', hint: 'Gaming console' },
  { name: 'Laptops', icon: 'Laptop', hint: 'Portable computer' },
  { name: 'Appliances', icon: 'Home', hint: 'Home appliance' },
  { name: 'Car and Truck', icon: 'Car', hint: 'Vehicle repair' },
  { name: 'Power Tool', icon: 'Wrench', hint: 'Electric tools' },
  { name: 'Medical Device', icon: 'Activity', hint: 'Medical equipment' },
] as const;

export const DIRECTORY_CATEGORIES = [
  { name: 'Apparel', count: 709 },
  { name: 'Cameras', count: 2071 },
  { name: 'Electronics', count: 6614 },
  { name: 'Household', count: 2139 },
  { name: 'Tablets', count: 1522 },
  { name: 'Audio', count: 3241 },
  { name: 'Desktop PCs', count: 2629 },
  { name: 'Skills', count: 332 },
] as const;

// For backward compatibility
export const REPAIR_CATEGORIES = [...PRIMARY_CATEGORIES];

export const FEATURED_REPAIRS: RepairGuide[] = [];
