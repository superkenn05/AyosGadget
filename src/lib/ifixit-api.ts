'use server';

/**
 * @fileOverview iFixit API Client with Firestore Caching Logic.
 */

<<<<<<< HEAD
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
=======
const IFIXIT_API_BASE = 'https://www.ifixit.com/api/2.0';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
>>>>>>> 56956337c1736eb3b5c1f3e9581c885b6962ef2c

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
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 3600 }
    });
    
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

export async function getTrendingGuides(offset: number = 0, limit: number = 12) {
  const data = await fetchIFixit(`guides?offset=${offset}&limit=${limit}`);
  if (!data) return [];
  const guides = Array.isArray(data) ? data : (data.results || []);
  return guides.map((g: any) => mapIFixitToInternal(g)).filter(Boolean);
}

export async function getGuideWithAllSteps(id: string): Promise<any> {
  const guide = await fetchIFixit(`guides/${id}`);
  if (!guide) return null;
  return mapIFixitToInternal(guide);
}

export async function getIFixitWiki(categoryName: string): Promise<any> {
  const data = await fetchIFixit(`wikis/CATEGORY/${encodeURIComponent(categoryName)}`);
  if (!data) return null;
  return {
    id: categoryName.toLowerCase().replace(/\s+/g, '-'),
    title: data.title,
    name: data.title,
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