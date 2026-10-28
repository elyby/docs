// Assembles the site root after "docusaurus build".
// Every locale is built into its own build/<locale>/ directory (see i18n.localeConfigs in
// docusaurus.config.ts), so files that must live in the site root are placed here.
import {cpSync, copyFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = join(projectDir, 'build');
const defaultLocale = 'ru';

if (!existsSync(join(buildDir, defaultLocale))) {
    // Partial build (e.g. "docusaurus build --locale en"): there is nothing to assemble
    console.warn(`[postbuild] build/${defaultLocale} not found, skipping the site root assembly`);
    process.exit(0);
}

// CNAME, .nojekyll, robots.txt and the language-detecting index.html
cpSync(join(projectDir, 'root'), buildDir, {recursive: true});

// GitHub Pages only serves the 404.html from the site root
copyFileSync(join(buildDir, defaultLocale, '404.html'), join(buildDir, '404.html'));

console.log('[postbuild] Site root assembled');
