export type CurrencyCode = 'USD' | 'BDT';

export type DevWorkspaceTab = 'work' | 'services' | 'clients' | 'ai-studio';

export type ProjectDiscipline =
  | 'SaaS & Dashboards'
  | 'E-Commerce'
  | 'Developer Tools'
  | 'AI Systems';

export interface CaseStudy {
  id: string;
  title: string;
  client: string;
  year: string;
  discipline: ProjectDiscipline;
  role: string;
  stack: string[];
  outcomeMetric: string;
  summary: string;
  challenge: string;
  solution: string;
  imageUrl: string;
  liveUrl?: string;
}

export interface ServicePackage {
  id: string;
  index: string;
  title: string;
  audience: string;
  timeline: string;
  startingPriceUsd: number;
  summary: string;
  deliverables: string[];
}

export type InquiryStatus = 'New Lead' | 'Proposal Sent' | 'In Progress' | 'Shipped';

export interface ClientInquiry {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  company: string;
  projectTitle: string;
  brief: string;
  budgetUsd: number;
  timelineWeeks: number;
  status: InquiryStatus;
  recommendedStack: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  role: string;
  company: string;
  projectRef: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ScopeEstimate {
  projectTitle: string;
  executiveSummary: string;
  recommendedStack: string[];
  coreModules: Array<{
    moduleName: string;
    deliverables: string;
    estimatedDays: number;
  }>;
  milestones: Array<{
    phase: string;
    duration: string;
    outcome: string;
  }>;
  totalWeeks: number;
  estimatedCostUsd: number;
  technicalRisks: string[];
}

export interface ProposalDraft {
  emailSubject: string;
  proposalEmail: string;
  whatsappPitch: string;
  discoveryQuestions: string[];
}
