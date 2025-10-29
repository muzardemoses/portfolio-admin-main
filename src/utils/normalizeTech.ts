export const normalizeTechName = (raw: string): string => {
    const s = (raw || "").trim().replace(/\s+/g, " ");
  
    // Ordered rules (first match wins)
    const rules: Array<[RegExp, string]> = [
      [/^react(\.js|js)?$/i, "React"],
      [/^react native$/i, "React Native"],
      [/^next(\.js|js)?$/i, "Next.js"],
      [/^nuxt(\.js|js)?$/i, "Nuxt.js"],
      [/^vue(js)?$/i, "Vue.js"],
      [/^angular$/i, "Angular"],
      [/^svelte$/i, "Svelte"],
  
      [/^node(\.js|js)?$/i, "Node.js"],
      [/^express(\.js|js)?$/i, "Express.js"],
      [/^nest(js)?$/i, "NestJS"],
  
      [/^typescript$/i, "TypeScript"],
      [/^javascript$/i, "JavaScript"],
  
      [/^tailwind(\s*css)?$/i, "Tailwind CSS"],
      [/^(material ui|mui)$/i, "Material UI"],
      [/^shadcn(\s*ui)?$/i, "ShadCN UI"],
      [/^framer(\s*motion)?$/i, "Framer Motion"],
  
      [/^firebase$/i, "Firebase"],
      [/^firestore$/i, "Firestore"],
      [/^supabase$/i, "Supabase"],
  
      [/^postgres(ql)?$/i, "PostgreSQL"],
      [/^mysql$/i, "MySQL"],
      [/^mongodb$/i, "MongoDB"],
      [/^sqlite$/i, "SQLite"],
      [/^drizzle(\s*orm)?$/i, "Drizzle ORM"],
      [/^prisma$/i, "Prisma"],
  
      [/^vercel$/i, "Vercel"],
      [/^netlify$/i, "Netlify"],
      [/^cloudflare$/i, "Cloudflare"],
      [/^docker$/i, "Docker"],
      [/^kubernetes$/i, "Kubernetes"],
      [/^github actions?$/i, "GitHub Actions"],
      [/^(aws|amazon web services)$/i, "AWS"],
      [/^(gcp|google cloud( platform)?)$/i, "Google Cloud"],
      [/^hetzner$/i, "Hetzner"],
  
      [/^stripe$/i, "Stripe"],
      [/^paystack$/i, "Paystack"],
      [/^flutterwave$/i, "Flutterwave"],
    ];
  
    for (const [re, name] of rules) {
      if (re.test(s)) return name;
    }
  
    // Fallback: Title-case first letter, keep punctuation
    return s
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  };
  
  export const normalizeAndDedupe = (list: string[]): string[] => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of list) {
      const norm = normalizeTechName(item);
      const key = norm.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(norm);
      }
    }
    return out;
  };
  