
'use server';

/**
 * @fileOverview iFixit API Client - Server Side Implementation to avoid CORS.
 */

import { CategoryName } from './repair-data';

export interface IFixitGuide {
  guideid: number;
  title: string;
  summary: string;
  introduction_rendered: string;
  introduction_raw: string;
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

function stripHtml(html: string) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapDifficulty(diff: string): 'easy' | 'medium' | 'hard' {
  const d = diff.toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('moderate') || d.includes('medium')) return 'medium';
  return 'hard';
}

function mapCategory(type: string): CategoryName {
  const t = type.toLowerCase();
  if (t.includes('phone')) return 'Smartphones';
  if (t.includes('laptop')) return 'Laptops';
  if (t.includes('mac')) return 'Mac';
  return 'Appliances';
}

/**
 * Internal helper to map iFixit data to internal format.
 * Not exported because Server Actions must be async.
 */
async function mapIFixitToInternal(ifixit: any) {
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
        'caution': '⚠️ [BABALA]: ',
      };
      return (bulletIcons[l.bullet] || '• ') + stripHtml(text).trim();
    }).filter(Boolean);

    return {
      title: s.title || '',
      description: stepLines.join('\n\n'),
      imageUrl: (s.media?.data || [])[0]?.original || '',
      images: (s.media?.data || []).map((m: any) => m.original).filter(Boolean)
    };
  });

  return {
    id: rawId.toString(),
    title: ifixit.title || 'Untitled',
    device: ifixit.subject || 'Hardware',
    category: mapCategory(ifixit.type || ifixit.category || ''),
    difficulty: mapDifficulty(ifixit.difficulty || 'Easy'),
    timeEstimate: ifixit.time_required || '30-60 mins',
    description: stripHtml(ifixit.introduction_rendered || ifixit.introduction_raw || ifixit.summary || ''),
    thumbnail: ifixit.image?.original || '',
    tools: (ifixit.tools || []).map((t: any) => ({ name: t.name })),
    parts: (ifixit.parts || []).map((p: any) => ({ name: p.name })),
    steps: mappedSteps,
    rating: 4.8,
  };
}

export async function searchIFixitGuides(query: string) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?type=guide&limit=40`);
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];
    const mapped = await Promise.all(results.map((r: any) => mapIFixitToInternal(r)));
    return mapped.filter(Boolean);
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
    const mapped = await Promise.all((data || []).map((r: any) => mapIFixitToInternal(r)));
    return mapped.filter(Boolean);
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

export async function getGuideWithAllSteps(id: string, visitedRaw?: string[]): Promise<any> {
  const visited = new Set(visitedRaw || []);
  if (visited.has(id) || visited.size > 20) return null; 
  visited.add(id);

  try {
    const guide = await getIFixitGuide(id);
    if (!guide) return null;

    let allSteps: any[] = [];
    let consolidatedDescription = stripHtml(guide.introduction_rendered || guide.introduction_raw || guide.summary || '');
    
    if (guide.prerequisites && Array.isArray(guide.prerequisites)) {
      for (const prereq of guide.prerequisites) {
        const prereqData = await getGuideWithAllSteps(prereq.guideid.toString(), Array.from(visited));
        if (prereqData && prereqData.steps) {
          allSteps = [...allSteps, ...prereqData.steps];
          if (prereqData.description && !consolidatedDescription.includes(prereqData.description.slice(0, 40))) {
            consolidatedDescription = prereqData.description + "\n\n" + consolidatedDescription;
          }
        }
      }
    }

    const mappedSteps = (guide.steps || []).map((s: any) => {
      const stepLines = (s.lines || []).map((l: any) => {
        let text = l.text_rendered || l.text_raw || '';
        const bulletIcons: Record<string, string> = {
          'black': '• ',
          'blue': '🔵 ',
          'orange': '🟠 ',
          'caution': '⚠️ [BABALA]: ',
        };
        return (bulletIcons[l.bullet] || '• ') + stripHtml(text).trim();
      }).filter(Boolean);

      return {
        title: s.title || '',
        description: stepLines.join('\n\n'),
        imageUrl: (s.media?.data || [])[0]?.original || '',
        images: (s.media?.data || []).map((m: any) => m.original).filter(Boolean)
      };
    });

    allSteps = [...allSteps, ...mappedSteps];

    return {
      id: guide.guideid.toString(),
      title: guide.title || 'Untitled',
      device: guide.subject || 'Hardware',
      category: mapCategory(guide.type || guide.category || ''),
      difficulty: mapDifficulty(guide.difficulty || 'Easy'),
      timeEstimate: guide.time_required || '30-60 mins',
      description: consolidatedDescription.trim(),
      thumbnail: guide.image?.original || '',
      tools: (guide.tools || []).map((t: any) => ({ name: t.name })),
      parts: (guide.parts || []).map((p: any) => ({ name: p.name })),
      steps: allSteps,
      rating: 4.8,
    };
  } catch (error) {
    console.error('Recursive guide fetch failed:', error);
    return null;
  }
}

export async function getIFixitWiki(categoryName: string): Promise<IFixitWiki | null> {
  try {
    let mappedName = categoryName;
    if (categoryName === 'Smartphones') mappedName = 'Phone';
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
