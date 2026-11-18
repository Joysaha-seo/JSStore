import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

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

function formatAiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 400, message: raw };
  }
  if (raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID') || raw.includes('403') || raw.includes('400')) {
    return {
      status: 400,
      message: 'Gemini API key is invalid or missing permissions. Check Settings > Secrets.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Please wait a moment and try again.',
    };
  }
  return { status: 500, message: raw || 'Failed to generate AI response.' };
}

interface StoreContextPayload {
  currency: 'BDT' | 'USD';
  products: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    lowStockThreshold: number;
    description: string;
    specs: string[];
  }>;
  orders: Array<{
    id: string;
    createdAt: string;
    customerName: string;
    channel: string;
    paymentMethod: string;
    status: string;
    total: number;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
  }>;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const {
        message,
        history = [],
        mode = 'business',
        storeContext,
      } = req.body as {
        message: string;
        history?: Array<{ role: 'user' | 'model'; text: string }>;
        mode?: 'business' | 'shopper';
        storeContext?: StoreContextPayload;
      };

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const currencySymbol = storeContext?.currency === 'USD' ? '$' : '৳';
      const productsSummary = (storeContext?.products ?? [])
        .map(
          (p) =>
            `- ${p.name} (SKU: ${p.sku}, Category: ${p.category}, Price: ${currencySymbol}${p.price}, Cost: ${currencySymbol}${p.cost}, Stock: ${p.stock} units, Low-stock alert at: ${p.lowStockThreshold})`
        )
        .join('\n');

      const ordersSummary = (storeContext?.orders ?? [])
        .slice(0, 15)
        .map(
          (o) =>
            `- ${o.id}: ${o.customerName} via ${o.channel} (${o.paymentMethod}) | Status: ${o.status} | Total: ${currencySymbol}${o.total} | Items: ${o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`
        )
        .join('\n');

      const systemInstruction =
        mode === 'shopper'
          ? `You are the JS Store AI Shopping Concierge. Help customers explore products, compare specifications, check availability, and choose gifts within their budget.
Respond in the exact language or style the customer uses (English, Bangla / বাংলা, or Banglish). Keep answers helpful, concise, and grounded strictly in JS Store's current catalog below. Never invent products or prices not listed here.

Current JS Store Catalog (${storeContext?.currency ?? 'BDT'}):
${productsSummary || 'No products currently listed.'}`
          : `You are the JS Store AI Business & Operations Copilot. You assist the store owner and team with inventory planning, pricing & profit margin analysis, Cash on Delivery (COD) operations, customer replies, and Facebook/Instagram/WhatsApp marketing copy.
Respond in the language style the user writes in (English, Bangla / বাংলা, or Banglish). Keep recommendations actionable, grounded strictly in JS Store's live inventory and recent orders below, and use clear bullet points or clean tables.

Live Inventory (${storeContext?.currency ?? 'BDT'}):
${productsSummary || 'No inventory items.'}

Recent Orders:
${ordersSummary || 'No orders recorded yet.'}`;

      const contents = [
        ...history.slice(-10).map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        { role: 'user', parts: [{ text: message }] },
      ];

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const stream = await ai.models.generateContentStream({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
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

  app.post('/api/ai/product-copy', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const {
        productName,
        category,
        price,
        currency = 'BDT',
        notes = '',
        language = 'en',
      } = req.body as {
        productName: string;
        category: string;
        price: number;
        currency?: 'BDT' | 'USD';
        notes?: string;
        language?: 'en' | 'bn' | 'banglish';
      };

      if (!productName || !productName.trim()) {
        res.status(400).json({ error: 'Product name is required.' });
        return;
      }

      const symbol = currency === 'USD' ? '$' : '৳';
      const langInstruction =
        language === 'bn'
          ? 'Write all marketing copy (description, highlights, Facebook caption, WhatsApp message) in natural, fluent Bengali (বাংলা script).'
          : language === 'banglish'
            ? 'Write the storefront description in clean English, and write the Facebook/Instagram caption and WhatsApp promo message in natural urban Bangladeshi Banglish (conversational mix of Bengali and English in Latin script).'
            : 'Write all copy in crisp, modern commercial English.';

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate storefront listing and social marketing copy for JS Store.
Product Name: ${productName}
Category: ${category}
Selling Price: ${symbol}${price}
Owner Notes / Key Details: ${notes || 'Standard retail quality, 1-year JS Store warranty, Cash on Delivery available.'}`,
        config: {
          systemInstruction: `You are JS Store's senior merchandising copywriter. ${langInstruction} Keep descriptions concise, accurate, and high-converting without spammy emojis or exaggerated claims.`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: '2-sentence clean storefront product description.',
              },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '4 concise product feature specifications.',
              },
              facebookPost: {
                type: Type.STRING,
                description: 'Ready-to-publish Facebook/Instagram caption with price and COD note.',
              },
              whatsappMessage: {
                type: Type.STRING,
                description: 'Short direct WhatsApp broadcast message for regular customers.',
              },
              seoTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '5 clean search keywords.',
              },
            },
            required: ['description', 'highlights', 'facebookPost', 'whatsappMessage', 'seoTags'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const { status, message } = formatAiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/business-insights', async (req: Request, res: Response) => {
    try {
      const ai = createAiClient();
      const { currency = 'BDT', products = [], orders = [] } = req.body as StoreContextPayload;
      const symbol = currency === 'USD' ? '$' : '৳';

      const inventoryData = products.map((p) => {
        const marginPct = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
        return {
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: `${symbol}${p.price}`,
          cost: `${symbol}${p.cost}`,
          marginPct: `${marginPct}%`,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
        };
      });

      const orderStats = orders.map((o) => ({
        id: o.id,
        channel: o.channel,
        paymentMethod: o.paymentMethod,
        status: o.status,
        total: `${symbol}${o.total}`,
        items: o.items.map((i) => `${i.quantity}x ${i.name}`),
      }));

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze JS Store's current inventory and orders snapshot and provide concrete business recommendations.
Inventory: ${JSON.stringify(inventoryData)}
Orders: ${JSON.stringify(orderStats)}`,
        config: {
          systemInstruction:
            'You are JS Store’s retail operations and finance analyst. Base every number, SKU, and recommendation strictly on the provided inventory and order records.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'Concise 2-3 sentence summary of store health, revenue mix, and stock risk.',
              },
              restockAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING },
                    productName: { type: Type.STRING },
                    currentStock: { type: Type.INTEGER },
                    recommendedOrderQty: { type: Type.INTEGER },
                    reason: { type: Type.STRING },
                  },
                  required: ['sku', 'productName', 'currentStock', 'recommendedOrderQty', 'reason'],
                },
              },
              marginOpportunities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    estimatedImpact: { type: Type.STRING },
                  },
                  required: ['title', 'detail', 'estimatedImpact'],
                },
              },
              bundleSuggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    bundleName: { type: Type.STRING },
                    items: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedPriceNote: { type: Type.STRING },
                    pitch: { type: Type.STRING },
                  },
                  required: ['bundleName', 'items', 'suggestedPriceNote', 'pitch'],
                },
              },
              actionChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'executiveSummary',
              'restockAlerts',
              'marginOpportunities',
              'bundleSuggestions',
              'actionChecklist',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
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
    console.log(`JS Store server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
