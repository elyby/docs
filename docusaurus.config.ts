import {themes as prismThemes} from 'prism-react-renderer';
import type {Config, I18nLocaleConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// All locales the documentation can be built for. Translations are downloaded from Crowdin during the CI build
const localeConfigs: Record<string, Partial<I18nLocaleConfig>> = {
    ru: {
        baseUrl: '/ru/',
    },
    en: {
        baseUrl: '/en/',
    },
    'zh-Hans': {
        baseUrl: '/zh/',
        htmlLang: 'zh-CN',
    },
};

// Locales to build. CI publishes only translations with enough progress (see scripts/crowdin-locales.mjs)
// and passes them via the DOCS_LOCALES env variable, e.g. "ru,en,zh-Hans"
const locales = process.env.DOCS_LOCALES
    ? process.env.DOCS_LOCALES.split(',').map((locale) => locale.trim()).filter(Boolean)
    : ['ru', 'en'];

for (const locale of locales) {
    if (!(locale in localeConfigs)) {
        throw new Error(`Unknown locale "${locale}" in DOCS_LOCALES. Add it to the localeConfigs in docusaurus.config.ts`);
    }
}

if (!locales.includes('ru')) {
    locales.unshift('ru');
}

const config: Config = {
    title: 'Документация Ely.by',
    tagline: 'Документация публичных проектов Ely.by',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://docs.ely.by',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',
    // Generate "page.html" files instead of "page/index.html" so that the URLs
    // of the old Sphinx-based documentation (/ru/api.html) keep working as is
    trailingSlash: false,

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'elyby', // Usually your GitHub org/user name.
    projectName: 'todo', // Usually your repo name.

    onBrokenLinks: 'throw',

    customFields: {
        buildYear: new Date().getFullYear(),
    },

    markdown: {
        hooks: {
            onBrokenMarkdownLinks: 'throw',
        },
    },

    i18n: {
        defaultLocale: 'ru',
        locales: locales as [string, ...string[]],
        // Each locale lives under its own prefix to preserve the URLs of the old documentation.
        // The site root is assembled by the "postbuild" script (see scripts/postbuild.mjs)
        localeConfigs: Object.fromEntries(locales.map((locale) => [locale, localeConfigs[locale]])),
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
            // {year} is replaced with the build year by the swizzled Footer/Copyright component, so the translatable
            // string doesn't change every year
            copyright: 'Copyright © {year} Ely.by. Built with Docusaurus.',
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
            additionalLanguages: [
                'bash',
                'properties',
                'json',
                'batch',
                'uri',
                'markup',
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
