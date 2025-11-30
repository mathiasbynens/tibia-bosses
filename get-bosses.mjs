import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
const world = process.argv[2] ?? 'Vunira';
await page.goto(
	`https://guildstats.eu/bosses?rook=0&world=${encodeURIComponent(world)}`,
);

const bossesToCheck = await page.evaluate(() => {
	const UNINTERESTING_BOSSES = new Set([
		'Apprentice Sheng', // Rookgaard boss; not in Bosstiary.
		'Arthom The Hunter', // Mini World Change boss; not time-based.
		'Burster', // Not a time-based spawn.
		'draptors', // Not in Bosstiary; Grand Mother Foulscale is tracked separately.
		'Dreadful Disruptor', // Not a time-based spawn.
		'Fernfang', // Not in Bosstiary.
		'Furyosa', // Mini World Change boss; not time-based.
		'Munster', // Rookgaard boss; not in Bosstiary.
		'Oodok Witchmaster', // Mini World Change boss; not time-based.
		'Teleskor', // Rookgaard boss; not in Bosstiary.
		'undead cavebears', // Not in Bosstiary.
		'Court Warlock', // Not a time-based spawn.
	]);

	// Map from upstreamName => prettyName.
	// Keep this in sync with scrape-kills.mjs.
	const NAME_MAPPINGS = new Map([
		// Bosses.
		['man in the cave', 'Man in the Cave'],
		// Boss-like creatures.
		['midnight panthers', 'midnight panther'],
		['yetis', 'yeti'],
	]);

	const toPrettyName = (upstreamName) => {
		const prettyName = NAME_MAPPINGS.get(upstreamName) ?? upstreamName;
		const prettierName = prettyName
			.replaceAll(' The ', ' the ')
			.replaceAll(' Of ', ' of ');
		return prettierName;
	};

	const rows = document.querySelectorAll(
		'#myTable tr:has(span[style="color: green; font-weight: bold"])',
	);
	const bosses = [];
	for (const row of rows) {
		const boss = toPrettyName(row.querySelector('b').textContent.trim());
		if (UNINTERESTING_BOSSES.has(boss)) continue;
		const chanceCell = row.querySelector(
			'td:has(span[style="color: green; font-weight: bold"]',
		);
		if (!chanceCell) continue;
		const chance = chanceCell.textContent.trim();
		if (chance === 'No') continue;
		const percentage = Number(chance.match(/([^%)]+)%/)[1]);
		bosses.push({
			name: boss,
			chance: percentage,
		});
	}
	bosses.sort((a, b) => {
		return b.chance - a.chance;
	});
	return bosses;
});
await browser.close();

const result = {
	timestamp: new Date().toISOString(),
	bosses: bossesToCheck,
};
console.log(JSON.stringify(result, null, '\t'));
