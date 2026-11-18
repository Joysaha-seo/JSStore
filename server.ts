import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function createAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractNestedError(raw: string): {
  code?: number;
  status?: string;
  message: string;
} {
  let currentMsg = raw;
  let code: number | undefined;
  let status: string | undefined;

  for (let depth = 0; depth < 3; depth++) {
    const trimmed = currentMsg.trim();
    if (!trimmed.startsWith('{')) break;
    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { code?: number; status?: string; message?: string };
        code?: number;
        status?: string;
        message?: string;
      };
      const inner = parsed.error ?? parsed;
      if (typeof inner.code === 'number') code = inner.code;
      if (typeof inner.status === 'string') status = inner.status;
      if (typeof inner.message === 'string' && inner.message.trim()) {
        currentMsg = inner.message;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return { code, status, message: currentMsg };
}

function isTransientAiError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const info = extractNestedError(raw);
  const errObj = err as { status?: number; code?: number } | null;
  const numericCode = info.code ?? errObj?.status ?? errObj?.code;

  if (numericCode === 503 || numericCode === 429) return true;
  if (info.status === 'UNAVAILABLE' || info.status === 'RESOURCE_EXHAUSTED') {
    return true;
  }
  return /high demand|temporarily|try again|overloaded|UNAVAILABLE|Service Unavailable|RESOURCE_EXHAUSTED/i.test(
    `${raw} ${info.message}`
  );
}

function formatAiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 400, message: raw };
  }

  const info = extractNestedError(raw);
  const errObj = err as { status?: number; code?: number } | null;
  const code = info.code ?? errObj?.status ?? errObj?.code;

  if (
    code === 503 ||
    info.status === 'UNAVAILABLE' ||
    /high demand|UNAVAILABLE|Service Unavailable|overloaded/i.test(
      `${raw} ${info.message}`
    )
  ) {
    return {
      status: 503,
      message:
        'The AI model is currently experiencing high demand. Please click Retry in a few seconds.',
    };
  }

  if (
    code === 429 ||
    info.status === 'RESOURCE_EXHAUSTED' ||
    /RESOURCE_EXHAUSTED|quota|rate limit/i.test(`${raw} ${info.message}`)
  ) {
    return {
      status: 429,
      message:
        'Gemini API rate limit reached. Please wait a moment and click Retry.',
    };
  }

  if (
    code === 404 ||
    info.status === 'NOT_FOUND' ||
    /NOT_FOUND/i.test(raw)
  ) {
    return {
      status: 404,
      message: 'Requested Gemini model is currently unavailable.',
    };
  }

  if (
    code === 401 ||
    code === 403 ||
    info.status === 'PERMISSION_DENIED' ||
    info.status === 'UNAUTHENTICATED' ||
    /PERMISSION_DENIED|API_KEY_INVALID/i.test(raw)
  ) {
    return {
      status: 400,
      message:
        'Gemini API key is invalid or missing permissions. Check Settings > Secrets.',
    };
  }

  return {
    status: code && code >= 400 && code < 600 ? code : 500,
    message: info.message || 'Failed to generate AI response.',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetryAndFallback<T>(
  runner: (modelName: string, isFallback: boolean) => Promise<T>
): Promise<T> {
  const attempts: Array<{ model: string; isFallback: boolean; delayMs: number }> = [
    { model: PRIMARY_MODEL, isFallback: false, delayMs: 0 },
    { model: PRIMARY_MODEL, isFallback: false, delayMs: 700 },
    { model: FALLBACK_MODEL, isFallback: true, delayMs: 350 },
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await sleep(attempt.delayMs);
    }
    try {
      return await runner(attempt.model, attempt.isFallback);
    } catch (err) {
      lastError = err;
      if (!isTransientAiError(err)) {
        throw err;
      }
      console.warn(
        `Transient AI error on ${attempt.model}, retrying/falling back:`,
        extractNestedError(err instanceof Error ? err.message : String(err)).message
      );
    }
  }
  throw lastError;
}

function parseAiJson<T>(rawText: string | undefined): T {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) {
    throw new Error('Model returned an empty JSON payload.');
  }
  return JSON.parse(cleaned) as T;
}

