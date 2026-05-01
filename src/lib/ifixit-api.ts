/**
 * @fileOverview Client for interacting with the iFixit API v2.0 with recursive prerequisite support.
 */

import { CategoryName } from './repair-data';

export interface IFixitGuide {
  guideid: number;
  title: string;
  summary: string;
  difficulty: string;
  time_required: string;
  image: { original: string };
  subject: string;
  type: string;
  tools: { name: string }[];
  parts: { name: string }[];
  prerequisites: { guideid: number; title: string }[];
  steps: {
    title: string;
    lines: { text_raw: string; text_rendered: string; bullet: string }[];
    media: { data: { original: string; medium: string; thumbnail: string }[] };
  }[];
}

export interface IFixitWiki {
  title: string;
  description: string;
  image: { original: string };
  type: string;
  children: { title: string; image: { thumbnail: string }; type: string }[];
}

export async function searchIFixitGuides(query: string) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?type=guide&limit=40`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('iFixit search error:', error);
    return [];
  }
}

export async function getTrendingGuides(offset: number = 0, limit: number = 12) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/guides?offset=${offset}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error('iFixit trending error:', error);
    return [];
  }
}

export async function getIFixitGuide(id: string): Promise<IFixitGuide | null> {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('iFixit fetch error:', error);
    return null;
  }
}

/**
 * Robust fetching that ensures all 20+ steps are retrieved by traversing prerequisites.
 */
export async function getGuideWithAllSteps(id: string, visited = new Set<string>()): Promise<any> {
  if (visited.has(id)) return null;
  visited.add(id);

  try {
    const guide = await getIFixitGuide(id);
    if (!guide) return null;

    let combinedSteps: any[] = [];
    
    // 1. Fetch steps from prerequisites FIRST recursively
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

    // 2. Append current guide steps to the sequence
    if (internal.steps && internal.steps.length > 0) {
      combinedSteps = [...combinedSteps, ...internal.steps];
    }

    return {
      ...internal,
      steps: combinedSteps
    };
  } catch (error) {
    console.error(`Failed to fetch complete instructions for ${id}:`, error);
    return null;
  }
}

// Fallback sub-modules for flat categories that don't have them on iFixit
const FALLBACK_SUBMODULES: Record<string, { title: string; image?: { thumbnail: string } }[]> = {
  'Laptop': [
    { title: 'Dell Laptop' },
    { title: 'HP Laptop' },
    { title: 'Lenovo Laptop' },
    { title: 'ASUS Laptop' },
    { title: 'Acer Laptop' },
    { title: 'MSI Laptop' }
  ],
  'Headphones': [
    { title: 'Apple Headphones' },
    { title: 'Sony Headphones' },
    { title: 'Beats Headphones' },
    { title: 'Bose Headphones' },
    { title: 'Sennheiser Headphones' },
    { title: 'JBL Headphones' }
  ],
  'Desktop Computer': [
    { title: 'Apple iMac' },
    { title: 'Dell Desktop' },
    { title: 'HP Desktop' },
    { title: 'Lenovo Desktop' },
    { title: 'Custom PC Build' }
  ],
  'Car': [
    { title: 'Toyota' },
    { title: 'Honda' },
    { title: 'Ford' },
    { title: 'Chevrolet' },
    { title: 'BMW' },
    { title: 'Tesla' }
  ],
  'Appliances': [
    { title: 'Washing Machine' },
    { title: 'Refrigerator' },
    { title: 'Microwave' },
    { title: 'Dishwasher' },
    { title: 'Oven' },
    { title: 'Dryer' }
  ],
  'Household Appliance': [
    { title: 'Coffee Maker' },
    { title: 'Toaster' },
    { title: 'Vacuum Cleaner' },
    { title: 'Iron' },
    { title: 'Blender' },
    { title: 'Hair Dryer' }
  ]
};

export async function getIFixitWiki(categoryName: string): Promise<IFixitWiki | null> {
  try {
    // Map category names to iFixit API category names (only include categories with sub-modules)
    const categoryMapping: Record<string, string> = {
      'Smartphones': 'Phone',
      'Tablets': 'Tablet',
      'Mac': 'Mac',
      'Consoles': 'Game Console',
      'Cameras': 'Camera',
      'Power Tool': 'Power Tool',
      'Electronics': 'Electronics',
      // Categories without sub-modules still map to themselves as fallback
      'Laptops': 'Laptop',
      'Audio': 'Headphones',
      'Desktop PCs': 'Desktop Computer',
      'Car and Truck': 'Car',
      'Appliances': 'Appliances',
      'Household': 'Household Appliance',
      'Medical Device': 'Medical Device',
      'Skills': 'Skills',
      'PC': 'PC'
    };

    const mappedName = categoryMapping[categoryName] || categoryName;
    const res = await fetch(`https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodeURIComponent(mappedName)}`);
    
    if (!res.ok) {
      // If API fails, check if we have fallback sub-modules
      const fallback = FALLBACK_SUBMODULES[mappedName];
      if (fallback) {
        return {
          title: categoryName,
          description: `Browse repair guides for ${categoryName}`,
          image: { original: '' },
          type: 'category',
          children: fallback,
        };
      }
      return null;
    }

    const data = await res.json();
    let children = data.children || [];
    
    // If API returned no children but we have fallback, use fallback
    if ((!children || children.length === 0) && FALLBACK_SUBMODULES[mappedName]) {
      children = FALLBACK_SUBMODULES[mappedName];
    }

    return {
      title: data.title,
      description: stripHtml(data.description_rendered || data.description || ''),
      image: data.image,
      type: data.type || 'category',
      children: children,
    };
  } catch (error) {
    console.error('iFixit wiki error:', error);
    // Try fallback if network error
    const fallback = FALLBACK_SUBMODULES[categoryName];
    if (fallback) {
      return {
        title: categoryName,
        description: `Browse repair guides for ${categoryName}`,
        image: { original: '' },
        type: 'category',
        children: fallback,
      };
    }
    return null;
  }
}

export function mapIFixitToInternal(ifixit: any) {
  const rawId = ifixit.guideid ?? ifixit.id;
  if (!rawId) return null;
  
  const guideId = rawId.toString();
  const rawSteps = ifixit.steps || [];
  
  const mappedSteps = rawSteps.map((s: any) => {
    const stepLines = (s.lines || []).map((l: any) => {
      let text = l.text_rendered || l.text_raw || l.text || '';
      const bulletType = l.bullet || 'none';
      
      const bulletIcons: Record<string, string> = {
        'black': '• ',
        'blue': '🔵 ',
        'orange': '🟠 ',
        'yellow': '🟡 ',
        'red': '🔴 ',
        'green': '🟢 ',
        'violet': '🟣 ',
        'white': '⚪ ',
        'caution': '⚠️ [WARNING]: ',
        'warning': '⚠️ [WARNING]: '
      };

      const prefix = bulletIcons[bulletType] || (bulletType !== 'none' ? '• ' : '');
      return prefix + stripHtml(text).trim();
    }).filter(Boolean);

    const images = (s.media?.data || []).map((m: any) => m.original || m.medium || m.thumbnail).filter(Boolean);
    const primaryImage = images[0] || '';

    return {
      title: s.title || '',
      description: stepLines.join('\n\n'),
      imageUrl: primaryImage,
      images: images
    };
  });

  return {
    id: guideId,
    title: ifixit.title || 'Untitled Guide',
    device: ifixit.subject || ifixit.type || 'Hardware Device',
    category: mapCategory(ifixit.type || ifixit.subject || ifixit.category || 'Appliances'),
    difficulty: mapDifficulty(ifixit.difficulty || 'Easy'),
    timeEstimate: ifixit.time_required || '30-60 mins',
    description: stripHtml(ifixit.summary || ifixit.text || ''),
    thumbnail: ifixit.image?.original || ifixit.thumbnail || '',
    type: ifixit.type || 'replacement',
    tools: (ifixit.tools || []).map((t: any) => ({ name: t.name })),
    parts: (ifixit.parts || []).map((p: any) => ({ name: p.name })),
    prerequisites: (ifixit.prerequisites || []).map((pr: any) => ({ id: pr.guideid, title: pr.title })),
    steps: mappedSteps,
    rating: 4.8,
    reviewsCount: 156,
  };
}

function mapDifficulty(diff: string): 'easy' | 'medium' | 'hard' {
  if (!diff) return 'easy';
  const d = diff.toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('moderate') || d.includes('medium')) return 'medium';
  return 'hard';
}

function mapCategory(type: string): CategoryName {
  if (!type) return 'Appliances';
  const t = type.toLowerCase();
  if (t.includes('phone')) return 'Smartphones';
  if (t.includes('macbook') || t.includes('mac')) return 'Mac';
  if (t.includes('laptop')) return 'Laptops';
  if (t.includes('tablet') || t.includes('ipad')) return 'Tablets';
  if (t.includes('console') || t.includes('switch') || t.includes('playstation') || t.includes('xbox') || t.includes('gaming')) return 'Consoles';
  if (t.includes('audio') || t.includes('headphone') || t.includes('speaker') || t.includes('earbud')) return 'Audio';
  if (t.includes('camera') || t.includes('lens') || t.includes('photography')) return 'Cameras';
  if (t.includes('desktop') || t.includes('pc') || t.includes('monitor') || t.includes('workstation')) return 'Desktop PCs';
  if (t.includes('car') || t.includes('truck')) return 'Car and Truck';
  return 'Appliances';
}

function stripHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}
