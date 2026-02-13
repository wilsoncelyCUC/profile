export const siteConfig = {
  title: 'Wilson Cely | AI Productization for Enterprises',
  description: 'I turn AI prototypes into production systems for enterprises where the stakes are real.',
  author: 'Wilson Cely',
  email: 'hello@wilsoncely.com',
  bookingUrl: 'https://cal.com/wilsoncely/discovery-call',

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
    headline: "Building Munich's MLOps Scene",
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
