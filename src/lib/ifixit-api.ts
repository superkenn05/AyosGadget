'use server';

/**
 * @fileOverview iFixit API Client with Firestore Caching Logic.
 */

const IFIXIT_API_BASE = 'https://www.ifixit.com/api/2.0';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

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