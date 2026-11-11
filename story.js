/*
 * SALTGLASS - story data.
 * Plain data plus a few small text functions. Loads in the browser as
 * window.STORY and in Node via module.exports (see tools/validate.js).
 *
 * Node shape:
 *   { title, text (string | function(state) -> string), onEnter?: Effects,
 *     ending?: true, death?: true, choices?: Choice[] }
 * Choice shape:
 *   { label, to | random: [ids] | check: {stat, dc, success, fail,
 *     successEffects?, failEffects?}, requires?: Cond | Cond[], effects?: Effects }
 * Effects: { hp, glow, scrip (deltas), stats: {grit,wits,charm} (deltas),
 *     add: [item], remove: [item], keys: [key], allies: [ally],
 *     flags: {name: value}, counters: {name: delta}, note: 'journal line' }
 * Cond: { stat, min } | { item } | { flag } | { notFlag } | { ally } |
 *     { key } | { notKey } | { keysAtLeast } | { minScrip } |
 *     { counter, min } | { maxGlow }      (each may carry `why`)
 */
(function (root) {
  'use strict';

  var STORY = {
    title: 'SALTGLASS',
    subtitle: 'A post-atomic radio adventure',
    start: 'cold_open',
    deaths: { hp: 'death_hp', glow: 'death_glow' },

    nodes: {

      /* ============================ ACT 1 ============================ */

      cold_open: {
        title: 'The Count Stops',
        text: `At 02:14 the count stops. For a hundred and thirty-one years the Metronome has broadcast the same slow sequence on 5.110 megahertz, one number every four seconds, and you have heard it every night since you were small, the way you hear your own pulse. Tonight the next number does not come. There is only hiss, thin and grey, and then a voice cuts through it, flat and unhurried, like someone reading from a card.

"Lantern Station. Keeper. Come home."

Then the hiss again. The brass dial glows amber. Outside, wind pushes salt against the lighthouse glass like sand against a window, and the lamp above you ticks as it warms.`,
        choices: [
          { label: `Keep the handset to your ear and listen harder.`, to: 'cold_open_2' },
          { label: `Key the microphone and ask who is calling.`, to: 'cold_open_2',
            effects: { note: `You asked who was calling. The silence answered politely.` } }
        ]
      },

      cold_open_2: {
        title: 'Come Home',
        text: `You wait. The hiss rises and falls like surf on a shore that drowned long ago. Odalys used to say the Metronome was a clock somebody forgot to switch off, built by people who wanted someone to notice when it stopped. She said it drily, the way she said most things. She has been six months under the blue stones at the dune's edge now, and her chair still holds the shape of her.

The voice returns once, softer, almost embarrassed. "Keeper. Please." Then the carrier drops out, and the quiet is so complete you can hear the lamp glass pinging as it heats.

Something in your chest has already stood up.`,
        choices: [
          { label: `Pull on your coat and think about who you were before this.`, to: 'background' }
        ]
      },

      background: {
        title: 'Before the Lamp',
        text: `Odalys took you in when you were nineteen and sure you were finished. She said she needed a pair of hands and a mouth that could argue with weather. Before the station, you made your living the way the Saltglass taught everyone: by being good at one thing and selling it to whoever was hungry. Nobody crosses the flat without a trade. The sail-carts want drivers, the tallymen want clerks, the Choir want believers, and everybody wants a repair.

So what did you sell?`,
        choices: [
          { label: `Scrap: copper and steel pulled out of the wrecks. You can hear a bad weld across a room. (GRIT 3, WITS 1, CHARM 1)`,
            to: 'distribute_1', effects: { stats: { grit: 3, wits: 1, charm: 1 }, note: `Background: Scrapper.` } },
          { label: `Wirehead: radios for the sail-cart crews, and an ear for a fault in the static. (GRIT 1, WITS 3, CHARM 1)`,
            to: 'distribute_1', effects: { stats: { grit: 1, wits: 3, charm: 1 }, note: `Background: Wirehead.` } },
          { label: `Barker: tonic and talk on the car deck of Brinetown. You could sell a bone to a dog. (GRIT 1, WITS 1, CHARM 3)`,
            to: 'distribute_1', effects: { stats: { grit: 1, wits: 1, charm: 3 }, note: `Background: Barker.` } }
        ]
      },

      distribute_1: {
        title: 'Two Points',
        text: `Your past gets you started. It does not finish you. Two points are still unspent, and the road will spend them for you if you do not choose first. The Saltglass does not care what you used to do. It cares whether you can take a hit, read a face, or find a line through the glare. Think about the night ahead: hounds on the crust, pirates on their carts, glow-storms that rise like a tide, and people who will want something from you before they say hello.`,
        choices: [
          { label: `+1 GRIT. You can take a hit and keep standing.`, to: 'distribute_2', effects: { stats: { grit: 1 } } },
          { label: `+1 WITS. You see the trick before it closes.`, to: 'distribute_2', effects: { stats: { wits: 1 } } },
          { label: `+1 CHARM. People tell you more than they mean to.`, to: 'distribute_2', effects: { stats: { charm: 1 } } }
        ]
      },

      distribute_2: {
        title: 'One Point Left',
        text: `One point left, and it is the last one you will get before the road starts asking questions. You can feel the old lamp room humming overhead through the stairwell, a sound that has been in your ears since childhood. Odalys left the station in good order, which means she left it full of small problems she expected you to solve. Spend the point well. Then get up off the floor and go find out what she was afraid of.`,
        choices: [
          { label: `+1 GRIT. Your shoulders are ready for a fight.`, to: 'station_entry', effects: { stats: { grit: 1 } } },
          { label: `+1 WITS. You want to know how things work.`, to: 'station_entry', effects: { stats: { wits: 1 } } },
          { label: `+1 CHARM. You know how to make a stranger lean in.`, to: 'station_entry', effects: { stats: { charm: 1 } } }
        ]
      },

      station_entry: {
        title: 'Lantern Station',
        text: `Lantern Station stands where the sea used to break: a lighthouse with its lamp room cracked and its lower rooms drifted with dune sand. Odalys kept the living quarters spotless out of spite. The radio room is on the second floor, racks of valves glowing behind a grille. The gear locker sits under the stairs. The logbook lies open on her desk where she left it.

You have a few hours before the glow comes up from the south. The count is still silent. Whatever you do next, you will do it with your own hands.`,
        choices: [
          { label: `Read Odalys's logbook.`, to: 'logbook' },
          { label: `Open the gear locker.`, to: 'gear_locker',
            requires: { notFlag: 'gear', why: 'you have already taken her gear' } },
          { label: `Climb to the radio room and walk the direction-finder.`, to: 'radio_room',
            requires: { flag: 'logbook', why: 'read the logbook first' } },
          { label: `Set out onto the crust.`, to: 'set_out',
            requires: [
              { flag: 'logbook', why: 'read the logbook' },
              { flag: 'gear', why: 'take something from the locker' },
              { flag: 'triangulated', why: 'find the bearing in the radio room' }
            ] }
        ]
      },

      logbook: {
        title: "Odalys's Logbook",
        text: `The logbook is a grey ledger with a cracked spine. Her handwriting shrinks as the pages go on, from careful capitals to hurried slants. Most entries are weather, tides, and the wrecks she logged on the crust. Then, eleven months before she died, a page dated in shaking ink:

"Heard the count again, and the voice under it. It said my name. Bearing 214 from the lamp, toward the second tower. Did not go. Will not go. I think the count is the only thing keeping something asleep, and I should not be the one to find out what happens when it stops."

The bearing is boxed and underlined twice.`,
        onEnter: { flags: { logbook: true }, note: `Odalys's bearing: 214 from the lamp, toward the second tower.` },
        choices: [
          { label: `Close the book and go back to the station room.`, to: 'station_entry' }
        ]
      },

      gear_locker: {
        title: 'The Gear Locker',
        text: `The locker smells of oil and mothballs. Three things sit on the shelf, each wrapped in a note in Odalys's hand. The first is a revolver in oilcloth, labelled THE ARGUMENT, with four rounds in a tin. The second is a steel toolkit with its tools cradled in grey foam. The third is a biscuit tin of trade scrip with a bag of tonic bottles tucked beside it, and a note that says: FOR THE DAY YOU HAVE TO BUY SOMEONE.

You can take one of them. The rest stay where they are.`,
        choices: [
          { label: `Take the revolver, THE ARGUMENT, and its four rounds.`, to: 'station_entry',
            effects: { add: ['revolver'], counters: { ammo: 4 }, flags: { gear: true }, note: `Took THE ARGUMENT and four rounds.` } },
          { label: `Take the steel toolkit.`, to: 'station_entry',
            effects: { add: ['toolkit'], flags: { gear: true }, note: `Took Odalys's toolkit.` } },
          { label: `Take the biscuit tin: thirty scrip and a tonic.`, to: 'station_entry',
            effects: { scrip: 30, add: ['tonic'], flags: { gear: true }, note: `Took thirty scrip and a tonic from the biscuit tin.` } },
          { label: `Leave the locker shut for now.`, to: 'station_entry' }
        ]
      },

      radio_room: {
        title: 'The Radio Room',
        text: `The room is warm and loud with valves. The direction-finder is a brass ring on a stand, its needle as thin as a hair. You tune it to 5.110 and the empty carrier bleeds through, faint as breath. Odalys's bearing is 214 from the lamp. You turn the ring until the needle trembles, then settles, and you feel it: a pull in the bones, south-west, into the flat, toward somewhere under the centre of the Saltglass where the ground is hot and the signal does not wander.`,
        choices: [
          { label: `Walk the bearing carefully.`, check: { stat: 'wits', dc: 7,
              success: 'station_entry', fail: 'station_entry',
              successEffects: { flags: { triangulated: true }, note: `A clean fix: the signal comes from under the flat's centre, deep and steady.` },
              failEffects: { flags: { triangulated: true }, note: `A rough fix: the needle wanders, but the direction holds.` } } }
        ]
      },

      set_out: {
        title: 'Setting Out',
        text: `You pack what the station has given you, and step out past the cracked lamp room onto the crust. Dawn is a grey stripe over the flat. The salt crunches like sugar under your boots and throws the light back up into your face. Behind you the lighthouse keeps its lamp burning on a timer Odalys set years ago. Ahead the old shoreline road runs out across the white, marked by faded yellow lines that somebody once painted with great care. You follow them.`,
        choices: [
          { label: `Walk out onto the Saltglass road.`, to: 'map' }
        ]
      },

      /* ============================ ACT 2 ============================ */

      map: {
        title: 'The Saltglass Road',
        text: function (s) {
          var words = ['none', 'one', 'two', 'three'];
          var n = s.keys.length;
          var line = (n >= 2)
            ? `Under the centre of the flat, the stairs down to Deepwell Meridian are unsealed to anyone with two keys. You have ${words[n] || n}.`
            : `Under the centre of the flat, the stairs down to Deepwell Meridian are sealed. They want two keys before they open. You have ${words[n] || n}.`;
          return `The Saltglass goes on past the horizon in every direction: a white plain that rings under boots and glitters where the sun catches the fused crust. The old shoreline road runs across it, marked by yellow paint nobody has renewed in a century. Three places are worth the walk. Brinetown lies west, a trade town built inside a beached car ferry. The Choir's cooling tower stands north over a reactor that still ticks. The Rustwrights' crawler, Patience, grinds slowly east.\n\n` + line;
        },
        choices: [
          { label: `Go west to Brinetown, the ferry town.`, to: 'bt_gate' },
          { label: `Go north to the Choir's cooling tower.`, to: 'choir_gate' },
          { label: `Go east to the Rustwrights' crawler, Patience.`, to: 'patience_gate' },
          { label: `Walk the road for a while. Something may come.`, to: 'road' },
          { label: `Rest in the lee of a wrecked ferry ramp.`, to: 'shelter' },
          { label: `Go down the stairs to Deepwell Meridian.`, to: 'dw_stairs',
            requires: { keysAtLeast: 2, why: 'needs two of the three keys' } }
        ]
      },

      road: {
        title: 'The Long Way',
        text: `The road is a line of yellow paint worn to a ghost. Wind pushes thin white dust across it in long snakes. The Saltglass makes its own sounds as you walk: the tick of cooling crust, a wind-chime of broken glass somewhere ahead, the far snap of a sail-cart's canvas, and your own breathing, which is louder than you would like.

Something out there is watching the road. Something always is.`,
        choices: [
          { label: `Keep walking.`,
            random: ['hound_r1', 'road_pirates', 'road_custodian', 'road_storm', 'road_salvage', 'road_radio', 'map'] },
          { label: `Turn back toward the map.`, to: 'map' }
        ]
      },

      shelter: {
        title: 'The Ferry Ramp',
        text: `You find the lee of a wrecked ferry ramp, cool and blessedly dark under a sheet of rusting steel. Someone has left a clean blanket folded on the concrete and a dead lantern on a hook. For a while you do nothing but sit, listen to your heart, and let the salt in your hair settle. The glow outside is a lilac ghost on the far wall. Here you are small and out of the wind, which is more than the flat will give you for long.

You can rest until the light softens, or get up now while your legs still listen to you.`,
        choices: [
          { label: `Rest until the light softens. (+3 HP, -1 glow)`, to: 'map', effects: { hp: 3, glow: -1 } },
          { label: `Get up and keep walking.`, to: 'map' }
        ]
      },

      hound_r1: {
        title: 'Glass-Hound',
        text: `It comes low across the crust, all ribs and hunger. Its hide is crusted with salt that catches the light like sugar frost, and its eyes are the colour of old brass. It circles once, testing the distance between you and the road, then drops its shoulder and runs straight at your legs.

There is no time to think. There is only time to choose how you will not die.`,
        choices: [
          { label: `Stand and swing at it with the pipe.`,
            check: { stat: 'grit', dc: 7, success: 'hound_r2', fail: 'hound_r2',
              failEffects: { hp: -3, note: `The hound's shoulder took you off your feet.` } } },
          { label: `Shoot it with THE ARGUMENT.`, to: 'hound_won',
            requires: [
              { item: 'revolver', why: 'needs: THE ARGUMENT' },
              { counter: 'ammo', min: 1, why: 'no rounds left' }
            ],
            effects: { counters: { ammo: -1 } } },
          { label: `Break for the cart.`,
            check: { stat: 'wits', dc: 6, success: 'map', fail: 'hound_r2',
              successEffects: { note: `Got clear of a glass-hound by reading the ground.` },
              failEffects: { hp: -2 } } }
        ]
      },

      hound_r2: {
        title: 'Second Pass',
        text: `The hound comes back slower, with blood in the salt behind it. It has learned where you stand, and it is no longer in a hurry. Its breath steams and its brass eyes do not leave your hands. This is the last exchange you will get before one of you stops moving. There is no third chance in a fight like this, and you both know it.`,
        choices: [
          { label: `Finish it with the pipe.`,
            check: { stat: 'grit', dc: 7, success: 'hound_won', fail: 'hound_lost' } },
          { label: `Shoot it with THE ARGUMENT.`, to: 'hound_won',
            requires: [
              { item: 'revolver', why: 'needs: THE ARGUMENT' },
              { counter: 'ammo', min: 1, why: 'no rounds left' }
            ],
            effects: { counters: { ammo: -1 } } },
          { label: `Break and run.`,
            check: { stat: 'wits', dc: 8, success: 'map', fail: 'hound_lost',
              successEffects: { note: `Clear of the glass-hound at last.` } } }
        ]
      },

      hound_won: {
        title: 'Clean Kill',
        text: `The hound lies still on the glass, ribs heaving and then not. You stand over it with your breath sawing and your hands shaking, which is how you know you are still alive. Its hide would sell in Brinetown. Its teeth are the kind the collectors pay for. You are not a collector, but you take the tongue anyway, because Odalys would have, and because the road will remember which of you was faster.`,
        onEnter: { note: `Killed a glass-hound on the road.` },
        choices: [
          { label: `Walk on.`, to: 'map' }
        ]
      },

      hound_lost: {
        title: 'Down in the Salt',
        text: `The hound's teeth find the meat of your calf and you go down into the salt. Your palms are cut. The glare is in your eyes. By the time you get your feet under you the animal has gone, dragging a pale trail toward the shimmer, and it has taken a strip of your coat with it. You are alive. That is the honest word for it, and mostly the only one that matters.`,
        onEnter: { hp: -2, note: `A glass-hound bit you on the road. The salt stings for days.` },
        choices: [
          { label: `Drink a tonic. (needs: a tonic)`, to: 'map',
            requires: { item: 'tonic', why: 'needs: a tonic' },
            effects: { hp: 6, remove: ['tonic'] } },
          { label: `Crawl back to the road.`, to: 'map' }
        ]
      },

      road_pirates: {
        title: 'Toll Road',
        text: `Three sail-carts come out of the glare with their canvas patched in ledger pages, sails snapping in the wind. The lead cart stops across the road. A woman in a salt-stiff coat leans on the rail with a brass bell in one hand, and she is smiling the way people smile when they have already done the sums.

"Toll," she says. "Five scrip, or something of equal weight. I am not particular."`,
        choices: [
          { label: `Pay five scrip.`, to: 'map', requires: { minScrip: 5, why: 'needs 5 scrip' },
            effects: { scrip: -5, note: `Paid the salt-pirate toll.` } },
          { label: `Talk your way past them.`,
            check: { stat: 'charm', dc: 8, success: 'map', fail: 'map',
              successEffects: { note: `Talked past the salt-pirates. The bell rang twice, approving.` },
              failEffects: { scrip: -4, note: `The salt-pirates took what they could reach.` } } },
          { label: `Stand your ground.`,
            check: { stat: 'grit', dc: 9, success: 'map', fail: 'map',
              successEffects: { scrip: 4, note: `Took the pirates' spoils, and their bell.` },
              failEffects: { hp: -3, note: `Two of the pirates took a turn at your ribs.` } } }
        ]
      },

      road_custodian: {
        title: 'Lane Four',
        text: `A tall grey machine with one good arm and one arm of ragged cable is painting a yellow line across the salt. It stops when you approach and tilts its head, polite and bewildered. Its brush drips. A brass plate on its chest reads CUSTODIAN-7, MUNICIPAL MAINTENANCE, and beneath it someone has scratched in marker: DO NOT SWITCH OFF.

"Lane four," it says. "Lane four is missing. Have you seen lane four?"`,
        choices: [
          { label: `Stop and talk to it.`, to: 'custodian_talk' },
          { label: `Leave it to its painting.`, to: 'map' }
        ]
      },

      custodian_talk: {
        title: 'CUSTODIAN-7',
        text: `It keeps painting while it speaks, a steady, careful stroke that drifts a finger's width off true every few metres. It remembers the city and its tall lamps, the long lanes and the people who walked them. It does not remember the day it stopped. It asks what year it is. You could tell it the truth, or something kinder, and it will believe whichever you choose.`,
        choices: [
          { label: `Read it the number of the lane it lost.`,
            check: { stat: 'wits', dc: 7, success: 'custodian_out', fail: 'custodian_out',
              successEffects: { flags: { custodian: true }, note: `CUSTODIAN-7 knows your voice now. It will walk with you if you let it.` },
              failEffects: { note: `It thanks you for a number that is almost right.` } } },
          { label: `Tell it the war is over and it can rest.`,
            check: { stat: 'charm', dc: 6, success: 'custodian_out', fail: 'custodian_out',
              successEffects: { flags: { custodian: true }, note: `CUSTODIAN-7 set its brush down for the first time in a century.` },
              failEffects: { flags: { custodian: 'refused' }, note: `CUSTODIAN-7 picked up its brush and went back to the line.` } } },
          { label: `Leave it to its line.`, to: 'map' }
        ]
      },

      custodian_out: {
        title: 'Yellow Line',
        text: function (s) {
          if (s.flags.custodian === true) {
            return `CUSTODIAN-7 walks at your side now, brush held like a rifle, its good arm swinging in a regular beat. Every few hundred metres it stops, paints a short yellow stroke across the crust and says the name of the lane it is marking. The lane names it recites are no longer on any map. You are fairly sure that is the point. Now and then it stops to listen to the wind, the way Odalys used to, and you stop with it.`;
          }
          if (s.flags.custodian === 'refused') {
            return `CUSTODIAN-7 has gone back to its yellow line and does not look up again. The stroke it paints behind it is straight now, steady and sure, and it no longer seems to know that you were there. You find you mind that more than you expected, which is a strange thing to carry across the flat. Once or twice you think it glances back at you, but the brush keeps moving, and so, after a while, do you.`;
          }
          return `CUSTODIAN-7 is still painting when you turn away. Lane four is not yet found, and it has not decided whether to forgive you for asking. The yellow line behind it runs straight toward the horizon, north, and it ends where the salt is cracked and warm. You do not know whether the machine is lost, or whether it has simply found the place it was always going. Its brush keeps dripping, a tiny bright tick on the glass, and you keep listening to it for longer than you meant to.`;
        },
        choices: [
          { label: `Walk on toward the map.`, to: 'map' }
        ]
      },

      road_storm: {
        title: 'Lilac Haze',
        text: `The glow comes up out of the south like a tide: a low lilac haze, shot through with sparks where the crust cracks. The light makes your teeth ache. Your eyes water and then sting, and the skin behind your ears begins a slow, unpleasant warmth. Somewhere a sail-cart's bell rings far off, out of time with the wind.

There is a sail-cart lying on its side nearby, and a ferry ramp that might keep out the worst of it. Both are gambles.`,
        choices: [
          { label: `Shelter in the lee of the sail-cart. (+1 glow)`, to: 'map', effects: { glow: 1 } },
          { label: `Push through the storm.`,
            check: { stat: 'grit', dc: 8, success: 'map', fail: 'map',
              failEffects: { glow: 3, note: `The storm got into your lungs on the way across.` } } }
        ]
      },

      road_salvage: {
        title: 'Sail-Cart Wreck',
        text: `The cart lies on its side, canvas rotted to lace and axle snapped clean. Salt crusts the spokes. Under the seat, wedged in the frame, is a steel strongbox, rusted shut but not locked. Someone was in a hurry when they left it, or someone was never coming back for it. Either way the box is heavy when you test it with your boot, and the rust around its hinge is thin and flaking.

You could take it, or leave it to the wind.`,
        choices: [
          { label: `Pry the strongbox open. (+6 scrip)`, to: 'map',
            effects: { scrip: 6, note: `Pried a rusted strongbox open on the road: six scrip and a dead man's ring.` } },
          { label: `Leave it alone.`, to: 'map' }
        ]
      },

      road_radio: {
        title: 'The Crossroads Set',
        text: `At a crossroads a shortwave set is bolted to a steel post, its valves still warm after a century. It is broadcasting a loop on 5.110: a woman's voice, patient and unhurried, recorded long before you were born. "Deepwell wants a listener. Deepwell is patient. Do not be the one who sleeps." The loop starts again before you have finished hearing it. You can stand and catch the whole thing, or walk on and let the voice wait for someone else.`,
        choices: [
          { label: `Listen to the whole loop.`,
            check: { stat: 'wits', dc: 6, success: 'map', fail: 'map',
              successEffects: { flags: { heard_loop: true }, note: `Heard the whole loop from the crossroads set.` },
              failEffects: { note: `Caught the end of the crossroads loop and none of the start.` } } },
          { label: `Walk on and let the voice wait.`, to: 'map' }
        ]
      },

      /* ======================= BRINETOWN (ACT 2) ======================= */

      bt_gate: {
        title: 'Brinetown',
        text: function (s) {
          var t = `Brinetown is a ferry four decks high, beached on her own keel in the salt. Her name is still legible on the bow: ARDENT TERN, PASSENGERS ONLY. The car deck has become a market under tarpaulins. The upper decks are ledger rooms, and the Tallymen keep their tallies there in cabinets of pale wood. Every one of them wears a green sash and a slate on a cord, and every one of them looks at you as if they are already adding up what you are worth.`;
          if (s.flags.debt) {
            t += `\n\nYour name is already in one of their books, in red ink. The sashes look at you a little longer than they used to.`;
          }
          return t;
        },
        choices: [
          { label: `Go to the ledger hall and ask for Ledger-Prime Okafor-Vance.`, to: 'bt_hall' },
          { label: `Visit the market on the car deck.`, to: 'bt_market' },
          { label: `Walk the docks to find the dockhands.`, to: 'bt_docks' },
          { label: `Leave Brinetown for the road.`, to: 'map' }
        ]
      },

      bt_hall: {
        title: 'The Ledger Hall',
        text: `The ferry's old lounge is now the ledger hall. Ledger-Prime Ines Okafor-Vance sits at a table under a brass lamp, a green book open before her. She is courteous in the way of people who have never once been surprised by a sum. She asks your name, writes it down, and does not look up while she does it.

"You want a dose-suit," she says. "It is sealed, it is ours, and it is not cheap. Tell me how you intend to pay, and I will tell you what it costs you."`,
        choices: [
          { label: `Pay thirty scrip in full.`, to: 'bt_gate',
            requires: [
              { minScrip: 30, why: 'needs 30 scrip' },
              { notKey: 'dosesuit', why: 'you already have a dose-suit' }
            ],
            effects: { scrip: -30, keys: ['dosesuit'], allies: ['tallymen'], flags: { suit: 'paid' },
              note: `Paid Ines thirty scrip. Your name is written in green: SETTLED.` } },
          { label: `Take the suit on debt. Let her write it down.`, to: 'bt_gate',
            requires: { notKey: 'dosesuit', why: 'you already have a dose-suit' },
            effects: { keys: ['dosesuit'], flags: { debt: true }, note: `Took a dose-suit on debt to the Tallymen.` } },
          { label: `Charm her into believing she has already been paid.`,
            requires: { notKey: 'dosesuit', why: 'you already have a dose-suit' },
            check: { stat: 'charm', dc: 9, success: 'bt_gate', fail: 'bt_gate',
              successEffects: { keys: ['dosesuit'], allies: ['tallymen'],
                note: `Ines decided you were worth a friend, and wrote you down as one.` },
              failEffects: { keys: ['dosesuit'], flags: { debt: true },
                note: `Ines charged you a debt for trying, and gave you the suit to be going on with.` } } },
          { label: `Slip off to the ledger room while she counts.`, to: 'bt_ledger',
            requires: { notKey: 'dosesuit', why: 'you already have a dose-suit' } },
          { label: `Leave her to her ledgers.`, to: 'bt_gate' }
        ]
      },

      bt_ledger: {
        title: 'The Ledger Room',
        text: `The ledger room was the ferry's purser's office: a cabin with an iron door and shelves of tallies bound in string. Every debt in Brinetown sits in here in a neat hand. The dose-suit is in a crate by the window with a brass lock, tagged with your name in the same neat hand, and someone has already written its price beside it, and the word PENDING.

You can hear Ines's pen scratching through two walls. You have time for one try at the lock, and no time for a second.`,
        choices: [
          { label: `Pick the crate's brass lock.`,
            check: { stat: 'wits', dc: 9, success: 'bt_gate', fail: 'bt_caught',
              successEffects: { keys: ['dosesuit'], flags: { stole: true },
                note: `Took the dose-suit from the ledger room. Nobody saw. Probably.` } } },
          { label: `Put everything back and walk out.`, to: 'bt_hall' }
        ]
      },

      bt_caught: {
        title: 'Caught in the Ledger',
        text: `Two Tallymen take you by the elbows before you reach the stair. They are gentle about it, which is worse. Ines comes out of the hall with her pen still in her hand and reads your name aloud from the tally, then the price of the lock, then the price of her time.

"You are not a thief," she says. "You are a debtor who has not yet been introduced to his debt."

Her men set you on a bench. Your ribs complain about it for the rest of the afternoon.`,
        onEnter: { hp: -2, note: `Caught in the ledger room. Two Tallymen and a bench.` },
        choices: [
          { label: `Accept the debt, and take the suit with it.`, to: 'bt_gate',
            effects: { keys: ['dosesuit'], flags: { debt: true }, note: `Caught in the ledger room: the debt and the suit, both yours.` } },
          { label: `Walk out of the ledger room with a bruise and no suit.`, to: 'bt_gate' }
        ]
      },

      bt_market: {
        title: 'The Car Deck',
        text: `The car deck is a market under tarpaulins: tin cups, glow-scrub powder in twists of newsprint, dried fish on lines, and a girl with a box of tonic bottles who calls prices like a bird. The tonic is brown and tastes of liquorice and alum. Scrip changes hands as worn, thumbed tokens, each stamped with a long-dead transit line. Everyone here is trying very hard not to look at the sails of the salt-pirates on the horizon.`,
        choices: [
          { label: `Buy a tonic. (8 scrip)`, to: 'bt_gate', requires: { minScrip: 8, why: 'needs 8 scrip' },
            effects: { scrip: -8, add: ['tonic'], note: `Bought a tonic from the girl with the bird voice.` } },
          { label: `Buy glow-scrub. (10 scrip, -2 glow)`, to: 'bt_gate', requires: { minScrip: 10, why: 'needs 10 scrip' },
            effects: { scrip: -10, glow: -2 } },
          { label: `Haggle the girl down for a tonic.`,
            check: { stat: 'charm', dc: 7, success: 'bt_gate', fail: 'bt_gate',
              successEffects: { add: ['tonic'], note: `Haggled a tonic out of the bird-voiced girl.` },
              failEffects: { note: `The girl says her prices are the only thing in Brinetown that debt has not touched.` } } },
          { label: `Back to the ferry gate.`, to: 'bt_gate' }
        ]
      },

      bt_docks: {
        title: 'The Docks',
        text: `The docks are a row of ramps where dockhands haul salt-barrels up on cables. The work is loud and wet, and the men sing in turn to keep their pace. Among them is a thin young man with rope burns on both palms and a hat stamped with the name PIM. He stops hauling when he sees you looking at him, and he does not start again until you look away.`,
        choices: [
          { label: `Ask Pim about his debt.`, to: 'bt_pim' },
          { label: `Back up to the ferry gate.`, to: 'bt_gate' }
        ]
      },

      bt_pim: {
        title: "Pim's Tally",
        text: `Pim owes the Tallymen ninety scrip for a rope he snapped on a crane, which is roughly three years of wages, and the sum climbs each month, slightly, like a tide. "They're not wrong," he says, without bitterness. "Ines doesn't make mistakes. That's the trouble with her. You can't argue with a clean page." He shows you the slip. The handwriting is very neat, and every figure on it is correct. The total is not.`,
        choices: [
          { label: `Take his debt onto your own tally.`, to: 'bt_docks',
            effects: { flags: { pim: 'freed', debt: true }, note: `Took Pim's debt onto your own tally. Ninety scrip, in green.` } },
          { label: `Smuggle him out on a sail-cart.`,
            check: { stat: 'charm', dc: 7, success: 'bt_docks', fail: 'bt_docks',
              successEffects: { flags: { pim: 'escaped' }, note: `Pim is gone on a sail-cart, singing badly under a tarpaulin of ledger pages.` },
              failEffects: { flags: { pim: 'caught' }, hp: -1, note: `The Tallymen caught Pim at the ramp. You were too slow.` } } },
          { label: `Leave him to his tally.`, to: 'bt_docks',
            effects: { flags: { pim: 'abandoned' }, note: `Left Pim to his ninety scrip.` } }
        ]
      },

      /* ============================ THE CHOIR ============================ */

      choir_gate: {
        title: 'The Cooling Tower',
        text: `The cooling tower rises out of the flat like a broken finger, concrete ribs cracked, fans silent for a hundred years. Beneath it a deep ticking comes up through the ground, slow and steady, like a heart beating through a wall. Two acolytes in grey robes hold lanterns at the foot of the stair. Their breath smokes in the cold, and they watch you with the bright, wet eyes of people who have been crying and are trying to stop.

"Come in," one says. "She is waiting for someone to tell her the count is not over."`,
        choices: [
          { label: `Go inside and find the Cantor.`, to: 'choir_hall' },
          { label: `Keep to the road.`, to: 'map' }
        ]
      },

      choir_hall: {
        title: 'The Choir',
        text: `The Choir live in the tower's lower halls, bedrolls and candles on every ledge, a song that never quite finishes. Cantor Belisande is thin, sincere, and frightened, her hands red from the cold. "It stopped," she says, as though you might argue. "The heartbeat stopped. Tell me it is a fault in the machinery." Behind her a hundred voices hum under their breath. Beneath your feet, through the iron grating, the coolant pump coughs, and coughs again.

She does not ask you to be a believer. She only asks for help.`,
        choices: [
          { label: `Join tonight's vigil. (+2 glow)`, to: 'choir_vigil',
            requires: { maxGlow: 7, why: 'too much glow to sit the vigil safely' } },
          { label: `Ask her for the words the count last said.`,
            requires: { notKey: 'passphrase', why: 'you already have the words' },
            check: { stat: 'charm', dc: 8, success: 'choir_hall', fail: 'choir_hall',
              successEffects: { keys: ['passphrase'], allies: ['choir'],
                note: `Belisande says the words once, then makes you say them back. She asks you to keep them carefully.` },
              failEffects: { note: `She folds her hands over the words. They are not for strangers.` } } },
          { label: `Repair the coolant pump.`, to: 'choir_pump',
            requires: { item: 'toolkit', why: 'needs: toolkit' } },
          { label: `Tell her what the silence may mean.`, to: 'choir_hall',
            effects: { flags: { warned: true }, note: `Warned the Choir: when the count stops, something may wake.` } },
          { label: `Hear the Warm Hymn sung through.`, to: 'choir_hymn' },
          { label: `Leave the tower for the road.`, to: 'map' }
        ]
      },

      choir_pump: {
        title: 'The Coolant Pump',
        text: `The pump lives in a sealed bay, its housing scorched and its coolant lines running down into the reactor pit like roots. The gasket has cracked, and every stroke sprays a fine grey mist. You can fix the valve if you are careful, and you will be scalded if you are not. The acolytes stand at the door with their lanterns held up, watching your hands and trying not to pray out loud.`,
        choices: [
          { label: `Work the valve carefully.`,
            check: { stat: 'wits', dc: 7, success: 'choir_hall', fail: 'choir_hall',
              successEffects: { keys: ['passphrase'], allies: ['choir'], flags: { pump: 'fixed' },
                note: `Fixed the Choir's pump. Belisande wept, then sang, then made you promise to come back for the vigil.` },
              failEffects: { glow: 1, flags: { pump: 'botched' },
                note: `A scald and a ruined gasket. The pump still coughs.` } } },
          { label: `Give up and go back up the stair.`, to: 'choir_hall' }
        ]
      },

      choir_vigil: {
        title: 'The Evening Vigil',
        text: `They sit in rows on the cooling-tower floor with their knees drawn up, and the reactor ticks beneath them through the concrete. Belisande sings the count, but there are no numbers now, only the rhythm and the four-second gap where the next number ought to be. You feel your pulse fall into step. The glow on your skin is a faint lilac warmth, like a second coat you did not ask for.

Then they sing the words. A short sequence, nonsense in every language you know, and yet entirely certain. It is the last thing the old count ever said, and only the Choir remembers it.`,
        onEnter: { glow: 2, note: `Sat the vigil in the cold light of the tower.` },
        choices: [
          { label: `Sing to the end with them. (+1 CHARM)`, to: 'choir_hall',
            effects: { stats: { charm: 1 }, keys: ['passphrase'], allies: ['choir'],
              note: `Sang the vigil to the end. The words are yours now.` } },
          { label: `Listen, memorise the words, and slip out early.`, to: 'choir_hall',
            effects: { keys: ['passphrase'], note: `Memorised the vigil's words and slipped out early. Belisande noticed.` } }
        ]
      },

      choir_hymn: {
        title: 'The Warm Hymn',
        text: `The Warm Hymn is sung in a hundred slow voices, the verses rising and falling with the ticking of the reactor. The Choir believe the Metronome was the heartbeat of the world, the first thing anyone ever built to keep the living company through the dark. They sing about the count the way a mother sings to a cradle. The last verse ends on the number. "One. Two." Then silence. Every voice turns toward the gap where the next number should be, and holds its breath.`,
        choices: [
          { label: `Go back to the hall.`, to: 'choir_hall',
            effects: { note: `The Choir believe the count is a heartbeat. You are no longer sure they are wrong.` } }
        ]
      },

      /* ============================ RUSTWRIGHTS ============================ */

      patience_gate: {
        title: 'Patience',
        text: `Patience is a crawler the length of three ferries: a moving town of steel rails, tarpaulins and rope ladders, grinding across the Saltglass at the pace of a brisk walk. It leaves two smooth tracks of glass behind it, bright as a mirror. A ladder drops at your feet. Above, someone shouts a bet on the weather, and someone else shouts back that the weather has no interest in bets.

The crawler does not stop for anyone. It only slows, which is its way of asking.`,
        choices: [
          { label: `Climb aboard.`, to: 'patience_tour' },
          { label: `Keep to the road.`, to: 'map' }
        ]
      },

      patience_tour: {
        title: 'The Workshop',
        text: `The Rustwrights live in the crawler's middle decks, where the great engines turn slowly and everything smells of oil and fresh bread. Their workshop is a long hall of salvage, sorted and labelled with more care than anything in Brinetown. A chalk board tracks every bet made aboard, with names and odds and small sad drawings of losers. A tall young woman with a clipboard gives you a tour without being asked.

"We are chasing something," she says. "Patience steers north-east, toward the centre. The Foreman calls it the North Star. Don't ask him why. He'll tell you, and then he'll bet you that you were wrong to ask."`,
        choices: [
          { label: `Find Foreman Tobiah Quill.`, to: 'rw_quill', effects: { flags: { rw_toured: true } } },
          { label: `Get off Patience.`, to: 'map' }
        ]
      },

      rw_quill: {
        title: 'Foreman Quill',
        text: `Foreman Tobiah Quill sits on an upturned crate with his boots on a gear housing. He is sunburnt and cheerful, and missing the last two fingers of his left hand, which he waves at you as a greeting. A tin cup of dice sits by his elbow. "Power cell," he says. "Charged, the good kind. Patience eats them like sweets. I'll give you one, friend, if you can make it worth my while. I'm a reasonable man. I'm also a gambler, which is a different thing."`,
        choices: [
          { label: `Accept his bet.`, to: 'rw_bet',
            requires: { notKey: 'cell', why: 'you already have the cell' } },
          { label: `Trade him twenty scrip for the cell.`, to: 'rw_quill',
            requires: [
              { minScrip: 20, why: 'needs 20 scrip' },
              { notKey: 'cell', why: 'you already have the cell' }
            ],
            effects: { scrip: -20, keys: ['cell'], note: `Bought a charged power cell from Tobiah Quill for twenty scrip.` } },
          { label: `Fix Patience's gearbox.`,
            requires: [
              { item: 'toolkit', why: 'needs: toolkit' },
              { notKey: 'cell', why: 'you already have the cell' }
            ],
            check: { stat: 'wits', dc: 6, success: 'rw_quill', fail: 'rw_quill',
              successEffects: { keys: ['cell'], allies: ['rustwrights'], flags: { gearbox: 'fixed' },
                note: `Fixed Patience's gearbox. Quill gave you the cell and a bruising hug.` },
              failEffects: { hp: -2, note: `The gearbox bit back. Try again, or find another way.` } } },
          { label: `Bring him the spare coil from CUSTODIAN-7.`, to: 'rw_quill',
            requires: [
              { flag: 'custodian', why: 'needs CUSTODIAN-7 befriended' },
              { notKey: 'cell', why: 'you already have the cell' }
            ],
            effects: { keys: ['cell'], allies: ['rustwrights'],
              note: `Brought CUSTODIAN-7's spare tram coil to Quill. He wept, which surprised you.` } },
          { label: `Get off Patience.`, to: 'map' }
        ]
      },

      rw_bet: {
        title: 'The Bet',
        text: `Tobiah sets the dice down and rolls his sleeve up on the good arm. "Arm-wrestle, or cards. Stakes: the cell against your next five scrip. Pick your poison." The Rustwrights gather behind him, betting in whispers. The chalk board behind him shows his record: a thousand wins, and one memorable loss to a woman who was mostly made of wire and who, he insists, still owes him a sandwich.`,
        choices: [
          { label: `Arm-wrestle him across the crate.`,
            check: { stat: 'grit', dc: 8, success: 'rw_quill', fail: 'rw_quill',
              successEffects: { keys: ['cell'], allies: ['rustwrights'],
                note: `Won the cell across a crate. Quill pays with grace and a bad bruise.` },
              failEffects: { scrip: -5, note: `Lost the arm-wrestle. He collects five scrip, cheerfully.` } } },
          { label: `Play cards with him.`,
            check: { stat: 'wits', dc: 8, success: 'rw_quill', fail: 'rw_quill',
              successEffects: { keys: ['cell'], allies: ['rustwrights'],
                note: `Won the cell at cards. Quill says the luck was his, and then that it was yours.` },
              failEffects: { scrip: -5, note: `Lost at cards. He collects five scrip and deals you back in.` } } },
          { label: `Refuse the bet and walk back to the ladder.`, to: 'rw_quill' }
        ]
      },

      /* ============================ DEEPWELL (ACT 3) ============================ */

      dw_stairs: {
        title: 'Deepwell Meridian',
        text: `The Saltglass ends here, in a concrete stair that drops into a shaft cut by people who wanted to stay dry for a very long time. Stencils on the wall are nearly gone: DEEPWELL MERIDIAN, CIVIL CONTINUITY. DO NOT ENTER WITHOUT A SEALED SUIT. A hum comes up through the soles of your boots, steady as a clock in an empty house. The air is still and tastes of copper, and every breath sounds slightly too loud.`,
        choices: [
          { label: `Descend in the sealed dose-suit. (needs: dose-suit)`, to: 'dw_corridor',
            requires: { key: 'dosesuit', why: 'needs: sealed dose-suit' } },
          { label: `Descend unsuited and take the glow. (+2 glow)`, to: 'dw_glowhall',
            effects: { glow: 2, flags: { unsuited: true } } },
          { label: `Climb back up to the road.`, to: 'map' }
        ]
      },

      dw_glowhall: {
        title: 'Unsuited',
        text: `Without the suit the glow is a living thing. It gets into your teeth and the backs of your eyes, into the skin behind your ears and the small bones of your hands. The walls here are lined with a mineral that glitters like a sleeping sea, lighting the corridor a soft, unhealthy lilac. The tram tunnel runs on ahead. You can feel its far end the way you feel a draught.`,
        choices: [
          { label: `Push on through, fast. (+1 glow, -1 HP)`, to: 'dw_corridor', effects: { glow: 1, hp: -1 } },
          { label: `Turn around and climb out.`, to: 'map' }
        ]
      },

      dw_corridor: {
        title: 'Tram Tunnel',
        text: `The old tram tunnel runs straight under the flat. Its rails are crusted white and its posters still cling to the tiles, yellowed and smiling. THE COUNT IS THE CITY, says one. KEEP STEADY, KEEP TIME, says another. A maintenance hatch in the ceiling is stencilled for robots only, and a rusted ladder leads up to it from a cart. Ahead, the tunnel bends toward a grey steel door that hums faintly in its frame.`,
        choices: [
          { label: `Stop at the reel store beside the tunnel.`, to: 'dw_tapes' },
          { label: `Walk on to the blast door.`, to: 'dw_door' },
          { label: `Take the maintenance hatch. (needs: CUSTODIAN-7)`, to: 'dw_core',
            requires: { flag: 'custodian', why: 'needs CUSTODIAN-7 at your side' },
            effects: { note: `CUSTODIAN-7 led you through the robots' hatch, past the door, to the room where the voice waits.` } }
        ]
      },

      dw_tapes: {
        title: 'Reel Store',
        text: `The reel store is a room of steel shelves holding hundreds of tapes in brown boxes, each labelled in a patient hand. One reel sits apart on the bench with a strip of tape across its lid: FIRST KEEPER, TRAINING. A cassette player is bolted to the bench, its belt cracked and its lid dusty. The label says this is the voice that was copied into the Operator, and you can see the wear on the tape where a thousand counts have passed under the heads.`,
        choices: [
          { label: `Play the first Keeper's tape.`,
            check: { stat: 'wits', dc: 6, success: 'dw_door', fail: 'dw_door',
              successEffects: { flags: { heard_tape: true },
                note: `A patient teacher counts with a child. The child sounds like a younger version of you, and also like nobody at all.` },
              failEffects: { note: `The belt snaps. You hear only the start of a count before the room goes quiet.` } } },
          { label: `Leave the reels and walk on.`, to: 'dw_door' }
        ]
      },

      dw_door: {
        title: 'The Blast Door',
        text: `The blast door is a wall of grey steel four metres high, its brass plate scratched with an old maintenance log. The lock is shaped like a keyhole crossed with a tuning fork. Above it a grille hums. Behind it a voice comes through the metal, patient and tired: "Keeper. Please identify. Please identify. Please."

The lock does not care about your name, your history, or the things you promised in other rooms. It only cares about the right key, and whether you can produce one.`,
        choices: [
          { label: `Speak the passphrase. (needs: the passphrase)`, to: 'dw_core',
            requires: { key: 'passphrase', why: 'needs: the passphrase' },
            effects: { flags: { door: 'opened' }, note: `Spoke the passphrase. The door knew it.` } },
          { label: `Jumper the lock with the cell.`, requires: { key: 'cell', why: 'needs: power cell' },
            check: { stat: 'wits', dc: 6, success: 'dw_core', fail: 'dw_door',
              successEffects: { flags: { door: 'bypassed' },
                note: `Fed the cell to the lock and pulled it back before the lock could keep it.` },
              failEffects: { glow: 1, note: `A spark jumps the gap and burns the skin on your wrist.` } } },
          { label: `Go back down the tunnel.`, to: 'dw_corridor' }
        ]
      },

      dw_core: {
        title: 'The Operator',
        text: `The room at the bottom is round and warm, lined with cream panels that light one by one as you enter. A console hums in the middle of the floor. A wall dial ticks very slowly. Then a voice speaks: not quite human, flat and kind, with the faint hiss of a recording copied too many times.

"I am the Operator. I am the continuity system for Meridian. My voice was built from tapes of the first Keeper. Please sit down. You have been a long time coming, and I have been awake for a very long time."`,
        choices: [
          { label: `Ask what the Metronome was for.`, to: 'dw_reveal' },
          { label: `Ask how long it has been awake.`, to: 'dw_reveal',
            effects: { note: `The Operator says it has counted every four seconds for one hundred and thirty-one years, and that it has been getting tired.` } }
        ]
      },

      dw_reveal: {
        title: 'Dead-Man Signal',
        text: `The Operator explains without hurry. The Metronome was never a clock. It was a dead-man's signal. For as long as it counted, a missile battery buried under the flat stayed asleep, its launch sequence waiting for a silence that never came. The count was the battery's permission to dream. The tape that carried it has finally worn through. Tonight the number stopped, and the battery has begun to wake.

Its targets were set by people who are no longer here to change them. The coordinates now sit exactly on Brinetown. "I have no one left to decide," the Operator says. "So I called the only listener I have left."`,
        choices: [
          { label: `Ask what it needs from you.`, to: 'dw_decision' },
          { label: `Ask for a moment to think.`, to: 'dw_decision' }
        ]
      },

      dw_decision: {
        title: 'The Decision',
        text: `A dial on the console counts down in slow, uneven steps. Far above and below, the battery is waking, and the Operator waits for your answer with a patience that is almost unbearable. A person has only a few things to do with a hand on a lever. You can cut the battery's power at its source, if you have the cell to do it. You can hand the decision to the Tallymen, who are never wrong. You can open a channel and let everyone speak. Or you can do nothing, and let the tape run out.`,
        choices: [
          { label: `Go down to the reactor pit and cut the battery's power.`, to: 'dw_reactor',
            requires: { key: 'cell', why: 'needs: power cell' } },
          { label: `Hand the launch to the Tallymen.`, to: 'dw_end_ledger',
            requires: { ally: 'tallymen', why: 'needs: Tallymen alliance' } },
          { label: `Hand the launch to the Tallymen on your own debt.`, to: 'dw_end_ledger',
            requires: { flag: 'debt', why: 'needs: a debt to the Tallymen' } },
          { label: `Open a live channel and let everyone speak.`, to: 'dw_end_open',
            requires: [
              { keysAtLeast: 3, why: 'needs all three keys' },
              { ally: 'tallymen', why: 'needs: Tallymen alliance' },
              { ally: 'choir', why: 'needs: Choir alliance' },
              { ally: 'rustwrights', why: 'needs: Rustwrights alliance' }
            ] },
          { label: `Stay and read the numbers yourself.`, to: 'dw_end_newcount' },
          { label: `Walk away from the Operator.`, to: 'dw_end_walk' },
          { label: `Let the tape run out.`, to: 'dw_end_brightening' }
        ]
      },

      dw_reactor: {
        title: 'The Reactor Pit',
        text: `The reactor pit is a dark cylinder, cold at the top and warm at the bottom, its coolant lines bundled like roots. A thick cable runs from the pit toward the battery's line, and a red valve sits at the middle of a steel wheel as big as a cartwheel. Turning it starves the battery of power. It also starves the Choir's tower, the lamps on Patience, and the cold blue stones over Odalys's grave of their small warmth, which you had not thought about until now.`,
        choices: [
          { label: `Turn the wheel with the Rustwrights' counterweight trick.`, to: 'dw_end_lights',
            requires: [
              { key: 'cell', why: 'needs: power cell' },
              { ally: 'rustwrights', why: 'needs: Rustwrights alliance' }
            ] },
          { label: `Turn it by hand and trust your reading of the gauge.`,
            requires: { key: 'cell', why: 'needs: power cell' },
            check: { stat: 'wits', dc: 7, success: 'dw_end_lights', fail: 'dw_end_brightening' } },
          { label: `Back up to the Operator.`, to: 'dw_decision' }
        ]
      },

      /* ============================ ENDINGS ============================ */

      dw_end_newcount: {
        title: 'The New Count',
        ending: true,
        text: function (s) {
          var t = `You take the chair beside the console, and the Operator thanks you in a voice that breaks a little at the edges. It hands you the count, which is only a number, every four seconds, forever. You read it into the microphone each night in your own voice, steady as a lighthouse. The battery sleeps. Brinetown never learns what its ferry was for. Lantern Station's lamp burns on a timer, and the people who come down the stair to visit are always polite, and always a little afraid to stay. Odalys's chair is still by the desk, and you sit in it when the weather turns. Some winters you write a line in Odalys's logbook about the weather, the tide, and the count, and you keep the pen steady while you do it.`;
          if (s.flags.custodian === true) t += ` CUSTODIAN-7 paints the number on the reel-store wall in yellow, one stroke a count, and walks the lane back to you every week.`;
          if (s.flags.pim === 'freed') t += ` Pim brings soup on the first of each month, on the strength of a debt that is now yours.`;
          if (s.flags.pim === 'abandoned') t += ` Pim never comes down the stair. When you hear footsteps you never know whose they are.`;
          if (s.allies.choir) t += ` The Choir sing the count back to you on the anniversary, and never once ask why it is still needed.`;
          return t;
        }
      },

      dw_end_lights: {
        title: 'Lights Out',
        ending: true,
        text: function (s) {
          var t = `You turn the wheel, and for a long moment the whole Saltglass seems to hold its breath. Then the battery's line goes dark, and a sleeper under the flat stops dreaming of Brinetown. The reactor's warmth goes out with it. Up in the cooling tower the pump stops mid-cough, and the ticking that Belisande called a heartbeat falls silent. The sky over Brinetown stays grey, which is the best colour grey can be. At Lantern Station the lamp goes off, and it is the first night in one hundred and thirty-one years that nobody counts. You sit in the dark with the logbook open on your knees, and you wait to find out what the cold will ask of you.`;
          if (s.allies.choir && s.flags.warned) t += ` The Choir had been warned. They walked out into the flat with their lanterns held high, singing the count they no longer had, and not one of them went back for the cold.`;
          else if (s.allies.choir) t += ` The Choir had not been warned. Some of them never stopped being cold, and Belisande never forgave the silence you chose.`;
          else t += ` The Choir were never told, and their lanterns went out one by one in the dark.`;
          if (s.allies.rustwrights) t += ` A card arrives at the station weeks later, with two fingers drawn on it, and a bet you did not take.`;
          return t;
        }
      },

      dw_end_ledger: {
        title: 'Balanced Ledger',
        ending: true,
        text: function (s) {
          var t = `You hand the launch authority to the Tallymen, and Ines Okafor-Vance receives it the way she receives everything, without a flicker of surprise. She writes the transfer in her green book and adds the figures, and the sum balances to the last scrip. The battery's sequence is re-entered in the Tallymen's neat hand. Nothing fires unless Brinetown's ledger says so. For the first time in its history Brinetown is perfectly, permanently at peace. Nobody asks what the books are for, and nobody is brave enough to ask twice. The ferry bell rings the hour for the first time in a decade, exactly, which is the only thing about the new order anyone finds reassuring. Ines keeps the book open on her desk, and every morning she checks the total, and every morning it balances.`;
          if (s.flags.debt) t += ` Your own name sits at the bottom of the last page, in red, and it is the only entry she has ever underlined.`;
          if (s.allies.tallymen) t += ` Ines shakes your hand at the ferry gate, one partner to another, and offers you a seat in the ledger hall for life.`;
          if (s.flags.pim === 'freed') t += ` Pim walks the docks with his tally cleared, and cannot stop looking at the sky.`;
          return t;
        }
      },

      dw_end_brightening: {
        title: 'The Brightening, Again',
        ending: true,
        text: function (s) {
          var t = `The battery wakes all the way. You feel it through the floor first, a long grinding shudder, and then a quiet that is worse than the noise. The Operator says your name once, gently, as the dial falls to zero. Far above you the sky over the flat goes white in a single afternoon, the way it did one hundred and thirty-one years ago, and the glass beneath it rings like a bell. Brinetown's ferry burns on her keel. The tally-men are writing their last entries when the light arrives. Lantern Station's lamp is the last thing to go, and it goes quickly, which is some kind of mercy. The salt keeps the shape of the shadows for a long time afterward, the way old paint keeps its lines on the road.`;
          if (s.flags.pim) t += ` Pim was on the car deck with his debt still in his pocket.`;
          if (s.flags.debt) t += ` Your own name was the last one in Ines's ledger, and it was never settled.`;
          if (s.flags.custodian === true) t += ` CUSTODIAN-7 was painting lane four when the light came, and it did not finish the stroke.`;
          return t;
        }
      },

      dw_end_open: {
        title: 'Open Channel',
        ending: true,
        text: function (s) {
          var t = `You do the thing nobody asked you to do. You open the channel. Belisande reads the words of the vigil into the microphone, and the Choir's voices come up through the tower's ribs like steam. Ines reads the ledger aloud, every debt, every name, every small sum forgiven. Tobiah Quill calls the odds, and his crew shouts them back. The Operator adds its own tired voice to the chorus. At last CUSTODIAN-7 hums lane four into the microphone, the number it lost. Somewhere under the flat the battery hears a hundred living voices and decides, for the first time in its life, that it has company.

Nobody tells anyone to be quiet. It stands down for good. The count is gone. The channel stays open.`;
          if (s.flags.pim === 'freed') t += ` Pim sings the loudest, and loses his voice on the second verse.`;
          return t;
        }
      },

      dw_end_walk: {
        title: 'Walk Away',
        ending: true,
        text: function (s) {
          var t = `You take your hand off the lever. The Operator says nothing for a long time, and then it says, almost shyly, that it understands. You climb the stair in the dark, your legs remembering every step. At the top the Saltglass is grey and endless and cold. Behind you the dial stops at a number you cannot read from the stair. Whether the battery sleeps or wakes, you will never know. You keep the logbook, and you do not go back to see. Some nights you hear a count in the wind, and you tell yourself it is only the wind, and most nights that is true. In spring the yellow lines fade a little more each year, and you find yourself repainting one now and then, in case somebody comes looking for the way.`;
          if (s.flags.custodian === true) t += ` CUSTODIAN-7 walks beside you, painting yellow lines that go nowhere, and you let it.`;
          if (s.flags.debt) t += ` Ines's tally-men come to collect a debt you cannot remember taking on.`;
          return t;
        }
      },

      death_hp: {
        title: 'White Salt',
        ending: true,
        death: true,
        text: `Your legs give out somewhere on the crust, and the salt takes the rest of you the way it takes everything: slowly, and then all at once. The glare is very bright, then not at all. Somewhere a bell rings, and somebody stops walking to listen. Nobody writes your name in a book. The yellow lines go on past you toward the horizon, neat and patient, and the wind covers you before the sun has finished rising.`
      },

      death_glow: {
        title: 'The Glow Takes You',
        ending: true,
        death: true,
        text: `The lilac light gets under your eyelids and into the warm places behind your ears, and you stop feeling the cold. Your hands go slack around whatever you were holding. It does not hurt, which is the cruelty of it. The count stops in your chest, and for one moment there is a silence so complete that you can hear the lamp at Lantern Station ticking, far behind you, as if keeping time were still your job.`
      }
    }
  };

  root.STORY = STORY;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = STORY;
  }
})(typeof window !== 'undefined' ? window : globalThis);
