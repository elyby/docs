// Prints the comma-separated list of locales to publish (the DOCS_LOCALES env variable for the build).
// Russian (the source language) and English (also stored in the repository) are always published,
// other languages only when their translation progress in Crowdin reaches MIN_PROGRESS.
//
// Requires the CROWDIN_PERSONAL_TOKEN env variable.

const API_URL = 'https://ely.api.crowdin.com/api/v2';
const PROJECT_ID = 2;
const MIN_PROGRESS = 60;
const ALWAYS_PUBLISHED = ['ru', 'en'];

// Crowdin language id => Docusaurus locale. Must match "languages_mapping" in crowdin.yml
// and the localeConfigs in docusaurus.config.ts
const LOCALES_MAPPING = {
    'zh-CN': 'zh-Hans',
};

const token = process.env.CROWDIN_PERSONAL_TOKEN;
if (!token) {
    console.error('The CROWDIN_PERSONAL_TOKEN env variable is not set');
    process.exit(1);
}

const response = await fetch(`${API_URL}/projects/${PROJECT_ID}/languages/progress?limit=500`, {
    headers: {Authorization: `Bearer ${token}`},
});
if (!response.ok) {
    console.error(`Crowdin API responded with ${response.status}: ${await response.text()}`);
    process.exit(1);
}

const locales = [...ALWAYS_PUBLISHED];
for (const {data: progress} of (await response.json()).data) {
    const locale = LOCALES_MAPPING[progress.languageId] ?? progress.languageId;
    const published = progress.translationProgress >= MIN_PROGRESS;
    console.error(`${progress.languageId} (${locale}): ${progress.translationProgress}%${published ? '' : `, less than ${MIN_PROGRESS}%, skipping`}`);
    if (published && !locales.includes(locale)) {
        locales.push(locale);
    }
}

console.log(locales.join(','));