interface DevContextPayload {
  developerName: string;
  currency: 'USD' | 'BDT';
  language?: 'en' | 'bn' | 'hi';
  projects: Array<{
    title: string;
    category: string;
    stack: string[];
    outcomeMetric: string;
    year: string;
  }>;
  services: Array<{
    title: string;
    timeline: string;
    startingPriceUsd: number;
  }>;
  inquiries: Array<{
    id: string;
    clientName: string;
    projectTitle: string;
    status: string;
    budgetUsd: number;
  }>;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/ai/dev-chat', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const {
        message,
        history = [],
        mode = 'architect',
        devContext,
      } = req.body as {
        message: string;
        history?: Array<{ role: 'user' | 'model'; text: string }>;
        mode?: 'architect' | 'client';
        devContext?: DevContextPayload;
      };

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const projectsSummary = (devContext?.projects ?? [])
        .map(
          (p) =>
            `- ${p.title} (${p.category}, ${p.year}): Stack [${p.stack.join(', ')}] | Outcome: ${p.outcomeMetric}`
        )
        .join('\n');

      const servicesSummary = (devContext?.services ?? [])
        .map(
          (s) =>
            `- ${s.title}: Starting $${s.startingPriceUsd} (${s.timeline})`
        )
        .join('\n');

      const inquiriesSummary = (devContext?.inquiries ?? [])
        .slice(0, 10)
        .map(
          (i) =>
            `- ${i.id}: ${i.clientName} — "${i.projectTitle}" | Status: ${i.status} | Est. $${i.budgetUsd}`
        )
        .join('\n');

      const preferredLangLabel =
        devContext?.language === 'bn'
          ? 'Bengali (বাংলা script)'
          : devContext?.language === 'hi'
            ? 'Hindi (हिन्दी Devanagari script)'
            : 'English';

      const systemInstruction =
        mode === 'client'
          ? `You are the AI Studio Assistant for ${devContext?.developerName || 'Badhan Saha'}, a full-stack web developer. Help prospective clients understand services, timelines, realistic budgets, and relevant past case studies.
The customer's selected site language is ${preferredLangLabel}. Respond in the language the user writes in (English, বাংলা, Banglish, or हिन्दी), or default to ${preferredLangLabel} when ambiguous. Keep responses concise, transparent, and grounded strictly in the portfolio and pricing below.

Selected Case Studies:
${projectsSummary || 'None listed.'}

Service Packages:
${servicesSummary || 'Custom web engineering.'}`
          : `You are an experienced Principal Full-Stack Engineer & Freelance Technical Advisor assisting ${devContext?.developerName || 'Badhan Saha'}. Help with system architecture, React/Next.js/TypeScript/Node/PostgreSQL decisions, client scope breakdown, and freelance business strategy.
The current UI language is ${preferredLangLabel}. Respond in the language style the user writes in (English, বাংলা, Banglish, or हिन्दी), defaulting to ${preferredLangLabel}. Be direct, practical, and structured.

Portfolio Projects:
${projectsSummary || 'None listed.'}

Active Client Pipeline:
${inquiriesSummary || 'No active inquiries.'}`;

      const contents = [
        ...history.slice(-10).map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      let clientClosed = false;
      req.on('close', () => {
        clientClosed = true;
      });

      const streamAttempts: Array<{
        model: string;
        isFallback: boolean;
        delayMs: number;
      }> = [
        { model: PRIMARY_MODEL, isFallback: false, delayMs: 0 },
        { model: PRIMARY_MODEL, isFallback: false, delayMs: 700 },
        { model: FALLBACK_MODEL, isFallback: true, delayMs: 350 },
      ];

      let emittedAnyChunk = false;
      let lastStreamError: unknown;

      for (const attempt of streamAttempts) {
        if (clientClosed) break;
        if (attempt.delayMs > 0) {
          await sleep(attempt.delayMs);
        }
        if (clientClosed) break;

        try {
          const stream = await ai.models.generateContentStream({
            model: attempt.model,
            contents,
            config: {
              systemInstruction,
              ...(attempt.isFallback
                ? {}
                : { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }),
            },
          });

          for await (const chunk of stream) {
            if (clientClosed) break;
            const text = chunk.text;
            if (text) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache, no-transform');
                res.setHeader('Connection', 'keep-alive');
              }
              emittedAnyChunk = true;
              res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
          }

          lastStreamError = null;
          break;
        } catch (streamErr) {
          lastStreamError = streamErr;
          if (emittedAnyChunk || !isTransientAiError(streamErr)) {
            throw streamErr;
          }
          console.warn(
            `Transient stream error on ${attempt.model}, retrying/falling back:`,
            extractNestedError(
              streamErr instanceof Error ? streamErr.message : String(streamErr)
            ).message
          );
        }
      }

      if (lastStreamError) {
        throw lastStreamError;
      }

      if (!clientClosed) {
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    } catch (err) {
      const { status, message } = formatAiError(err);
      if (!res.headersSent) {
        res.status(status).json({ error: message });
      } else {
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      }
    }
  });

  app.post('/api/ai/estimate-scope', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const {
        projectIdea,
        targetPlatform = 'Full-Stack Web App',
        urgency = 'Standard (4-8 weeks)',
        currency = 'USD',
        language = 'en',
      } = req.body as {
        projectIdea: string;
        targetPlatform?: string;
        urgency?: string;
        currency?: 'USD' | 'BDT';
        language?: 'en' | 'bn' | 'hi';
      };

      if (!projectIdea || !projectIdea.trim()) {
        res.status(400).json({ error: 'Project idea description is required.' });
        return;
      }

      const estimateLangInstruction =
        language === 'bn'
          ? 'Write descriptive prose fields (projectTitle, executiveSummary, module deliverables, milestone phase/outcome, and technicalRisks) in clear natural Bengali (বাংলা script), while keeping technical framework/library names in English.'
          : language === 'hi'
            ? 'Write descriptive prose fields (projectTitle, executiveSummary, module deliverables, milestone phase/outcome, and technicalRisks) in clear natural Hindi (हिन्दी script), while keeping technical framework/library names in English.'
            : 'Produce clean, realistic engineering plans in clear English.';

      const response = await generateWithRetryAndFallback((modelName, isFallback) =>
        ai.models.generateContent({
          model: modelName,
          contents: `Break down a full technical scope, stack recommendation, timeline, and realistic freelance/agency cost estimate for this web development brief.
Brief: ${projectIdea}
Target Platform: ${targetPlatform}
Timeline Preference: ${urgency}
Preferred Currency Display Note: ${currency} (provide estimatedCostUsd as an integer in USD).`,
          config: {
            systemInstruction: `You are a pragmatic full-stack web architect and technical estimator. Understand briefs in English, Bangla, Banglish, or Hindi. ${estimateLangInstruction}`,
            ...(isFallback
              ? {}
              : { thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } }),
            responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectTitle: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              recommendedStack: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              coreModules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    moduleName: { type: Type.STRING },
                    deliverables: { type: Type.STRING },
                    estimatedDays: { type: Type.INTEGER },
                  },
                  required: ['moduleName', 'deliverables', 'estimatedDays'],
                },
              },
              milestones: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                  },
                  required: ['phase', 'duration', 'outcome'],
                },
              },
              totalWeeks: { type: Type.INTEGER },
              estimatedCostUsd: { type: Type.INTEGER },
              technicalRisks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'projectTitle',
              'executiveSummary',
              'recommendedStack',
              'coreModules',
              'milestones',
              'totalWeeks',
              'estimatedCostUsd',
              'technicalRisks',
            ],
          },
          },
        })
      );

      const parsed = parseAiJson<Record<string, unknown>>(response.text);
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatAiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/write-proposal', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const {
        clientName,
        projectTitle,
        clientBrief,
        budgetNote,
        language = 'en',
      } = req.body as {
        clientName: string;
        projectTitle: string;
        clientBrief: string;
        budgetNote?: string;
        language?: 'en' | 'bn' | 'banglish' | 'hi';
      };

      if (!clientBrief || !clientBrief.trim()) {
        res.status(400).json({ error: 'Client brief is required.' });
        return;
      }

      const langInstruction =
        language === 'bn'
          ? 'Write the proposal email and WhatsApp message in natural, professional Bengali (বাংলা script).'
          : language === 'hi'
            ? 'Write the proposal email and WhatsApp message in natural, professional Hindi (हिन्दी Devanagari script).'
            : language === 'banglish'
              ? 'Write the formal proposal email in crisp English, and write the WhatsApp quick pitch in friendly urban Banglish.'
              : 'Write all sections in crisp, persuasive commercial English.';

      const response = await generateWithRetryAndFallback((modelName, isFallback) =>
        ai.models.generateContent({
          model: modelName,
          contents: `Draft a winning web development proposal for:
Client Name: ${clientName || 'Client'}
Project Title: ${projectTitle || 'Custom Web Application'}
Project Brief: ${clientBrief}
Budget / Timeline Reference: ${budgetNote || 'To be finalized on discovery call'}`,
          config: {
            systemInstruction: `You are a senior full-stack web developer writing direct, jargon-free proposals that convert clients. ${langInstruction}`,
            ...(isFallback
              ? {}
              : { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }),
            responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emailSubject: { type: Type.STRING },
              proposalEmail: { type: Type.STRING },
              whatsappPitch: { type: Type.STRING },
              discoveryQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'emailSubject',
              'proposalEmail',
              'whatsappPitch',
              'discoveryQuestions',
            ],
          },
          },
        })
      );

      const parsed = parseAiJson<Record<string, unknown>>(response.text);
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatAiError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
