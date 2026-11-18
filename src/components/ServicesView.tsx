import { ArrowRight } from 'lucide-react';
import { formatDevMoney } from '../data/initialDevData';
import { TranslationPack } from '../i18n/translations';
import { CurrencyCode, ServicePackage } from '../types/dev';

interface ServicesViewProps {
  services: ServicePackage[];
  currency: CurrencyCode;
  t: TranslationPack;
  onSelectPackage: (pkg: ServicePackage) => void;
  onOpenAiEstimator: () => void;
}

const TECH_STACK_GROUPS = [
  { label: 'Frontend', items: 'React 19 · Next.js · TypeScript · Tailwind CSS · Motion' },
  { label: 'Backend & APIs', items: 'Node.js · Express · REST · WebSockets · Zod Validation' },
  { label: 'Data & Cloud', items: 'PostgreSQL · Drizzle ORM · Redis · Docker · Cloud Run' },
  { label: 'AI & Payments', items: 'Gemini API (@google/genai) · Stripe · bKash / SSLCommerz' },
];

export function ServicesView({
  services,
  currency,
  t,
  onSelectPackage,
  onOpenAiEstimator,
}: ServicesViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-14">
      {/* Capabilities Header */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-zinc-200">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium text-zinc-500">{t.services.kicker}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950">
            {t.services.heading}
          </h1>
          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            {t.services.subcopy}
          </p>
          <button
            type="button"
            onClick={onOpenAiEstimator}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>{t.services.ctaEstimate}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="lg:col-span-7 divide-y divide-zinc-200 bg-white border border-zinc-200 rounded-xl">
          {t.services.capabilities.map((cap) => (
            <div key={cap.num} className="p-5 flex items-start gap-4">
              <span className="font-mono text-xs font-semibold text-blue-700 pt-1 tabular-nums">
                {cap.num}
              </span>
              <div>
                <h2 className="font-display text-base font-semibold text-zinc-950">
                  {cap.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{cap.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engagement Tiers */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-950">
            {t.services.packagesHeading}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t.services.packagesSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          {services.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-mono">{pkg.index}</span>
                  <span className="font-mono tabular-nums">{pkg.timeline}</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-zinc-950">
                  {pkg.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-500">{pkg.audience}</p>

                <div className="mt-5 pb-5 border-b border-zinc-200">
                  <span className="text-xs text-zinc-500">{t.services.startingAt}</span>
                  <p className="font-mono text-2xl font-bold text-zinc-950 tabular-nums mt-0.5">
                    {formatDevMoney(pkg.startingPriceUsd, currency)}
                  </p>
                </div>

                <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
                  {pkg.summary}
                </p>

                <ul className="mt-5 space-y-2 text-xs text-zinc-700">
                  {pkg.deliverables.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-zinc-400">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPackage(pkg)}
                className="mt-7 w-full py-2.5 px-4 text-sm font-medium text-white bg-zinc-950 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                {t.services.requestPrefix} {pkg.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Matrix */}
      <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-zinc-950 mb-4">
          {t.services.stackHeading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-zinc-200">
          {TECH_STACK_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-zinc-900">{group.label}</p>
              <p className="mt-1.5 text-xs font-mono text-zinc-600 leading-relaxed">
                {group.items}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
