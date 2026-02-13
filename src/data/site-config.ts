export const siteConfig = {
  title: 'Wilson Cely | AI Productization for Enterprises',
  description: 'I turn AI prototypes into production systems for enterprises where the stakes are real.',
  author: 'Wilson Cely',
  email: 'hello@wilsoncely.com',
  bookingUrl: 'https://cal.com/wilsoncely/discovery-call',
  valuePageV2: {
    seo: {
      title: 'Wilson Cely | Fractional Product Engineer for Outcome-Critical Teams',
      description:
        'Fractional product engineering for SMEs, fast startups, and enterprise innovation teams that need to move from prototype momentum to measurable product outcomes.',
    },
    hero: {
      kicker: 'Fractional Product Engineering',
      headline:
        'I help teams own product outcomes end-to-end, from problem framing to shipped value.',
      subheadline:
        'You do not need another handoff chain. You need one operator who can align product decisions, engineering execution, and business impact across SMEs, high-paced startups, and enterprise innovation teams.',
      audiences: [
        'SME operators',
        'High-paced startup teams',
        'Enterprise innovation and product departments',
      ],
      primaryCta: {
        text: 'Book a Discovery Call',
        href: 'BOOKING_URL',
      },
      secondaryCta: {
        text: 'See Services',
        href: '#services',
      },
      stats: [
        { value: '8+', label: 'Complex delivery programs shipped' },
        { value: '40K+', label: 'Product and MLOps community reach' },
        { value: '4+', label: 'Industries with production outcomes' },
      ],
    },
    problem: {
      title: 'Most teams are not blocked by ideas. They are blocked by ownership gaps.',
      subtitle:
        'The same pattern repeats: insights exist, demos exist, interest exists, but outcomes do not scale because discovery, execution, and measurement are fragmented.',
      items: [
        {
          title: 'Too many ideas, no decision system',
          detail:
            'Roadmaps are driven by urgency and internal opinions instead of validated opportunities and constraints.',
          impact: 'Teams spend quarters on low-impact bets.',
        },
        {
          title: 'Work ships, outcomes stay unclear',
          detail:
            'Features launch without a shared model for activation, retention, reliability, and commercial value.',
          impact: 'Leadership questions budget and direction.',
        },
        {
          title: 'Cross-functional drag kills momentum',
          detail:
            'Product, data, and engineering move at different speeds with no single owner for end-to-end delivery.',
          impact: 'Execution stalls at handoff boundaries.',
        },
      ],
    },
    servicesSection: {
      title: 'Three focused offers to close the product engineering gap.',
      intro:
        'Each engagement is designed to reduce decision friction, increase shipping velocity, and make outcomes visible to the people funding the work.',
    },
    operatingModel: {
      title: 'A simple operating model: Discover, Build, Ship, Measure.',
      subtitle:
        'A repeatable cadence that combines product judgment with technical execution and measurable accountability.',
      steps: [
        {
          number: 1,
          title: 'Discover',
          description:
            'Clarify user problems, business constraints, and the smallest high-leverage opportunity worth shipping.',
        },
        {
          number: 2,
          title: 'Build',
          description:
            'Design and implement the solution path with clear tradeoffs, architecture realism, and ownership mapping.',
        },
        {
          number: 3,
          title: 'Ship',
          description:
            'Run cross-functional delivery to production with release gates, risk control, and operational readiness.',
        },
        {
          number: 4,
          title: 'Measure',
          description:
            'Instrument outcomes, review impact, and feed insights back into the next product cycle.',
        },
      ],
    },
    icpSegments: [
      {
        title: 'SME Operators',
        bestFor:
          'Lean teams where one person needs to connect roadmap choices, implementation, and business priorities.',
        outcome:
          'Faster shipping with fewer false starts and clearer decisions about where to invest next.',
        trigger: 'You are juggling delivery with no dedicated product leadership layer.',
      },
      {
        title: 'High-Paced Startups',
        bestFor:
          'Teams scaling quickly that need to keep product velocity high without sacrificing quality or focus.',
        outcome:
          'Higher experiment throughput, tighter execution cycles, and clearer signal on what drives growth.',
        trigger: 'Your backlog is full but your impact per sprint is inconsistent.',
      },
      {
        title: 'Enterprise Innovation/Product Teams',
        bestFor:
          'Departments under pressure to turn pilots into production outcomes with governance and executive clarity.',
        outcome:
          'Production-grade delivery with transparent value reporting and stronger stakeholder confidence.',
        trigger: 'You can demo progress but cannot yet defend outcomes at executive level.',
      },
    ],
    proofSection: {
      title: 'Proof from high-stakes environments where quality and accountability matter.',
      subtitle:
        'Case studies from telecom, payments, and automotive contexts where product engineering discipline made delivery measurable and repeatable.',
      snapshots: [
        { value: '3', label: 'Industries represented in featured cases' },
        { value: '100%', label: 'Case studies tied to explicit business outcomes' },
        { value: '1', label: 'Single accountable operating model across teams' },
      ],
    },
    contact: {
      title: 'Need outcome ownership across product and engineering?',
      subtitle:
        'Book a discovery call to define your highest-leverage initiative, delivery model, and success metrics.',
      primaryCtaText: 'Book a Discovery Call',
      secondaryCtaText: 'Email Directly',
    },
  },

  hero: {
    headline: 'I turn AI prototypes into production systems for enterprises where the stakes are real.',
    subheadline:
      'Hands-on AI engineering combined with cross-functional delivery leadership. From telecom RAG systems to automotive AI pipelines, I bridge the gap between your data science team and your production environment.',
    primaryCta: {
      text: 'Book a Discovery Call',
      href: 'BOOKING_URL',
    },
    secondaryCta: {
      text: 'See How I Work',
      href: '#services',
    },
    stats: [
      { value: '8+', label: 'Enterprise AI Systems Shipped' },
      { value: '40K+', label: 'MLOps Community Members' },
      { value: '4+', label: 'Industries Served' },
    ],
  },

  testimonials: [
    {
      quote:
        'Wilson translated our AI proof-of-concept into a production roadmap the engineering team could actually execute.',
      name: 'VP Engineering',
      title: 'European Telecom Provider',
    },
    {
      quote:
        'He aligned product, data, and operations in weeks, not quarters, and gave leadership a clear value narrative.',
      name: 'Head of Digital Transformation',
      title: 'Global Automotive OEM',
    },
    {
      quote:
        'Strong technically, pragmatic commercially, and relentless on delivery discipline. Exactly what we needed post-pilot.',
      name: 'CTO',
      title: 'Enterprise Payments Platform',
    },
  ],

  pillars: [
    {
      key: 'build',
      title: 'Build',
      tagline: 'Will this actually work technically?',
      bullets: [
        'Enterprise-grade AI architecture and prototype hardening',
        'RAG, multimodal pipelines, and evaluation frameworks',
        'Integration design for existing data and platform constraints',
      ],
    },
    {
      key: 'ship',
      title: 'Ship',
      tagline: 'Will this ever get to production?',
      bullets: [
        'Cross-functional orchestration across data, product, and engineering',
        'Security, compliance, and deployment-readiness pathways',
        'Milestone delivery with accountability and launch discipline',
      ],
    },
    {
      key: 'prove',
      title: 'Prove',
      tagline: 'How do we justify this spend?',
      bullets: [
        'KPI trees from model quality to business outcomes',
        'Value realization reporting with owner-level accountability',
        'Executive-ready QBR narratives for budget protection and scale-up',
      ],
    },
  ],

  servicesSection: {
    title: 'Most AI initiatives get stuck after the first demo.',
    intro:
      'Your team built a pilot. The demo looked great. But now outputs are unreliable, enterprise constraints block launch, and leadership asks for ROI. You do not have an AI idea problem. You have an AI productization gap.',
  },

  howWeStart: {
    title: 'How We Work',
    subtitle:
      'A four-phase model to move from prototype confidence to production and measurable value.',
    capabilityTransfer:
      'Every engagement includes capability transfer so your team can sustain delivery without vendor dependency.',
    steps: [
      {
        number: 1,
        title: 'Discover',
        description: 'Clarify target outcomes, technical constraints, and business priorities.',
      },
      {
        number: 2,
        title: 'Build',
        description: 'Harden architecture, evaluation, and implementation plan beyond demo quality.',
      },
      {
        number: 3,
        title: 'Ship',
        description: 'Lead cross-functional execution to production with risk and stakeholder control.',
      },
      {
        number: 4,
        title: 'Prove',
        description: 'Connect operational metrics to business value through repeatable reporting.',
      },
    ],
  },

  proof: {
    title: 'Proof That Survives Executive Scrutiny',
    subtitle: 'Impact snapshots from enterprise environments where production standards are non-negotiable.',
    stats: [
      { value: '8+', label: 'Enterprise AI Systems Shipped' },
      { value: '40K+', label: 'Community Reach' },
      { value: '4+', label: 'Industries Delivered' },
    ],
    capabilityTags: [
      'Multimodal AI',
      'RAG Systems',
      'Data Pipeline Architecture',
      'Product Team Coaching',
      'Enterprise Deployment',
      'Value Realization',
      'On-Prem & Hybrid',
      'LLM Evaluation',
      'Cross-Functional Delivery',
    ],
  },

  bestFit: {
    title: 'Best Fit',
    bestFitTitle: 'Best Fit',
    notFitTitle: 'Not the Right Fit',
    bestFitItems: [
      'Enterprise teams that already ran pilots and need production delivery leadership',
      'CTOs and VP Engineering leaders accountable for measurable AI outcomes',
      'Organizations with cross-functional stakeholders that need aligned execution',
      'Teams that want capability transfer, not long-term consultant dependency',
    ],
    notFitItems: [
      'Very early startups still searching for product-market fit',
      'Pure research initiatives with no production path in scope',
      'Staff-augmentation requests without product ownership or outcomes',
      'One-off chatbot or dashboard builds with no lifecycle ownership',
    ],
  },

  newsletter: {
    headline: 'Signal Over Noise',
    description: 'Practical AI productization insights for operators shipping in real enterprise conditions.',
    subscribersShort: '15K+',
    socialProof: 'Read by builders, engineering leaders, and applied AI teams.',
    link: 'https://www.ai-revolution-hub.com/',
    ctaText: 'Read the Newsletter',
  },

  community: {
    headline: "Part of Munich's MLOps Scene",
    description: "Co-organizer of one of Europe's largest MLOps communities.",
    membersShort: '40K+',
    link: 'https://lu.ma/munich-mlops',
    event: {
      title: 'Munich MLOps Meetup',
      date: 'Jan 28, 2026',
      description: 'Gen AI at Scale: from experimentation bottlenecks to production agents.',
      spotsLeft: '4 spots left',
      urgencyText: 'Seats Filling Fast',
      link: 'https://lu.ma/munich-mlops?e=calev-ddS9tD5XOnzMJM4',
    },
    sponsor: {
      title: 'Become a Sponsor',
      description: 'Reach thousands of ML practitioners and engineering leaders across the region.',
      cta: 'Start a conversation',
      link: 'BOOKING_URL',
    },
  },

  contact: {
    headline: 'Need AI outcomes that survive production reality?',
    subheadline:
      'Book a discovery call to define the delivery path, ownership model, and value measurement plan.',
    ctaText: 'Book a Discovery Call',
  },

  social: {
    github: 'https://github.com/wilsoncelyCUC',
    twitter: 'https://twitter.com/wilson_cely',
    linkedin: 'https://www.linkedin.com/in/wilsoncely/',
  },

  seo: {
    openGraph: {
      type: 'website',
      image: '/profile/images/profile_wct.jpeg',
    },
  },
};

export type PillarKey = 'build' | 'ship' | 'prove';

export const resolveBookingUrl = (href: string) =>
  href === 'BOOKING_URL' ? siteConfig.bookingUrl : href;
