#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";

worlds=$(cat enabled-worlds.txt);
for world in $worlds; do
	world_slug="${world,,}";
	node get-bosses.mjs "${world}" > "data/${world_slug}/${date}.json";
	ln --symbolic --force "${date}.json" "data/${world_slug}/latest.json";
done;
