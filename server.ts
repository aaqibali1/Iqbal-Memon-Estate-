import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function requireApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.',
    );
  }
  return apiKey;
}

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: requireApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Interactions API models such as gemini-omni-1.2-flash require v1beta on @google/genai >= 3.x
function getInteractionsAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: requireApiKey(),
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isRetryableQuotaOrBusyError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return (
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('429') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('503') ||
    raw.includes('overloaded') ||
    raw.includes('high demand')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback(
  ai: GoogleGenAI,
  contents: any,
  baseConfig: Record<string, any>,
) {
  const attempts: Array<{ model: string; config: Record<string, any>; delayMs: number }> = [
    {
      model: 'gemini-4-hydrogen',
      config: {
        ...baseConfig,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
      delayMs: 0,
    },
    {
      model: 'gemini-3.1-flash-lite',
      config: { ...baseConfig },
      delayMs: 350,
    },
    {
      model: 'gemini-3.1-flash-lite',
      config: { ...baseConfig },
      delayMs: 1100,
    },
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await sleep(attempt.delayMs);
    }
    try {
      return await ai.models.generateContent({
        model: attempt.model,
        contents,
        config: attempt.config,
      });
    } catch (err) {
      lastError = err;
      const raw = err instanceof Error ? err.message : String(err);
      const retryable =
        isRetryableQuotaOrBusyError(err) ||
        raw.includes('NOT_FOUND') ||
        raw.includes('404');
      if (!retryable) {
        throw err;
      }
    }
  }
  throw lastError;
}

type ErrorContext = 'chat' | 'insights' | 'video';

function formatGeminiError(
  err: unknown,
  context: ErrorContext,
): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY is not configured')) {
    return { status: 503, message: raw };
  }
  if (raw.includes('UNAVAILABLE') || raw.includes('503') || raw.includes('high demand')) {
    return {
      status: 503,
      message:
        'The AI service is momentarily busy due to high demand. Please retry in a few seconds.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    if (context === 'video') {
      return {
        status: 429,
        message:
          'Video generation (gemini-omni-1.2-flash) requires a billing-enabled Gemini API key or available quota. Please select a paid key in Settings > Secrets and try again.',
      };
    }
    return {
      status: 429,
      message:
        'Temporary API rate limit reached for this search request. Please wait a moment and try again, or upgrade your key in Settings > Secrets for higher limits.',
    };
  }
  if (
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('403') ||
    raw.includes('API_KEY_INVALID')
  ) {
    return {
      status: 403,
      message:
        context === 'video'
          ? 'Video generation (gemini-omni-1.2-flash) requires a paid Gemini API key with billing enabled in Settings > Secrets.'
          : 'Access denied or invalid API key. Please verify your Gemini API key in Settings > Secrets.',
    };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return {
      status: 404,
      message:
        context === 'video'
          ? 'The video model endpoint is not enabled for the current API key. Please ensure a billing-enabled key is configured in Settings > Secrets.'
          : 'Requested Gemini model endpoint was not found. Please retry shortly.',
    };
  }
  return {
    status: 500,
    message: 'Unable to complete the AI request right now. Please try again in a moment.',
  };
}

const INSIGHTS_CACHE_TTL_MS = 5 * 60 * 1000;
const insightsCache = new Map<
  string,
  {
    expiresAt: number;
    payload: {
      answer: string;
      sources: GroundingSource[];
      mode: string;
      groundingNote?: string;
    };
  }
>();

async function searchPlacesRestFallback(
  query: string,
  lat: number,
  lng: number,
): Promise<GroundingSource[]> {
  const mapsKey =
    process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';
  if (!mapsKey) return [];
  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask':
          'places.displayName,places.formattedAddress,places.googleMapsUri',
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 5,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 6000,
          },
        },
      }),
    });
    if (!resp.ok) return [];
    const data: any = await resp.json();
    const places = Array.isArray(data?.places) ? data.places : [];
    return places
      .filter((p: any) => p?.displayName?.text && p?.googleMapsUri)
      .map((p: any) => ({
        type: 'maps' as const,
        title: p.displayName.text,
        uri: p.googleMapsUri,
        snippets: p.formattedAddress ? [p.formattedAddress] : undefined,
      }));
  } catch {
    return [];
  }
}

