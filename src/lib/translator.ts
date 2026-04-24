/**
 * @fileOverview Standard translation utility using a public API (LibreTranslate).
 * Replaces the Genkit AI flow for faster, non-LLM based translation.
 */

export async function translateFast(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  
  // Split by sentences to improve translation quality in some APIs
  const sentences = text.split(/(?<=[.!?])\s+/);

  const requests = sentences.map(async (sentence) => {
    if (!sentence.trim()) return "";

    try {
      // Note: LibreTranslate public instances can be unstable or have rate limits.
      // In a production app, a dedicated key or a more robust provider is recommended.
      const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        body: JSON.stringify({
          q: sentence.trim(),
          source: "en",
          target: "tl",
          format: "text"
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) return sentence;
      
      const data = await res.json();
      return data.translatedText || sentence;
    } catch (error) {
      console.warn("Translation partial failure, falling back to original sentence.");
      return sentence;
    }
  });

  const results = await Promise.all(requests);
  return results.filter(Boolean).join(" ");
}
