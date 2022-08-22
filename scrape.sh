#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node get-bosses.mjs > "data/vunira/bosses-${date}.json";
cp -r "data/vunira/bosses-${date}.json" "data/vunira/bosses-latest.json";
