import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Документация Ely.by',
  tagline: 'Документация публичных проектов Ely.by',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.ely.by',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'elyby', // Usually your GitHub org/user name.
  projectName: 'todo', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ru',
    locales: ['en', 'ru'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Документация Ely.by',
      logo: {
        alt: 'Логотип Ely.by',
        src: 'img/logo.svg',
      },
      items: [
         {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Проекты',
          items: [
            {
              label: 'Система скинов Ely.by',
              to: 'https://ely.by',
            },
            {
              label: 'Аккаунты Ely.by',
              to: 'https://account.ely.by',
            },
          ],
        },
        {
          title: 'Сообщество',
          items: [
            {
              label: 'X (Twitter)',
              href: 'https://x.com/erickskrauch',
            },
            {
              label: 'YouTube',
              href: 'https://www.youtube.com/c/ElyByOfficial',
            },
            {
              label: 'VK',
              href: 'https://vk.com/elyby',
            },
            {
              label: 'Discord',
              // todo
              href: 'https://ely.by',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/elyby',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ely.by. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: [
        'bash',
        'properties',
        'json',
        'batch',
        'url',
        'html',
        'php',
      ],
    },
    zoom: {
      selector: '.markdown :not(em) > img',
      config: {
        container: {
          top: 72,
          left: 0,
          right: 0,
          bottom: 16,
        },
      }
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    'docusaurus-plugin-image-zoom'
  ]
};

export default config;
