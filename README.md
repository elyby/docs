# Ely.by Docs

Source of [docs.ely.by](https://docs.ely.by), built with [Docusaurus](https://docusaurus.io).

## Development

Requires Node.js 22.

```sh
npm ci
npm run start
```

The dev server shows the Russian version. To check another language, download the translations from Crowdin (requires the `CROWDIN_PERSONAL_TOKEN` environment variable) and start the server for that locale:

```sh
npm run write-translations -- --locale ru --override
npx @crowdin/cli@4 download
npm run start -- --locale en
```

`npm run build` builds the whole site into `build/`, `npm run serve` serves it.

## Writing

- Pages are written in Russian in `docs/` (MDX). Don't wrap lines: one paragraph is one line. Use soft-wrap with your preferred line width.
- Translations are made only on [Crowdin](https://ely.crowdin.com). The `i18n/` directory is generated and not committed.
