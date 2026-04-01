/**
 * @fileOverview Client for interacting with the iFixit API v2.0.
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

export async function getIFixitWiki(categoryName: string): Promise<IFixitWiki | null> {
  try {
    const mappedName = categoryName === 'Smartphones' ? 'Phone' : categoryName;
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
  
  // Robust Mapping: Capture ALL lines and use color indicators to match iFixit's UI
  const rawSteps = ifixit.steps || [];
  const mappedSteps = rawSteps.map((s: any) => {
    const stepLines = (s.lines || []).map((l: any) => {
      let text = l.text_rendered || l.text_raw || l.text || '';
      const bulletType = l.bullet || 'none';
      
      // Map iFixit bullet colors to Emojis for better visual guidance
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

    // Get ALL media items for the step gallery
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
    rating: 4.5,
    reviewsCount: Math.floor(Math.random() * 100) + 10,
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
  if (t.includes('laptop') || t.includes('macbook')) return 'Laptops';
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
