'use server';

/**
 * @fileOverview iFixit API Client - Server Side Implementation.
 * All functions here are async to satisfy Next.js Server Action requirements.
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

/**
 * Internal helper to map iFixit data to our internal format.
 * Not exported as it is synchronous and would violate 'use server' if exported.
 */
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
  'User-Agent': 'AyosGadget/1.0 (Neural Repair Engine)',
  'Accept': 'application/json',
};

export async function searchIFixitGuides(query: string) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?type=guide&limit=20`, {
      headers: DEFAULT_HEADERS
    });
    if (!res.ok) throw new Error(`iFixit Search Failed: ${res.status}`);
    const data = await res.json();
    return (data.results || []).map(transformIFixitData).filter(Boolean);
  } catch (error) {
    console.error('iFixit search error:', error);
    return [];
  }
}

export async function getTrendingGuides(offset: number = 0, limit: number = 12) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/guides?offset=${offset}&limit=${limit}`, {
      headers: DEFAULT_HEADERS,
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error(`iFixit Trending Failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(transformIFixitData).filter(Boolean);
  } catch (error) {
    console.error('iFixit trending error:', error);
    return [];
  }
}

export async function getGuideWithAllSteps(id: string): Promise<any> {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${id}`, {
      headers: DEFAULT_HEADERS
    });
    if (!res.ok) throw new Error(`iFixit Guide Fetch Failed: ${res.status}`);
    const guide = await res.json();
    return transformIFixitData(guide);
  } catch (error) {
    console.error('iFixit fetch error:', error);
    return null;
  }
}

export async function getIFixitWiki(categoryName: string): Promise<any> {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodeURIComponent(categoryName)}`, {
      headers: DEFAULT_HEADERS
    });
    if (!res.ok) throw new Error(`iFixit Wiki Failed: ${res.status}`);
    const data = await res.json();
    return {
      title: data.title,
      description: stripHtml(data.description_rendered || data.description || ''),
      image: data.image,
      children: data.children || [],
    };
  } catch (error) {
    console.error('iFixit wiki error:', error);
    return null;
  }
}
