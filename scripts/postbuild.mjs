// Assembles the site root after "docusaurus build".
// Every locale is built into its own build/<prefix>/ directory (see i18n.localeConfigs in
// docusaurus.config.ts), so files that must live in the site root are placed here.
import { cpSync, copyFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://docs.ely.by';
const DEFAULT_PREFIX = 'ru';
// Browser languages, whose speakers are more likely to understand Russian than English
const RUSSIAN_SPEAKING = ['ru', 'be', 'uk', 'kk'];

const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(projectDir, 'build');

if (!existsSync(join(buildDir, DEFAULT_PREFIX, 'index.html'))) {
    // Partial build (e.g. "docusaurus build --locale en"): there is nothing to assemble
    console.warn(`[postbuild] build/${DEFAULT_PREFIX} not found, skipping the site root assembly`);
    process.exit(0);
}

// Collect built locales: { prefix: "zh", lang: "zh-CN" }
const locales = readdirSync(buildDir, {withFileTypes: true})
    .filter((entry) => entry.isDirectory() && existsSync(join(buildDir, entry.name, 'index.html')))
    .map(({name: prefix}) => {
        const html = readFileSync(join(buildDir, prefix, 'index.html'), 'utf8');
        const lang = html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] ?? prefix;

        return {prefix, lang};
    });

// Language name in the language itself: "русский", "English", "中文（中国）"
function languageName(lang) {
    const name = new Intl.DisplayNames([lang], {type: 'language'}).of(lang) ?? lang;

    return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
}

// CNAME and .nojekyll
cpSync(join(projectDir, 'root'), buildDir, {recursive: true});

// GitHub Pages only serves the 404.html from the site root
copyFileSync(join(buildDir, DEFAULT_PREFIX, '404.html'), join(buildDir, '404.html'));

// Browsers and other clients request /favicon.ico when a page doesn't declare its icons
copyFileSync(join(buildDir, DEFAULT_PREFIX, 'img', 'favicon.ico'), join(buildDir, 'favicon.ico'));

// The site root redirects to the documentation in the browser's language
const languagesMap = Object.fromEntries([
    ...RUSSIAN_SPEAKING.map((lang) => [lang, DEFAULT_PREFIX]),
    ...locales.map(({prefix, lang}) => [lang.toLowerCase().split('-')[0], prefix]),
]);
const fallbackPrefix = locales.some(({prefix}) => prefix === 'en') ? 'en' : DEFAULT_PREFIX;

writeFileSync(join(buildDir, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ely.by Documentation</title>
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="icon" href="/${DEFAULT_PREFIX}/img/favicon.svg" type="image/svg+xml">
${locales.map(({prefix, lang}) => `    <link rel="alternate" hreflang="${lang}" href="${SITE_URL}/${prefix}/">`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}/${DEFAULT_PREFIX}/">
    <script>
        (function () {
            var map = ${JSON.stringify(languagesMap)};
            var languages = navigator.languages || [navigator.language || ''];
            var target = ${JSON.stringify(fallbackPrefix)};
            for (var i = 0; i < languages.length; i++) {
                var lang = String(languages[i]).toLowerCase().split('-')[0];
                if (map[lang]) {
                    target = map[lang];
                    break;
                }
            }

            window.location.replace('/' + target + '/' + window.location.search + window.location.hash);
        })();
    </script>
</head>
<body>
    <ul>
${locales.map(({prefix, lang}) => `        <li><a href="/${prefix}/" hreflang="${lang}">${languageName(lang)}</a></li>`).join('\n')}
    </ul>
</body>
</html>
`);

// Every locale build produces its own sitemap.xml. They are merged into a single /sitemap.xml, where each page
// lists its translations (hreflang), so search engines know which pages are the same in different languages
const pages = new Map(); // path inside a locale ("/api") => [{prefix, lang, loc}]
for (const {prefix, lang} of locales) {
    const sitemapPath = join(buildDir, prefix, 'sitemap.xml');
    if (!existsSync(sitemapPath)) {
        continue;
    }

    for (const [, loc] of readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
        const path = loc.slice(`${SITE_URL}/${prefix}`.length) || '/';
        pages.set(path, [...(pages.get(path) ?? []), {prefix, lang, loc}]);
    }

    rmSync(sitemapPath);
}

const sitemapUrls = [...pages.values()].flatMap((translations) => translations.map(({loc}) => [
    '    <url>',
    `        <loc>${loc}</loc>`,
    ...translations.map((alternate) => `        <xhtml:link rel="alternate" hreflang="${alternate.lang}" href="${alternate.loc}"/>`),
    ...translations.filter(({prefix}) => prefix === DEFAULT_PREFIX).map((alternate) => `        <xhtml:link rel="alternate" hreflang="x-default" href="${alternate.loc}"/>`),
    '    </url>',
].join('\n')));

// The locale sitemaps are removed after merging, so don't overwrite the result when the script runs again
if (pages.size > 0) {
    writeFileSync(join(buildDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>
`);
}

writeFileSync(join(buildDir, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);

console.log(`[postbuild] Site root assembled for locales: ${locales.map(({prefix}) => prefix).join(', ')}`);
