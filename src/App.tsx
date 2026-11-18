import { useEffect, useState } from 'react';
import { ClientHubView } from './components/ClientHubView';
import { DevAiStudioView } from './components/DevAiStudioView';
import { DevHeader } from './components/DevHeader';
import { FloatingChatBox } from './components/FloatingChatBox';
import { ProjectInquiryModal } from './components/ProjectInquiryModal';
import { ServicesView } from './components/ServicesView';
import { WorkView } from './components/WorkView';
import {
  INITIAL_CASE_STUDIES,
  INITIAL_INQUIRIES,
  SERVICE_PACKAGES,
  TESTIMONIALS,
} from './data/initialDevData';
import { TRANSLATIONS } from './i18n/translations';
import {
  AppLanguage,
  CaseStudy,
  ClientInquiry,
  CurrencyCode,
  DevWorkspaceTab,
  InquiryStatus,
} from './types/dev';

const STORAGE_KEYS = {
  projects: 'dev_studio_projects_v1',
  inquiries: 'dev_studio_inquiries_v1',
  currency: 'dev_studio_currency_v1',
  language: 'dev_studio_lang_v1',
};

const FOOTER_LANGUAGES: Array<{ id: AppLanguage; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'bn', label: 'বাংলা' },
  { id: 'hi', label: 'हिन्दी' },
];

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getNextInquiryId(inquiries: ClientInquiry[]): string {
  const maxNum = inquiries.reduce((max, item) => {
    const parsed = Number.parseInt(item.id.replace(/^REQ-/, ''), 10);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 208);
  return `REQ-${maxNum + 1}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DevWorkspaceTab>('work');
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = loadSaved<AppLanguage>(STORAGE_KEYS.language, 'en');
    return saved === 'bn' || saved === 'hi' || saved === 'en' ? saved : 'en';
  });
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    loadSaved<CurrencyCode>(STORAGE_KEYS.currency, 'USD')
  );
  const [projects, setProjects] = useState<CaseStudy[]>(() =>
    loadSaved<CaseStudy[]>(STORAGE_KEYS.projects, INITIAL_CASE_STUDIES)
  );
  const [inquiries, setInquiries] = useState<ClientInquiry[]>(() =>
    loadSaved<ClientInquiry[]>(STORAGE_KEYS.inquiries, INITIAL_INQUIRIES)
  );

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryDefaultTitle, setInquiryDefaultTitle] = useState('');
  const [preselectedInquiryForAi, setPreselectedInquiryForAi] =
    useState<ClientInquiry | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.inquiries, JSON.stringify(inquiries));
    } catch {
      // ignore
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.currency, JSON.stringify(currency));
    } catch {
      // ignore
    }
  }, [currency]);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language));
    } catch {
      // ignore
    }
  }, [language]);

  const handleSubmitInquiry = (payload: {
    clientName: string;
    clientEmail: string;
    company: string;
    projectTitle: string;
    brief: string;
    budgetUsd: number;
    timelineWeeks: number;
    recommendedStack: string[];
  }): ClientInquiry => {
    const created: ClientInquiry = {
      id: getNextInquiryId(inquiries),
      createdAt: new Date().toISOString(),
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      company: payload.company,
      projectTitle: payload.projectTitle,
      brief: payload.brief,
      budgetUsd: payload.budgetUsd,
      timelineWeeks: payload.timelineWeeks,
      status: 'New Lead',
      recommendedStack: payload.recommendedStack,
    };
    setInquiries((prev) => [created, ...prev]);
    return created;
  };

  const handleSaveEstimateAsLead = (payload: {
    projectTitle: string;
    brief: string;
    budgetUsd: number;
    timelineWeeks: number;
    recommendedStack: string[];
  }): ClientInquiry => {
    const created: ClientInquiry = {
      id: getNextInquiryId(inquiries),
      createdAt: new Date().toISOString(),
      clientName: 'Prospective Client (AI Estimate)',
      clientEmail: 'pending@client.com',
      company: 'AI Scoped Lead',
      projectTitle: payload.projectTitle,
      brief: payload.brief,
      budgetUsd: payload.budgetUsd,
      timelineWeeks: payload.timelineWeeks,
      status: 'New Lead',
      recommendedStack: payload.recommendedStack,
    };
    setInquiries((prev) => [created, ...prev]);
    return created;
  };

  const handleUpdateInquiryStatus = (id: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const handleDeleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  const handleSaveCaseStudy = (project: CaseStudy) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        return prev.map((p) => (p.id === project.id ? project : p));
      }
      return [project, ...prev];
    });
  };

  const handleDeleteCaseStudy = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-zinc-950">
      <DevHeader
        brandName="Badhan.dev"
        activeTab={activeTab}
        t={t}
        onSelectTab={setActiveTab}
        onOpenInquiry={() => {
          setInquiryDefaultTitle('');
          setIsInquiryOpen(true);
        }}
      />

      <main className="flex-1">
        {activeTab === 'work' && (
          <WorkView
            projects={projects}
            testimonials={TESTIMONIALS}
            language={language}
            onChangeLanguage={setLanguage}
            t={t}
            onGoToAiEstimator={() => setActiveTab('ai-studio')}
            onGoToServices={() => setActiveTab('services')}
            onStartSimilarProject={(title) => {
              setInquiryDefaultTitle(title);
              setIsInquiryOpen(true);
            }}
          />
        )}

        {activeTab === 'services' && (
          <ServicesView
            services={SERVICE_PACKAGES}
            currency={currency}
            t={t}
            onSelectPackage={(pkg) => {
              setInquiryDefaultTitle(pkg.title);
              setIsInquiryOpen(true);
            }}
            onOpenAiEstimator={() => setActiveTab('ai-studio')}
          />
        )}

        {activeTab === 'clients' && (
          <ClientHubView
            inquiries={inquiries}
            projects={projects}
            currency={currency}
            t={t}
            onUpdateInquiryStatus={handleUpdateInquiryStatus}
            onDeleteInquiry={handleDeleteInquiry}
            onSaveCaseStudy={handleSaveCaseStudy}
            onDeleteCaseStudy={handleDeleteCaseStudy}
            onOpenAiProposalForInquiry={(inq) => {
              setPreselectedInquiryForAi(inq);
              setActiveTab('ai-studio');
            }}
            onOpenInquiryModal={() => {
              setInquiryDefaultTitle('');
              setIsInquiryOpen(true);
            }}
          />
        )}

        {activeTab === 'ai-studio' && (
          <DevAiStudioView
            developerName="Badhan Saha"
            currency={currency}
            language={language}
            t={t}
            projects={projects}
            services={SERVICE_PACKAGES}
            inquiries={inquiries}
            preselectedInquiry={preselectedInquiryForAi}
            onConsumePreselectedInquiry={() => setPreselectedInquiryForAi(null)}
            onSaveEstimateAsLead={handleSaveEstimateAsLead}
          />
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-semibold text-zinc-900">Badhan.dev</span>
            <span aria-hidden="true">·</span>
            <span>{t.footer.tagline}</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
              {FOOTER_LANGUAGES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLanguage(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    language === opt.id
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-1 border border-zinc-200 rounded-lg p-0.5 bg-zinc-50">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                USD $
              </button>
              <button
                type="button"
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer ${
                  currency === 'BDT'
                    ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                BDT ৳
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setProjects(INITIAL_CASE_STUDIES);
                setInquiries(INITIAL_INQUIRIES);
                sessionStorage.removeItem('dev_ai_last_estimate');
                sessionStorage.removeItem('dev_ai_last_proposal');
              }}
              className="text-zinc-500 hover:text-zinc-900 underline underline-offset-2 cursor-pointer"
            >
              {t.footer.resetDemo}
            </button>
          </div>
        </div>
      </footer>

      <ProjectInquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        defaultProjectTitle={inquiryDefaultTitle}
        t={t}
        onSubmitInquiry={handleSubmitInquiry}
        onViewInClientHub={() => setActiveTab('clients')}
      />

      <FloatingChatBox
        developerName="Badhan Saha"
        currency={currency}
        language={language}
        onChangeLanguage={setLanguage}
        t={t}
        projects={projects}
        services={SERVICE_PACKAGES}
        inquiries={inquiries}
        onStartProject={() => {
          setInquiryDefaultTitle('');
          setIsInquiryOpen(true);
        }}
        onOpenAiStudio={() => setActiveTab('ai-studio')}
      />
    </div>
  );
}
