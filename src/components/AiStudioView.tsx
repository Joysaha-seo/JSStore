import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  FileText,
  LineChart,
  MessageSquare,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';
import {
  fetchBusinessInsights,
  generateProductCopy,
  streamAiChat,
} from '../services/aiService';
import {
  BusinessInsightsReport,
  ChatMessage,
  CurrencyCode,
  GeneratedProductCopy,
  Order,
  Product,
  ProductCategory,
} from '../types/store';
import { formatMoney } from '../utils/currency';

interface AiStudioViewProps {
  products: Product[];
  orders: Order[];
  currency: CurrencyCode;
  preselectedProductId?: string | null;
  onConsumePreselectedProduct: () => void;
  onApplyDescriptionToProduct: (
    productId: string,
    description: string,
    specs: string[]
  ) => void;
}

type StudioSubTab = 'copilot' | 'copywriter' | 'analyst';

const BUSINESS_PROMPTS = [
  'Which SKUs are low on stock and how much will restocking 10 units each cost?',
  'JS Store er jonno weekend flash offer Facebook post likhe dao (Banglish)',
  'Suggest 2 profitable product bundles from our current inventory',
  'Summarize pending COD revenue and top-margin products',
];

export function AiStudioView({
  products,
  orders,
  currency,
  preselectedProductId,
  onConsumePreselectedProduct,
  onApplyDescriptionToProduct,
}: AiStudioViewProps) {
  const [subTab, setSubTab] = useState<StudioSubTab>('copilot');

  // Copilot Chat State
  const [chatMode, setChatMode] = useState<'business' | 'shopper'>('business');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'studio-welcome',
      role: 'model',
      text: 'JS Store AI Copilot is connected to your live inventory, pricing, and orders. Ask for margin breakdowns, restock plans, customer replies, or Facebook/WhatsApp promos in English, বাংলা, or Banglish.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Copywriter State
  const [selectedCopyProductId, setSelectedCopyProductId] = useState<string>(
    products[0]?.id || 'custom'
  );
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<ProductCategory>('Workspace');
  const [customPrice, setCustomPrice] = useState(4500);
  const [copyNotes, setCopyNotes] = useState('');
  const [copyLanguage, setCopyLanguage] = useState<'en' | 'bn' | 'banglish'>('banglish');
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedProductCopy | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [appliedBanner, setAppliedBanner] = useState('');

  // Business Analyst State
  const [insights, setInsights] = useState<BusinessInsightsReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    if (preselectedProductId) {
      setSubTab('copywriter');
      setSelectedCopyProductId(preselectedProductId);
      setGeneratedCopy(null);
      onConsumePreselectedProduct();
    }
  }, [preselectedProductId, onConsumePreselectedProduct]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSendChat = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isStreaming) return;

    setChatError('');
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
    setChatInput('');
    setIsStreaming(true);

    try {
      await streamAiChat({
        message: trimmed,
        history: nextHistory,
        mode: chatMode,
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
      setChatError(
        err instanceof Error ? err.message : 'Unable to generate AI response.'
      );
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedCopyProductId);

  const handleGenerateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setCopyError('');
    setAppliedBanner('');

    const targetName =
      selectedCopyProductId === 'custom'
        ? customName.trim()
        : selectedProduct?.name || '';
    const targetCategory =
      selectedCopyProductId === 'custom'
        ? customCategory
        : selectedProduct?.category || 'Workspace';
    const targetPrice =
      selectedCopyProductId === 'custom'
        ? customPrice
        : selectedProduct?.price || 0;

    if (!targetName) {
      setCopyError('Select an existing product or enter a custom product name.');
      return;
    }

    setIsGeneratingCopy(true);
    try {
      const result = await generateProductCopy({
        productName: targetName,
        category: targetCategory,
        price: targetPrice,
        currency,
        notes: copyNotes.trim() || selectedProduct?.description,
        language: copyLanguage,
      });
      setGeneratedCopy(result);
    } catch (err) {
      setCopyError(
        err instanceof Error ? err.message : 'Failed to generate marketing copy.'
      );
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCopyText = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const handleRunInsights = async () => {
    setInsightsError('');
    setIsAnalyzing(true);
    try {
      const report = await fetchBusinessInsights({
        currency,
        products,
        orders,
      });
      setInsights(report);
    } catch (err) {
      setInsightsError(
        err instanceof Error ? err.message : 'Failed to analyze store performance.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Studio Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            JS Store AI Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live business copilot, multilingual marketing copywriter, and restock intelligence.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-zinc-100 border border-zinc-200 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setSubTab('copilot')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'copilot'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Business Copilot</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('copywriter')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'copywriter'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Product & Social Copy</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('analyst')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'analyst'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Business Analyst</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: AI Copilot */}
      {subTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Context & Quick Prompts */}
          <aside className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-zinc-900 mb-2">Assistant Role</p>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChatMode('business')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    chatMode === 'business'
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Business Owner
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('shopper')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    chatMode === 'shopper'
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Shopper Concierge
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-1.5 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">Live Context Connected</p>
              <p className="tabular-nums">
                {products.length} catalog SKUs · {products.reduce((s, p) => s + p.stock, 0)} units in stock
              </p>
              <p className="tabular-nums">
                {orders.length} store & POS orders tracked
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-2">
              <p className="text-xs font-semibold text-zinc-900">Try Asking</p>
              <div className="space-y-1.5">
                {BUSINESS_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isStreaming}
                    onClick={() => void handleSendChat(prompt)}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Chat Window */}
          <section className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl flex flex-col h-[580px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold text-zinc-950">
                  {chatMode === 'business'
                    ? 'Business & Operations Copilot'
                    : 'Customer Shopping Concierge'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Supports English, বাংলা, and Banglish
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      role: 'model',
                      text: 'Conversation cleared. How can I help with JS Store today?',
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ])
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-950 border border-zinc-200 rounded-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8F9FA]"
            >
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
                    {msg.text || (isStreaming ? 'Analyzing store data...' : '')}
                  </div>
                  <span className="mt-1 text-[11px] text-zinc-400 tabular-nums">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {chatError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {chatError}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendChat(chatInput);
              }}
              className="p-4 border-t border-zinc-200 bg-white flex items-center gap-2.5"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about stock, margins, COD follow-ups, or write a promo post..."
                className="flex-1 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isStreaming}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {/* Sub-Tab 2: Product & Social Copywriter */}
      {subTab === 'copywriter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleGenerateCopy}
            className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-zinc-950">
              Generate Product & Social Copy
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Select JS Store Product
              </label>
              <select
                value={selectedCopyProductId}
                onChange={(e) => setSelectedCopyProductId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-700"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
                <option value="custom">+ Custom New Product</option>
              </select>
            </div>

            {selectedCopyProductId === 'custom' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. MagSafe Aluminum Stand"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) =>
                        setCustomCategory(e.target.value as ProductCategory)
                      }
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
                    >
                      <option value="Audio">Audio</option>
                      <option value="Workspace">Workspace</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Carry">Carry</option>
                      <option value="Living">Living</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Price (BDT ৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Output Language / Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'banglish', label: 'Banglish Promo' },
                    { id: 'bn', label: 'বাংলা' },
                    { id: 'en', label: 'English' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCopyLanguage(opt.id)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      copyLanguage === opt.id
                        ? 'border-blue-700 bg-blue-50 text-blue-800'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Offer / Campaign Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={copyNotes}
                onChange={(e) => setCopyNotes(e.target.value)}
                placeholder="e.g. Weekend 10% discount, free Dhaka delivery, limited batch..."
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            {copyError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {copyError}
              </p>
            )}

            <button
              type="submit"
              disabled={isGeneratingCopy}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-300 rounded-lg transition-colors cursor-pointer"
            >
              {isGeneratingCopy ? 'Generating Copy...' : 'Generate Marketing Kit'}
            </button>
          </form>

          <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6">
            {!generatedCopy ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-zinc-900">
                  Ready to draft product listings & social posts
                </p>
                <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                  Select a product on the left and click Generate Marketing Kit to create storefront descriptions, bullet specs, Facebook captions, and WhatsApp broadcasts.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
                  <div>
                    <h3 className="font-display text-base font-semibold text-zinc-950">
                      Generated Marketing Kit
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {selectedProduct ? selectedProduct.name : customName}
                    </p>
                  </div>
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyDescriptionToProduct(
                          selectedProduct.id,
                          generatedCopy.description,
                          generatedCopy.highlights
                        );
                        setAppliedBanner(
                          `Updated ${selectedProduct.name} in Storefront & Inventory.`
                        );
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply to Store Product
                    </button>
                  )}
                </div>

                {appliedBanner && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    {appliedBanner}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900">
                      Storefront Description
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('desc', generatedCopy.description)
                      }
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedField === 'desc' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'desc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 leading-relaxed">
                    {generatedCopy.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-900 block">
                    Key Highlights
                  </span>
                  <ul className="space-y-1.5 text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
                    {generatedCopy.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-zinc-400">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900">
                      Facebook / Instagram Caption
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('fb', generatedCopy.facebookPost)
                      }
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedField === 'fb' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'fb' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 whitespace-pre-wrap leading-relaxed">
                    {generatedCopy.facebookPost}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900">
                      WhatsApp Broadcast
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        void handleCopyText('wa', generatedCopy.whatsappMessage)
                      }
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedField === 'wa' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'wa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 whitespace-pre-wrap leading-relaxed">
                    {generatedCopy.whatsappMessage}
                  </p>
                </div>

                <div className="pt-2 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-700">Keywords: </span>
                  {generatedCopy.seoTags.join(' · ')}
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sub-Tab 3: Business & Restock Analyst */}
      {subTab === 'analyst' && (
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-zinc-950">
                Live Store Performance & Restock Analysis
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Evaluates {products.length} SKUs and {orders.length} orders for restock urgency, margins, and bundle pricing.
              </p>
            </div>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => void handleRunInsights()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`}
              />
              <span>
                {isAnalyzing ? 'Analyzing Store Data...' : 'Analyze Store Performance'}
              </span>
            </button>
          </div>

          {insightsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {insightsError}
            </div>
          )}

          {!insights && !isAnalyzing ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <p className="text-sm font-semibold text-zinc-900">
                No analysis generated yet
              </p>
              <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                Click Analyze Store Performance above to run a live audit of stock shortages, profit margins, and bundle deals.
              </p>
            </div>
          ) : (
            insights && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200 rounded-xl p-6">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Executive Summary
                  </h3>
                  <p className="mt-2 text-sm text-zinc-800 leading-relaxed">
                    {insights.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Restock Priorities */}
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-200">
                      <h3 className="font-display text-sm font-semibold text-zinc-950">
                        Restock Priorities
                      </h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {insights.restockAlerts.length === 0 ? (
                        <p className="p-5 text-xs text-zinc-500">
                          All inventory levels are currently healthy.
                        </p>
                      ) : (
                        insights.restockAlerts.map((alert) => {
                          const matched = products.find((p) => p.sku === alert.sku);
                          return (
                            <div key={alert.sku} className="p-4 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-zinc-900">
                                  {alert.productName}
                                </span>
                                <span className="font-mono text-xs text-amber-700 font-medium tabular-nums">
                                  Order +{alert.recommendedOrderQty} units
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 font-mono tabular-nums">
                                {alert.sku} · Current stock: {alert.currentStock}
                                {matched
                                  ? ` · Est. restock cost: ${formatMoney(
                                      matched.cost * alert.recommendedOrderQty,
                                      currency
                                    )}`
                                  : ''}
                              </p>
                              <p className="text-xs text-zinc-600 pt-1">
                                {alert.reason}
                              </p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Margin Opportunities */}
                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-200">
                      <h3 className="font-display text-sm font-semibold text-zinc-950">
                        Margin & Pricing Opportunities
                      </h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {insights.marginOpportunities.map((opp, idx) => (
                        <div key={idx} className="p-4 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-zinc-900">
                              {opp.title}
                            </span>
                            <span className="text-xs font-medium text-emerald-700">
                              {opp.estimatedImpact}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {opp.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bundle Suggestions & Action Checklist */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-200">
                      <h3 className="font-display text-sm font-semibold text-zinc-950">
                        Recommended Bundles
                      </h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {insights.bundleSuggestions.map((bundle, idx) => (
                        <div key={idx} className="p-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-zinc-950">
                              {bundle.bundleName}
                            </span>
                            <span className="font-mono text-xs text-blue-700 font-medium">
                              {bundle.suggestedPriceNote}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {bundle.items.join(' + ')}
                          </p>
                          <p className="text-xs text-zinc-600">{bundle.pitch}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-200">
                      <h3 className="font-display text-sm font-semibold text-zinc-950">
                        Next Action Checklist
                      </h3>
                    </div>
                    <ul className="p-4 space-y-2.5 text-xs text-zinc-700">
                      {insights.actionChecklist.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-mono text-zinc-400 tabular-nums">
                            0{idx + 1}.
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
