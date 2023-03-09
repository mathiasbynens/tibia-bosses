#!/usr/bin/env bash

worlds=$(cat enabled-worlds.txt);
for world in $worlds; do
	node render-html.mjs "${world}";
done;

cp dist/vunira.html dist/index.html;
