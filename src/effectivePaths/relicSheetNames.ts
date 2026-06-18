import relicRows from '../data/workshopRelics.generated.json'

/** Normalize relic names for Effective Paths sheet matching. */
export function normalizeEffectivePathsRelicName(name: string): string {
  return name
    .trim()
    .replace(/\s*\[\d+\]\s*$/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, '')
    // EP Relics v3.1.6+ may label tiers as "T: VI Nova" (space after colon).
    .replace(/\bt\s*:\s*([ivx]+)\b/gi, (_match, roman: string) => `t${roman.toLowerCase()}`)
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const EFFECTIVE_PATHS_RELIC_NAME_ALIASES: Readonly<Record<string, string>> = {
  [normalizeEffectivePathsRelicName('Game Joystick')]: 'holy_joystick',
  [normalizeEffectivePathsRelicName('Holy Joystick')]: 'holy_joystick',
  [normalizeEffectivePathsRelicName('Controller')]: 'controller',
  [normalizeEffectivePathsRelicName('Cheers')]: 'cheers',
  [normalizeEffectivePathsRelicName('Champagne')]: 'champagne',
  [normalizeEffectivePathsRelicName('Gnosis')]: 'gnosis',
  [normalizeEffectivePathsRelicName('Omniscience')]: 'gnosis',
  [normalizeEffectivePathsRelicName('Instant Knowledge')]: 'gnosis',
  [normalizeEffectivePathsRelicName('Creepy Smile')]: 'creepy_smile',
  [normalizeEffectivePathsRelicName('Dark Sight')]: 'dark_sight',
  [normalizeEffectivePathsRelicName('Storm Clouds')]: 'cloud_lightning',
  [normalizeEffectivePathsRelicName('Cloud Lightning')]: 'cloud_lightning',
  [normalizeEffectivePathsRelicName('River Of Plenty')]: 'river_of_plenty',
  [normalizeEffectivePathsRelicName('Gift box')]: 'gift_box',
  [normalizeEffectivePathsRelicName('Gift Box')]: 'gift_box',
  [normalizeEffectivePathsRelicName('Carousel Of Joy')]: 'carousel_of_joy',
  [normalizeEffectivePathsRelicName('Mystic Bunny')]: 'mystic_bunny_1',
  [normalizeEffectivePathsRelicName('Mystic Hare')]: 'mystic_bunny_1',
  [normalizeEffectivePathsRelicName('Mystic Hair')]: 'mystic_bunny_1',
  [normalizeEffectivePathsRelicName('Pet Cat')]: 'pet_cat',
  [normalizeEffectivePathsRelicName('Lunar Cat Paw')]: 'lunar_cat_paw',
  [normalizeEffectivePathsRelicName('Clip Ons')]: 'clip_ons',
  [normalizeEffectivePathsRelicName('Summit Starlight')]: 'summit_starlight',
  [normalizeEffectivePathsRelicName('3 Body Solution')]: '3_body_solution',
  [normalizeEffectivePathsRelicName('Lets Mix')]: 'let_s_mix',
  [normalizeEffectivePathsRelicName("Let's Mix")]: 'let_s_mix',
  [normalizeEffectivePathsRelicName('Night Life')]: 'night_life',
  [normalizeEffectivePathsRelicName('Vr')]: 'vr',
  [normalizeEffectivePathsRelicName('Cyberpunk')]: 'vr',
  [normalizeEffectivePathsRelicName('Lets Play')]: 'let_s_play',
  [normalizeEffectivePathsRelicName("Let's Play")]: 'let_s_play',
  [normalizeEffectivePathsRelicName('Warm Clothes')]: 'warm_clothes',
  [normalizeEffectivePathsRelicName('Winter Is Coming')]: 'warm_clothes',
  [normalizeEffectivePathsRelicName("Collector's Spirit")]: 'collector_s_spirit',
  [normalizeEffectivePathsRelicName('What Time Is It?')]: 'ancient_times',
  [normalizeEffectivePathsRelicName('What time is it? (II)')]: 'clock_tower',
  [normalizeEffectivePathsRelicName('Ancient Times')]: 'ancient_times',
  [normalizeEffectivePathsRelicName("Nature's Fury")]: 'nature_s_fury',
  [normalizeEffectivePathsRelicName("Nature's Wrath")]: 'nature_s_wrath',
  [normalizeEffectivePathsRelicName('Endless Adventure')]: 'eternal_quest',
  [normalizeEffectivePathsRelicName('Eternal Quest')]: 'eternal_quest',
  [normalizeEffectivePathsRelicName('Tower Agent')]: 'tower_agent',
  [normalizeEffectivePathsRelicName('Fake Reality')]: 'fake_reality',
  [normalizeEffectivePathsRelicName('Sands of (II) Time')]: 'sphinx',
  [normalizeEffectivePathsRelicName('Sands of Time (II)')]: 'sphinx',
  // Effective Paths sheets may abbreviate T:I / T:II / T:III display names.
  [normalizeEffectivePathsRelicName('Tri Flux')]: 't_i_flux',
  [normalizeEffectivePathsRelicName('Till Lumin')]: 't_ii_lumin',
  [normalizeEffectivePathsRelicName('Till Pulse')]: 't_iii_pulse',
  [normalizeEffectivePathsRelicName('BigParty')]: 'big_party',
}

const NAME_TO_RELIC_ID = new Map<string, string>()

for (const row of relicRows as { id: string; name: string }[]) {
  NAME_TO_RELIC_ID.set(normalizeEffectivePathsRelicName(row.name), row.id)
}
for (const [alias, id] of Object.entries(EFFECTIVE_PATHS_RELIC_NAME_ALIASES)) {
  NAME_TO_RELIC_ID.set(alias, id)
}

/** Map an Effective Paths relic name cell to a TowerSmith relic id, if known. */
export function workshopRelicIdFromSheetName(sheetName: string): string | null {
  return NAME_TO_RELIC_ID.get(normalizeEffectivePathsRelicName(sheetName)) ?? null
}
