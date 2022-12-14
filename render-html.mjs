import fs from 'node:fs/promises';
import { escape as escapeHtml, startCase } from 'lodash-es';
import { minify as minifyHtml } from 'html-minifier-terser';

const slugify = (part) => {
	const first = part.at(0);
	// E.g. `'midnight panthers'`.
	if (/\p{Lowercase}/u.test(first) && part.at(-1) === 's') {
		const startCased = startCase(part);
		const singularized = startCased.slice(0, -1);
		part = singularized;
	}
	const underscored = part
		.replaceAll(' ', '_')
		.replaceAll('_The_', '_the_')
		.replaceAll('_Of_', '_of_');
	const encoded = encodeURIComponent(underscored);
	return encoded;
};

const formatNumber = (number) => {
	return `${number.toFixed(2)}%`;
};

const render = (data) => {
	const output = ['<div class="table-wrapper"><table><thead><tr><th>Boss<th>Confidence<tbody>'];
	for (const boss of data.bosses) {
		output.push(`<tr><td><a href="https://tibia.fandom.com/wiki/${slugify(boss.name)}">${boss.killed ? '<s>' : ''}${
			escapeHtml(
				boss.name
					.replaceAll(' The ', ' the ')
					.replaceAll(' Of ', ' of ')
			)
		}${boss.killed ? '</s>' : ''}${boss.killed ? ' (killed)' : ''}</a><td>${boss.killed ? '<s>' : ''}${formatNumber(boss.chance)}${boss.killed ? '</s>' : ''}`);
	}
	output.push(`</table></div><p>Last updated on <time>${escapeHtml(data.timestamp)}</time>.`);
	const html = output.join('');
	return html;
};

const json = await fs.readFile('./data/vunira/latest.json', 'utf8');
const data = JSON.parse(json);

const htmlTemplate = await fs.readFile('./templates/index.html', 'utf8');
const html = htmlTemplate.toString().replace('%%%DATA%%%', render(data));
const minifiedHtml = await minifyHtml(html, {
	collapseBooleanAttributes: true,
	collapseInlineTagWhitespace: false,
	collapseWhitespace: true,
	conservativeCollapse: false,
	decodeEntities: true,
	html5: true,
	includeAutoGeneratedTags: false,
	minifyCSS: true,
	minifyJS: true,
	preserveLineBreaks: false,
	preventAttributesEscaping: true,
	removeAttributeQuotes: true,
	removeComments: true,
	removeEmptyAttributes: true,
	removeEmptyElements: false,
	removeOptionalTags: false,
	removeRedundantAttributes: true,
	removeTagWhitespace: false,
	sortAttributes: true,
	sortClassName: true,
});
await fs.writeFile('./dist/index.html', minifiedHtml);
