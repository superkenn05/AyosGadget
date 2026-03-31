/**
 * @fileOverview Client for interacting with the iFixit API v2.0.
 */

export interface IFixitGuide {
  guideid: number;
  title: string;
  summary: string;
  difficulty: string;
  time_required: string;
  image: { original: string };
  tools: { name: string }[];
  parts: { name: string }[];
  steps: {
    title: string;
    lines: { text_raw: string; text_rendered: string }[];
    media: { data: { original: string }[] };
  }[];
}

export async function searchIFixitGuides(query: string) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?type=guide&limit=12`);
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

export function mapIFixitToInternal(ifixit: any) {
  // Handles both search result structure and full guide structure
  const guideId = ifixit.guideid || ifixit.id;
  
  // Extract steps instructions more robustly
  const mappedSteps = (ifixit.steps || []).map((s: any) => {
    // Collect all lines of text for this step
    const stepLines = (s.lines || []).map((l: any) => {
      // Prefer text_rendered (stripped of HTML) or text_raw
      const text = l.text_rendered || l.text_raw || l.text || '';
      return stripHtml(text).trim();
    }).filter(Boolean);

    return {
      title: s.title || 'Step',
      description: stepLines.join('\n\n'),
      imageUrl: s.media?.data?.[0]?.original || 'https://picsum.photos/seed/step/600/400'
    };
  });

  return {
    id: guideId.toString(),
    title: ifixit.title,
    device: ifixit.subject || 'Hardware Device',
    category: 'Appliances' as any, // Default category
    difficulty: mapDifficulty(ifixit.difficulty || 'Easy'),
    timeEstimate: ifixit.time_required || '30-60 mins',
    description: stripHtml(ifixit.summary || ifixit.text || ''),
    thumbnail: ifixit.image?.original || ifixit.thumbnail || 'https://picsum.photos/seed/repair/600/400',
    tools: (ifixit.tools || []).map((t: any) => ({ name: t.name })),
    parts: (ifixit.parts || []).map((p: any) => ({ name: p.name })),
    steps: mappedSteps,
    rating: 4.5,
    reviewsCount: 10,
  };
}

function mapDifficulty(diff: string): 'easy' | 'medium' | 'hard' {
  const d = diff.toLowerCase();
  if (d.includes('easy')) return 'easy';
  if (d.includes('moderate') || d.includes('medium')) return 'medium';
  return 'hard';
}

function stripHtml(html: string) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}
