import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const GITHUB_URL = 'https://github.com/ForliLabs/agri-romagna';

const config: Config = {
  title: 'AgriRomagna',
  tagline: 'The digital backbone for Romagna’s farms and cooperatives — plan, track, sell, and protect your harvest from one platform.',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://agriromagna.it',
  baseUrl: '/',

  organizationName: 'ForliLabs',
  projectName: 'agri-romagna',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: `${GITHUB_URL}/edit/main/website/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.svg',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    navbar: {
      title: 'AgriRomagna',
      logo: {
        alt: 'AgriRomagna logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/getting-started/quick-start',
          label: 'Quick Start',
          position: 'left',
        },
        {
          to: '/docs/reference/api',
          label: 'API',
          position: 'left',
        },
        {
          to: '/docs/comparison',
          label: 'Why AgriRomagna',
          position: 'left',
        },
        {
          href: GITHUB_URL,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Getting Started', to: '/docs/getting-started/install'},
            {label: 'Core Concepts', to: '/docs/concepts/architecture'},
            {label: 'API Reference', to: '/docs/reference/api'},
          ],
        },
        {
          title: 'Guides',
          items: [
            {label: 'Field & Crop Management', to: '/docs/guides/fields-and-crops'},
            {label: 'Compliance & Audits', to: '/docs/guides/compliance'},
            {label: 'Traceability', to: '/docs/guides/traceability'},
            {label: 'IoT & Sensors', to: '/docs/guides/iot-sensors'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'GitHub', href: GITHUB_URL},
            {label: 'Discussions', href: `${GITHUB_URL}/discussions`},
            {label: 'Issues', href: `${GITHUB_URL}/issues`},
            {label: 'Contributing', to: '/docs/community/contributing'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'Changelog', to: '/docs/community/changelog'},
            {label: 'FAQ', to: '/docs/faq'},
            {label: 'Troubleshooting', to: '/docs/troubleshooting'},
            {label: 'Comparison', to: '/docs/comparison'},
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} ForliLabs · AgriRomagna. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
