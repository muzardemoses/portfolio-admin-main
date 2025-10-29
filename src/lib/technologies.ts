export type Option = {
    value: string;
    label: string;
    __isNew__?: boolean;
  };
  
  export const technologiesOptions: Option[] = [
    // --- Frontend Frameworks & Libraries ---
    { value: "Next.js", label: "Next.js" },
    { value: "React", label: "React" },
    { value: "Vue.js", label: "Vue.js" },
    { value: "Nuxt.js", label: "Nuxt.js" },
    // { value: "Angular", label: "Angular" },
    // { value: "Svelte", label: "Svelte" },
  
    // --- Styling & UI Frameworks ---
    { value: "Tailwind CSS", label: "Tailwind CSS" },
    { value: "Chakra UI", label: "Chakra UI" },
    { value: "Material UI", label: "Material UI" },
    // { value: "Bootstrap", label: "Bootstrap" },
    { value: "ShadCN UI", label: "ShadCN UI" },
    { value: "Framer Motion", label: "Framer Motion" },
  
    // --- Backend & APIs ---
    { value: "Node.js", label: "Node.js" },
    { value: "Express.js", label: "Express.js" },
    { value: "NestJS", label: "NestJS" },
    // { value: "FastAPI", label: "FastAPI" },
    // { value: "Django", label: "Django" },
    // { value: "Flask", label: "Flask" },
  
    // --- Databases & ORMs ---
    { value: "PostgreSQL", label: "PostgreSQL" },
    { value: "MySQL", label: "MySQL" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "SQLite", label: "SQLite" },
    { value: "Firebase", label: "Firebase" },
    { value: "Supabase", label: "Supabase" },
    { value: "Drizzle ORM", label: "Drizzle ORM" },
    { value: "Prisma", label: "Prisma" },
  
    // --- DevOps / Hosting ---
    { value: "Vercel", label: "Vercel" },
    { value: "Netlify", label: "Netlify" },
    { value: "Cloudflare", label: "Cloudflare" },
    { value: "Docker", label: "Docker" },
    { value: "GitHub Actions", label: "GitHub Actions" },
    { value: "DigitalOcean", label: "DigitalOcean" },
    { value: "AWS", label: "AWS" },
    { value: "Google Cloud", label: "Google Cloud" },
    { value: "Hetzner", label: "Hetzner" },
  
    // --- Authentication & Security ---
    { value: "Clerk", label: "Clerk" },
    { value: "Auth.js", label: "Auth.js" },
    { value: "OAuth2", label: "OAuth2" },
    { value: "JWT", label: "JWT" },
    { value: "Firebase Auth", label: "Firebase Auth" },
  
    // --- Payment & APIs ---
    { value: "Stripe", label: "Stripe" },
    { value: "Paystack", label: "Paystack" },
    { value: "Flutterwave", label: "Flutterwave" },
    { value: "Mailgun", label: "Mailgun" },
    { value: "SendGrid", label: "SendGrid" },
  
    // --- State Management & Data ---
    { value: "Redux", label: "Redux" },
    { value: "Zustand", label: "Zustand" },
    { value: "TanStack Query", label: "TanStack Query" },
    { value: "Recoil", label: "Recoil" },
    { value: "Jotai", label: "Jotai" },
  
    // --- Utilities & Build Tools ---
    { value: "TypeScript", label: "TypeScript" },
    { value: "JavaScript", label: "JavaScript" },
    { value: "ESLint", label: "ESLint" },
    { value: "Prettier", label: "Prettier" },
    { value: "Vite", label: "Vite" },
    { value: "Webpack", label: "Webpack" },
  
    // --- Testing ---
    { value: "Jest", label: "Jest" },
    { value: "Vitest", label: "Vitest" },
    { value: "Playwright", label: "Playwright" },
    { value: "Cypress", label: "Cypress" },
  
    // --- Analytics & Performance ---
    { value: "Google Analytics", label: "Google Analytics" },
    { value: "PostHog", label: "PostHog" },
    { value: "Sentry", label: "Sentry" },
  
    // --- Other ---
    { value: "GraphQL", label: "GraphQL" },
    { value: "REST API", label: "REST API" },
    { value: "WebSockets", label: "WebSockets" },
    { value: "OpenAI API", label: "OpenAI API" },
    { value: "Replit", label: "Replit" },
  ];
  