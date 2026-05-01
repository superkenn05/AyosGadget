'use server';

import type { CategoryName } from './repair-data';

/**
 * @fileOverview iFixit API Client with Firestore Caching Logic.
 */

const IFIXIT_API_BASE = 'https://www.ifixit.com/api/2.0';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

async function getIFixitGuide(id: string) {
  return await fetchIFixit(`guides/${encodeURIComponent(id)}`);
}

export async function getGuideWithAllSteps(id: string, visited = new Set<string>()): Promise<any> {
  if (visited.has(id)) return null;
  visited.add(id);

  try {
    const guide = await getIFixitGuide(id);
    if (!guide) return null;

    let combinedSteps: any[] = [];

    if (guide.prerequisites && Array.isArray(guide.prerequisites)) {
      for (const prereq of guide.prerequisites) {
        if (prereq.guideid) {
          const prereqData = await getGuideWithAllSteps(prereq.guideid.toString(), visited);
          if (prereqData && prereqData.steps) {
            combinedSteps = [...combinedSteps, ...prereqData.steps];
          }
        }
      }
    }

    const internal = mapIFixitToInternal(guide);
    if (!internal) return null;

    if (internal.steps && internal.steps.length > 0) {
      combinedSteps = [...combinedSteps, ...internal.steps];
    }

    return {
      ...internal,
      steps: combinedSteps,
    };
  } catch (error) {
    console.error(`Failed to fetch complete instructions for ${id}:`, error);
    return null;
  }
}

function stripHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapDifficulty(diff: string): 'easy' | 'medium' | 'hard' {
  const d = (diff || '').toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('moderate') || d.includes('medium')) return 'medium';
  return 'hard';
}

function mapIFixitToInternal(ifixit: any) {
  const rawId = ifixit.guideid ?? ifixit.id;
  if (!rawId) return null;
  
  const rawSteps = ifixit.steps || [];
  const mappedSteps = rawSteps.map((s: any) => {
    const stepLines = (s.lines || []).map((l: any) => {
      let text = l.text_rendered || l.text_raw || '';
      const bulletIcons: Record<string, string> = {
        'black': '• ',
        'blue': '🔵 ',
        'orange': '🟠 ',
        'caution': '⚠️ ',
      };
      return (bulletIcons[l.bullet] || '• ') + stripHtml(text).trim();
    }).filter(Boolean);

    return {
      id: s.id?.toString() || Math.random().toString(36).substr(2, 9),
      stepNumber: s.stepNumber || 0,
      title: s.title || '',
      description: stepLines.join('\n\n'),
      imageUrl: (s.media?.data || [])[0]?.original || '',
    };
  });

  return {
    id: rawId.toString(),
    title: ifixit.title || 'Untitled',
    device: ifixit.subject || 'Hardware',
    category: ifixit.type || ifixit.category || 'General',
    difficulty: mapDifficulty(ifixit.difficulty || 'Easy'),
    timeEstimate: ifixit.time_required || '30-60 mins',
    description: stripHtml(ifixit.introduction_rendered || ifixit.introduction_raw || ifixit.summary || ''),
    thumbnail: ifixit.image?.original || '',
    tools: (ifixit.tools || []).map((t: any) => ({ name: t.name, id: t.toolid?.toString() || t.name })),
    parts: (ifixit.parts || []).map((p: any) => ({ name: p.name, id: p.partid?.toString() || p.name })),
    steps: mappedSteps,
    rating: 4.8,
  };
}

