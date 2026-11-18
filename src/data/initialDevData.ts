import {
  CaseStudy,
  ClientInquiry,
  CurrencyCode,
  ServicePackage,
  Testimonial,
} from '../types/dev';

export const HERO_DEV_IMAGE_URL =
  '/src/assets/images/hero_web_developer_1795003679153.jpg';

const BDT_PER_USD = 120;

export function formatDevMoney(amountUsd: number, currency: CurrencyCode): string {
  if (currency === 'BDT') {
    const bdt = Math.round(amountUsd * BDT_PER_USD);
    return `৳${bdt.toLocaleString('en-US')}`;
  }
  return `$${Math.round(amountUsd).toLocaleString('en-US')}`;
}

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-finledger',
    title: 'FinLedger Multi-Currency Treasury & Payout Portal',
    client: 'DhakaPay Commerce',
    year: '2026',
    discipline: 'SaaS & Dashboards',
    role: 'Lead Full-Stack Engineer',
    stack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    outcomeMetric: '-64% payout reconciliation time across 1,400+ merchants',
    summary:
      'High-density treasury console unifying merchant settlements, automated ledger audits, and real-time webhook diagnostics.',
    challenge:
      'Finance teams were reconciling CSV settlement batches manually across three payment gateways, causing 18-hour payout delays.',
    solution:
      'Built an idempotent double-entry ledger API with real-time transaction indexing, role-based approvals, and instant audit exports.',
    imageUrl: '/src/assets/images/project_fintech_ui_1795003680639.jpg',
  },
  {
    id: 'case-nomad-commerce',
    title: 'Nomad Atlas Headless Storefront & Counter POS',
    client: 'Nomad Apparel Ltd.',
    year: '2026',
    discipline: 'E-Commerce',
    role: 'Full-Stack Architect',
    stack: ['Next.js', 'TypeScript', 'Express', 'Stripe & bKash', 'Gemini AI'],
    outcomeMetric: '+41% mobile checkout conversion within 90 days',
    summary:
      'Omnichannel retail storefront synced directly with showroom counter POS inventory and AI-assisted product discovery.',
    challenge:
      'Separate online and showroom inventory systems caused overselling during seasonal drops and slow mobile page loads.',
    solution:
      'Unified stock reservations behind a low-latency REST engine, cutting LCP to 1.1s and adding verified COD checkout.',
    imageUrl: '/src/assets/images/project_commerce_ui_1795003680922.jpg',
  },
  {
    id: 'case-deploygrid',
    title: 'DeployGrid CI/CD Telemetry & Edge API Monitor',
    client: 'KiteScale Systems',
    year: '2025',
    discipline: 'Developer Tools',
    role: 'Frontend & Systems Engineer',
    stack: ['React', 'TypeScript', 'WebSockets', 'Go API', 'Docker'],
    outcomeMetric: '380ms median incident triage across 22 edge regions',
    summary:
      'Real-time release pipeline console tracking build stages, p99 latency spikes, and automated rollback triggers.',
    challenge:
      'Engineers switched between four separate logging tools during production deploys to isolate regressions.',
    solution:
      'Designed a unified keyboard-first pipeline timeline streaming structured release events over WebSockets.',
    imageUrl: '/src/assets/images/project_realtime_ui_1795003680962.jpg',
  },
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-mvp',
    index: '01',
    title: 'MVP Product Sprint',
    audience: 'For founders launching a validated V1 web app',
    timeline: '3–4 Weeks',
    startingPriceUsd: 1200,
    summary:
      'Production-ready React/Next.js frontend, backend API routes, database schema, authentication, and deployment pipeline.',
    deliverables: [
      'Responsive UI built in React, TypeScript & Tailwind',
      'REST API & relational database setup with validation',
      'Optional Gemini AI assistant or automation endpoint',
      'Production deployment with CI/CD & documentation',
    ],
  },
  {
    id: 'pkg-commerce',
    index: '02',
    title: 'Custom Commerce & Business Platform',
    audience: 'For growing retail brands & B2B operations',
    timeline: '5–7 Weeks',
    startingPriceUsd: 2400,
    summary:
      'Tailored online storefront paired with inventory control, POS billing, local payment gateways, and automated reporting.',
    deliverables: [
      'Storefront catalog with cart, COD & digital payments',
      'Admin operations dashboard for orders, SKUs & margins',
      'AI-assisted copywriter or customer support chat',
      'Core Web Vitals optimization & SEO metadata',
    ],
  },
  {
    id: 'pkg-retainer',
    index: '03',
    title: 'Dedicated Engineering Retainer',
    audience: 'For teams needing continuous feature velocity',
    timeline: 'Monthly (80 hrs/mo)',
    startingPriceUsd: 1800,
    summary:
      'Ongoing senior frontend & backend development, performance audits, third-party API integrations, and technical mentorship.',
    deliverables: [
      'Weekly sprint shipping with pull request reviews',
      'API latency optimization & bug resolution SLA',
      'Direct Slack/WhatsApp collaboration & roadmap planning',
      'Architecture documentation & automated test coverage',
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    quote:
      'Before working with Badhan, our settlement team spent every morning cross-checking spreadsheets. His ledger dashboard cut reconciliation time by over 60% in the first month.',
    authorName: 'Mahmudul Hasan',
    role: 'VP of Operations',
    company: 'DhakaPay Commerce',
    projectRef: 'FinLedger Portal',
  },
  {
    id: 'test-2',
    quote:
      'He rebuilt our storefront and showroom stock sync without interrupting live sales. Mobile conversion jumped 41% and our staff now runs counter billing from the same system.',
    authorName: 'Sadia Afrin',
    role: 'Co-Founder',
    company: 'Nomad Apparel Ltd.',
    projectRef: 'Nomad Atlas Commerce',
  },
];

export const INITIAL_INQUIRIES: ClientInquiry[] = [
  {
    id: 'REQ-208',
    createdAt: '2026-11-17T11:20:00.000Z',
    clientName: 'Arifur Rahman',
    clientEmail: 'arif@auroraclinic.com',
    company: 'Aurora Diagnostics',
    projectTitle: 'Patient Portal & AI Lab Report Explainer',
    brief:
      'Need a web portal where patients can book diagnostic slots, download PDF reports, and ask basic questions in Bangla/English.',
    budgetUsd: 2800,
    timelineWeeks: 6,
    status: 'Proposal Sent',
    recommendedStack: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Gemini AI'],
  },
  {
    id: 'REQ-207',
    createdAt: '2026-11-15T15:45:00.000Z',
    clientName: 'Elena Vance',
    clientEmail: 'elena@gridform.io',
    company: 'GridForm Studio',
    projectTitle: 'Interactive Architecture Portfolio & CMS',
    brief:
      'Minimalist portfolio site with filterable project archive, fast image loading, and private client review links.',
    budgetUsd: 1500,
    timelineWeeks: 4,
    status: 'In Progress',
    recommendedStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
  },
  {
    id: 'REQ-206',
    createdAt: '2026-11-11T09:10:00.000Z',
    clientName: 'Kamrul Hasan',
    clientEmail: 'kamrul@swiftcargo.bd',
    company: 'SwiftCargo Logistics',
    projectTitle: 'Courier Tracking & Merchant Billing Dashboard',
    brief:
      'Real-time parcel tracking page for buyers plus merchant COD settlement dashboard.',
    budgetUsd: 3200,
    timelineWeeks: 7,
    status: 'New Lead',
    recommendedStack: ['React', 'Node.js', 'PostgreSQL', 'REST API'],
  },
];
