#!/usr/bin/env bash

date="$(date +'%Y-%m-%d')";
node get-bosses.mjs > "data/vunira/${date}.json";
ln --symbolic --force "${date}.json" "data/vunira/latest.json";
