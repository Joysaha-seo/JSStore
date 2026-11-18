import { useEffect, useState } from 'react';
import { Edit3, Plus, Printer, Search, Sparkles, Trash2, X } from 'lucide-react';
import { formatDevMoney } from '../data/initialDevData';
import {
  CaseStudy,
  ClientInquiry,
  CurrencyCode,
  InquiryStatus,
  ProjectDiscipline,
} from '../types/dev';

interface ClientHubViewProps {
  inquiries: ClientInquiry[];
  projects: CaseStudy[];
  currency: CurrencyCode;
  onUpdateInquiryStatus: (id: string, status: InquiryStatus) => void;
  onDeleteInquiry: (id: string) => void;
  onSaveCaseStudy: (project: CaseStudy) => void;
  onDeleteCaseStudy: (id: string) => void;
  onOpenAiProposalForInquiry: (inquiry: ClientInquiry) => void;
  onOpenInquiryModal: () => void;
}

const DISCIPLINES: ProjectDiscipline[] = [
  'SaaS & Dashboards',
  'E-Commerce',
  'Developer Tools',
  'AI Systems',
];

const SHOWCASE_IMAGE_PRESETS = [
  {
    label: 'SaaS Analytics Display',
    url: '/src/assets/images/project_fintech_ui_1795003680639.jpg',
  },
  {
    label: 'E-Commerce Storefront',
    url: '/src/assets/images/project_commerce_ui_1795003680922.jpg',
  },
  {
    label: 'Developer Pipeline Console',
    url: '/src/assets/images/project_realtime_ui_1795003680962.jpg',
  },
  {
    label: 'Typographic Fallback Card',
    url: '',
  },
];

