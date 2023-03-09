#!/usr/bin/env bash

worlds=$(cat enabled-worlds.txt);
for world in $worlds; do
	node --no-warnings scrape-kills.mjs "${world}";
done;
