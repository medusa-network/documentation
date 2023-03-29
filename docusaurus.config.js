// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Medusa',
  tagline: 'Medusa - key management onchain',
  url: 'https://medusanet.xyz',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'medusa', // Usually your GitHub org/user name.
  projectName: 'medusa', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [math],
          rehypePlugins: [katex],
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  stylesheets: [{
    href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
    type: 'text/css',
    integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
    crossorigin: 'anonymous',
  },],
  scripts: [
    {
      src: '/js/custom.js',
      async: true,
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Medusa',
        style: 'dark',
        logo: {
          alt: 'medusa logo',
          src: 'img/medusa-logo.png',
          href: 'https://medusanet.xyz',
        },
        items: [{
          type: 'doc',
          docId: 'developers',
          position: 'left',
          label: 'Developers',
        },
        {
          type: 'doc',
          docId: 'about',
          position: 'left',
          label: 'About',
        },
        {
          href: 'https://github.com/medusa-network/',
          label: 'GitHub',
          position: 'right',
        },
        ],
      },
      footer: {
        style: 'dark',
        links: [{
          title: 'Community',
          items: [{
            label: 'Discord',
            href: 'https://discord.gg/mGjVUwsVtJ',
          },],
        },
        {
          title: 'More',
          items: [{
            label: 'Cryptonet',
            href: 'https://cryptonet.org',
          },],
        },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Asudem Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['solidity'],
      },
    }),
};

module.exports = config;
