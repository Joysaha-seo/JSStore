import { AppLanguage, ProjectDiscipline } from '../types/dev';

export interface TranslationPack {
  langLabel: string;
  nav: {
    work: string;
    services: string;
    clients: string;
    aiStudio: string;
    startProject: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subcopy: string;
    ctaPrimary: string;
    ctaSecondary: string;
    languageLabel: string;
    stats: [
      { value: string; label: string },
      { value: string; label: string },
      { value: string; label: string },
      { value: string; label: string },
    ];
  };
  work: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    emptyTitle: string;
    showAll: string;
    readCase: string;
    outcomesHeading: string;
    outcomesSubheading: string;
    viewPackages: string;
    modalOutcomePrefix: string;
    modalChallenge: string;
    modalSolution: string;
    modalStack: string;
    requestSimilar: string;
    livePreview: string;
    disciplines: Record<'All' | ProjectDiscipline, string>;
  };
  services: {
    kicker: string;
    heading: string;
    subcopy: string;
    ctaEstimate: string;
    packagesHeading: string;
    packagesSubheading: string;
    startingAt: string;
    requestPrefix: string;
    stackHeading: string;
    capabilities: Array<{ num: string; title: string; detail: string }>;
  };
  clientHub: {
    heading: string;
    subheading: string;
    addCaseStudy: string;
    newClientLead: string;
    pipelineValue: string;
    openLeads: string;
    activeBuilds: string;
    publishedShipped: string;
    leadsHeading: string;
    searchPlaceholder: string;
    allStages: string;
    noInquiries: string;
    noInquiriesHint: string;
    colRef: string;
    colClient: string;
    colProject: string;
    colTimeline: string;
    colEstimate: string;
    colStage: string;
    colActions: string;
    aiProposalBtn: string;
    quoteBtn: string;
    publishedHeading: string;
    editBtn: string;
    removeBtn: string;
    printQuoteBtn: string;
  };
  aiStudio: {
    heading: string;
    subheading: string;
    tabEstimator: string;
    tabProposal: string;
    tabCopilot: string;
    estimatorHeading: string;
    estimatorHint: string;
    ideaLabel: string;
    ideaPlaceholder: string;
    platformLabel: string;
    speedLabel: string;
    generateEstimateBtn: string;
    estimatingBtn: string;
    noEstimateTitle: string;
    noEstimateHint: string;
    saveToHubBtn: string;
    draftFromEstimateBtn: string;
    proposalHeading: string;
    loadLeadLabel: string;
    manualEntry: string;
    draftProposalBtn: string;
    draftingProposalBtn: string;
    noProposalTitle: string;
    noProposalHint: string;
    copilotArchitectTitle: string;
    copilotClientTitle: string;
    modeArchitect: string;
    modeClient: string;
    clearBtn: string;
    sendBtn: string;
    stopBtn: string;
    chatPlaceholder: string;
  };
  inquiryModal: {
    title: string;
    subtitle: string;
    submittedTitle: string;
    submittedSubtitle: string;
    openClientHub: string;
    done: string;
    nameLabel: string;
    emailLabel: string;
    companyLabel: string;
    projectTitleLabel: string;
    stackLabel: string;
    budgetLabel: string;
    timelineLabel: string;
    briefLabel: string;
    briefPlaceholder: string;
    submitBtn: string;
    validationError: string;
  };
  chatBox: {
    buttonLabel: string;
    headerTitle: string;
    headerSub: string;
    clientMode: string;
    devMode: string;
    bookCall: string;
    placeholder: string;
    welcome: string;
    typing: string;
    retryBtn: string;
    quickPromptsClient: string[];
    quickPromptsDev: string[];
  };
  footer: {
    tagline: string;
    resetDemo: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationPack> = {
  en: {
    langLabel: 'English',
    nav: {
      work: 'Work',
      services: 'Services',
      clients: 'Client Hub',
      aiStudio: 'AI Studio',
      startProject: 'Start a Project',
    },
    hero: {
      kicker: 'Full-Stack Web Developer · React, TypeScript, Node.js & AI',
      headline: 'I Design and Ship Production Web Apps, APIs, and AI Systems.',
      subcopy:
        'Independent software engineer building fast customer storefronts, multi-tenant SaaS dashboards, and reliable backend architectures for founders and growing teams.',
      ctaPrimary: 'View Selected Work',
      ctaSecondary: 'Estimate Project with AI',
      languageLabel: 'Language',
      stats: [
        { value: '34+', label: 'Production web apps & APIs shipped since 2021' },
        { value: '99.95%', label: 'Measured production uptime across managed deployments' },
        { value: '< 450ms', label: 'Median API response time across client platforms' },
        { value: '3–6 Weeks', label: 'Typical sprint from technical spec to live launch' },
      ],
    },
    work: {
      heading: 'Selected Case Studies',
      subheading: 'Architecture decisions, shipped interfaces, and measurable business outcomes.',
      searchPlaceholder: 'Filter by stack or client...',
      emptyTitle: 'No case studies match this filter',
      showAll: 'Show All Work',
      readCase: 'Read Case',
      outcomesHeading: 'Client Outcomes',
      outcomesSubheading: 'Direct feedback from engineering leaders and founders.',
      viewPackages: 'View Service Packages →',
      modalOutcomePrefix: 'Outcome:',
      modalChallenge: 'The Challenge',
      modalSolution: 'Engineering Solution',
      modalStack: 'Technical Stack',
      requestSimilar: 'Request Similar Build',
      livePreview: 'Live Preview',
      disciplines: {
        All: 'All',
        'SaaS & Dashboards': 'SaaS & Dashboards',
        'E-Commerce': 'E-Commerce',
        'Developer Tools': 'Developer Tools',
        'AI Systems': 'AI Systems',
      },
    },
    services: {
      kicker: 'Engineering Capabilities',
      heading: 'Clear Scope, Direct Code Ownership, and Measurable Speed.',
      subcopy:
        'Every engagement includes clean source repository handoff, deployment setup, and zero vendor lock-in.',
      ctaEstimate: 'Calculate Custom Estimate with AI',
      packagesHeading: 'Engagement Packages',
      packagesSubheading:
        'Fixed-scope sprints or monthly engineering retainers tailored to product stage.',
      startingAt: 'Starting at',
      requestPrefix: 'Request',
      stackHeading: 'Core Production Stack',
      capabilities: [
        {
          num: '01.',
          title: 'Full-Stack Web Applications',
          detail:
            'End-to-end architecture in React, TypeScript, Next.js, and Node.js with strict type safety, clean REST/GraphQL APIs, and PostgreSQL data modeling.',
        },
        {
          num: '02.',
          title: 'Headless E-Commerce & POS Integrations',
          detail:
            'Fast conversion-focused storefronts paired with inventory sync, Cash on Delivery verification, Stripe, SSLCommerz/bKash, and printable invoicing.',
        },
        {
          num: '03.',
          title: 'Applied Gemini AI & Workflow Automation',
          detail:
            'Server-side LLM features including streaming customer copilots, structured JSON data extraction, document Q&A, and automated proposal generation.',
        },
        {
          num: '04.',
          title: 'Core Web Vitals & Legacy Refactoring',
          detail:
            'Bundle splitting, database query indexing, accessibility hardening (WCAG AA), and migrating brittle codebases to maintainable TypeScript modules.',
        },
      ],
    },
    clientHub: {
      heading: 'Client Hub & Portfolio Manager',
      subheading:
        'Track freelance inquiries, generate printable quotes & AI proposals, and manage published case studies.',
      addCaseStudy: 'Add Case Study',
      newClientLead: 'New Client Lead',
      pipelineValue: 'Total Pipeline Value',
      openLeads: 'Open Leads & Proposals',
      activeBuilds: 'Active Client Builds',
      publishedShipped: 'Published & Shipped',
      leadsHeading: 'Client Leads & Active Projects',
      searchPlaceholder: 'Search client or project...',
      allStages: 'All Stages',
      noInquiries: 'No client inquiries found',
      noInquiriesHint: 'Add a new lead or generate an AI scope estimate in AI Studio.',
      colRef: 'Ref',
      colClient: 'Client',
      colProject: 'Project & Stack',
      colTimeline: 'Timeline',
      colEstimate: 'Estimate',
      colStage: 'Stage',
      colActions: 'Actions',
      aiProposalBtn: 'AI Proposal',
      quoteBtn: 'Quote',
      publishedHeading: 'Published Portfolio Case Studies',
      editBtn: 'Edit',
      removeBtn: 'Remove',
      printQuoteBtn: 'Print / Save PDF Quote',
    },
    aiStudio: {
      heading: 'Web Developer AI Studio',
      subheading:
        'AI project scope & cost estimator, multilingual proposal writer, and technical architect copilot.',
      tabEstimator: 'Scope & Cost Estimator',
      tabProposal: 'Proposal Writer',
      tabCopilot: 'Architect Copilot',
      estimatorHeading: 'Estimate Technical Scope & Budget',
      estimatorHint:
        'Paste a client requirement in English, বাংলা, or Banglish to generate a structured build plan.',
      ideaLabel: 'Project Idea / Client Requirements',
      ideaPlaceholder:
        'e.g. Need an online booking & telemedicine portal with doctor profiles, bKash checkout, patient dashboard, and admin analytics...',
      platformLabel: 'Target Architecture',
      speedLabel: 'Delivery Speed',
      generateEstimateBtn: 'Generate Scope & Cost Estimate',
      estimatingBtn: 'Generating Technical Scope...',
      noEstimateTitle: 'No technical scope generated yet',
      noEstimateHint:
        'Describe the web application on the left to receive a module-by-module day breakdown, recommended stack, milestone schedule, and investment estimate.',
      saveToHubBtn: 'Save Estimate to Client Hub',
      draftFromEstimateBtn: 'Draft Proposal from Estimate',
      proposalHeading: 'AI Client Proposal & Pitch Writer',
      loadLeadLabel: 'Load from Client Hub Lead',
      manualEntry: 'Custom / Manual Entry',
      draftProposalBtn: 'Draft Proposal & Pitch',
      draftingProposalBtn: 'Drafting Proposal...',
      noProposalTitle: 'Ready to write client proposals',
      noProposalHint:
        'Select a lead from Client Hub or enter a brief to generate a ready-to-send email, WhatsApp pitch, and discovery questions.',
      copilotArchitectTitle: 'Full-Stack Architecture & Business Copilot',
      copilotClientTitle: 'Prospective Client Q&A Assistant',
      modeArchitect: 'Tech Architect',
      modeClient: 'Client Advisor',
      clearBtn: 'Clear',
      sendBtn: 'Send',
      stopBtn: 'Stop',
      chatPlaceholder: 'Ask about database schema, API design, or project pricing...',
    },
    inquiryModal: {
      title: 'Start a Web Development Project',
      subtitle: 'Share your goals and timeline to schedule a technical call.',
      submittedTitle: 'Inquiry Received',
      submittedSubtitle: 'Logged directly in Client Hub for scoping.',
      openClientHub: 'Open in Client Hub',
      done: 'Done',
      nameLabel: 'Your Name',
      emailLabel: 'Email Address',
      companyLabel: 'Company / Brand',
      projectTitleLabel: 'Project Title',
      stackLabel: 'Preferred Architecture / Stack',
      budgetLabel: 'Target Budget (USD)',
      timelineLabel: 'Target Timeline (Weeks)',
      briefLabel: 'Project Brief (English, বাংলা, or Banglish)',
      briefPlaceholder:
        'Describe key features, user roles, integrations (payment, AI, dashboard), and launch goals...',
      submitBtn: 'Submit Project Inquiry',
      validationError:
        'Please enter your name, a valid email address, and a brief project description.',
    },
    chatBox: {
      buttonLabel: 'Chat',
      headerTitle: 'Chat with Badhan AI',
      headerSub: 'English · বাংলা · Banglish',
      clientMode: 'Client Q&A',
      devMode: 'Dev Mode',
      bookCall: 'Book a Call →',
      placeholder: 'Type your message...',
      welcome:
        "Hi! Ask anything about Badhan Saha's web development services, project pricing, timelines, or technical stack in English, বাংলা, or Banglish.",
      typing: 'Typing...',
      retryBtn: 'Retry',
      quickPromptsClient: [
        'What services and packages do you offer?',
        'Web app banate koto din ar koto budget lagbe?',
        'Show me your e-commerce and SaaS case studies',
      ],
      quickPromptsDev: [
        'Suggest a fast stack for a multi-tenant SaaS MVP',
        'Review my active client leads and next steps',
        'How should I structure bKash + COD checkout?',
      ],
    },
    footer: {
      tagline: 'Full-Stack Web Engineering & AI Integration',
      resetDemo: 'Reset Demo Data',
    },
  },

  bn: {
    langLabel: 'বাংলা',
    nav: {
      work: 'প্রজেক্টসমূহ',
      services: 'সার্ভিস ও প্যাকেজ',
      clients: 'ক্লায়েন্ট হাব',
      aiStudio: 'AI স্টুডিও',
      startProject: 'প্রজেক্ট শুরু করুন',
    },
    hero: {
      kicker: 'ফুল-স্ট্যাক ওয়েব ডেভেলপার · React, TypeScript, Node.js ও AI',
      headline: 'আমি প্রোডাকশন-রেডি ওয়েব অ্যাপ, API এবং AI সিস্টেম তৈরি করি।',
      subcopy:
        'স্টার্টআপ ও ব্যবসার জন্য দ্রুতগতির ই-কমার্স স্টোরফ্রন্ট, SaaS ড্যাশবোর্ড এবং নির্ভরযোগ্য ব্যাকএন্ড আর্কিটেকচার ডিজাইন ও ডেভেলপ করি।',
      ctaPrimary: 'নির্বাচিত কাজ দেখুন',
      ctaSecondary: 'AI দিয়ে খরচ ও সময় জানুন',
      languageLabel: 'ভাষা',
      stats: [
        { value: '৩৪+', label: '২০২১ সাল থেকে প্রোডাকশনে লাইভ ওয়েব অ্যাপ ও API' },
        { value: '৯৯.৯৫%', label: 'ম্যানেজড প্রোডাকশন সার্ভার আপটাইম রেকর্ড' },
        { value: '< ৪৫০ms', label: 'ক্লায়েন্ট প্ল্যাটফর্মের গড় API রেসপন্স সময়' },
        { value: '৩–৬ সপ্তাহ', label: 'টেকনিক্যাল প্ল্যান থেকে লাইভ লঞ্চের সাধারণ সময়' },
      ],
    },
    work: {
      heading: 'নির্বাচিত কেস স্টাডি',
      subheading: 'আর্কিটেকচার সিদ্ধান্ত, লাইভ ইন্টারফেস এবং বাস্তব ব্যবসায়িক ফলাফল।',
      searchPlaceholder: 'টেক স্ট্যাক বা ক্লায়েন্ট খুঁজুন...',
      emptyTitle: 'এই ফিল্টারে কোনো প্রজেক্ট পাওয়া যায়নি',
      showAll: 'সব প্রজেক্ট দেখুন',
      readCase: 'বিস্তারিত দেখুন',
      outcomesHeading: 'ক্লায়েন্টদের অভিজ্ঞতা',
      outcomesSubheading: 'ফাউন্ডার ও অপারেশন টিমের সরাসরি মতামত।',
      viewPackages: 'সার্ভিস প্যাকেজ দেখুন →',
      modalOutcomePrefix: 'ফলাফল:',
      modalChallenge: 'মূল চ্যালেঞ্জ',
      modalSolution: 'ইঞ্জিনিয়ারিং সমাধান',
      modalStack: 'ব্যবহৃত টেক স্ট্যাক',
      requestSimilar: 'অনুরূপ প্রজেক্টের অনুরোধ করুন',
      livePreview: 'লাইভ প্রিভিউ',
      disciplines: {
        All: 'সবগুলো',
        'SaaS & Dashboards': 'SaaS ও ড্যাশবোর্ড',
        'E-Commerce': 'ই-কমার্স',
        'Developer Tools': 'ডেভেলপার টুলস',
        'AI Systems': 'AI সিস্টেম',
      },
    },
    services: {
      kicker: 'ইঞ্জিনিয়ারিং সক্ষমতা',
      heading: 'স্পষ্ট স্কোপ, সম্পূর্ণ কোড মালিকানা এবং দ্রুত ডেলিভারি।',
      subcopy:
        'প্রতিটি প্রজেক্টে ক্লিন সোর্স কোড রিপোজিটরি, ডিপ্লয়মেন্ট সেটআপ এবং পূর্ণ নিয়ন্ত্রণ দেওয়া হয়।',
      ctaEstimate: 'AI দিয়ে কাস্টম বাজেট হিসাব করুন',
      packagesHeading: 'সার্ভিস প্যাকেজসমূহ',
      packagesSubheading:
        'প্রজেক্টের ধরন অনুযায়ী ফিক্সড-স্কোপ স্প্রিন্ট অথবা মাসিক ডেডিকেটেড সার্ভিস।',
      startingAt: 'শুরু হচ্ছে',
      requestPrefix: 'অনুরোধ করুন:',
      stackHeading: 'প্রোডাকশন টেকনোলজি স্ট্যাক',
      capabilities: [
        {
          num: '০১.',
          title: 'ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন',
          detail:
            'React, TypeScript, Next.js এবং Node.js দিয়ে টাইপ-সেফ ফ্রন্টএন্ড, REST/GraphQL API এবং PostgreSQL ডেটাবেস আর্কিটেকচার।',
        },
        {
          num: '০২.',
          title: 'ই-কমার্স স্টোরফ্রন্ট ও POS সিস্টেম',
          detail:
            'দ্রুতগতির অনলাইন শপ, লাইভ ইনভেন্টরি সিঙ্ক, ক্যাশ অন ডেলিভারি (COD) ভেরিফিকেশন, bKash/SSLCommerz/Stripe এবং প্রিন্টেবল ইনভয়েস।',
        },
        {
          num: '০৩.',
          title: 'Gemini AI ও বিজনেস অটোমেশন',
          detail:
            'সার্ভার-সাইড AI চ্যাট অ্যাসিস্ট্যান্ট, অটোমেটেড প্রোডাক্ট/প্রপোজাল রাইটার এবং স্মার্ট বিজনেস রিপোর্টিং ইন্টিগ্রেশন।',
        },
        {
          num: '০৪.',
          title: 'পারফরম্যান্স অপ্টিমাইজেশন ও রিফ্যাক্টরিং',
          detail:
            'পেজ স্পিড বৃদ্ধি, ডেটাবেস কুয়েরি অপ্টিমাইজেশন, WCAG অ্যাক্সেসিবিলিটি এবং পুরনো কোড আধুনিক TypeScript-এ রূপান্তর।',
        },
      ],
    },
    clientHub: {
      heading: 'ক্লায়েন্ট হাব ও পোর্টফোলিও ম্যানেজার',
      subheading:
        'ক্লায়েন্ট ইনকোয়ারি ট্র্যাক করুন, প্রিন্টেবল কোট/ইনভয়েস ও AI প্রপোজাল তৈরি করুন এবং কেস স্টাডি পরিচালনা করুন।',
      addCaseStudy: 'কেস স্টাডি যোগ করুন',
      newClientLead: 'নতুন ক্লায়েন্ট লিড',
      pipelineValue: 'মোট পাইপলাইন ভ্যালু',
      openLeads: 'চলমান লিড ও প্রপোজাল',
      activeBuilds: 'চলমান ডেভেলপমেন্ট',
      publishedShipped: 'প্রকাশিত ও সম্পন্ন',
      leadsHeading: 'ক্লায়েন্ট লিড ও প্রজেক্ট তালিকা',
      searchPlaceholder: 'ক্লায়েন্ট বা প্রজেক্ট খুঁজুন...',
      allStages: 'সব ধাপ',
      noInquiries: 'কোনো ক্লায়েন্ট ইনকোয়ারি পাওয়া যায়নি',
      noInquiriesHint: 'নতুন লিড যোগ করুন অথবা AI Studio থেকে প্রজেক্ট এস্টিমেট সেভ করুন।',
      colRef: 'রেফারেন্স',
      colClient: 'ক্লায়েন্ট',
      colProject: 'প্রজেক্ট ও স্ট্যাক',
      colTimeline: 'সময়কাল',
      colEstimate: 'বাজেট',
      colStage: 'অবস্থা',
      colActions: 'অ্যাকশন',
      aiProposalBtn: 'AI প্রপোজাল',
      quoteBtn: 'কোট / বিল',
      publishedHeading: 'প্রকাশিত পোর্টফোলিও কেস স্টাডি',
      editBtn: 'এডিট',
      removeBtn: 'মুছুন',
      printQuoteBtn: 'কোট প্রিন্ট / PDF সেভ করুন',
    },
    aiStudio: {
      heading: 'ওয়েব ডেভেলপার AI স্টুডিও',
      subheading:
        'AI প্রজেক্ট স্কোপ ও বাজেট এস্টিমেটর, বহুভাষিক প্রপোজাল রাইটার এবং টেকনিক্যাল আর্কিটেক্ট কপাইলট।',
      tabEstimator: 'স্কোপ ও বাজেট এস্টিমেটর',
      tabProposal: 'প্রপোজাল রাইটার',
      tabCopilot: 'আর্কিটেক্ট কপাইলট',
      estimatorHeading: 'প্রজেক্ট স্কোপ ও বাজেট নির্ণয় করুন',
      estimatorHint:
        'ক্লায়েন্টের চাহিদা বাংলা, ইংরেজি বা বাংলিশে লিখুন—AI সম্পূর্ণ মডিউল ও বাজেট পরিকল্পনা তৈরি করবে।',
      ideaLabel: 'প্রজেক্টের ধারণা / ক্লায়েন্টের চাহিদা',
      ideaPlaceholder:
        'যেমন: আমার একটি ক্লিনিক বুকিং ও টেলিমেডিসিন ওয়েবসাইট লাগবে যেখানে bKash পেমেন্ট, ডক্টর প্রোফাইল ও অ্যাডমিন ড্যাশবোর্ড থাকবে...',
      platformLabel: 'টার্গেট আর্কিটেকচার',
      speedLabel: 'ডেলিভারি সময়',
      generateEstimateBtn: 'স্কোপ ও বাজেট তৈরি করুন',
      estimatingBtn: 'টেকনিক্যাল প্ল্যান তৈরি হচ্ছে...',
      noEstimateTitle: 'এখনো কোনো স্কোপ তৈরি করা হয়নি',
      noEstimateHint:
        'বাম পাশে প্রজেক্টের বিবরণ লিখে সাবমিট করলে মডিউল-ভিত্তিক সময়, টেক স্ট্যাক ও আনুমানিক খরচ দেখতে পাবেন।',
      saveToHubBtn: 'Client Hub-এ সেভ করুন',
      draftFromEstimateBtn: 'এই এস্টিমেট থেকে প্রপোজাল লিখুন',
      proposalHeading: 'AI ক্লায়েন্ট প্রপোজাল ও পিচ রাইটার',
      loadLeadLabel: 'Client Hub লিড থেকে লোড করুন',
      manualEntry: 'নিজে থেকে তথ্য লিখুন',
      draftProposalBtn: 'প্রপোজাল তৈরি করুন',
      draftingProposalBtn: 'প্রপোজাল লেখা হচ্ছে...',
      noProposalTitle: 'ক্লায়েন্ট প্রপোজাল লেখার জন্য প্রস্তুত',
      noProposalHint:
        'Client Hub থেকে একটি লিড সিলেক্ট করুন বা প্রজেক্ট ব্রিফ লিখে ইমেইল ও WhatsApp পিচ তৈরি করুন।',
      copilotArchitectTitle: 'ফুল-স্ট্যাক আর্কিটেকচার ও বিজনেস কপাইলট',
      copilotClientTitle: 'ক্লায়েন্ট প্রশ্নোত্তর অ্যাসিস্ট্যান্ট',
      modeArchitect: 'টেক আর্কিটেক্ট',
      modeClient: 'ক্লায়েন্ট গাইড',
      clearBtn: 'মুছুন',
      sendBtn: 'পাঠান',
      stopBtn: 'থামান',
      chatPlaceholder: 'ডেটাবেস, API ডিজাইন বা প্রজেক্ট খরচ সম্পর্কে জিজ্ঞাসা করুন...',
    },
    inquiryModal: {
      title: 'নতুন ওয়েব প্রজেক্ট শুরু করুন',
      subtitle: 'আপনার লক্ষ্য ও সময়সীমা শেয়ার করুন—আমি দ্রুত টেকনিক্যাল কল নির্ধারণ করব।',
      submittedTitle: 'আপনার অনুরোধ গ্রহণ করা হয়েছে',
      submittedSubtitle: 'প্রজেক্টটি Client Hub-এ সংরক্ষণ করা হয়েছে।',
      openClientHub: 'Client Hub দেখুন',
      done: 'সম্পন্ন',
      nameLabel: 'আপনার নাম',
      emailLabel: 'ইমেইল ঠিকানা',
      companyLabel: 'প্রতিষ্ঠান / ব্র্যান্ড',
      projectTitleLabel: 'প্রজেক্টের শিরোনাম',
      stackLabel: 'পছন্দের আর্কিটেকচার / টেক স্ট্যাক',
      budgetLabel: 'আনুমানিক বাজেট (USD)',
      timelineLabel: 'প্রত্যাশিত সময় (সপ্তাহ)',
      briefLabel: 'প্রজেক্টের বিস্তারিত (বাংলা, English, বা Banglish)',
      briefPlaceholder:
        'কী কী ফিচার, ইউজার রোল, পেমেন্ট গেটওয়ে বা AI সুবিধা প্রয়োজন তা লিখুন...',
      submitBtn: 'প্রজেক্ট রিকোয়েস্ট পাঠান',
      validationError: 'দয়া করে আপনার নাম, সঠিক ইমেইল এবং প্রজেক্টের সংক্ষিপ্ত বিবরণ দিন।',
    },
    chatBox: {
      buttonLabel: 'চ্যাট করুন',
      headerTitle: 'বাঁধন AI-এর সাথে চ্যাট',
      headerSub: 'বাংলা · English · Banglish',
      clientMode: 'ক্লায়েন্ট প্রশ্ন',
      devMode: 'ডেভ মোড',
      bookCall: 'কল বুক করুন →',
      placeholder: 'আপনার মেসেজ লিখুন...',
      welcome:
        'হ্যালো! ওয়েব ডেভেলপমেন্ট সার্ভিস, প্রজেক্ট খরচ, সময়কাল বা টেক স্ট্যাক নিয়ে যেকোনো প্রশ্ন বাংলা, ইংরেজি বা বাংলিশে করতে পারেন।',
      typing: 'লিখছে...',
      retryBtn: 'আবার চেষ্টা করুন',
      quickPromptsClient: [
        'আপনার সার্ভিস প্যাকেজ ও খরচ কেমন?',
        'একটি ই-কমার্স ওয়েবসাইট বানাতে কত সময় লাগে?',
        'আপনার সেরা SaaS ও ই-কমার্স প্রজেক্ট দেখান',
      ],
      quickPromptsDev: [
        'SaaS MVP-এর জন্য দ্রুততম টেক স্ট্যাক কী হবে?',
        'আমার চলমান ক্লায়েন্ট লিডগুলো রিভিউ করুন',
        'bKash ও COD চেকআউট কীভাবে ডিজাইন করব?',
      ],
    },
    footer: {
      tagline: 'ফুল-স্ট্যাক ওয়েব ইঞ্জিনিয়ারিং ও AI সিস্টেম',
      resetDemo: 'ডেমো ডেটা রিসেট',
    },
  },

  hi: {
    langLabel: 'हिन्दी',
    nav: {
      work: 'प्रोजेक्ट्स',
      services: 'सेवाएं',
      clients: 'क्लाइंट हब',
      aiStudio: 'AI स्टूडियो',
      startProject: 'प्रोजेक्ट शुरू करें',
    },
    hero: {
      kicker: 'फुल-स्टैक वेब डेवलपर · React, TypeScript, Node.js और AI',
      headline: 'मैं प्रोडक्शन-रेडी वेब ऐप्स, API और AI सिस्टम डिज़ाइन व शिप करता हूँ।',
      subcopy:
        'फाउंडर्स और बढ़ते बिज़नेस के लिए तेज़ ई-कॉमर्स स्टोरफ्रंट, SaaS डैशबोर्ड और भरोसेमंद बैकएंड आर्किटेक्चर तैयार करता हूँ।',
      ctaPrimary: 'प्रोजेक्ट्स देखें',
      ctaSecondary: 'AI से बजट जानें',
      languageLabel: 'भाषा',
      stats: [
        { value: '34+', label: '2021 से शिप किए गए प्रोडक्शन वेब ऐप्स और API' },
        { value: '99.95%', label: 'प्रबंधित डिप्लॉयमेंट पर मापा गया अपटाइम' },
        { value: '< 450ms', label: 'क्लाइंट प्लेटफ़ॉर्म पर औसत API रिस्पॉन्स समय' },
        { value: '3–6 सप्ताह', label: 'टेक्निकल प्लान से लाइव लॉन्च तक का सामान्य समय' },
      ],
    },
    work: {
      heading: 'चुनिंदा केस स्टडीज़',
      subheading: 'आर्किटेक्चर निर्णय, लाइव इंटरफ़ेस और मापने योग्य बिज़नेस परिणाम।',
      searchPlaceholder: 'स्टैक या क्लाइंट खोजें...',
      emptyTitle: 'इस फ़िल्टर से कोई प्रोजेक्ट नहीं मिला',
      showAll: 'सभी प्रोजेक्ट्स देखें',
      readCase: 'विवरण देखें',
      outcomesHeading: 'क्लाइंट अनुभव',
      outcomesSubheading: 'इंजीनियरिंग लीडर्स और फाउंडर्स की सीधी प्रतिक्रिया।',
      viewPackages: 'सर्विस पैकेज देखें →',
      modalOutcomePrefix: 'परिणाम:',
      modalChallenge: 'मुख्य चुनौती',
      modalSolution: 'इंजीनियरिंग समाधान',
      modalStack: 'टेक्निकल स्टैक',
      requestSimilar: 'समान प्रोजेक्ट का अनुरोध करें',
      livePreview: 'लाइव प्रीव्यू',
      disciplines: {
        All: 'सभी',
        'SaaS & Dashboards': 'SaaS और डैशबोर्ड',
        'E-Commerce': 'ई-कॉमर्स',
        'Developer Tools': 'डेवलपर टूल्स',
        'AI Systems': 'AI सिस्टम',
      },
    },
    services: {
      kicker: 'इंजीनियरिंग क्षमताएं',
      heading: 'स्पष्ट स्कोप, पूर्ण कोड स्वामित्व और तेज़ डिलीवरी।',
      subcopy:
        'हर प्रोजेक्ट में क्लीन सोर्स कोड रिपॉज़िटरी, डिप्लॉयमेंट सेटअप और पूर्ण नियंत्रण शामिल होता है।',
      ctaEstimate: 'AI से कस्टम अनुमान निकालें',
      packagesHeading: 'सर्विस पैकेज',
      packagesSubheading:
        'प्रोजेक्ट के चरण के अनुसार फिक्स्ड-स्कोप स्प्रिंट या मासिक रिटेनर।',
      startingAt: 'शुरुआती कीमत',
      requestPrefix: 'अनुरोध करें:',
      stackHeading: 'मुख्य प्रोडक्शन स्टैक',
      capabilities: [
        {
          num: '01.',
          title: 'फुल-स्टैक वेब एप्लिकेशन',
          detail:
            'React, TypeScript, Next.js और Node.js के साथ टाइप-सेफ फ्रंटएंड, क्लीन REST API और PostgreSQL डेटाबेस मॉडलिंग।',
        },
        {
          num: '02.',
          title: 'हेडलेस ई-कॉमर्स और POS सिस्टम',
          detail:
            'तेज़ ऑनलाइन स्टोरफ्रंट, इन्वेंटरी सिंक, कैश ऑन डिलीवरी (COD), Stripe/bKash पेमेंट और प्रिंटेबल इनवॉइसिंग।',
        },
        {
          num: '03.',
          title: 'Gemini AI और वर्कफ़्लो ऑटोमेशन',
          detail:
            'सर्वर-साइड AI कस्टमर चैट, स्ट्रक्चर्ड डेटा एक्सट्रैक्शन और ऑटोमेटेड प्रपोज़ल जनरेशन।',
        },
        {
          num: '04.',
          title: 'परफॉर्मेंस ऑप्टिमाइज़ेशन और रिफैक्टरिंग',
          detail:
            'पेज लोड स्पीड सुधार, डेटाबेस इंडेक्सिंग, WCAG एक्सेसिबिलिटी और पुराने कोड का आधुनिक TypeScript में माइग्रेशन।',
        },
      ],
    },
    clientHub: {
      heading: 'क्लाइंट हब और पोर्टफोलियो मैनेजर',
      subheading:
        'क्लाइंट लीड्स ट्रैक करें, प्रिंटेबल कोट्स व AI प्रपोज़ल बनाएं और केस स्टडीज़ प्रबंधित करें।',
      addCaseStudy: 'केस स्टडी जोड़ें',
      newClientLead: 'नई क्लाइंट लीड',
      pipelineValue: 'कुल पाइपलाइन मूल्य',
      openLeads: 'सक्रिय लीड्स व प्रपोज़ल',
      activeBuilds: 'चालू प्रोजेक्ट्स',
      publishedShipped: 'प्रकाशित व पूर्ण',
      leadsHeading: 'क्लाइंट लीड्स और सक्रिय प्रोजेक्ट्स',
      searchPlaceholder: 'क्लाइंट या प्रोजेक्ट खोजें...',
      allStages: 'सभी चरण',
      noInquiries: 'कोई क्लाइंट पूछताछ नहीं मिली',
      noInquiriesHint: 'नई लीड जोड़ें या AI Studio से स्कोप एस्टिमेट सेव करें।',
      colRef: 'संदर्भ',
      colClient: 'क्लाइंट',
      colProject: 'प्रोजेक्ट व स्टैक',
      colTimeline: 'समयसीमा',
      colEstimate: 'अनुमान',
      colStage: 'स्थिति',
      colActions: 'कार्रवाई',
      aiProposalBtn: 'AI प्रपोज़ल',
      quoteBtn: 'कोट',
      publishedHeading: 'प्रकाशित पोर्टफोलियो केस स्टडीज़',
      editBtn: 'संपादित करें',
      removeBtn: 'हटाएं',
      printQuoteBtn: 'कोट प्रिंट / PDF सेव करें',
    },
    aiStudio: {
      heading: 'वेब डेवलपर AI स्टूडियो',
      subheading:
        'AI प्रोजेक्ट स्कोप और लागत अनुमानक, बहुभाषी प्रपोज़ल राइटर और टेक्निकल आर्किटेक्ट कोपायलट।',
      tabEstimator: 'स्कोप व लागत अनुमानक',
      tabProposal: 'प्रपोज़ल राइटर',
      tabCopilot: 'आर्किटेक्ट कोपायलट',
      estimatorHeading: 'तकनीकी स्कोप और बजट का अनुमान लगाएं',
      estimatorHint:
        'अपनी आवश्यकता किसी भी भाषा में लिखें—AI मॉड्यूल, स्टैक और बजट प्लान तैयार करेगा।',
      ideaLabel: 'प्रोजेक्ट आइडिया / क्लाइंट आवश्यकताएं',
      ideaPlaceholder:
        'जैसे: मुझे डॉक्टर प्रोफ़ाइल, ऑनलाइन पेमेंट, पेशेंट डैशबोर्ड और एडमिन एनालिटिक्स के साथ बुकिंग पोर्टल चाहिए...',
      platformLabel: 'टारगेट आर्किटेक्चर',
      speedLabel: 'डिलीवरी गति',
      generateEstimateBtn: 'स्कोप और बजट तैयार करें',
      estimatingBtn: 'तकनीकी स्कोप बन रहा है...',
      noEstimateTitle: 'अभी तक कोई स्कोप तैयार नहीं किया गया',
      noEstimateHint:
        'बाईं ओर प्रोजेक्ट विवरण भरें और मॉड्यूल-वार समय, टेक स्टैक और बजट अनुमान प्राप्त करें।',
      saveToHubBtn: 'Client Hub में सेव करें',
      draftFromEstimateBtn: 'इस अनुमान से प्रपोज़ल लिखें',
      proposalHeading: 'AI क्लाइंट प्रपोज़ल और पिच राइटर',
      loadLeadLabel: 'Client Hub लीड से लोड करें',
      manualEntry: 'कस्टम / मैनुअल एंट्री',
      draftProposalBtn: 'प्रपोज़ल तैयार करें',
      draftingProposalBtn: 'प्रपोज़ल लिखा जा रहा है...',
      noProposalTitle: 'क्लाइंट प्रपोज़ल लिखने के लिए तैयार',
      noProposalHint:
        'Client Hub से लीड चुनें या प्रोजेक्ट ब्रीफ लिखकर ईमेल व WhatsApp पिच प्राप्त करें।',
      copilotArchitectTitle: 'फुल-स्टैक आर्किटेक्चर और बिज़नेस कोपायलट',
      copilotClientTitle: 'क्लाइंट प्रश्नोत्तर सहायक',
      modeArchitect: 'टेक आर्किटेक्ट',
      modeClient: 'क्लाइंट गाइड',
      clearBtn: 'साफ़ करें',
      sendBtn: 'भेजें',
      stopBtn: 'रोकें',
      chatPlaceholder: 'डेटाबेस, API डिज़ाइन या प्रोजेक्ट लागत के बारे में पूछें...',
    },
    inquiryModal: {
      title: 'नया वेब प्रोजेक्ट शुरू करें',
      subtitle: 'कॉल शेड्यूल करने के लिए अपने लक्ष्य और समयसीमा साझा करें।',
      submittedTitle: 'अनुरोध प्राप्त हुआ',
      submittedSubtitle: 'स्कोपिंग के लिए Client Hub में सेव किया गया।',
      openClientHub: 'Client Hub खोलें',
      done: 'पूर्ण',
      nameLabel: 'आपका नाम',
      emailLabel: 'ईमेल पता',
      companyLabel: 'कंपनी / ब्रांड',
      projectTitleLabel: 'प्रोजेक्ट शीर्षक',
      stackLabel: 'पसंदीदा आर्किटेक्चर / स्टैक',
      budgetLabel: 'लक्षित बजट (USD)',
      timelineLabel: 'अपेक्षित समय (सप्ताह)',
      briefLabel: 'प्रोजेक्ट विवरण',
      briefPlaceholder: 'मुख्य फीचर्स, यूज़र रोल्स, पेमेंट या AI ज़रूरतें लिखें...',
      submitBtn: 'प्रोजेक्ट अनुरोध भेजें',
      validationError: 'कृपया अपना नाम, मान्य ईमेल पता और संक्षिप्त विवरण दर्ज करें।',
    },
    chatBox: {
      buttonLabel: 'चैट करें',
      headerTitle: 'Badhan AI से चैट करें',
      headerSub: 'हिन्दी · English · বাংলা',
      clientMode: 'क्लाइंट Q&A',
      devMode: 'देव मोड',
      bookCall: 'कॉल बुक करें →',
      placeholder: 'अपना संदेश लिखें...',
      welcome:
        'नमस्ते! वेब डेवलपमेंट सेवाओं, प्रोजेक्ट लागत, समयसीमा या टेक स्टैक के बारे में कोई भी सवाल हिन्दी, English या বাংলা में पूछें।',
      typing: 'लिख रहा है...',
      retryBtn: 'पुनः प्रयास करें',
      quickPromptsClient: [
        'आप कौन-सी सेवाएं और पैकेज देते हैं?',
        'वेब ऐप बनाने में कितना समय और बजट लगता है?',
        'अपने ई-कॉमर्स और SaaS प्रोजेक्ट्स दिखाएं',
      ],
      quickPromptsDev: [
        'SaaS MVP के लिए तेज़ टेक स्टैक सुझाएं',
        'मेरी सक्रिय क्लाइंट लीड्स की समीक्षा करें',
        'ऑनलाइन पेमेंट और COD चेकआउट कैसे डिज़ाइन करें?',
      ],
    },
    footer: {
      tagline: 'फुल-स्टैक वेब इंजीनियरिंग और AI इंटीग्रेशन',
      resetDemo: 'डेमो डेटा रीसेट करें',
    },
  },
};
