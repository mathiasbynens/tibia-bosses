#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node --no-warnings get-bosses.mjs > "data/vunira/bosses-${date}.txt";
cp -r "data/vunira/bosses-${date}.txt" "data/vunira/bosses-latest.txt";
