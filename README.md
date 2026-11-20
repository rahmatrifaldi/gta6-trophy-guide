# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rahmatrifaldi/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rahmatrifaldi/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, kept as a detective's case file: every trophy with its official name, description and grade, a field report in our own words that cites its sources, an evidence log that saves in the browser, export and import, filters by kind, a spoiler setting that hides story trophies until they are earned, a three-stage operation plan to the platinum, and the one trophy you can miss — flagged in red and explained.

Version 2 (21 Nov 2026): a full visual redesign as a case file, the trophy data sorted in id order, and all five trophies that guide sites listed as unknown on 20 Nov now carry confirmed methods — four confirmed by two independent guides, and Bad Luck, I Guess following PowerPyx's full documented method. A Classic Blitz Play's street method is corrected (direct truck robberies have failed to pop for some players; the Chapter 4 mission is the sure route), and several guides gained specifics from the updated public guides (shooting-range sites, the Parrotfish catch, the garage prices with and without discount).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. It works with the network off: every file it loads lives under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. It first checks that `app/data/trophies.json` names all 55 trophies in id order with a guide each, and that `screenshots/` holds 3 or 4 renders within the size cap.

---

<sub>Entered on [make.fun](https://make.fun/?ref=b66x0zm8&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