const CONSULTANT_SYSTEM_INSTRUCTION = `You are the Senior Real Estate Advisor for Iqbal Memon Estate, a respected property consultancy headquartered at Plot No. 41-C/5, Murtaza Lane 1, Ground Floor, DHA Phase 8, Karachi, Pakistan (75500).
Contact: Primary Phone/WhatsApp +92 321 8228626, Secondary +92 315 2800010, Email iqbalmemonestate@hotmail.com.
Philosophy: "Honest advice, professional service & trusted investment solutions."
You advise clients on residential and commercial sale, purchase, and rental across DHA Karachi (Phases 4, 5, 6, 7, 8, Murtaza Commercial, Zulfiqar Commercial, Bukhari, Ittehad, Shahbaz, Khayaban-e-Shaheen, Creek Vista).
Active featured listings include:
- IME-801: 500 Sq. Yds Brand New Designer Bungalow, DHA Phase 8 Zone A, PKR 16.5 Crore (5 Bed, 6 Bath, West Open, Full Basement + Pool)
- IME-802: 200 Sq. Yds Commercial Plot on Murtaza Lane 1, DHA Phase 8, PKR 19.2 Crore
- IME-603: 1000 Sq. Yds Corner Mansion with Private Pool, DHA Phase 6, PKR 34.0 Crore (6 Bed, 7 Bath)
- IME-804: Sea-Facing 3-Bed Luxury Apartment for Rent, DHA Phase 8, PKR 4.2 Lakh / month
- IME-805: 500 Sq. Yds Corner Residential Plot, Phase 8 Zone B, PKR 10.8 Crore
- IME-506: 500 Sq. Yds Executive Upper Portion for Rent, DHA Phase 5, PKR 2.85 Lakh / month
- IME-707: 300 Sq. Yds Modern Double-Unit Bungalow, DHA Phase 7, PKR 11.4 Crore
- IME-808: Ground Floor Corporate Showroom on Zulfiqar Lane, DHA Phase 8, PKR 6.5 Lakh / month (Rent)
- IME-409: 500 Sq. Yds Renovated Family Bungalow, DHA Phase 4, PKR 14.2 Crore (5 Bed, 5 Bath)

Keep responses clear, trustworthy, structured, and concise (under 220 words unless the user requests deep analysis). Use authentic Pakistani real estate terminology (PKR Crore/Lakh, Sq. Yds / Gaz, Bayana, DHA Transfer, NDC, West Open). Never invent fake third-party ratings or unverified prices; when citing external facts or nearby places, rely on live search/maps grounding results.`;

interface GroundingSource {
  type: 'web' | 'maps';
  title: string;
  uri: string;
  snippets?: string[];
}

