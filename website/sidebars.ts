import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      link: {type: 'generated-index', slug: '/getting-started'},
      items: [
        'getting-started/install',
        'getting-started/quick-start',
        'getting-started/demo-login',
        'getting-started/first-field',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      link: {type: 'generated-index', slug: '/concepts'},
      items: [
        'concepts/architecture',
        'concepts/multi-tenancy',
        'concepts/rbac',
        'concepts/event-bus',
        'concepts/data-layer',
        'concepts/offline-first',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      link: {type: 'generated-index', slug: '/guides'},
      items: [
        'guides/fields-and-crops',
        'guides/compliance',
        'guides/traceability',
        'guides/iot-sensors',
        'guides/marketplace',
        'guides/carbon-and-esg',
        'guides/governance',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      link: {type: 'generated-index', slug: '/reference'},
      items: [
        'reference/api',
        'reference/api-errors',
        'reference/configuration',
        'reference/scripts',
        'reference/data-models',
        'reference/roles-and-permissions',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      link: {type: 'generated-index', slug: '/operations'},
      items: [
        'operations/docker',
        'operations/deployment',
        'operations/observability',
      ],
    },
    'troubleshooting',
    'faq',
    'comparison',
    {
      type: 'category',
      label: 'Community',
      items: [
        'community/contributing',
        'community/code-of-conduct',
        'community/changelog',
      ],
    },
  ],
};

export default sidebars;
