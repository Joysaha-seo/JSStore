import {
  CaseStudy,
  ChatMessage,
  ClientInquiry,
  CurrencyCode,
  ProposalDraft,
  ScopeEstimate,
  ServicePackage,
} from '../types/dev';

export async function streamDevAiChat(params: {
  message: string;
  history: ChatMessage[];
  mode: 'architect' | 'client';
  developerName: string;
  currency: CurrencyCode;
  projects: CaseStudy[];
  services: ServicePackage[];
  inquiries: ClientInquiry[];
  signal?: AbortSignal;
  onChunk: (partialText: string) => void;
}): Promise<string> {
  const response = await fetch('/api/ai/dev-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: params.signal,
    body: JSON.stringify({
      message: params.message,
      history: params.history.map((m) => ({ role: m.role, text: m.text })),
      mode: params.mode,
      devContext: {
        developerName: params.developerName,
        currency: params.currency,
        projects: params.projects.map((p) => ({
          title: p.title,
          category: p.discipline,
          stack: p.stack,
          outcomeMetric: p.outcomeMetric,
          year: p.year,
        })),
        services: params.services.map((s) => ({
          title: s.title,
          timeline: s.timeline,
          startingPriceUsd: s.startingPriceUsd,
        })),
        inquiries: params.inquiries.map((i) => ({
          id: i.id,
          clientName: i.clientName,
          projectTitle: i.projectTitle,
          status: i.status,
          budgetUsd: i.budgetUsd,
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
      // ignore non-JSON error body
    }
    throw new Error(errorMsg);
  }

  if (!response.body) {
    throw new Error('Streaming response unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  const processBlock = (block: string) => {
    const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
    if (!dataLine) return;
    const rawJson = dataLine.slice(6).trim();
    if (!rawJson) return;
    const payload = JSON.parse(rawJson) as {
      text?: string;
      done?: boolean;
      error?: string;
    };
    if (payload.error) {
      throw new Error(payload.error);
    }
    if (payload.text) {
      accumulated += payload.text;
      params.onChunk(accumulated);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim()) {
        processBlock(buffer);
      }
      break;
    }
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      if (block.trim()) {
        processBlock(block);
      }
    }
  }

  return accumulated;
}

export async function estimateProjectScope(params: {
  projectIdea: string;
  targetPlatform: string;
  urgency: string;
  currency: CurrencyCode;
}): Promise<ScopeEstimate> {
  const response = await fetch('/api/ai/estimate-scope', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to estimate project scope.');
  }
  return data as ScopeEstimate;
}

export async function writeClientProposal(params: {
  clientName: string;
  projectTitle: string;
  clientBrief: string;
  budgetNote?: string;
  language: 'en' | 'bn' | 'banglish';
}): Promise<ProposalDraft> {
  const response = await fetch('/api/ai/write-proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'Failed to draft proposal.');
  }
  return data as ProposalDraft;
}
