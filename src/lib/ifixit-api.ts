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
    lines: { text: string }[];
    media: { data: { original: string }[] };
  }[];
}

export async function searchIFixitGuides(query: string) {
  try {
    const res = await fetch(`https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?type=guide&limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('iFixit search error:', error);
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

export function mapIFixitToInternal(ifixit: IFixitGuide) {
  return {
    id: ifixit.guideid.toString(),
    title: ifixit.title,
    device: 'Hardware Device', // iFixit has a separate 'subject' usually
    category: 'Appliances' as any,
    difficulty: mapDifficulty(ifixit.difficulty),
    timeEstimate: ifixit.time_required || 'Unknown',
    description: stripHtml(ifixit.summary),
    thumbnail: ifixit.image?.original || 'https://picsum.photos/seed/repair/600/400',
    tools: ifixit.tools.map(t => ({ name: t.name })),
    parts: ifixit.parts.map(p => ({ name: p.name })),
    steps: ifixit.steps.map(s => ({
      title: s.title || 'Step',
      description: s.lines.map(l => stripHtml(l.text)).join(' '),
      imageUrl: s.media?.data?.[0]?.original || 'https://picsum.photos/seed/step/600/400'
    })),
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
