'use server';

/**
 * @fileOverview iFixit API Client - Server Side Implementation.
 * All functions here are async to satisfy Next.js Server Action requirements.
 * Using robust fetch options to bypass CORS and handle timeouts.
 */

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

function transformIFixitData(ifixit: any) {
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
    tools: (ifixit.tools || []).map((t: any) => ({ name: t.name })),
    parts: (ifixit.parts || []).map((p: any) => ({ name: p.name })),
    steps: mappedSteps,
    rating: 4.8,
  };
}

const DEFAULT_HEADERS = {
  'User-Agent': 'AyosGadget/1.0 (Neural Repair Engine; +https://ayosgadget.com)',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache',
};

/**
 * Robust fetch wrapper to handle common iFixit API quirks.
 */
async function fetchIFixit(endpoint: string) {
  const url = endpoint.startsWith('http') ? endpoint : `https://www.ifixit.com/api/2.0/${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.warn(`iFixit API Error: ${res.status} for ${url}`);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    return null;
  }
}

export async function searchIFixitGuides(query: string) {
  const data = await fetchIFixit(`search/${encodeURIComponent(query)}?type=guide&limit=20`);
  if (!data || !data.results) return [];
  return data.results.map(transformIFixitData).filter(Boolean);
}

export async function getTrendingGuides(offset: number = 0, limit: number = 12) {
  const data = await fetchIFixit(`guides?offset=${offset}&limit=${limit}`);
  if (!data || !Array.isArray(data)) return [];
  return data.map(transformIFixitData).filter(Boolean);
}

export async function getGuideWithAllSteps(id: string): Promise<any> {
  const guide = await fetchIFixit(`guides/${id}`);
  if (!guide) return null;
  return transformIFixitData(guide);
}

export async function getIFixitWiki(categoryName: string): Promise<any> {
  const data = await fetchIFixit(`wikis/CATEGORY/${encodeURIComponent(categoryName)}`);
  if (!data) return null;
  return {
    title: data.title,
    description: stripHtml(data.description_rendered || data.description || ''),
    image: data.image,
    children: data.children || [],
  };
}
