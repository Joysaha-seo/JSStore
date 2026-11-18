import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import { HERO_DEV_IMAGE_URL } from '../data/initialDevData';
import { CaseStudy, ProjectDiscipline, Testimonial } from '../types/dev';
import { ProductImage } from './ProductImage';

interface WorkViewProps {
  projects: CaseStudy[];
  testimonials: Testimonial[];
  onGoToAiEstimator: () => void;
  onGoToServices: () => void;
  onStartSimilarProject: (projectTitle: string) => void;
}

const DISCIPLINES: Array<'All' | ProjectDiscipline> = [
  'All',
  'SaaS & Dashboards',
  'E-Commerce',
  'Developer Tools',
  'AI Systems',
];

export function WorkView({
  projects,
  testimonials,
  onGoToAiEstimator,
  onGoToServices,
  onStartSimilarProject,
}: WorkViewProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<'All' | ProjectDiscipline>(
    'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCase, setActiveCase] = useState<CaseStudy | null>(null);

  useEffect(() => {
    if (!activeCase) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCase(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeCase]);

  const filteredProjects = projects.filter((proj) => {
    const matchesDisc =
      selectedDiscipline === 'All' || proj.discipline === selectedDiscipline;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      proj.title.toLowerCase().includes(q) ||
      proj.client.toLowerCase().includes(q) ||
      proj.stack.some((s) => s.toLowerCase().includes(q));
    return matchesDisc && matchesSearch;
  });

  return (
    <div>
      {/* Hero Split */}
      <section className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-medium text-zinc-500 tracking-wide mb-3">
                Full-Stack Web Developer · React, TypeScript, Node.js & AI
              </p>
              <h1
                className="font-display font-bold tracking-tight text-zinc-950 leading-[1.08]"
                style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                  textWrap: 'balance',
                }}
              >
                I Design and Ship Production Web Apps, APIs, and AI Systems.
              </h1>
              <p className="mt-5 text-base text-zinc-600 leading-relaxed max-w-xl">
                Independent software engineer building fast customer storefronts, multi-tenant SaaS dashboards, and reliable backend architectures for founders and growing teams.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#selected-work"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>View Selected Work</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={onGoToAiEstimator}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-900 bg-white border border-zinc-300 hover:border-zinc-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Estimate Project with AI</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] lg:min-h-[400px] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                <ProductImage
                  src={HERO_DEV_IMAGE_URL}
                  alt="Minimalist web developer studio desk displaying code architecture and UI wireframes"
                  title="Developer Engineering Studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 4-Column Proof Strip */}
          <div className="mt-10 pt-8 border-t border-zinc-200 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-xl font-semibold text-zinc-950 tabular-nums">
                34+
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Production web apps & APIs shipped since 2021
              </p>
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-zinc-950 tabular-nums">
                99.95%
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Measured production uptime across managed deployments
              </p>
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-zinc-950 tabular-nums">
                &lt; 450ms
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Median API response time across client platforms
              </p>
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-zinc-950 tabular-nums">
                3–6 Weeks
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Typical sprint from technical spec to live launch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Case Studies */}
      <section
        id="selected-work"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
              Selected Case Studies
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Architecture decisions, shipped interfaces, and measurable business outcomes.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by stack or client..."
              aria-label="Filter case studies"
              className="pl-9 pr-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg w-60 focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        {/* Discipline Filter Tabs */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-2">
          {DISCIPLINES.map((disc) => (
            <button
              key={disc}
              type="button"
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDiscipline === disc
                  ? 'bg-zinc-950 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-950'
              }`}
            >
              {disc}
            </button>
          ))}
        </div>

        {filteredProjects.length === 0 ? (
          <div className="mt-10 py-14 text-center bg-white border border-zinc-200 rounded-xl">
            <p className="text-sm font-semibold text-zinc-900">
              No case studies match this filter
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDiscipline('All');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 cursor-pointer"
            >
              Show All Work
            </button>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="group bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
              >
                <button
                  type="button"
                  onClick={() => setActiveCase(project)}
                  className="block w-full aspect-[4/3] bg-zinc-100 overflow-hidden text-left cursor-pointer"
                >
                  <ProductImage
                    src={project.imageUrl}
                    alt={project.title}
                    title={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                    <span>
                      {project.discipline} <span aria-hidden="true">·</span>{' '}
                      {project.client}
                    </span>
                    <span className="font-mono tabular-nums">{project.year}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveCase(project)}
                    className="mt-2 text-left font-display text-base font-semibold text-zinc-950 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    {project.title}
                  </button>

                  <p className="mt-2 text-sm text-zinc-600 line-clamp-2 flex-1">
                    {project.summary}
                  </p>

                  <p className="mt-4 pt-3 border-t border-zinc-100 text-xs font-medium text-emerald-700 tabular-nums">
                    {project.outcomeMetric}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-zinc-500 truncate">
                      {project.stack.slice(0, 3).join(' · ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveCase(project)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-zinc-950 hover:text-blue-700 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>Read Case</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Client Outcomes / Testimonials */}
      <section className="border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-zinc-200">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
                Client Outcomes
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Direct feedback from engineering leaders and founders.
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToServices}
              className="text-sm font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap cursor-pointer"
            >
              View Service Packages →
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <blockquote
                key={t.id}
                className="p-6 bg-[#F8F9FA] border border-zinc-200 rounded-xl flex flex-col justify-between"
              >
                <p className="text-sm text-zinc-800 leading-relaxed">
                  “{t.quote}”
                </p>
                <footer className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-zinc-950">{t.authorName}</p>
                    <p className="text-zinc-500">
                      {t.role}, {t.company}
                    </p>
                  </div>
                  <span className="font-mono text-zinc-500">{t.projectRef}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study Detail Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <div
            className="fixed inset-0"
            onClick={() => setActiveCase(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeCase.title}
            className="relative z-10 bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-12"
          >
            <button
              type="button"
              onClick={() => setActiveCase(null)}
              aria-label="Close case study"
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 border border-zinc-200 rounded-lg text-zinc-600 hover:text-zinc-950 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="md:col-span-6 bg-zinc-100 min-h-[260px]">
              <ProductImage
                src={activeCase.imageUrl}
                alt={activeCase.title}
                title={activeCase.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs text-zinc-500">
                  {activeCase.discipline} · {activeCase.client} ·{' '}
                  <span className="font-mono">{activeCase.year}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-zinc-950">
                  {activeCase.title}
                </h3>
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  Outcome: {activeCase.outcomeMetric}
                </p>

                <div>
                  <p className="text-xs font-semibold text-zinc-900">The Challenge</p>
                  <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                    {activeCase.challenge}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-900">Engineering Solution</p>
                  <p className="mt-1 text-sm text-zinc-600 leading-relaxed">
                    {activeCase.solution}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-900">Technical Stack</p>
                  <p className="mt-1 text-xs font-mono text-zinc-600">
                    {activeCase.stack.join(' · ')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const title = activeCase.title;
                    setActiveCase(null);
                    onStartSimilarProject(`Similar to: ${title}`);
                  }}
                  className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  Request Similar Build
                </button>
                {activeCase.liveUrl && (
                  <a
                    href={activeCase.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-2.5 px-4 text-sm font-medium text-zinc-800 border border-zinc-200 hover:border-zinc-950 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Live Preview</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
