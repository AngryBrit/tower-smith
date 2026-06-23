/**
 * `backgroundUnlocked` save index per theme id (from playerInfo.dat field order).
 * Slots follow **release date** (guild + event interleaved). UI catalog order differs.
 */
export const BACKGROUND_SAVE_INDEX_BY_THEME_ID: Readonly<Record<string, number>> = {
  'bg-interstellar': 1,
  'bg-volcano': 2,
  'bg-plasma-field': 3,
  'bg-honeycomb': 4,
  'bg-aurora': 5,
  'bg-alien-ship': 6,
  'bg-ocean-night': 7,
  'bg-sakura': 8,
  'bg-easter': 9,
  'bg-retrowave': 10,
  'bg-prismatic-lines': 11,
  'bg-cobweb': 12,
  'bg-matrix': 13,
  'bg-haunted-house': 14,
  'bg-virus-field': 15,
  'bg-mountain-night': 16,
  'bg-sandstorm': 17,
  'bg-autumn-forest': 18,
  'bg-arcade': 19,
  'bg-new-years': 20,
  'bg-dark-strands': 21,
  'bg-deep-sea': 22,
  'bg-hyper-space': 23,
  'bg-invasion': 24,
  'bg-sunset-river': 25,
  'bg-hurricane': 26,
  'bg-rainfall': 27,
  'bg-tv-wall': 28,
  'bg-abduction': 29,
  'bg-snowstorm': 30,
  'bg-forest-of-cats': 31,
  'bg-event-horizon': 32,
  'bg-clock-tower': 33,
  'bg-pi-disk': 34, // Pi event (29 Apr 2025) — save slot before Mech despite release date
  'bg-guild-mech-world': 36, // Guild S2 / Mech World (28 Apr 2025)
  'bg-camping': 37,
  'bg-cthulhu': 38,
  'bg-koi-pond': 39,
  'bg-guild-party': 40,
  'bg-guild-pixel-alien-war': 41,
  'bg-cyberpunk': 42,
  'bg-crystal-cave': 43,
  'bg-amusement-park': 44,
  'bg-guild-crimson-horror': 45,
  'bg-guild-cozy-cosmos': 46,
  'bg-valentine': 47,
  'bg-glitch': 48,
  'bg-guild-supernova': 49,
  'bg-guild-claw-machine': 50,
  'bg-neuron': 51,
  'bg-guild-magician': 52, // Guild S9 / Magician
  'bg-5th-anniversary': 53, // 5th Anniversary event
  'bg-meteor-shower': 54, // Meteor Shower event
}

/** Highest `backgroundUnlocked` index used by a catalog background. */
export const BACKGROUND_SAVE_MAX_INDEX = Math.max(
  ...Object.values(BACKGROUND_SAVE_INDEX_BY_THEME_ID),
)
