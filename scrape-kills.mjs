// This script is ONLY meant to be run after Tibia.com updates its kill
// stats (which happens ~6 hours before server save).

import * as fs from 'node:fs/promises';
import {toPrettyName} from './normalize-kill-stats-names.mjs';

const latestBossDataPath = './data/vunira/latest.json';
const json = await fs.readFile(latestBossDataPath, 'utf8');
const bossData = JSON.parse(json);

// “Interesting” bosses are bosses that we want to report kills of,
// regardless of whether or not we thought they were “on chance”. This
// includes bosses that are never “on chance” such as Burster and
// Mahatheb.
// Note: Keep this in sync with https://github.com/tibiamaps/tibia-kill-stats/blob/31b817dc8d789549eb62a5f4614ca7753db878e8/analyze-bosses.mjs#LL300C24-L374C6.
const INTERESTING_BOSSES = new Set([
	// Boss-like creatures.
	'draptor',
	'midnight panther',
	'yeti',
	// Bosses.
	'Arachir the Ancient One',
	'Arthom the Hunter',
	'Barbaria',
	'Battlemaster Zunzu',
	'Big Boss Trolliver',
	'Burster',
	'Captain Jones',
	'Countess Sorrow',
	'Devovorga',
	'Dharalion',
	'Diblis the Fair',
	'Dracola',
	'Dreadful Disruptor',
	'Dreadmaw',
	'Elvira Hammerthrust',
	'Ferumbras',
	'Flamecaller Zazrak',
	'Fleabringer',
	'Foreman Kneebiter',
	'Furyosa',
	'General Murius',
	'Ghazbaran',
	'Grandfather Tridian',
	'Gravelord Oshuran',
	'Groam',
	'Grorlam',
	'Hairman the Huge',
	'Hatebreeder',
	'High Templar Cobrass',
	'Hirintror',
	'Horestis',
	'Jesse the Wicked',
	'Mahatheb',
	'Man in the Cave',
	'Massacre',
	'Morgaroth',
	'Mornenion',
	'Morshabaal',
	'Mr. Punish',
	'Ocyakao',
	'Omrafir',
	'Oodok Witchmaster',
	'Orshabaal',
	'Robby the Reckless',
	'Rotworm Queen',
	'Rukor Zad',
	'Shlorg',
	'Sir Valorcrest',
	'Smuggler Baron Silvertoe',
	'The Abomination',
	'The Big Bad One',
	'The Evil Eye',
	'The Frog Prince',
	'The Handmaiden',
	'The Hungerer',
	'The Imperor',
	'The Manhunter',
	'The Mean Masher',
	'The Old Whopper',
	'The Pale Count',
	'The Plasmother',
	'The Voice of Ruin',
	'The Welter',
	'Tyrn',
	'Tzumrah the Dazzler',
	'Warlord Ruzad',
	'White Pale',
	'Xenia',
	'Yaga the Crone',
	'Yakchal',
	'Zarabustor',
	'Zevelon Duskbringer',
	'Zushuka',
]);

const getCreaturesKilledSinceServerSave = async () => {
	const response = await fetch('https://api.tibiadata.com/v3/killstatistics/Vunira');
	const data = await response.json();
	const entries = data.killstatistics.entries;
	const creaturesKilledSinceServerSave = new Set();
	for (const entry of entries) {
		const hasBeenKilledSinceServerSave = entry.last_day_killed > 0;
		if (hasBeenKilledSinceServerSave) {
			const normalized = toPrettyName(entry.race);
			creaturesKilledSinceServerSave.add(normalized);
		}
	}
	return creaturesKilledSinceServerSave;
};

const handledBosses = new Set();
const creaturesKilledSinceServerSave = await getCreaturesKilledSinceServerSave();
for (const boss of bossData.bosses) {
	const name = boss.name;
	if (creaturesKilledSinceServerSave.has(name)) {
		boss.killed = true;
	}
	handledBosses.add(name);
}
for (const creature of creaturesKilledSinceServerSave) {
	if (handledBosses.has(creature)) continue;
	if (INTERESTING_BOSSES.has(creature)) {
		bossData.bosses.push({
			name: creature,
			chance: 0,
			killed: true,
		});
	}
}
bossData.timestamp = new Date().toISOString();
const updatedJson = JSON.stringify(bossData, null, '\t') + '\n';
fs.writeFile(latestBossDataPath, updatedJson);
