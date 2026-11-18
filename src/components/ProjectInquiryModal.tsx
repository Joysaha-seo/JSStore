import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ClientInquiry } from '../types/dev';

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectTitle?: string;
  onSubmitInquiry: (payload: {
    clientName: string;
    clientEmail: string;
    company: string;
    projectTitle: string;
    brief: string;
    budgetUsd: number;
    timelineWeeks: number;
    recommendedStack: string[];
  }) => ClientInquiry;
  onViewInClientHub: () => void;
}

const STACK_PRESETS: Array<{ label: string; stack: string[] }> = [
  {
    label: 'Full-Stack Web App (React + Node.js + PostgreSQL)',
    stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  },
  {
    label: 'Headless E-Commerce + Payments (Next.js + bKash/Stripe)',
    stack: ['Next.js', 'TypeScript', 'Express', 'bKash / Stripe'],
  },
  {
    label: 'AI-Powered SaaS Platform (React + Express + Gemini AI)',
    stack: ['React', 'TypeScript', 'Express', 'Gemini AI'],
  },
];

export function ProjectInquiryModal({
  isOpen,
  onClose,
  defaultProjectTitle = '',
  onSubmitInquiry,
  onViewInClientHub,
}: ProjectInquiryModalProps) {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [company, setCompany] = useState('');
  const [projectTitle, setProjectTitle] = useState(defaultProjectTitle);
  const [budgetUsd, setBudgetUsd] = useState(1800);
  const [timelineWeeks, setTimelineWeeks] = useState(5);
  const [stackIndex, setStackIndex] = useState(0);
  const [brief, setBrief] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<ClientInquiry | null>(null);

  useEffect(() => {
    if (isOpen && defaultProjectTitle) {
      setProjectTitle(defaultProjectTitle);
    }
  }, [isOpen, defaultProjectTitle]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSubmitted(null);
        setError('');
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSubmitted(null);
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim());
    if (!clientName.trim() || !emailValid || !brief.trim()) {
      setError('Please enter your name, a valid email address, and a brief project description.');
      return;
    }
    setError('');
    const created = onSubmitInquiry({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      company: company.trim() || 'Independent',
      projectTitle: projectTitle.trim() || 'Custom Web Application',
      brief: brief.trim(),
      budgetUsd: Math.max(300, Number(budgetUsd) || 1500),
      timelineWeeks: Math.max(1, Number(timelineWeeks) || 4),
      recommendedStack: STACK_PRESETS[stackIndex]?.stack ?? STACK_PRESETS[0].stack,
    });
    setSubmitted(created);
    setClientName('');
    setClientEmail('');
    setCompany('');
    setProjectTitle('');
    setBrief('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Start a Web Development Project"
        className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-zinc-950">
              {submitted ? 'Inquiry Received' : 'Start a Web Development Project'}
            </h2>
            <p className="text-xs text-zinc-500">
              {submitted
                ? 'Logged directly in Client Hub for scoping.'
                : 'Share your goals and timeline to schedule a technical call.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close inquiry modal"
            className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-900">
                <p className="font-semibold">
                  Project Brief #{submitted.id} Created
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  “{submitted.projectTitle}” for {submitted.clientName} is now tracked in Client Hub.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onViewInClientHub();
                }}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                Open in Client Hub
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Tariq Hasan"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Company / Brand
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. SaaS Booking Platform"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Preferred Architecture / Stack
              </label>
              <select
                value={stackIndex}
                onChange={(e) => setStackIndex(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-blue-700"
              >
                {STACK_PRESETS.map((preset, idx) => (
                  <option key={preset.label} value={idx}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Target Budget (USD)
                </label>
                <input
                  type="number"
                  min={300}
                  step={100}
                  value={budgetUsd}
                  onChange={(e) => setBudgetUsd(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Target Timeline (Weeks)
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={timelineWeeks}
                  onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Project Brief (English, বাংলা, or Banglish)
              </label>
              <textarea
                rows={4}
                required
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Describe key features, user roles, integrations (payment, AI, dashboard), and launch goals..."
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-700"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Submit Project Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
