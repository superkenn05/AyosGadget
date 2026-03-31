
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

export const FEATURED_REPAIRS: RepairGuide[] = [
  {
    id: 'iphone-13-screen',
    title: 'iPhone 13 Screen Replacement',
    device: 'iPhone 13',
    category: 'Smartphones',
    difficulty: 'medium',
    timeEstimate: '45-60 mins',
    description: 'A comprehensive guide to replacing a cracked or non-functional display on your iPhone 13.',
    thumbnail: 'https://picsum.photos/seed/iphone13/600/400',
    rating: 4.8,
    reviewsCount: 124,
    tools: [
      { name: 'Pentalobe P2 Screwdriver' },
      { name: 'Spudger' },
      { name: 'Suction Handle' },
      { name: 'Opening Picks' }
    ],
    parts: [
      { name: 'iPhone 13 Screen Assembly', price: '₱8,500' },
      { name: 'Display Adhesive', price: '₱250' }
    ],
    steps: [
      {
        title: 'Power Off',
        description: 'Before beginning, discharge your battery below 25% and turn off your iPhone.',
        imageUrl: 'https://picsum.photos/seed/step1/600/400'
      },
      {
        title: 'Remove Pentalobe Screws',
        description: 'Remove the two 6.7 mm long pentalobe screws at the bottom edge of the iPhone.',
        imageUrl: 'https://picsum.photos/seed/step2/600/400'
      },
      {
        title: 'Apply Heat',
        description: 'Use a heat gun or hairdryer to soften the adhesive around the display edges.',
        imageUrl: 'https://picsum.photos/seed/step3/600/400'
      }
    ]
  },
  {
    id: 'macbook-pro-battery',
    title: 'MacBook Pro 14" Battery Replacement',
    device: 'MacBook Pro M1 (2021)',
    category: 'Laptops',
    difficulty: 'hard',
    timeEstimate: '90-120 mins',
    description: 'Replace the aging battery in your 14-inch MacBook Pro for better portable performance.',
    thumbnail: 'https://picsum.photos/seed/macbook/600/400',
    rating: 4.5,
    reviewsCount: 56,
    tools: [
      { name: 'P5 Pentalobe Screwdriver' },
      { name: 'T5 Torx Screwdriver' },
      { name: 'Plastic Spudger' },
      { name: 'Adhesive Remover' }
    ],
    parts: [
      { name: 'MacBook Pro 14" Battery Pack', price: '₱6,200' }
    ],
    steps: [
      {
        title: 'Bottom Cover Removal',
        description: 'Remove the eight P5 Pentalobe screws securing the lower case.',
        imageUrl: 'https://picsum.photos/seed/mbstep1/600/400'
      }
    ]
  },
  {
    id: 'switch-joycon-drift',
    title: 'Nintendo Switch Joy-Con Drift Repair',
    device: 'Joy-Con Controller',
    category: 'Consoles',
    difficulty: 'easy',
    timeEstimate: '20-30 mins',
    description: 'Fix the common "drift" issue by replacing the analog stick module.',
    thumbnail: 'https://picsum.photos/seed/switch/600/400',
    rating: 4.9,
    reviewsCount: 342,
    tools: [
      { name: 'Y00 Tri-point Screwdriver' },
      { name: 'PH000 Phillips Screwdriver' },
      { name: 'Tweezers' }
    ],
    parts: [
      { name: 'Replacement Joystick Module', price: '₱450' }
    ],
    steps: [
      {
        title: 'Open the Casing',
        description: 'Remove the four Y00 screws on the back of the Joy-Con.',
        imageUrl: 'https://picsum.photos/seed/swstep1/600/400'
      }
    ]
  }
];
