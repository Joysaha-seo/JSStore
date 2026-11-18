import {
  BusinessInsightsReport,
  ChatMessage,
  CurrencyCode,
  GeneratedProductCopy,
  Order,
  Product,
} from '../types/store';

export interface AiChatStreamParams {
  message: string;
  history: ChatMessage[];
  mode: 'business' | 'shopper';
  currency: CurrencyCode;
  products: Product[];
  orders: Order[];
  onChunk: (partialText: string) => void;
}

export async function streamAiChat({
  message,
  history,
  mode,
  currency,
  products,
  orders,
  onChunk,
}: AiChatStreamParams): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({ role: m.role, text: m.text })),
      mode,
      storeContext: {
        currency,
        products: products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          price: p.price,
          cost: p.cost,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          description: p.description,
          specs: p.specs,
        })),
        orders: orders.map((o) => ({
          id: o.id,
          createdAt: o.createdAt,
          customerName: o.customerName,
          channel: o.channel,
          paymentMethod: o.paymentMethod,
          status: o.status,
          total: o.total,
          items: o.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        })),
      },
    }),
  });

  if (!response.ok) {
    let errorMsg = `AI request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) errorMsg = data.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(errorMsg);
  }

  if (!response.body) {
    throw new Error('Streaming response body was unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';

    for (const block of lines) {
      const dataLine = block
        .split('\n')
        .find((line) => line.startsWith('data: '));
      if (!dataLine) continue;
      const jsonStr = dataLine.slice(6);
      try {
        const payload = JSON.parse(jsonStr) as {
          text?: string;
          done?: boolean;
          error?: string;
        };
        if (payload.error) {
          throw new Error(payload.error);
        }
        if (payload.text) {
          accumulated += payload.text;
          onChunk(accumulated);
        }
      } catch (err) {
        if (err instanceof Error && err.message !== 'Unexpected end of JSON input') {
          throw err;
        }
      }
    }
  }

  return accumulated;
}

export async function generateProductCopy(params: {
  productName: string;
  category: string;
  price: number;
  currency: CurrencyCode;
  notes?: string;
  language: 'en' | 'bn' | 'banglish';
}): Promise<GeneratedProductCopy> {
  const response = await fetch('/api/ai/product-copy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to generate product copy.');
  }
  return data as GeneratedProductCopy;
}

export async function fetchBusinessInsights(params: {
  currency: CurrencyCode;
  products: Product[];
  orders: Order[];
}): Promise<BusinessInsightsReport> {
  const response = await fetch('/api/ai/business-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to analyze business metrics.');
  }
  return data as BusinessInsightsReport;
}