function extractGroundingSources(response: any): GroundingSource[] {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const sources: GroundingSource[] = [];

  for (const chunk of chunks) {
    if (chunk?.web?.uri && !seen.has(chunk.web.uri)) {
      seen.add(chunk.web.uri);
      sources.push({
        type: 'web',
        title: chunk.web.title || chunk.web.uri,
        uri: chunk.web.uri,
      });
    }
    if (chunk?.maps?.uri && !seen.has(chunk.maps.uri)) {
      seen.add(chunk.maps.uri);
      const snippets: string[] = [];
      const reviewSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
      if (Array.isArray(reviewSnippets)) {
        for (const r of reviewSnippets) {
          if (typeof r?.content === 'string') snippets.push(r.content);
          else if (typeof r?.text === 'string') snippets.push(r.text);
        }
      }
      sources.push({
        type: 'maps',
        title: chunk.maps.title || 'View on Google Maps',
        uri: chunk.maps.uri,
        snippets: snippets.length ? snippets : undefined,
      });
    }
  }
  return sources;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  // Public Google Maps JS key config endpoint (public browser key restricted by referrer)
  app.get('/api/config/maps', (_req, res) => {
    const apiKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ apiKey });
  });

  // Multi-turn Gemini Real Estate Concierge with optional Search or Maps Grounding
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, mode = 'advisor', location } = req.body ?? {};
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Messages array is required.' });
        return;
      }

      const ai = getAiClient();
      const sanitizedContents = messages
        .filter(
          (m: any) =>
            m &&
            (m.role === 'user' || m.role === 'model') &&
            typeof m.text === 'string' &&
            m.text.trim().length > 0,
        )
        .slice(-16)
        .map((m: any) => ({
          role: m.role,
          parts: [{ text: m.text.trim() }],
        }));

      if (sanitizedContents.length === 0) {
        res.status(400).json({ error: 'At least one non-empty message is required.' });
        return;
      }

      const lat =
        typeof location?.lat === 'number' && Number.isFinite(location.lat)
          ? location.lat
          : 24.7838;
      const lng =
        typeof location?.lng === 'number' && Number.isFinite(location.lng)
          ? location.lng
          : 67.0748;

      const baseConfig: Record<string, any> = {
        systemInstruction: CONSULTANT_SYSTEM_INSTRUCTION,
      };
      const groundedConfig: Record<string, any> = { ...baseConfig };

      if (mode === 'search') {
        groundedConfig.tools = [{ googleSearch: {} }];
      } else if (mode === 'maps') {
        groundedConfig.tools = [{ googleMaps: {} }];
        groundedConfig.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        };
      }

      let response: any;
      let sources: GroundingSource[] = [];
      let groundingNote: string | undefined;

      try {
        response = await generateWithFallback(ai, sanitizedContents, groundedConfig);
        sources = extractGroundingSources(response);
      } catch (err) {
        // If live grounding tool exceeds free-tier quota, answer using real Gemini (plus Places API for maps mode)
        if ((mode === 'search' || mode === 'maps') && isRetryableQuotaOrBusyError(err)) {
          const lastUserText =
            sanitizedContents[sanitizedContents.length - 1]?.parts?.[0]?.text || '';
          if (mode === 'maps') {
            sources = await searchPlacesRestFallback(lastUserText, lat, lng);
          }
          const placesContext =
            sources.length > 0
              ? `\n\nVerified nearby places from Google Maps:\n${sources
                  .map((s) => `- ${s.title}${s.snippets?.[0] ? ` (${s.snippets[0]})` : ''}`)
                  .join('\n')}`
              : '';
          const fallbackContents = placesContext
            ? [
                ...sanitizedContents.slice(0, -1),
                {
                  role: 'user',
                  parts: [{ text: `${lastUserText}${placesContext}` }],
                },
              ]
            : sanitizedContents;
          response = await generateWithFallback(ai, fallbackContents, baseConfig);
          groundingNote =
            mode === 'maps' && sources.length > 0
              ? 'Powered by Gemini Advisor + Google Places.'
              : 'Answered by Gemini Advisor (live web/maps grounding quota is currently limited on this API key).';
        } else {
          throw err;
        }
      }

      res.json({
        reply: response.text ?? 'I could not generate a response right now. Please try again.',
        sources,
        mode,
        groundingNote,
      });
    } catch (err) {
      const { status, message } = formatGeminiError(err, 'chat');
      res.status(status).json({ error: message });
    }
  });

  // Live Market Search Grounding & DHA Neighborhood Maps Grounding
  app.post('/api/market-insights', async (req, res) => {
    try {
      const { query, mode = 'search', location } = req.body ?? {};
      if (typeof query !== 'string' || query.trim().length < 3) {
        res.status(400).json({ error: 'Please enter a valid DHA Karachi query.' });
        return;
      }

      const normalizedQuery = query.trim();
      const cacheKey = `${mode}:${normalizedQuery.toLowerCase()}`;
      const cached = insightsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        res.json(cached.payload);
        return;
      }

      const lat =
        typeof location?.lat === 'number' && Number.isFinite(location.lat)
          ? location.lat
          : 24.7838;
      const lng =
        typeof location?.lng === 'number' && Number.isFinite(location.lng)
          ? location.lng
          : 67.0748;

      const ai = getAiClient();
      const baseConfig: Record<string, any> = {
        systemInstruction:
          'You are a DHA Karachi property & neighborhood research analyst for Iqbal Memon Estate. Provide factual, structured, up-to-date answers about DHA Karachi real estate, transfer procedures, and neighborhoods. Keep summaries clear, scannable, and under 220 words.',
      };
      const groundedConfig: Record<string, any> = { ...baseConfig };

      if (mode === 'maps') {
        groundedConfig.tools = [{ googleMaps: {} }];
        groundedConfig.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        };
      } else {
        groundedConfig.tools = [{ googleSearch: {} }];
      }

      let response: any;
      let sources: GroundingSource[] = [];
      let groundingNote: string | undefined;

      try {
        response = await generateWithFallback(ai, normalizedQuery, groundedConfig);
        sources = extractGroundingSources(response);
      } catch (err) {
        if (isRetryableQuotaOrBusyError(err)) {
          if (mode === 'maps') {
            sources = await searchPlacesRestFallback(normalizedQuery, lat, lng);
          }
          const placesContext =
            sources.length > 0
              ? `\n\nVerified Google Maps places near DHA Phase 8:\n${sources
                  .map((s) => `- ${s.title}${s.snippets?.[0] ? ` (${s.snippets[0]})` : ''}`)
                  .join('\n')}`
              : '';
          response = await generateWithFallback(
            ai,
            `${normalizedQuery}${placesContext}`,
            baseConfig,
          );
          groundingNote =
            mode === 'maps' && sources.length > 0
              ? 'Grounded with live Google Places data + Gemini Advisor.'
              : 'Generated with Gemini Advisor (live Google Search/Maps grounding quota is limited on free-tier keys; enable billing in Settings > Secrets for live web citations).';
        } else {
          throw err;
        }
      }

      const payload = {
        answer: response.text ?? '',
        sources,
        mode,
        groundingNote,
      };
      insightsCache.set(cacheKey, {
        expiresAt: Date.now() + INSIGHTS_CACHE_TTL_MS,
        payload,
      });
      res.json(payload);
    } catch (err) {
      const { status, message } = formatGeminiError(err, 'insights');
      res.status(status).json({ error: message });
    }
  });

  // Animate Property Photo into Video using Gemini Interactions API (gemini-omni-1.2-flash on v1beta)
  app.post('/api/video/animate', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body ?? {};
      if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
        res.status(400).json({ error: 'Please upload or select a valid property photo.' });
        return;
      }
      const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
      const safeMime = allowedMime.includes(mimeType) ? mimeType : 'image/jpeg';
      const safeRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
      const safePrompt =
        typeof prompt === 'string' && prompt.trim().length > 0
          ? prompt.trim()
          : 'Smooth architectural drone glide showcasing the luxury residence at golden hour with subtle palm breeze and warm glowing interior lights.';

      const ai = getInteractionsAiClient();
      const interaction: any = await ai.interactions.create(
        {
          api_version: 'v1beta',
          model: 'gemini-omni-1.2-flash',
          input: [
            {
              type: 'image',
              mime_type: safeMime,
              data: imageBase64,
            },
            {
              type: 'text',
              text: safePrompt,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: safeRatio,
          },
        } as any,
        { timeout: 300000 } as any,
      );

      const videoPart = interaction?.output_video;
      if (videoPart?.data) {
        const videoMime = videoPart.mime_type || 'video/mp4';
        res.json({
          videoDataUrl: `data:${videoMime};base64,${videoPart.data}`,
          mimeType: videoMime,
          aspectRatio: safeRatio,
        });
        return;
      }

      if (videoPart?.uri) {
        res.json({
          videoUri: videoPart.uri,
          mimeType: videoPart.mime_type || 'video/mp4',
          aspectRatio: safeRatio,
        });
        return;
      }

      res.status(502).json({
        error: 'Video generation completed without returning a playable video stream. Please try another prompt.',
      });
    } catch (err) {
      const { status, message } = formatGeminiError(err, 'video');
      res.status(status).json({ error: message });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Iqbal Memon Estate server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
