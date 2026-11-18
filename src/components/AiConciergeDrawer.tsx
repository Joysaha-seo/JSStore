import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Send, X } from 'lucide-react';
import { streamAiChat } from '../services/aiService';
import { ChatMessage, CurrencyCode, Order, Product } from '../types/store';

interface AiConciergeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onConsumeInitialPrompt: () => void;
  products: Product[];
  orders: Order[];
  currency: CurrencyCode;
  onOpenFullStudio: () => void;
}

const SHOPPER_SUGGESTIONS = [
  'Best gift under ৳10,000 in stock?',
  'Compare the headphones and smartwatch',
  'Desk setup er jonno ki ki ache?',
];

export function AiConciergeDrawer({
  isOpen,
  onClose,
  initialPrompt,
  onConsumeInitialPrompt,
  products,
  orders,
  currency,
  onOpenFullStudio,
}: AiConciergeDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-shopper',
      role: 'model',
      text: 'Welcome to JS Store. Ask me about product specs, live stock availability, gift recommendations, or delivery terms in English, বাংলা, or Banglish.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      void sendMessage(initialPrompt);
      onConsumeInitialPrompt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setError('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantId = `m-${Date.now() + 1}`;
    const placeholderMsg: ChatMessage = {
      id: assistantId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, placeholderMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      await streamAiChat({
        message: trimmed,
        history: nextHistory,
        mode: 'shopper',
        currency,
        products,
        orders,
        onChunk: (partial) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: partial } : m))
          );
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach AI advisor.';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <aside
        className="relative z-10 w-full max-w-md bg-white h-full border-l border-zinc-200 flex flex-col"
        aria-label="JS Store AI Shopper"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-zinc-950">
              JS Store AI Shopper
            </h2>
            <p className="text-xs text-zinc-500">
              Live catalog & stock guidance · EN / বাংলা / Banglish
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullStudio();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer whitespace-nowrap"
            >
              <span>AI Studio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close AI Shopper"
              className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8F9FA]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-zinc-950 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-800'
                }`}
              >
                {msg.text || (isStreaming ? 'Thinking...' : '')}
              </div>
              <span className="mt-1 text-[11px] text-zinc-400 tabular-nums">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SHOPPER_SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isStreaming}
                onClick={() => void sendMessage(prompt)}
                className="px-2.5 py-1 text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950 rounded-md transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, stock, or budget..."
              className="flex-1 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label="Send message"
              className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