async function fetchIFixit(endpoint: string) {
  const url = `${IFIXIT_API_BASE}/${endpoint}`;
  try {
    const init: RequestInit & { next?: { revalidate: number } } = {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 3600 },
    };

    const res = await fetch(url, init);
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function searchIFixitGuides(query: string) {
  const data = await fetchIFixit(`search/${encodeURIComponent(query)}?type=guide&limit=20`);
  if (!data || !data.results) return [];
  return data.results.map((r: any) => mapIFixitToInternal(r)).filter(Boolean);
}

// Fallback sub-modules for flat categories that don't have them on iFixit
const FALLBACK_SUBMODULES: Record<string, { title: string; image?: { thumbnail: string } }[]> = {
  'Smartphones': [
    { title: 'Apple iPhone' },
    { title: 'Samsung Galaxy' },
    { title: 'Google Pixel' },
    { title: 'OnePlus' },
    { title: 'Huawei' },
    { title: 'Xiaomi' }
  ],
  'Tablets': [
    { title: 'Apple iPad' },
    { title: 'Samsung Galaxy Tab' },
    { title: 'Microsoft Surface' },
    { title: 'Amazon Fire Tablet' },
    { title: 'Lenovo Tab' },
    { title: 'Huawei MatePad' }
  ],
  'Mac': [
    { title: 'MacBook Air' },
    { title: 'MacBook Pro' },
    { title: 'iMac' },
    { title: 'Mac mini' },
    { title: 'Mac Studio' },
    { title: 'Mac Pro' }
  ],
  'Consoles': [
    { title: 'PlayStation 5' },
    { title: 'Xbox Series X' },
    { title: 'Nintendo Switch' },
    { title: 'PlayStation 4' },
    { title: 'Xbox One' },
    { title: 'Nintendo Wii' }
  ],
  'Cameras': [
    { title: 'Canon DSLR' },
    { title: 'Nikon DSLR' },
    { title: 'Sony Mirrorless' },
    { title: 'GoPro Action Camera' },
    { title: 'Panasonic Lumix' },
    { title: 'DJI Drone Camera' }
  ],
  'Power Tool': [
    { title: 'Cordless Drill' },
    { title: 'Circular Saw' },
    { title: 'Jigsaw' },
    { title: 'Impact Driver' },
    { title: 'Router' },
    { title: 'Orbital Sander' }
  ],
  'Electronics': [
    { title: 'Wi-Fi Router' },
    { title: 'Bluetooth Speaker' },
    { title: 'Smartwatch' },
    { title: 'Drone' },
    { title: 'Smart Home Hub' },
    { title: 'Gaming Headset' }
  ],
  'Skills': [
    { title: 'Soldering Basics' },
    { title: 'Battery Replacement' },
    { title: 'Screen Repair' },
    { title: 'Keyboard Repair' },
    { title: 'Hard Drive Recovery' },
    { title: 'Circuit Diagnosis' }
  ],
  'Medical Device': [
    { title: 'Blood Pressure Monitor' },
    { title: 'CPAP Machine' },
    { title: 'Hearing Aid' },
    { title: 'Digital Thermometer' },
    { title: 'Electric Wheelchair' },
    { title: 'Medical Tablet' }
  ],
  'Desktop PCs': [
    { title: 'Gaming PC' },
    { title: 'Workstation' },
    { title: 'Mini PC' },
    { title: 'All-in-One PC' },
    { title: 'Home Office PC' },
    { title: 'Custom Build' }
  ],
  'Laptops': [
    { title: 'Dell Laptop' },
    { title: 'HP Laptop' },
    { title: 'Lenovo Laptop' },
    { title: 'ASUS Laptop' },
    { title: 'Acer Laptop' },
    { title: 'MSI Laptop' }
  ],
  'Audio': [
    { title: 'Headphones' },
    { title: 'Speakers' },
    { title: 'Soundbars' },
    { title: 'Amplifiers' },
    { title: 'Microphones' },
    { title: 'Turntables' }
  ],
  'Car and Truck': [
    { title: 'Toyota' },
    { title: 'Honda' },
    { title: 'Ford' },
    { title: 'Chevrolet' },
    { title: 'BMW' },
    { title: 'Tesla' }
  ],
  'Household': [
    { title: 'Washing Machine' },
    { title: 'Refrigerator' },
    { title: 'Microwave' },
    { title: 'Dishwasher' },
    { title: 'Oven' },
    { title: 'Dryer' }
  ],
  'Appliances': [
    { title: 'Washing Machine' },
    { title: 'Refrigerator' },
    { title: 'Microwave' },
    { title: 'Dishwasher' },
    { title: 'Oven' },
    { title: 'Dryer' }
  ],
  'Apparel': [
    { title: 'Jackets' },
    { title: 'Jeans' },
    { title: 'Shoes' },
    { title: 'Shirts' },
    { title: 'Pants' },
    { title: 'Bags' }
  ],
};

export async function getTrendingGuides(offset: number = 0, limit: number = 12) {
  const data = await fetchIFixit(`guides?offset=${offset}&limit=${limit}`);
  if (!data) return [];
  const guides = Array.isArray(data) ? data : (data.results || []);
  return guides.map((g: any) => mapIFixitToInternal(g)).filter(Boolean);
}

export async function getIFixitWiki(categoryName: string): Promise<any> {
  const data = await fetchIFixit(`wikis/CATEGORY/${encodeURIComponent(categoryName)}`);
  
  // If API returns data with children, use it
  if (data && data.children && data.children.length > 0) {
    return {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      title: data.title || categoryName,
      name: data.title || categoryName,
      description: stripHtml(data.description_rendered || data.description || ''),
      image: data.image,
      iconUrl: data.image?.thumbnail || '',
      children: (data.children || []).map((c: any) => ({
        title: c.title,
        name: c.title,
        imageUrl: c.image?.thumbnail || '',
      })),
    };
  }
  
  // Fallback to pre-built submodules if API doesn't have children
  const fallback = FALLBACK_SUBMODULES[categoryName];
  if (fallback) {
    return {
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      title: data?.title || categoryName,
      name: data?.title || categoryName,
      description: data ? stripHtml(data.description_rendered || data.description || '') : `Browse repair guides for ${categoryName}`,
      image: data?.image,
      iconUrl: data?.image?.thumbnail || '',
      children: fallback.map((c) => ({
        title: c.title,
        name: c.title,
        imageUrl: c.image?.thumbnail || '',
      })),
    };
  }
  
  return null;
}
