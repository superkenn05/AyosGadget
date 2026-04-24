/**
 * @fileOverview Client for interacting with the iFixit API v2.0 with recursive prerequisite support.
 * Ensures all 20+ steps are retrieved by traversing all levels of prerequisite manuals.
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
 * Robust fetching that ensures all 20+ steps are retrieved by recursively traversing prerequisites.
 * MacBook guides often hide the first ~15 steps in "Lower Case" or "Battery" prerequisites.
 */
export async function getGuideWithAllSteps(id: string, visited = new Set<string>()): Promise<any> {
  if (visited.has(id)) return null;
  visited.add(id);

  try {
    const guide = await getIFixitGuide(id);
    if (!guide) return null;

    let combinedSteps: any[] = [];
    
    // 1. Fetch steps from prerequisites FIRST recursively to build the sequence
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

    // 2. Append current guide steps to the end of the prerequisite steps
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

export async function getIFixitWiki(categoryName: string): Promise<IFixitWiki | null> {
  try {
    // Normalize common categories for better API matching
    let mappedName = categoryName;
    if (categoryName === 'Smartphones') mappedName = 'Phone';
    if (categoryName === 'Desktop PCs') mappedName = 'Desktop';
    
    const res = await fetch(`https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodeURIComponent(mappedName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      description: stripHtml(data.description_rendered || data.description || ''),
      image: data.image,
      type: data.type || 'category',
      children: data.children || [],
    };
  } catch (error) {
    console.error('iFixit wiki error:', error);
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
  if (t.includes('laptop') || t.includes('macbook') || t.includes('mac')) return 'Laptops';
  if (t.includes('tablet') || t.includes('ipad')) return 'Tablets';
  if (t.includes('console') || t.includes('switch') || t.includes('playstation') || t.includes('xbox') || t.includes('gaming')) return 'Consoles';
  if (t.includes('audio') || t.includes('headphone') || t.includes('speaker') || t.includes('earbud')) return 'Audio';
  if (t.includes('camera') || t.includes('lens') || t.includes('photography')) return 'Cameras';
  if (t.includes('desktop') || t.includes('pc') || t.includes('monitor') || t.includes('workstation')) return 'Desktop PCs';
  if (t.includes('car') || t.includes('truck') || t.includes('vehicle')) return 'Car and Truck';
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