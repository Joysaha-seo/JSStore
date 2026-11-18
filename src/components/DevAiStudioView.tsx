import { useEffect, useRef, useState } from 'react';
import {
  Calculator,
  Check,
  Copy,
  FileText,
  MessageSquare,
  Send,
  Square,
  Trash2,
} from 'lucide-react';
import { formatDevMoney } from '../data/initialDevData';
import {
  estimateProjectScope,
  streamDevAiChat,
  writeClientProposal,
} from '../services/devAiService';
import {
  CaseStudy,
  ChatMessage,
  ClientInquiry,
  CurrencyCode,
  ProposalDraft,
  ScopeEstimate,
  ServicePackage,
} from '../types/dev';

interface DevAiStudioViewProps {
  developerName: string;
  currency: CurrencyCode;
  projects: CaseStudy[];
  services: ServicePackage[];
  inquiries: ClientInquiry[];
  preselectedInquiry: ClientInquiry | null;
  onConsumePreselectedInquiry: () => void;
  onSaveEstimateAsLead: (payload: {
    projectTitle: string;
    brief: string;
    budgetUsd: number;
    timelineWeeks: number;
    recommendedStack: string[];
  }) => ClientInquiry;
}

type AiSubTab = 'estimator' | 'proposal' | 'copilot';

const ARCHITECT_PROMPTS = [
  'Compare PostgreSQL vs Firestore for a multi-vendor Bangladeshi e-commerce SaaS',
  'Client ekta clinic booking + AI report explainer chay—architecture kivabe sajabo?',
  'Review my active client pipeline and suggest next follow-up priorities',
  'Draft a clean REST API folder structure for React + Express + TypeScript',
];

