// This script is ONLY meant to be run after Tibia.com updates its kill
// stats (which happens ~6 hours before server save).

import * as fs from 'node:fs/promises';

const latestBossDataPath = './data/vunira/latest.json';
const json = await fs.readFile(latestBossDataPath, 'utf8');
const bossData = JSON.parse(json);

// Map from upstreamName => prettyName.
// Keep this in sync with get-bosses.mjs.
const NAME_MAPPINGS = new Map([
	['midnight panthers', 'midnight panther'],
	['yetis', 'yeti'],
]);

const normalize = (bossName) => {
	const prettyName = NAME_MAPPINGS.get(bossName);
	return prettyName || bossName.toLowerCase();
};

const getCreaturesKilledSinceServerSave = async () => {
	const response = await fetch('https://api.tibiadata.com/v3/killstatistics/Vunira');
	const data = await response.json();
	const entries = data.killstatistics.entries;
	const creaturesKilledSinceServerSave = new Set();
	for (const entry of entries) {
		const hasBeenKilledSinceServerSave = entry.last_day_killed > 0;
		if (hasBeenKilledSinceServerSave) {
			const normalized = normalize(entry.race);
			creaturesKilledSinceServerSave.add(normalized);
		}
	}
	return creaturesKilledSinceServerSave;
};

const creaturesKilledSinceServerSave = await getCreaturesKilledSinceServerSave();
for (const boss of bossData.bosses) {
	const normalized = normalize(boss.name);
	if (creaturesKilledSinceServerSave.has(normalized)) {
		boss.killed = true;
	}
}
bossData.timestamp = new Date().toISOString();
const updatedJson = JSON.stringify(bossData, null, '\t') + '\n';
fs.writeFile(latestBossDataPath, updatedJson);