export function ClientHubView({
  inquiries,
  projects,
  currency,
  onUpdateInquiryStatus,
  onDeleteInquiry,
  onSaveCaseStudy,
  onDeleteCaseStudy,
  onOpenAiProposalForInquiry,
  onOpenInquiryModal,
}: ClientHubViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InquiryStatus>('All');
  const [quoteModalInquiry, setQuoteModalInquiry] = useState<ClientInquiry | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  // Case Study form state
  const [projTitle, setProjTitle] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projYear, setProjYear] = useState('2026');
  const [projDiscipline, setProjDiscipline] =
    useState<ProjectDiscipline>('SaaS & Dashboards');
  const [projStack, setProjStack] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [projOutcome, setProjOutcome] = useState('');
  const [projSummary, setProjSummary] = useState('');
  const [projChallenge, setProjChallenge] = useState('');
  const [projSolution, setProjSolution] = useState('');
  const [projImageUrl, setProjImageUrl] = useState(SHOWCASE_IMAGE_PRESETS[0].url);
  const [projLiveUrl, setProjLiveUrl] = useState('');

  useEffect(() => {
    if (!quoteModalInquiry && !isProjectModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuoteModalInquiry(null);
        setIsProjectModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quoteModalInquiry, isProjectModalOpen]);

  const pipelineValueUsd = inquiries.reduce((sum, i) => sum + i.budgetUsd, 0);
  const activeBuildsCount = inquiries.filter((i) => i.status === 'In Progress').length;
  const openLeadsCount = inquiries.filter(
    (i) => i.status === 'New Lead' || i.status === 'Proposal Sent'
  ).length;
  const shippedCount =
    projects.length + inquiries.filter((i) => i.status === 'Shipped').length;

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      inq.id.toLowerCase().includes(q) ||
      inq.clientName.toLowerCase().includes(q) ||
      inq.company.toLowerCase().includes(q) ||
      inq.projectTitle.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const openAddCaseModal = () => {
    setEditingCaseId(null);
    setProjTitle('');
    setProjClient('');
    setProjYear('2026');
    setProjDiscipline('SaaS & Dashboards');
    setProjStack('React, TypeScript, Node.js, PostgreSQL');
    setProjOutcome('');
    setProjSummary('');
    setProjChallenge('');
    setProjSolution('');
    setProjImageUrl(SHOWCASE_IMAGE_PRESETS[0].url);
    setProjLiveUrl('');
    setIsProjectModalOpen(true);
  };

  const openEditCaseModal = (project: CaseStudy) => {
    setEditingCaseId(project.id);
    setProjTitle(project.title);
    setProjClient(project.client);
    setProjYear(project.year);
    setProjDiscipline(project.discipline);
    setProjStack(project.stack.join(', '));
    setProjOutcome(project.outcomeMetric);
    setProjSummary(project.summary);
    setProjChallenge(project.challenge);
    setProjSolution(project.solution);
    setProjImageUrl(project.imageUrl);
    setProjLiveUrl(project.liveUrl ?? '');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projClient.trim()) return;
    const saved: CaseStudy = {
      id: editingCaseId ?? `case-${Date.now()}`,
      title: projTitle.trim(),
      client: projClient.trim(),
      year: projYear.trim() || '2026',
      discipline: projDiscipline,
      role: 'Full-Stack Developer',
      stack: projStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      outcomeMetric: projOutcome.trim() || 'Delivered on schedule in production',
      summary:
        projSummary.trim() ||
        `Custom ${projDiscipline} web platform built for ${projClient.trim()}.`,
      challenge:
        projChallenge.trim() ||
        'Legacy manual workflows slowed customer turnaround and reporting visibility.',
      solution:
        projSolution.trim() ||
        'Engineered a modern full-stack TypeScript web application with clean API architecture.',
      imageUrl: projImageUrl.trim(),
      liveUrl: projLiveUrl.trim() || undefined,
    };
    onSaveCaseStudy(saved);
    setIsProjectModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            Client Hub & Portfolio Manager
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track freelance inquiries, generate printable quotes & AI proposals, and manage published case studies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openAddCaseModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Case Study</span>
          </button>
          <button
            type="button"
            onClick={onOpenInquiryModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client Lead</span>
          </button>
        </div>
      </div>

      {/* 4-Column Pipeline Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-zinc-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        <div className="p-5">
          <p className="text-xs text-zinc-500">Total Pipeline Value</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-zinc-950 tabular-nums">
            {formatDevMoney(pipelineValueUsd, currency)}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Open Leads & Proposals</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-amber-700 tabular-nums">
            {openLeadsCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Active Client Builds</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-blue-700 tabular-nums">
            {activeBuildsCount}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500">Published & Shipped</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
            {shippedCount}
          </p>
        </div>
      </div>

      {/* Client Inquiries Table */}
      <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-zinc-950">
            Client Leads & Active Projects
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client or project..."
                className="pl-8 pr-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg w-48 focus:outline-none focus:border-blue-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'All' | InquiryStatus)
              }
              aria-label="Filter leads by status"
              className="px-2.5 py-1.5 text-xs border border-zinc-200 rounded-lg bg-white text-zinc-700 focus:outline-none focus:border-blue-700"
            >
              <option value="All">All Stages</option>
              <option value="New Lead">New Lead</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="In Progress">In Progress</option>
              <option value="Shipped">Shipped</option>
            </select>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-medium text-zinc-900">No client inquiries found</p>
            <p className="mt-1 text-xs text-zinc-500">
              Add a new lead or generate an AI scope estimate in AI Studio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
                  <th className="py-2.5 px-4">Ref</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Project & Stack</th>
                  <th className="py-2.5 px-4 text-right">Timeline</th>
                  <th className="py-2.5 px-4 text-right">Estimate</th>
                  <th className="py-2.5 px-4">Stage</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-zinc-50/70">
                    <td className="py-3 px-4 align-top font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                      {inq.id}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <p className="font-medium text-zinc-950">{inq.clientName}</p>
                      <p className="text-xs text-zinc-500">
                        {inq.company} · {inq.clientEmail}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top max-w-xs">
                      <p className="font-medium text-zinc-900">{inq.projectTitle}</p>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {inq.recommendedStack.join(' · ')}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top text-right font-mono text-xs text-zinc-600 tabular-nums">
                      {inq.timelineWeeks} wks
                    </td>
                    <td className="py-3 px-4 align-top text-right font-mono text-xs font-semibold text-zinc-950 tabular-nums">
                      {formatDevMoney(inq.budgetUsd, currency)}
                    </td>
                    <td className="py-3 px-4 align-top">
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          onUpdateInquiryStatus(inq.id, e.target.value as InquiryStatus)
                        }
                        aria-label={`Update status for ${inq.projectTitle}`}
                        className={`px-2 py-1 text-xs font-medium border border-zinc-200 rounded-md bg-white cursor-pointer ${
                          inq.status === 'Shipped'
                            ? 'text-emerald-700'
                            : inq.status === 'In Progress'
                              ? 'text-blue-700'
                              : inq.status === 'Proposal Sent'
                                ? 'text-amber-700'
                                : 'text-zinc-800'
                        }`}
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Shipped">Shipped</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 align-top text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenAiProposalForInquiry(inq)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-md cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Proposal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuoteModalInquiry(inq)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-700 border border-zinc-200 hover:border-zinc-400 rounded-md cursor-pointer whitespace-nowrap"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Quote</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteInquiry(inq.id)}
                          aria-label={`Delete inquiry ${inq.id}`}
                          className="p-1 text-zinc-400 hover:text-red-700 border border-zinc-200 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Published Case Studies Table */}
      <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-zinc-950">
            Published Portfolio Case Studies ({projects.length})
          </h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {projects.map((p) => (
            <div
              key={p.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-950">{p.title}</p>
                <p className="text-xs text-zinc-500">
                  {p.discipline} · {p.client} · <span className="font-mono">{p.year}</span> ·{' '}
                  <span className="text-emerald-700">{p.outcomeMetric}</span>
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => openEditCaseModal(p)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-700 hover:text-zinc-950 border border-zinc-200 rounded-md cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCaseStudy(p.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-red-700 border border-zinc-200 rounded-md cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Printable Quote / Invoice Modal */}
      {quoteModalInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0 no-print"
            onClick={() => setQuoteModalInquiry(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Project Quote ${quoteModalInquiry.id}`}
            className="print-sheet relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold text-zinc-950">Badhan.dev</p>
                <p className="text-xs text-zinc-500 font-mono tabular-nums">
                  Project Quote #{quoteModalInquiry.id} ·{' '}
                  {new Date(quoteModalInquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuoteModalInquiry(null)}
                aria-label="Close quote modal"
                className="no-print p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 border-y border-zinc-200 space-y-1 text-xs text-zinc-600">
              <p>
                <span className="text-zinc-400">Client:</span>{' '}
                <span className="font-medium text-zinc-950">
                  {quoteModalInquiry.clientName}
                </span>{' '}
                ({quoteModalInquiry.company})
              </p>
              <p>
                <span className="text-zinc-400">Email:</span>{' '}
                {quoteModalInquiry.clientEmail}
              </p>
              <p>
                <span className="text-zinc-400">Project:</span>{' '}
                <span className="font-medium text-zinc-950">
                  {quoteModalInquiry.projectTitle}
                </span>
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">Scope Summary</p>
              <p className="leading-relaxed">{quoteModalInquiry.brief}</p>
              <p className="font-mono text-zinc-500 pt-1">
                Stack: {quoteModalInquiry.recommendedStack.join(' · ')}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Timeline</span>
                <span className="font-mono tabular-nums">
                  {quoteModalInquiry.timelineWeeks} weeks
                </span>
              </div>
              <div className="flex justify-between font-semibold text-zinc-950 text-base">
                <span>Quoted Investment</span>
                <span className="font-mono tabular-nums">
                  {formatDevMoney(quoteModalInquiry.budgetUsd, currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="no-print w-full py-2.5 px-4 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Print / Save PDF Quote
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Case Study Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setIsProjectModalOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingCaseId ? 'Edit Case Study' : 'Add Portfolio Case Study'}
            className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h2 className="font-display text-lg font-semibold text-zinc-950">
                {editingCaseId ? 'Edit Case Study' : 'Add Portfolio Case Study'}
              </h2>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. MedQueue Clinic Booking System"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={projClient}
                    onChange={(e) => setProjClient(e.target.value)}
                    placeholder="e.g. Nova Health"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Discipline
                  </label>
                  <select
                    value={projDiscipline}
                    onChange={(e) =>
                      setProjDiscipline(e.target.value as ProjectDiscipline)
                    }
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
                  >
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Year
                  </label>
                  <input
                    type="text"
                    value={projYear}
                    onChange={(e) => setProjYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Measured Outcome
                  </label>
                  <input
                    type="text"
                    value={projOutcome}
                    onChange={(e) => setProjOutcome(e.target.value)}
                    placeholder="e.g. +35% bookings in 60 days"
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Showcase Cover Visual
                </label>
                <select
                  value={projImageUrl}
                  onChange={(e) => setProjImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white"
                >
                  {SHOWCASE_IMAGE_PRESETS.map((preset) => (
                    <option key={preset.label} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={projStack}
                  onChange={(e) => setProjStack(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={projSummary}
                  onChange={(e) => setProjSummary(e.target.value)}
                  placeholder="Describe what you engineered and shipped..."
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Challenge
                  </label>
                  <textarea
                    rows={2}
                    value={projChallenge}
                    onChange={(e) => setProjChallenge(e.target.value)}
                    placeholder="Core client bottleneck..."
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Engineering Solution
                  </label>
                  <textarea
                    rows={2}
                    value={projSolution}
                    onChange={(e) => setProjSolution(e.target.value)}
                    placeholder="Architecture implemented..."
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Live Project URL (Optional)
                </label>
                <input
                  type="url"
                  value={projLiveUrl}
                  onChange={(e) => setProjLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  {editingCaseId ? 'Save Changes' : 'Publish Case Study'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
