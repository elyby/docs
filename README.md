# Ely.by Docs

Source of [docs.ely.by](https://docs.ely.by), built with [Docusaurus](https://docusaurus.io).

## Development

Requires Node.js 22.

```sh
npm ci
npm run start
```

The dev server shows the Russian version. To check another language, download the translations from Crowdin
(requires the `CROWDIN_PERSONAL_TOKEN` environment variable) and start the server for that locale:

```sh
npm run write-translations -- --locale ru --override
npx @crowdin/cli@4 download
npm run start -- --locale en
```

`npm run build` builds the whole site into `build/`, `npm run serve` serves it.

## Writing

- Pages are written in Russian in `docs/` (MDX). Don't wrap lines: one paragraph is one line.
- Translations are made only on [Crowdin](https://ely.crowdin.com). The `i18n/` directory is generated and not committed.
- Keep the `{#id}` of headings: they are the anchors of the existing links.

## Deployment

Every push to `master` uploads the source strings to Crowdin, downloads the translations and deploys the site
to the `gh-pages` branch. A language is published once its translation reaches 60%. The site is also rebuilt
nightly to publish fresh translations.
