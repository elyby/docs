// Assembles the site root after "docusaurus build".
// Every locale is built into its own build/<prefix>/ directory (see i18n.localeConfigs in
// docusaurus.config.ts), so files that must live in the site root are placed here.
import {cpSync, copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

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

writeFileSync(join(buildDir, 'robots.txt'), `User-agent: *
Allow: /

${locales.filter(({prefix}) => existsSync(join(buildDir, prefix, 'sitemap.xml'))).map(({prefix}) => `Sitemap: ${SITE_URL}/${prefix}/sitemap.xml`).join('\n')}
`);

console.log(`[postbuild] Site root assembled for locales: ${locales.map(({prefix}) => prefix).join(', ')}`);
