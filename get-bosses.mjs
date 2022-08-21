import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://guildstats.eu/bosses?rook=0&world=Vunira');

const bossesToCheck = await page.evaluate(() => {
	const UNINTERESTING_BOSSES = new Set([
		'Apprentice Sheng', // Rookgaard boss; not in Bosstiary.
		'Arthom The Hunter', // Mini World Change boss.
		'Furyosa', // Mini World Change boss.
		'midnight panthers', // Not in Bosstiary.
		'Munster', // Rookgaard boss; not in Bosstiary.
		'Oodok Witchmaster', // Mini World Change boss.
		'Teleskor', // Rookgaard boss; not in Bosstiary.
		'undead cavebears', // Not in Bosstiary.
	]);

	const rows = document.querySelectorAll('#myTable tr:has(span[style])');
	const bosses = [];
	for (const row of rows) {
		const boss = row.querySelector('b').textContent.trim();
		if (UNINTERESTING_BOSSES.has(boss)) continue;
		const chance = row.querySelector('td:has(span[style]').textContent.trim();
		if (chance === 'No') continue;
		const percentage = Number(chance.match(/Yes \(([^%)]+)%\)/)[1]);
		bosses.push({ name: boss, chance: percentage });
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
console.log(result);