export function DevAiStudioView({
  developerName,
  currency,
  projects,
  services,
  inquiries,
  preselectedInquiry,
  onConsumePreselectedInquiry,
  onSaveEstimateAsLead,
}: DevAiStudioViewProps) {
  const [subTab, setSubTab] = useState<AiSubTab>('estimator');

  // 1. Scope & Cost Estimator State (persisted in sessionStorage across tab switches)
  const [projectIdea, setProjectIdea] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('Full-Stack Web App');
  const [urgency, setUrgency] = useState('Standard (4–8 weeks)');
  const [estimate, setEstimate] = useState<ScopeEstimate | null>(() => {
    try {
      const raw = sessionStorage.getItem('dev_ai_last_estimate');
      return raw ? (JSON.parse(raw) as ScopeEstimate) : null;
    } catch {
      return null;
    }
  });
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [savedEstimateLeadId, setSavedEstimateLeadId] = useState<string | null>(null);

  // 2. Proposal Writer State
  const [selectedLeadId, setSelectedLeadId] = useState<string>('custom');
  const [propClientName, setPropClientName] = useState('');
  const [propProjectTitle, setPropProjectTitle] = useState('');
  const [propBrief, setPropBrief] = useState('');
  const [propBudgetNote, setPropBudgetNote] = useState('');
  const [propLanguage, setPropLanguage] = useState<'en' | 'bn' | 'banglish'>('en');
  const [proposal, setProposal] = useState<ProposalDraft | null>(() => {
    try {
      const raw = sessionStorage.getItem('dev_ai_last_proposal');
      return raw ? (JSON.parse(raw) as ProposalDraft) : null;
    } catch {
      return null;
    }
  });
  const [isDraftingProp, setIsDraftingProp] = useState(false);
  const [propError, setPropError] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 3. Streaming Copilot State
  const [chatMode, setChatMode] = useState<'architect' | 'client'>('architect');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'dev-ai-welcome',
      role: 'model',
      text: `Hi ${developerName} — I'm connected to your live portfolio, service packages, and client pipeline. Ask for technical architecture advice, client scoping, or write responses in English, বাংলা, or Banglish.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatError, setChatError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (estimate) {
        sessionStorage.setItem('dev_ai_last_estimate', JSON.stringify(estimate));
      }
    } catch {
      // ignore
    }
  }, [estimate]);

  useEffect(() => {
    try {
      if (proposal) {
        sessionStorage.setItem('dev_ai_last_proposal', JSON.stringify(proposal));
      }
    } catch {
      // ignore
    }
  }, [proposal]);

  useEffect(() => {
    if (preselectedInquiry) {
      setSubTab('proposal');
      setSelectedLeadId(preselectedInquiry.id);
      setPropClientName(preselectedInquiry.clientName);
      setPropProjectTitle(preselectedInquiry.projectTitle);
      setPropBrief(preselectedInquiry.brief);
      setPropBudgetNote(
        `${formatDevMoney(preselectedInquiry.budgetUsd, currency)} · ${preselectedInquiry.timelineWeeks} weeks`
      );
      setProposal(null);
      onConsumePreselectedInquiry();
    }
  }, [preselectedInquiry, currency, onConsumePreselectedInquiry]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const handleLoadLeadIntoProposal = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (leadId === 'custom') return;
    const found = inquiries.find((i) => i.id === leadId);
    if (!found) return;
    setPropClientName(found.clientName);
    setPropProjectTitle(found.projectTitle);
    setPropBrief(found.brief);
    setPropBudgetNote(
      `${formatDevMoney(found.budgetUsd, currency)} · ${found.timelineWeeks} weeks`
    );
  };

  const handleRunEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectIdea.trim()) return;
    setEstimateError('');
    setSavedEstimateLeadId(null);
    setIsEstimating(true);
    try {
      const result = await estimateProjectScope({
        projectIdea: projectIdea.trim(),
        targetPlatform,
        urgency,
        currency,
      });
      setEstimate(result);
    } catch (err) {
      setEstimateError(
        err instanceof Error ? err.message : 'Unable to estimate project scope.'
      );
    } finally {
      setIsEstimating(false);
    }
  };

  const handleDraftProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propBrief.trim()) return;
    setPropError('');
    setIsDraftingProp(true);
    try {
      const result = await writeClientProposal({
        clientName: propClientName.trim() || 'Client',
        projectTitle: propProjectTitle.trim() || 'Web Application Build',
        clientBrief: propBrief.trim(),
        budgetNote: propBudgetNote.trim(),
        language: propLanguage,
      });
      setProposal(result);
    } catch (err) {
      setPropError(
        err instanceof Error ? err.message : 'Unable to draft client proposal.'
      );
    } finally {
      setIsDraftingProp(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleStopStream = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const handleSendChat = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;
    setChatError('');

    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const assistantId = `m-${Date.now() + 1}`;
    const placeholder: ChatMessage = {
      id: assistantId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, placeholder]);
    setChatInput('');
    setIsStreaming(true);

    try {
      await streamDevAiChat({
        message: trimmed,
        history: nextHistory,
        mode: chatMode,
        developerName,
        currency,
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
      setChatError(
        err instanceof Error ? err.message : 'Unable to reach AI copilot.'
      );
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            Web Developer AI Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            AI project scope & cost estimator, multilingual proposal writer, and technical architect copilot.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-zinc-100 border border-zinc-200 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setSubTab('estimator')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'estimator'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Scope & Cost Estimator</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('proposal')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'proposal'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Proposal Writer</span>
          </button>
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
            <span>Architect Copilot</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Scope & Cost Estimator */}
      {subTab === 'estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleRunEstimate}
            className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-zinc-950">
              Estimate Technical Scope & Budget
            </h2>
            <p className="text-xs text-zinc-500">
              Paste a client requirement in English, বাংলা, or Banglish to generate a structured build plan.
            </p>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Project Idea / Client Requirements
              </label>
              <textarea
                rows={5}
                required
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="e.g. Need an online booking & telemedicine portal with doctor profiles, bKash checkout, patient dashboard, and admin analytics..."
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Target Architecture
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
                >
                  <option value="Full-Stack Web App">Full-Stack Web App</option>
                  <option value="E-Commerce + POS">E-Commerce + POS</option>
                  <option value="SaaS Dashboard + Billing">SaaS Dashboard + Billing</option>
                  <option value="AI-Powered Web Platform">AI-Powered Web Platform</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Delivery Speed
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
                >
                  <option value="Standard (4–8 weeks)">Standard (4–8 weeks)</option>
                  <option value="Rapid MVP (2–3 weeks)">Rapid MVP (2–3 weeks)</option>
                  <option value="Phased Enterprise (8–12 weeks)">
                    Phased Enterprise (8–12 weeks)
                  </option>
                </select>
              </div>
            </div>

            {estimateError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {estimateError}
              </p>
            )}

            <button
              type="submit"
              disabled={isEstimating}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-300 rounded-lg transition-colors cursor-pointer"
            >
              {isEstimating ? 'Generating Technical Scope...' : 'Generate Scope & Cost Estimate'}
            </button>
          </form>

          <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6">
            {!estimate ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-zinc-900">
                  No technical scope generated yet
                </p>
                <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                  Describe the web application on the left to receive a module-by-module day breakdown, recommended stack, milestone schedule, and investment estimate.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-200">
                  <div>
                    <h3 className="font-display text-lg font-bold text-zinc-950">
                      {estimate.projectTitle}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-zinc-500">
                      {estimate.recommendedStack.join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xl font-bold text-blue-700 tabular-nums">
                      {formatDevMoney(estimate.estimatedCostUsd, currency)}
                    </p>
                    <p className="text-xs font-mono text-zinc-500 tabular-nums">
                      Est. {estimate.totalWeeks} weeks
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed">
                  {estimate.executiveSummary}
                </p>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 mb-2">
                    Engineering Modules Breakdown
                  </h4>
                  <div className="border border-zinc-200 rounded-lg divide-y divide-zinc-100">
                    {estimate.coreModules.map((mod, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-950">
                            {mod.moduleName}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {mod.deliverables}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-zinc-500 tabular-nums shrink-0">
                          {mod.estimatedDays}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 mb-2">
                    Delivery Milestones
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {estimate.milestones.map((ms, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                      >
                        <div className="flex justify-between text-xs font-semibold text-zinc-900">
                          <span>{ms.phase}</span>
                          <span className="font-mono text-zinc-500">{ms.duration}</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-600">{ms.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 mb-1.5">
                    Key Technical Risks & Edge Cases
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-600">
                    {estimate.technicalRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-zinc-400">—</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {savedEstimateLeadId && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 font-mono">
                    Saved to Client Hub as #{savedEstimateLeadId}.
                  </p>
                )}

                <div className="pt-3 border-t border-zinc-200 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={Boolean(savedEstimateLeadId)}
                    onClick={() => {
                      const created = onSaveEstimateAsLead({
                        projectTitle: estimate.projectTitle,
                        brief: projectIdea.trim() || estimate.executiveSummary,
                        budgetUsd: estimate.estimatedCostUsd,
                        timelineWeeks: estimate.totalWeeks,
                        recommendedStack: estimate.recommendedStack,
                      });
                      setSavedEstimateLeadId(created.id);
                    }}
                    className="px-4 py-2 text-xs font-medium text-white bg-zinc-950 hover:bg-blue-700 disabled:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {savedEstimateLeadId
                      ? `Saved (#${savedEstimateLeadId})`
                      : 'Save Estimate to Client Hub'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLeadId('custom');
                      setPropProjectTitle(estimate.projectTitle);
                      setPropBrief(projectIdea.trim() || estimate.executiveSummary);
                      setPropBudgetNote(
                        `${formatDevMoney(estimate.estimatedCostUsd, currency)} · ${estimate.totalWeeks} weeks`
                      );
                      setSubTab('proposal');
                    }}
                    className="px-4 py-2 text-xs font-medium text-zinc-800 border border-zinc-200 hover:border-zinc-950 rounded-lg transition-colors cursor-pointer"
                  >
                    Draft Proposal from Estimate
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sub-Tab 2: Client Proposal Writer */}
      {subTab === 'proposal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleDraftProposal}
            className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
          >
            <h2 className="font-display text-base font-semibold text-zinc-950">
              AI Client Proposal & Pitch Writer
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Load from Client Hub Lead
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLoadLeadIntoProposal(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
              >
                <option value="custom">Custom / Manual Entry</option>
                {inquiries.map((inq) => (
                  <option key={inq.id} value={inq.id}>
                    {inq.id} — {inq.clientName} ({inq.projectTitle})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={propClientName}
                  onChange={(e) => setPropClientName(e.target.value)}
                  placeholder="e.g. Arifur Rahman"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Budget / Timeline
                </label>
                <input
                  type="text"
                  value={propBudgetNote}
                  onChange={(e) => setPropBudgetNote(e.target.value)}
                  placeholder="e.g. $2,200 · 5 weeks"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Project Title
              </label>
              <input
                type="text"
                value={propProjectTitle}
                onChange={(e) => setPropProjectTitle(e.target.value)}
                placeholder="e.g. E-Commerce Store & Admin Panel"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Client Brief / Pain Points
              </label>
              <textarea
                rows={4}
                required
                value={propBrief}
                onChange={(e) => setPropBrief(e.target.value)}
                placeholder="What does the client need built?"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Language / Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'en', label: 'English' },
                    { id: 'banglish', label: 'EN + Banglish' },
                    { id: 'bn', label: 'বাংলা' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPropLanguage(opt.id)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      propLanguage === opt.id
                        ? 'border-blue-700 bg-blue-50 text-blue-800'
                        : 'border-zinc-200 text-zinc-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {propError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {propError}
              </p>
            )}

            <button
              type="submit"
              disabled={isDraftingProp}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-300 rounded-lg transition-colors cursor-pointer"
            >
              {isDraftingProp ? 'Drafting Proposal...' : 'Draft Proposal & Pitch'}
            </button>
          </form>

          <section className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6">
            {!proposal ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-zinc-900">
                  Ready to write client proposals
                </p>
                <p className="mt-1 text-xs text-zinc-500 max-w-md mx-auto">
                  Select a lead from Client Hub or enter a brief to generate a ready-to-send email, WhatsApp pitch, and discovery questions.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-900">
                      Email Subject
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy('subj', proposal.emailSubject)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedKey === 'subj' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'subj' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5">
                    {proposal.emailSubject}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-900">
                      Full Proposal Email
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy('email', proposal.proposalEmail)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedKey === 'email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 whitespace-pre-wrap leading-relaxed">
                    {proposal.proposalEmail}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-900">
                      WhatsApp / Quick Message
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopy('wa', proposal.whatsappPitch)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 cursor-pointer"
                    >
                      {copiedKey === 'wa' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedKey === 'wa' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 whitespace-pre-wrap leading-relaxed">
                    {proposal.whatsappPitch}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-900 block mb-2">
                    Discovery Call Questions
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3.5">
                    {proposal.discoveryQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-zinc-400">0{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sub-Tab 3: Architect & Client Copilot */}
      {subTab === 'copilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 space-y-5">
            <div>
              <p className="text-xs font-semibold text-zinc-900 mb-2">Copilot Mode</p>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setChatMode('architect')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    chatMode === 'architect'
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  Tech Architect
                </button>
                <button
                  type="button"
                  onClick={() => setChatMode('client')}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    chatMode === 'client'
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  Client Advisor
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-2">
              <p className="text-xs font-semibold text-zinc-900">Starter Prompts</p>
              <div className="space-y-1.5">
                {ARCHITECT_PROMPTS.map((prompt) => (
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

          <section className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl flex flex-col h-[560px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold text-zinc-950">
                  {chatMode === 'architect'
                    ? 'Full-Stack Architecture & Business Copilot'
                    : 'Prospective Client Q&A Assistant'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Supports English, বাংলা, and Banglish
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleStopStream();
                  setMessages([
                    {
                      id: `clear-${Date.now()}`,
                      role: 'model',
                      text: 'Chat cleared. Ask anything about architecture, stack trade-offs, or client projects.',
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-600 border border-zinc-200 rounded-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div
              ref={scrollRef}
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
                    {msg.text || (isStreaming ? 'Thinking...' : '')}
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
                placeholder="Ask about database schema, API design, or project pricing..."
                className="flex-1 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStream}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              )}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
