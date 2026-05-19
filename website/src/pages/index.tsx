import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';

const features = [
  {
    icon: '🌱',
    title: 'Field & Crop Management',
    desc: 'Digital field journal, crop planning, harvest declarations and yield prediction backed by phenology models.',
  },
  {
    icon: '📜',
    title: 'EU Compliance Built-In',
    desc: 'Organic, DOP/IGP and CAP audit packages generated from your daily operations log — no paperwork sprints.',
  },
  {
    icon: '🔗',
    title: 'End-to-End Traceability',
    desc: 'Product lots, supply-chain events and public QR pages ready for the EU Digital Product Passport.',
  },
  {
    icon: '📡',
    title: 'IoT & Satellite Data',
    desc: 'Sensor devices, real-time readings, NDVI from Copernicus Sentinel-2 — all fused in one timeline.',
  },
  {
    icon: '🤝',
    title: 'Cooperative-Native',
    desc: 'Member directory, governance proposals, weighted voting and a communication hub built for Italian co-ops.',
  },
  {
    icon: '🛒',
    title: 'Direct Sales Channel',
    desc: 'Farm-to-buyer marketplace with orders, benchmarking and B2B integrations for GDO partners.',
  },
];

const stats = [
  {value: '36', label: 'Prisma data models'},
  {value: '~50', label: 'REST endpoints'},
  {value: '32', label: 'Functional domains'},
  {value: '67', label: 'Unit tests passing'},
];

function CopyableInstall({command}: {command: string}): ReactNode {
  return (
    <span className="hero__install" title="Copy install command">
      <span className="dollar">$</span>
      {command}
    </span>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="AgriRomagna — Farm Cooperative Management Platform"
      description="The digital backbone for Romagna's farms and cooperatives. Plan, track, sell, and protect your harvest from one platform.">
      <header className="hero--ar">
        <div className="container">
          <span className="hero__eyebrow">Open Source · Made in Romagna 🌾</span>
          <h1 className="hero__title--ar">
            One platform for the entire farm cooperative.
          </h1>
          <p className="hero__subtitle--ar">
            AgriRomagna unifies field management, EU compliance, traceability, IoT,
            marketplace and governance for Italian agricultural cooperatives —
            offline-first and built for real-world conditions.
          </p>

          <div className="hero__ctas">
            <Link
              className="button button--lg button--hero-primary"
              to="/docs/getting-started/quick-start">
              Get Started →
            </Link>
            <Link
              className="button button--lg button--hero-secondary"
              to="/docs/intro">
              Read the Docs
            </Link>
            <Link
              className="button button--lg button--hero-secondary"
              href="https://github.com/ForliLabs/agri-romagna">
              ★ Star on GitHub
            </Link>
          </div>

          <CopyableInstall command="git clone https://github.com/ForliLabs/agri-romagna && cd agri-romagna && npm install" />

          <div className="hero__badges">
            <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
            <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
            <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" />
            <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
            <img alt="Tests" src="https://img.shields.io/badge/tests-67%20passing-2f7a3a" />
            <img alt="License" src="https://img.shields.io/badge/license-source--available-blue" />
          </div>
        </div>
      </header>

      <section className="section">
        <h2 className="section__title">Built for the way co-ops actually work</h2>
        <p className="section__subtitle">
          Most farm SaaS is built for 5,000-acre US row-crop operations. AgriRomagna
          is built for the Italian cooperative model: dozens of small farms, shared
          logistics, strict EU compliance, and patchy field connectivity.
        </p>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon" aria-hidden>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{background: 'var(--ifm-background-surface-color)'}}>
        <h2 className="section__title">From clone to running platform in 3 commands</h2>
        <p className="section__subtitle">
          A reproducible local environment with seeded demo data, JWT auth and the
          full dashboard — no external services required.
        </p>
        <div style={{maxWidth: 820, margin: '0 auto'}}>
          <CodeBlock language="bash">
{`git clone https://github.com/ForliLabs/agri-romagna && cd agri-romagna
npm install
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev   # → http://localhost:3000`}
          </CodeBlock>
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">A platform, not a prototype</h2>
        <p className="section__subtitle">
          AgriRomagna ships with the breadth of a vertical SaaS and the test
          coverage of a serious codebase.
        </p>
        <div className="stats-strip">
          {stats.map((s) => (
            <div key={s.label} className="stat">
              <div className="stat__value">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Define a field, plant a crop, declare a harvest</h2>
        <p className="section__subtitle">
          Every business object is a typed Prisma model and a REST endpoint. Here
          is the minimum-viable-flow.
        </p>
        <div style={{maxWidth: 820, margin: '0 auto'}}>
          <CodeBlock language="bash">
{`# 1. Authenticate
curl -X POST http://localhost:3000/api/auth \\
  -H "Content-Type: application/json" \\
  -d '{"action":"login","email":"elena.bellini@vignediromagna.it","password":"demo"}'

# 2. Create a field (5 hectares, Sangiovese on Bertinoro hillside)
curl -X POST http://localhost:3000/api/fields \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "farmId": "farm-tondini",
    "name": "Vigna Alta",
    "hectares": 5.2,
    "crop": "Sangiovese",
    "soilType": "argilloso-calcareo"
  }'

# 3. Stream readings from an in-field sensor
curl -X POST http://localhost:3000/api/iot \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"deviceId":"sensor-01","type":"soil_moisture","value":28.4,"unit":"%"}'`}
          </CodeBlock>
        </div>
      </section>

      <section className="section">
        <div className="cta-banner">
          <h2>Ready to digitize your cooperative?</h2>
          <p>Self-host AgriRomagna in minutes, or build on top of the API.</p>
          <div className="hero__ctas" style={{justifyContent: 'center'}}>
            <Link className="button button--lg button--hero-primary" to="/docs/getting-started/install">
              Install Guide
            </Link>
            <Link className="button button--lg button--hero-secondary" to="/docs/reference/api">
              API Reference
            </Link>
            <Link className="button button--lg button--hero-secondary" href="https://github.com/ForliLabs/agri-romagna/discussions">
              Join the Community
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
