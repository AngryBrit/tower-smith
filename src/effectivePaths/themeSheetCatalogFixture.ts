/**
 * Themes & Songs v3.0.5 catalog tab rows (names in B/E/L/R; owned in A/D/K/Q).
 * https://docs.google.com/spreadsheets/d/1Xlh6e2PUEtt-Wx7_FdJt_eL-G8FKgVWpQOAFPCvy9oo/
 */
export function buildCatalogV305FullRows(): string[][] {
  const rows = Array.from({ length: 60 }, () => Array<string>(26).fill(''))
  const set = (row: number, col: number, value: string) => {
    rows[row]![col] = value
  }

  set(1, 1, 'Tower Skin')
  set(1, 4, 'Background Skin')
  set(1, 11, 'Milestone Skin')
  set(1, 12, 'Tier Unlocked')

  const towers = [
    'Star',
    'Eye of the Lord',
    'Plasma Ball',
    'Bee',
    'North Spirit',
    'Alien',
    'Water Droplet',
    'Cherry Blossom',
    'Bunny',
    'Neo Turbo',
    'Prisma',
    'Spider',
    'Sentinel',
    'Virus',
    'Howling Wolf',
    'Hourglass',
    'Autumn Leaf',
    'Pumpkin',
    'Invader',
    'Toast Glass',
    'Dark Tower',
    'Dive Helmet',
    'Starship',
    'Elite Tower',
    'Fisherman',
    'Storm Eye',
    'Umbrella',
    'Noise Tower',
    'Unlucky Cow',
    'Snowman',
    'Black Cat',
    'Black Hole',
    'Pocket Watch',
    'Neon Pi',
    'Frog',
    'Marshmallow',
    'Cthulhu',
    'Flying Car',
    'Crystal',
    'Balloon',
    'Heart',
    'Glitch',
    'Brain',
    'Crown',
    'Mech Warrior',
    'Dj',
    'Pixel Soldier',
    'Restless Eye',
    'Shining Star',
    'Space Telescope',
    'Bear',
    'Rabbit In Hat',
  ]
  const backgrounds = [
    'Interstellar',
    'Volcano',
    'Plasma Field',
    'Honeycomb',
    'Aurora',
    'Alien Ship',
    'Ocean Night',
    'Sakura',
    'Easter',
    'Retrowave',
    'Prismatic Lines',
    'Cobweb',
    'Matrix',
    'Virus Field',
    'Mountain Night',
    'Sandstorm',
    'Autumn Forest',
    'Haunted House',
    'Arcade',
    'New Year',
    'Dark Strands',
    'Deep Sea',
    'Hyper Space',
    'Invasion',
    'Sunset River',
    'Hurricane',
    'Rainfall',
    'TV Wall',
    'Abduction',
    'Snowstorm',
    'Forest of Cats',
    'Event Horizon',
    'Clock Tower',
    'Pi Disk',
    'Koi Pond',
    'Camping',
    'Cthulhu',
    'Cyberpunk',
    'Crystal Cave',
    'Amusement Park',
    'Valentine',
    'Glitch',
    'Neuron',
    'Throne Room',
    'Mech World',
    'Party',
    'Pixel Alien War',
    'Crimson Horror',
    'Cosy Cosmos',
    'Supernova',
    'Claw Machine',
    'Magician',
  ]
  const milestones = [
    'Shuriken',
    'Donut',
    'Yin-Yang',
    'Smile',
    'Butterfly',
    'Sheep',
    'Fried Egg',
    'Mush-mush',
    'Turtle',
    'Cheese',
    'Cat',
    'Skull',
    'Creepy Clown',
    'Panda',
    'Tech Tree',
    'Cactus',
    'Dragon',
    'Rhino',
    'Atomic',
    'Cyber',
    'Eclipse',
  ]

  const nColumnSummary = [
    'Event Tower',
    'Event Background',
    'Tier Skins',
    'Songs',
    'Guardians',
    'Menus',
    'Profile Banners',
    'Total',
  ]
  towers.forEach((name, index) => {
    const row = 2 + index
    set(row, 0, 'TRUE')
    set(row, 1, name)
    if (backgrounds[index]) {
      set(row, 3, 'TRUE')
      set(row, 4, backgrounds[index]!)
    }
    if (milestones[index]) {
      set(row, 10, 'TRUE')
      set(row, 11, milestones[index]!)
      set(row, 12, `Tier ${index + 1}`)
    }
    if (index < nColumnSummary.length) {
      set(row, 13, nColumnSummary[index]!)
    }
  })

  set(24, 11, 'Songs')
  set(24, 16, 'Menu')
  set(25, 10, 'TRUE')
  set(25, 11, 'Krisu - Oceans Sings')
  set(25, 16, 'TRUE')
  set(25, 17, 'Dark Being')
  set(26, 10, 'TRUE')
  set(26, 11, 'Krisu - Hiding in Himalaya')
  set(26, 16, 'TRUE')
  set(26, 17, 'Mech World')
  set(27, 10, 'TRUE')
  set(27, 11, 'Krisu - Forest Bathing')
  set(27, 16, 'TRUE')
  set(27, 17, 'Party')

  set(29, 11, 'Guardians')
  const guardians = [
    'Butter',
    'Muse',
    'Finn',
    'Nyra',
    'Rolo',
    'Glenn',
    'Zepe',
    'Iris',
    'Silk',
    'Mickey',
    'Gaia',
    'Arwing',
    'Frank',
    'Earl',
    'Mei',
    'Shelly',
    'Disco',
  ]
  const menuNames = [
    'Cosy Cosmos',
    'Supernova',
    'Claw Machine',
    'Magician',
    'Pixel Alien War',
    'Crimson Horror',
    'Cosy Cosmos',
    'Supernova',
    'Claw Machine',
    'Magician',
    'Pixel Alien War',
    'Crimson Horror',
    'Cosy Cosmos',
    'Supernova',
    'Claw Machine',
    'Magician',
    'Magician',
  ]
  guardians.forEach((name, index) => {
    const row = 30 + index
    set(row, 10, 'TRUE')
    set(row, 11, name)
    if (menuNames[index]) {
      set(row, 16, 'TRUE')
      set(row, 17, menuNames[index]!)
    }
  })

  set(35, 11, 'Glenn')
  set(35, 16, 'Profile Banner')
  const bannerNames = [
    'Mech World',
    'Party',
    'Pixel Alien War',
    'Crimson Horror',
    'Cosy Cosmos',
    'Supernova',
    'Claw Machine',
    'Magician',
  ]
  bannerNames.forEach((name, index) => {
    const row = 36 + index
    set(row, 10, 'TRUE')
    set(row, 11, guardians[6 + index] ?? '')
    set(row, 16, 'TRUE')
    set(row, 17, name)
  })

  return rows
}
