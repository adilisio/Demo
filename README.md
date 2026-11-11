# SALTGLASS

*A post-atomic radio adventure.*

You are the Keeper of Lantern Station, a shortwave relay in a dead lighthouse on the
edge of the Saltglass: a fused, glittering salt flat where an inland sea used to be.
For 131 years a numbers station called the Metronome has counted on 5.110 MHz.
Tonight it stopped, and a voice said your name.

## How to play

Open `index.html` in a browser. That's it: no build step, no server, no network.
It also works when served from any static host.

- Keys **1-9** choose an option. Click works too.
- Greyed-out options show why they are locked.
- `[WITS 7]` style tags are skill checks: 2d6 + stat against the number. The roll is shown.
- **J** opens the journal (pack, keys, allies, notes).
- Click the text or press any key to finish the typewriter reveal.
- Progress autosaves after every scene. **Continue** resumes it.
- Endings found are remembered in your browser.

Two of the three keys (dose-suit, passphrase, power cell) open the stairs to Deepwell
Meridian. Finding all three keys and all three allies unlocks the best ending.

## Files

- `index.html`: page shell and CRT styling.
- `story.js`: all story content as data (`window.STORY`).
- `engine.js`: state, rules, rendering, saving.
- `tools/validate.js`: checks the story graph and word counts. Run `node tools/validate.js`.
