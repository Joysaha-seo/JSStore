import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  MessageSquare,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { TranslationPack } from '../i18n/translations';
import { streamDevAiChat } from '../services/devAiService';
import {
  AppLanguage,
  CaseStudy,
  ChatMessage,
  ClientInquiry,
  CurrencyCode,
  ServicePackage,
} from '../types/dev';

interface FloatingChatBoxProps {
  developerName: string;
  currency: CurrencyCode;
  language: AppLanguage;
  onChangeLanguage: (lang: AppLanguage) => void;
  t: TranslationPack;
  projects: CaseStudy[];
  services: ServicePackage[];
  inquiries: ClientInquiry[];
  onStartProject: () => void;
  onOpenAiStudio: () => void;
}

const STORAGE_KEY = 'dev_floating_chat_v1';

const CHAT_LANG_OPTIONS: Array<{ id: AppLanguage; label: string }> = [
  { id: 'en', label: 'EN' },
  { id: 'bn', label: 'বাংলা' },
  { id: 'hi', label: 'हिन्दी' },
];

function createWelcomeMessage(welcomeText: string): ChatMessage {
  return {
    id: 'chatbox-welcome',
    role: 'model',
    text: welcomeText,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function FloatingChatBox({
  developerName,
  currency,
  language,
  onChangeLanguage,
  t,
  projects,
  services,
  inquiries,
  onStartProject,
  onOpenAiStudio,
}: FloatingChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'client' | 'architect'>('client');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [createWelcomeMessage(t.chatBox.welcome)];
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [lastFailedPrompt, setLastFailedPrompt] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.id === 'chatbox-welcome') {
        return [createWelcomeMessage(t.chatBox.welcome)];
      }
      return prev;
    });
  }, [t.chatBox.welcome]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const handleClear = () => {
    handleStop();
    setError('');
    setMessages([createWelcomeMessage(t.chatBox.welcome)]);
  };

  const handleSend = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isStreaming) return;

    setError('');
    setLastFailedPrompt('');
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = {
      id: `cb-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const assistantId = `cb-m-${Date.now() + 1}`;
    const placeholder: ChatMessage = {
      id: assistantId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, placeholder]);
    setInput('');
    setIsStreaming(true);

    try {
      await streamDevAiChat({
        message: trimmed,
        history: nextHistory,
        mode,
        developerName,
        currency,
        language,
        projects,
        services,
        inquiries,
        signal: controller.signal,
        onChunk: (partial) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, text: partial } : m))
          );
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(
        err instanceof Error ? err.message : 'Unable to send message right now.'
      );
      setLastFailedPrompt(trimmed);
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id)
      );
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  const quickPrompts =
    mode === 'client' ? t.chatBox.quickPromptsClient : t.chatBox.quickPromptsDev;

  return (
    <div className="no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {isOpen ? (
        <section
          role="dialog"
          aria-label="Live AI Chat Box"
          className="w-[calc(100vw-2rem)] sm:w-[400px] h-[520px] max-h-[80vh] bg-white border border-zinc-200 rounded-2xl shadow-lg flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between gap-2 bg-white">
            <div className="min-w-0">
              <h2 className="font-display text-sm font-semibold text-zinc-950 truncate">
                {t.chatBox.headerTitle}
              </h2>
              <p className="text-[11px] text-zinc-500">
                {t.chatBox.headerSub}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleClear}
                title="Clear conversation"
                aria-label="Clear conversation"
                className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenAiStudio();
                }}
                title="Open full AI Studio"
                aria-label="Open full AI Studio"
                className="p-1.5 text-zinc-500 hover:text-blue-700 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat box"
                className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Toggle + Language Switcher + Book Call */}
          <div className="px-3.5 py-2 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between gap-2">
            <div className="inline-flex p-0.5 bg-zinc-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('client')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'client'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {t.chatBox.clientMode}
              </button>
              <button
                type="button"
                onClick={() => setMode('architect')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'architect'
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {t.chatBox.devMode}
              </button>
            </div>

            <div className="inline-flex p-0.5 bg-zinc-200/70 rounded-lg">
              {CHAT_LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeLanguage(opt.id)}
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    language === opt.id
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onStartProject();
              }}
              className="text-[11px] font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap cursor-pointer"
            >
              {t.chatBox.bookCall}
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA]"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-zinc-950 text-white'
                      : 'bg-white border border-zinc-200 text-zinc-800'
                  }`}
                >
                  {msg.text || (isStreaming ? t.chatBox.typing : '')}
                </div>
                <span className="mt-1 text-[10px] text-zinc-400 tabular-nums">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center justify-between gap-2">
                <span>{error}</span>
                {lastFailedPrompt && (
                  <button
                    type="button"
                    onClick={() => void handleSend(lastFailedPrompt)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white border border-red-300 text-red-800 hover:bg-red-100 rounded-md shrink-0 cursor-pointer"
                  >
                    {t.chatBox.retryBtn}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Prompts + Input */}
          <div className="p-3 border-t border-zinc-200 bg-white space-y-2.5">
            {messages.length <= 2 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => void handleSend(prompt)}
                    className="px-2.5 py-1 text-[11px] text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatBox.placeholder}
                className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  aria-label="Stop response"
                  className="p-2.5 bg-zinc-800 hover:bg-zinc-950 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send chat message"
                  className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat box"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-xl shadow-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 focus-visible:outline-offset-2"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
          <span>{t.chatBox.buttonLabel}</span>
        </button>
      )}
    </div>
  );
}
