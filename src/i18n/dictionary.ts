import { STRINGS_DE } from './dictionary.de'
import { STRINGS_ES } from './dictionary.es'
import type { TowerGalleryApiError } from '../towerGallery/api'

/** UI string ids — English is the source of truth; locales in dictionary.*.ts must define every key. */
export const STRINGS_EN = {
  app_skipToMain: 'Skip to main content',
  app_first_run_title: 'Start here',
  app_first_run_body:
    'LAB sets research levels. WORKSHOP, CARDS, and MODULES shape your build. Import a player save (account menu → tower backup) or load a community build from BUILDS.',
  app_first_run_import: 'Import save',
  app_first_run_gallery: 'Browse builds',
  app_first_run_dismiss: 'Got it',
  panel_error_title: 'This tab crashed',
  panel_error_desc:
    'Something went wrong while rendering {{panel}}. Reload this tab or switch to another tab.',
  panel_error_reload: 'Reload tab',
  panel_error_copy: 'Copy error details',
  panel_error_copied: 'Error details copied to clipboard.',
  panel_error_copy_fail: 'Could not copy — select the text below manually.',
  panel_error_details_label: 'Error details',
  panel_error_report: 'Report bug',
  bug_buster_title: 'Bug Buster',
  bug_buster_fab_aria: 'Report a problem (Bug Buster)',
  bug_buster_report_this: 'Report this',
  bug_buster_open: 'Report a problem',
  bug_buster_footer_link: 'Report bug',
  bug_buster_privacy_hint:
    'Diagnostics include version, tab, and browser info — not your save or tower CSV unless you attach them below. Describe what went wrong.',
  bug_buster_category_label: 'Category',
  bug_buster_category_crash: 'Crash / error screen',
  bug_buster_category_wrong_stat: 'Wrong number or stat',
  bug_buster_category_import: 'Save import',
  bug_buster_category_share_gallery: 'Share link or gallery',
  bug_buster_category_ui: 'UI or accessibility',
  bug_buster_category_other: 'Other',
  bug_buster_description_label: 'What happened?',
  bug_buster_description_placeholder: 'What did you expect, and what did you see instead?',
  bug_buster_description_required:
    'Please describe what happened before copying, emailing, opening Discord, or opening GitHub.',
  bug_buster_steps_label: 'Steps to reproduce (optional)',
  bug_buster_steps_placeholder: '1. Open … 2. Click …',
  bug_buster_diagnostics_label: 'Diagnostic report (preview)',
  bug_buster_attach_label: 'Attach files (optional)',
  bug_buster_attach_hint:
    'playerInfo.dat and/or tower CSV (Lab → Export to CSV). Pick one or both in a single dialog. Files stay on your device until you send them.',
  bug_buster_attach_analyzing: 'Reading files…',
  bug_buster_attach_clear: 'Clear all',
  bug_buster_attach_remove_save: 'Remove save',
  bug_buster_attach_remove_csv: 'Remove CSV',
  bug_buster_attach_save_meta: 'Save: {{name}} — {{size}} ({{gzip}})',
  bug_buster_attach_csv_meta: 'CSV: {{name}} — {{size}}',
  bug_buster_attach_unrecognized:
    'Unrecognized file — use playerInfo.dat or a tower CSV export (tower_csv_v1).',
  bug_buster_save_meta: '{{name}} — {{size}} ({{gzip}})',
  bug_buster_save_gzip_yes: 'gzip',
  bug_buster_save_gzip_no: 'uncompressed',
  bug_buster_save_remove: 'Remove file',
  bug_buster_save_empty: 'That file is empty. Pick your playerInfo.dat backup.',
  bug_buster_save_too_large: 'That file is too large (max 200 KB).',
  bug_buster_csv_meta: '{{name}} — {{size}}',
  bug_buster_csv_empty: 'That file is empty. Pick a tower CSV export from this app.',
  bug_buster_csv_too_large: 'That CSV is too large (max 2 MB).',
  bug_buster_csv_invalid:
    'Not a tower CSV — the first line must be tower_csv_v1 (use Export to CSV in Lab).',
  bug_buster_email_csv_downloaded:
    'Email opened — tower CSV was downloaded; attach it in your mail app if needed.',
  bug_buster_github_csv_downloaded:
    'GitHub opened — tower CSV was downloaded; drag it onto the issue if needed.',
  bug_buster_email_files_downloaded:
    'Email opened — your attached files were downloaded; add them in your mail app if needed.',
  bug_buster_github_files_downloaded:
    'GitHub opened — your attached files were downloaded; drag them onto the issue if needed.',
  bug_buster_share_ok_csv: 'Shared report and tower CSV.',
  bug_buster_share_ok_files: 'Shared report and attached files.',
  bug_buster_copy: 'Copy support',
  bug_buster_email: 'Email support',
  bug_buster_discord: 'Discord support ticket',
  bug_buster_discord_ready:
    'Report copied — join TowerSmith Discord if prompted, open a support ticket, and paste your report.',
  bug_buster_discord_files_downloaded:
    'Discord opened — your attached files were downloaded; upload them in your ticket if needed.',
  bug_buster_discord_save_downloaded:
    'Discord opened — playerInfo.zip was downloaded; upload it in your ticket if needed.',
  bug_buster_discord_csv_downloaded:
    'Discord opened — your tower CSV was downloaded; upload it in your ticket if needed.',
  bug_buster_github: 'Open GitHub issue',
  bug_buster_copied: 'Report copied to clipboard.',
  bug_buster_email_ready:
    'Email text copied — paste over the message if you see plus signs (+).',
  bug_buster_copy_fail: 'Could not copy — use the preview above and copy manually.',
  bug_buster_email_save_downloaded:
    'Email opened — playerInfo.zip was downloaded; attach it in your mail app if needed.',
  bug_buster_github_save_downloaded:
    'GitHub opened — playerInfo.zip was downloaded; drag it onto the issue if needed.',
  bug_buster_share_ok: 'Shared report and save file.',
  bug_buster_settings_hint: 'Send bugs or incorrect stats. We never attach your save unless you paste it yourself.',
  whats_new_dismiss: 'Dismiss',
  whats_new_changelog: 'Full changelog',
  whats_new_3114_headline: "What's new in v3.1.14",
  whats_new_3114_body:
    'Module inventory stays fully configurable until you import playerInfo.dat — manual picks no longer lock out other chassis modules. Sharp Fortitude Wall Health submodule rarity imports correctly on legendary and ancestral armor. Owned inventory syncs to Effective Paths; modules hub layout polish. Dissonance module icon added.',
  whats_new_3113_headline: "What's new in v3.1.13",
  whats_new_3113_body:
    'Module save import fixes: equipped hub slots stay aligned when an earlier slot is empty; submodule picks for Orbital Augment, Galaxy Compressor, Shrink Ray, Sharp Fortitude, Black Hole Digestor, and Dimension Core. Unequipped modules in the inventory grid are easier to see. Re-import playerInfo.dat to refresh picks.',
  whats_new_3112_headline: "What's new in v3.1.12",
  whats_new_3112_body:
    'Modules inventory grid with chassis filters and per-module configs from your save. Ancestral Core and Generator submodule import fixed — re-import playerInfo.dat if picks looked wrong. Effective Paths Google sign-in now uses the authorization-code flow with PKCE.',
  whats_new_3111_headline: "What's new in v3.1.11",
  whats_new_3111_body:
    'Effective Paths sync now uses Google Picker with drive.file scope — select only your IDS Master and linked workbooks. Split-sheet setups remember linked IDs for faster reconnect. 5th Anniversary themes and relics added.',
  whats_new_3110_headline: "What's new in v3.1.10",
  whats_new_3110_body:
    'Effective Paths export fixes: Workshop Cells/Kill Bonus +, Themes Plasma shortcuts, and Relics Mystic Hair/Hare. Mystic Hair is the catalog display name for the Easter (II) premium relic. Relic export shows example names when a sheet label is still unmapped.',
  whats_new_319_headline: "What's new in v3.1.9",
  whats_new_319_body:
    'Assist Module labs import from researchLevel slots 230–237. Enhancement Attack and Utility coin discount labs use slots 154 and 227. Krisu music previews moved under public/themes/music/.',
  whats_new_318_headline: "What's new in v3.1.8",
  whats_new_318_body:
    'Bug Buster can open a Discord support ticket in the bug-reports channel. Mythic+ core module substat import fixed — re-import playerInfo.dat if submodule picks looked wrong.',
  whats_new_317_headline: "What's new in v3.1.7",
  whats_new_317_body:
    'Bot Bot and Amplify duration lab import (slots 213/100). Renamable card and module preset tabs with account sync. Google OAuth hardening, privacy policy link, and Effective Paths setup guide.',
  whats_new_316_headline: "What's new in v3.1.6",
  whats_new_316_body:
    'Lab import fixes: Dissonant Echo Attack/Utility (slots 240/238), Shatter Shards (152), and Battle Condition Reduction (199). Bot presets now use purchased medal levels. Effective Paths detects IDS Collection workbooks.',
  whats_new_315_headline: "What's new in v3.1.5",
  whats_new_315_body:
    'Main and Modules lab import fixes: Reroll Daily Mission (slot 148), Common Drop Chance (134), and Unmerge Module (151). Re-import playerInfo.dat if any of those looked wrong.',
  whats_new_314_headline: "What's new in v3.1.4",
  whats_new_314_body:
    'Golden Bot - Duration now imports from the correct researchLevel slot (108) — re-import playerInfo.dat if that lab or its +0.5s duration bonus looked wrong.',
  whats_new_313_headline: "What's new in v3.1.3",
  whats_new_313_body:
    'Effective Paths Google sign-in is more reliable: consent opens immediately, popups work on desktop Chrome, FedCM on mobile, and embedded IDE browsers get a clear message to use Chrome or Firefox instead.',
  whats_new_312_headline: "What's new in v3.1.2",
  whats_new_312_body:
    'Effective Paths IDS Master URL now lives on your Supabase profile with a Save IDS button in Settings — reliable cross-device sync when signed in. Legacy workspace backups migrate automatically on login.',
  whats_new_311_headline: "What's new in v3.1.1",
  whats_new_311_body:
    'Effective Paths IDS Master URL now saves per signed-in account and syncs across devices. Google Sheets sign-in no longer hangs on retry, and account cloud sync is more reliable.',
  whats_new_310_headline: "What's new in v3.1.0",
  whats_new_310_body:
    'New GUARDIANS tab with chip loadouts and upgrade tracks. Sync labs, workshop, relics, themes, cards, bots, modules, and guardians with community Effective Paths Google Sheets — including staged export previews. Tower CSV backups now include guardian chips and full research levels. Gallery adds Twitch sign-in, upvotes, and owner controls.',
  whats_new_308_headline: "What's new in v3.0.8",
  whats_new_308_body:
    'Module submodule picks from your save now match in-game for ancestral and star-tier chassis and assist modules — including Orbital Augment, Dimension Core, and Primordial Collapse — with corrected assist picker scaling and formatting.',
  whats_new_307_headline: "What's new in v3.0.7",
  whats_new_307_body:
    'Golden Tower Golden Combo now upgrades to level 14 (0.45% bonus) with correct wiki stone costs — the Plus track was previously capped five levels early.',
  whats_new_306_headline: "What's new in v3.0.6",
  whats_new_306_body:
    'Assist module substat bonuses now include the full Assist Module Substats lab on top of sub-stone efficiency — ultimate weapon cooldown/duration and other assist sub-stats display correctly at 100% combined efficiency.',
  whats_new_305_headline: "What's new in v3.0.5",
  whats_new_305_body:
    'Workshop stat cards now match in-game values — damage, health, utility rows, Recovery Amount, and Max Recovery with Recovery Package+ enhancement. Lab and workshop costs use refreshed GOD tables.',
  whats_new_304_headline: "What's new in v3.0.4",
  whats_new_304_body:
    'Workshop buy multiplier now includes MAX (+ to cap, − to zero). playerInfo.dat import maps more labs from researchLevel slots. Bug Buster and Tower Backup dialogs fit better on 1080p screens.',
  whats_new_303_headline: "What's new in v3.0.3",
  whats_new_303_body:
    'Older playerInfo.dat saves now import medal bots from legacy preset arrays. Bug Buster email uses normal spaces (not plus signs) and copies the message to your clipboard.',
  whats_new_302_headline: "What's new in v3.0.2",
  whats_new_302_body:
    'Save import fixes: bot medal order, Assist Module lab costs in q (e.g. 250.00q), other labs T/q like the wiki, cannon modules (e.g. Shrink Ray) name and icon, and gallery admin lists all builds.',
  whats_new_301_headline: "What's new in v3.0.1",
  whats_new_301_body:
    'Golden Bot Bonus and Range now import correctly from playerInfo.dat — re-import your save if those stats looked wrong.',
  whats_new_300_headline: "What's new in v3.0.0",
  whats_new_300_body:
    'Import playerInfo.dat from The Tower, pick light or high-contrast themes, and publish community builds after signing in with Google, Discord, or Twitch.',
  whats_new_2811_headline: "What's new in v2.8.11",
  whats_new_2811_body:
    'Sub-module bonuses now affect workshop stat labels — equipped main and assist picks stack with labs and relics.',
  app_loadingResearch: 'Loading app data…',
  app_nav_main_aria: 'Primary pages',
  app_nav_research: 'LAB',
  app_nav_workshop: 'WORKSHOP',
  app_nav_bots: 'BOTS',
  app_nav_modules: 'MODULES',
  app_nav_cards: 'CARDS',
  app_nav_relics: 'RELICS',
  app_nav_vault: 'VAULT',
  app_nav_themes: 'THEMES',
  app_nav_guardians: 'GUARDIANS',
  app_nav_gallery: 'BUILDS',
  vault_placeholder: 'Vault tools are coming soon.',
  guardians_respec: 'Reset Chips',
  guardians_respec_aria: 'Reset equipped guardian chips and purchased slot unlocks',
  guardians_respec_confirm_title: 'Reset chips?',
  guardians_respec_confirm_body:
    'Unequip all guardian chips and reset purchased chip slot unlocks.',
  guardians_respec_confirm: 'Reset Chips',
  guardians_respec_cancel: 'Cancel',
  guardians_search_label_hidden: 'Search guardian chips',
  guardians_search_placeholder: 'Search chips…',
  guardians_search_slash_hint: 'Press / to focus chip search',
  guardians_profile_aria: 'Active guardian and chip loadout',
  guardians_inventory_title: 'CHIPS INVENTORY',
  guardians_inventory_aria: 'Guardian chips inventory',
  guardians_no_chips_match: 'No chips match your search.',
  guardians_no_guardian: 'No guardian',
  guardians_edit_guardian_aria: 'Change active guardian',
  guardians_slot_locked_aria: 'Locked chip slot',
  guardians_slot_unlock_aria: 'Unlock chip slot for {{cost}} Bits',
  guardians_slot_empty_aria: 'Empty chip slot',
  guardians_slot_empty_label: 'EMPTY',
  guardians_slot_unequip_aria: 'Unequip {{chip}}',
  guardians_chip_equip: 'Equip',
  guardians_chip_unequip: 'Unequip',
  guardians_chip_equip_aria: 'Equip {{chip}}',
  guardians_chip_equipped_aria: '{{chip}} equipped — click to unequip',
  guardians_chip_select_aria: 'Select {{chip}}',
  guardians_chip_upgrade_aria: 'Chip upgrades',
  guardians_attack_track_percent: 'Attack',
  guardians_attack_track_cooldown: 'Cooldown',
  guardians_attack_track_targets: 'Targets',
  guardians_ally_track_recovery: 'Recovery',
  guardians_ally_track_max_recovery: 'Max Recovery',
  guardians_ally_track_cooldown: 'Cooldown',
  guardians_bounty_track_multiplier: 'Multiplier',
  guardians_bounty_track_cooldown: 'Cooldown',
  guardians_bounty_track_targets: 'Targets',
  guardians_fetch_track_cooldown: 'Cooldown',
  guardians_fetch_track_find_chance: 'Find Chance',
  guardians_fetch_track_double_find_chance: 'Double Find Chance',
  guardians_summon_track_cooldown: 'Cooldown',
  guardians_summon_track_duration: 'Duration',
  guardians_summon_track_cash_bonus: 'Cash Bonus',
  guardians_scout_track_cooldown: 'Cooldown',
  guardians_scout_track_range_bonus: 'Range Bonus',
  guardians_scout_track_duration: 'Duration',
  guardians_chip_upgrade_cost: '{{cost}}',
  guardians_chip_upgrade_cost_title: 'Upgrade cost in Bits',
  guardians_chip_max: 'Max',
  guardians_chip_level_down_aria: 'Decrease {{track}}',
  guardians_chip_level_up_aria: 'Increase {{track}}',
  guardians_chip_upgrades_unavailable: 'Upgrades for {{chip}} are not available yet.',
  guardians_picker_title: 'Select guardian',
  guardians_picker_close_aria: 'Close guardian picker',
  guardian_chip_attack: 'Attack',
  guardian_chip_ally: 'Ally',
  guardian_chip_bounty: 'Bounty',
  guardian_chip_fetch: 'Fetch',
  guardian_chip_summon: 'Summon',
  guardian_chip_scout: 'Scout',
  app_nav_tools: 'TOOLS &',
  app_nav_settings: 'Settings',
  app_nav_tools_settings: 'Settings',
  app_nav_gallery_admin: 'ADMIN',
  app_themes_title: 'Themes & Songs',
  app_themes_intro: 'Customize how TowerSmith looks.',
  themes_tabs_aria: 'Theme categories',
  themes_tab_tower: 'Tower',
  themes_tab_background: 'Background',
  themes_tab_music: 'Music',
  themes_tab_menus: 'Menus',
  themes_tab_banners: 'Banners',
  themes_tab_guardian: 'Guardian',
  themes_tower_group_milestone: 'Milestone',
  themes_tower_group_event: 'Event skins',
  themes_tower_group_guild: 'Guild season',
  themes_guild_season: 'Guild Season {{season}}',
  themes_milestone_tier: 'Tier {{tier}}',
  themes_card_aria_milestone: '{{name}}, tier {{tier}}, {{unlock}}',
  themes_card_aria_event: '{{name}}, {{event}}',
  themes_card_aria_guild: '{{name}}, guild season {{season}}',
  theme_unlock_free: 'Free',
  theme_unlock_pass: 'Pass {{n}}',
  theme_tower_shuriken: 'Shuriken',
  theme_tower_donut: 'Donut',
  theme_tower_yin_yang: 'Yin-Yang',
  theme_tower_smile: 'Smile',
  theme_tower_butterfly: 'Butterfly',
  theme_tower_sheep: 'Sheep',
  theme_tower_fried_egg: 'Fried Egg',
  theme_tower_mush_mush: 'Mush-mush',
  theme_tower_turtle: 'Turtle',
  theme_tower_cheese: 'Cheese',
  theme_tower_cat: 'Cat',
  theme_tower_skull: 'Skull',
  theme_tower_creepy_clown: 'Creepy Clown',
  theme_tower_tech_tree: 'Tech Tree',
  theme_tower_cactus: 'Cactus',
  theme_tower_panda: 'Panda',
  theme_tower_dragon: 'Dragon',
  theme_tower_rhino: 'Rhino',
  theme_tower_atomic: 'Atomic',
  theme_tower_cyber: 'Cyber',
  theme_tower_eclipse: 'Eclipse',
  theme_skin_plasma_ball: 'Plasma Ball',
  theme_skin_north_spirit: 'North Spirit',
  theme_skin_alien: 'Alien',
  theme_skin_water_droplet: 'Water Droplet',
  theme_skin_cherry_blossom: 'Cherry Blossom',
  theme_skin_neo_turbo: 'Neo Turbo',
  theme_skin_spider: 'Spider',
  theme_skin_sentinel: 'Sentinel',
  theme_skin_autumn_leaf: 'Autumn Leaf',
  theme_skin_invader: 'Invader',
  theme_skin_toast_glass: 'Toast Glass',
  theme_skin_fisherman: 'Fisherman',
  theme_skin_storm_eye: 'Storm Eye',
  theme_skin_noise_tower: 'Noise Tower',
  theme_skin_snowman: 'Snowman',
  theme_skin_pocket_watch: 'Pocket Watch',
  theme_skin_frog: 'Frog',
  theme_skin_marshmallow: 'Marshmallow',
  theme_skin_cthulhu: 'Cthulhu',
  theme_skin_flying_car: 'Flying Car',
  theme_skin_crystal: 'Crystal',
  theme_skin_balloon: 'Balloon',
  theme_skin_heart: 'Heart',
  theme_skin_glitch: 'Glitch',
  theme_skin_brain: 'Brain',
  theme_skin_cake: 'Cake',
  theme_skin_star: 'Star',
  theme_skin_eye_of_the_lord: 'Eye of the Lord',
  theme_skin_bee: 'Bee',
  theme_skin_bunny: 'Bunny',
  theme_skin_prisma: 'Prisma',
  theme_skin_virus: 'Virus',
  theme_skin_howling_wolf: 'Howling Wolf',
  theme_skin_hourglass: 'Hourglass',
  theme_skin_pumpkin: 'Pumpkin',
  theme_skin_dark_tower: 'Dark Tower',
  theme_skin_dive_helmet: 'Dive Helmet',
  theme_skin_starship: 'Starship',
  theme_skin_elite_tower: 'Elite Tower',
  theme_skin_umbrella: 'Umbrella',
  theme_skin_unlucky_cow: 'Unlucky Cow',
  theme_skin_black_cat: 'Black Cat',
  theme_skin_black_hole: 'Black Hole',
  theme_skin_neon_pi: 'Neon Pi',
  theme_skin_crown: 'Crown',
  theme_skin_mech_warrior: 'Mech Warrior',
  theme_skin_dj: 'Dj',
  theme_skin_pixel_soldier: 'Pixel Soldier',
  theme_skin_restless_eye: 'Restless Eye',
  theme_skin_shining_star: 'Shining Star',
  theme_skin_space_telescope: 'Space Telescope',
  theme_skin_bear: 'Bear',
  theme_skin_rabbit_in_hat: 'Rabbit In Hat',
  theme_event_plasma_returns: 'Plasma Returns',
  theme_event_aurora: 'Aurora',
  theme_event_aliens: 'Aliens',
  theme_event_ocean_night: 'Ocean Night',
  theme_event_cherry_blossom: 'Cherry Blossom',
  theme_event_retrowave: 'Retrowave',
  theme_event_cobweb: 'Cobweb',
  theme_event_matrix: 'Into the Matrix',
  theme_event_autumn: 'Autumn',
  theme_event_retro_arcade: 'Retro Arcade',
  theme_event_new_year: 'New Year',
  theme_event_sunset_fishing: 'Sunset Fishing',
  theme_event_into_the_storm: 'Into The Storm',
  theme_event_towers_channel: "Tower's Channel",
  theme_event_snowstorm: 'Snowstorm',
  theme_event_what_time_is_it: 'What Time Is It?',
  theme_event_koi_pond: 'Koi Pond',
  theme_event_camping: 'Camping',
  theme_event_cthulhu: 'Cthulhu',
  theme_event_cyberpunk: 'Cyberpunk',
  theme_event_crystal_cave: 'Crystal Cave',
  theme_event_amusement_park: 'Amusement Park',
  theme_event_valentine: 'Valentine',
  theme_event_glitch: 'Glitch',
  theme_event_neuron: 'Neuron',
  theme_event_5th_anniversary: '5th Anniversary',
  theme_event_interstellar: 'Interstellar',
  theme_event_volcano: 'Volcano',
  theme_event_honey: 'Honey',
  theme_event_easter: 'Easter',
  theme_event_prismatic_lines: 'Prismatic Lines',
  theme_event_viral_outbreak: 'Viral Outbreak',
  theme_event_full_moon: 'Full Moon',
  theme_event_sands_of_time: 'Sands of Time',
  theme_event_halloween: 'Halloween',
  theme_event_dark_strands: 'Dark Strands',
  theme_event_deep_blue_sea: 'Deep Blue Sea',
  theme_event_faster_than_light: 'Faster Than Light',
  theme_event_invaders: 'Invaders',
  theme_event_rainfall: 'Rainfall',
  theme_event_abduction: 'Abduction',
  theme_event_meowy_night: 'Meowy Night',
  theme_event_gravity: 'Gravity',
  theme_event_pi: 'Pi',
  theme_bg_interstellar: 'Interstellar',
  theme_bg_volcano: 'Volcano',
  theme_bg_plasma_field: 'Plasma Field',
  theme_bg_honeycomb: 'Honeycomb',
  theme_bg_aurora: 'Aurora',
  theme_bg_alien_ship: 'Alien Ship',
  theme_bg_ocean_night: 'Ocean Night',
  theme_bg_sakura: 'Sakura',
  theme_bg_easter: 'Easter',
  theme_bg_retrowave: 'Retrowave',
  theme_bg_prismatic_lines: 'Prismatic Lines',
  theme_bg_cobweb: 'Cobweb',
  theme_bg_matrix: 'Matrix',
  theme_bg_virus_field: 'Virus Field',
  theme_bg_mountain_night: 'Mountain Night',
  theme_bg_sandstorm: 'Sandstorm',
  theme_bg_autumn_forest: 'Autumn Forest',
  theme_bg_haunted_house: 'Haunted House',
  theme_bg_arcade: 'Arcade',
  theme_bg_new_years: 'New Year',
  theme_bg_dark_strands: 'Dark Strands',
  theme_bg_deep_sea: 'Deep Sea',
  theme_bg_hyper_space: 'Hyper Space',
  theme_bg_invasion: 'Invasion',
  theme_bg_sunset_river: 'Sunset River',
  theme_bg_hurricane: 'Hurricane',
  theme_bg_rainfall: 'Rainfall',
  theme_bg_tv_wall: 'TV Wall',
  theme_bg_abduction: 'Abduction',
  theme_bg_snowstorm: 'Snowstorm',
  theme_bg_forest_of_cats: 'Forest of Cats',
  theme_bg_event_horizon: 'Event Horizon',
  theme_bg_clock_tower: 'Clock Tower',
  theme_bg_pi_disk: 'Pi Disk',
  theme_bg_koi_pond: 'Koi Pond',
  theme_bg_camping: 'Camping',
  theme_bg_cthulhu: 'Cthulhu',
  theme_bg_cyberpunk: 'Cyberpunk',
  theme_bg_crystal_cave: 'Crystal Cave',
  theme_bg_amusement_park: 'Amusement Park',
  theme_bg_valentine: 'Valentine',
  theme_bg_glitch: 'Glitch',
  theme_bg_neuron: 'Neuron',
  theme_bg_5th_anniversary: '5th Anniversary',
  theme_bg_throne_room: 'Throne Room',
  theme_bg_mech_world: 'Mech World',
  theme_bg_party: 'Party',
  theme_bg_pixel_alien_war: 'Pixel Alien War',
  theme_bg_crimson_horror: 'Crimson Horror',
  theme_bg_cozy_cosmos: 'Cosy Cosmos',
  theme_bg_supernova: 'Supernova',
  theme_bg_claw_machine: 'Claw Machine',
  theme_bg_magician: 'Magician',
  themes_reset: 'Reset Themes',
  themes_reset_aria: 'Reset theme selections and owned flags',
  themes_reset_confirm_title: 'Reset themes?',
  themes_reset_confirm_body:
    'Restores default active selections for tower, background, music, menus, banners, and guardian, and clears all owned flags. Saved in this browser only.',
  themes_coin_bonus_toggle_collapse: 'Collapse passive coin bonus',
  themes_coin_bonus_toggle_expand: 'Expand passive coin bonus',
  themes_coin_bonus_title: 'Passive coin bonus',
  themes_coin_bonus_formula:
    'Coin Bonus = 1 + 0.4%×Tower + 0.8%×Background + 0.6%×Music + 0.6%×Menus + 0.6%×Banners + 0.6%×Guardian (owned counts)',
  themes_coin_bonus_line: '{{category}}: {{count}} owned (+{{percent}}% each)',
  themes_passive_bonus:
    '{{category}} · +{{percent}}% per owned ({{owned}}/{{total}} owned)',
  themes_owned_true: 'Owned',
  themes_owned_false: 'Not owned',
  themes_owned_toggle_on: 'Mark {{name}} as owned',
  themes_owned_toggle_off: 'Mark {{name}} as not owned',
  themes_search_label_hidden: 'Search themes',
  themes_search_placeholder: 'Search… (press / to focus)',
  themes_search_slash_hint:
    'Press the slash key anywhere on this page to focus the theme search field.',
  themes_search_no_results: 'No themes match your search.',
  themes_filter_count: '{{owned}} owned · {{shown}} shown',
  themes_select_all_shown: 'Select all shown',
  themes_clear_all_shown: 'Clear shown',
  themes_select_all_shown_aria: 'Mark all {{count}} themes in this tab as owned',
  themes_clear_all_shown_aria: 'Mark all {{count}} themes in this tab as not owned',
  theme_music_krisu_oceans_sings: 'Krisu - Oceans Sings',
  theme_music_krisu_hiding_himalaya: 'Krisu - Hiding in Himalaya',
  theme_music_krisu_forest_bathing: 'Krisu - Forest Bathing',
  theme_menu_dark_being: 'Dark Being',
  theme_menu_mech: 'Mech World',
  theme_menu_party: 'Party',
  theme_menu_pixel: 'Pixel Alien War',
  theme_menu_horror: 'Crimson Horror',
  theme_menu_cosmos: 'Cosy Cosmos',
  theme_menu_supernova: 'Supernova',
  theme_menu_claw: 'Claw Machine',
  theme_menu_magician: 'Magician',
  theme_banner_dark_being: 'Dark Being',
  theme_banner_mech: 'Mech World',
  theme_banner_party: 'Party',
  theme_banner_pixel: 'Pixel Alien War',
  theme_banner_horror: 'Crimson Horror',
  theme_banner_cosmos: 'Cosy Cosmos',
  theme_banner_supernova: 'Supernova',
  theme_banner_claw: 'Claw Machine',
  theme_banner_magician: 'Magician',
  theme_guardian_butter: 'Butter',
  theme_guardian_muse: 'Muse',
  theme_guardian_finn: 'Finn',
  theme_guardian_nyra: 'Nyra',
  theme_guardian_rolo: 'Rolo',
  theme_guardian_glenn: 'Glenn',
  theme_guardian_zepe: 'Zepe',
  theme_guardian_iris: 'Iris',
  theme_guardian_silk: 'Silk',
  theme_guardian_mickey: 'Mickey',
  theme_guardian_gaia: 'Gaia',
  theme_guardian_arwing: 'Arwing',
  theme_guardian_frank: 'Frank',
  theme_guardian_earl: 'Earl',
  theme_guardian_mei: 'Mei',
  theme_guardian_shelly: 'Shelly',
  theme_guardian_disco: 'Disco',
  app_inpanel_tabs_aria: 'Main sections',
  app_tools_title: 'Tools',
  app_tools_full_reset: 'Reset all stored data',
  app_tools_full_reset_aria:
    'Clear all TowerSmith data saved in this browser: lab, workshop, builds, themes, and settings',
  app_tools_full_reset_hint:
    'Clears everything this app stores locally and reloads the page. Export or copy a share link first if you want to keep your data.',
  app_tools_full_reset_confirm_title: 'Reset everything in this browser?',
  app_tools_full_reset_confirm_body:
    'This removes lab levels, saved builds, workshop upgrades, cards, modules, relics, guardian chips, themes, language, and other settings stored for TowerSmith in this browser. The page will reload with factory defaults. Export or copy a share link first if you want to keep your data.',
  app_tools_full_reset_confirm_btn: 'Reset everything',
  auth_loading: 'Checking sign-in…',
  auth_sign_in: 'Sign in',
  auth_sign_out: 'Sign out',
  auth_my_builds: 'My Builds',
  auth_tower_backup: 'Tower Backup & Sharing',
  auth_my_builds_title: 'Your builds',
  auth_my_builds_intro:
    'Manage your published builds — load, copy link, set public or private, regenerate link, or delete.',
  auth_my_builds_empty: 'You have not published any builds yet.',
  auth_signed_in: 'Signed in',
  auth_sign_in_google: 'Continue with Google',
  auth_sign_in_discord: 'Continue with Discord',
  auth_sign_in_twitch: 'Continue with Twitch',
  auth_required_publish: 'Sign in with Google, Discord, or Twitch to publish a build.',
  auth_session_expired:
    'Your sign-in expired. Sign out, sign in again, then try publishing.',
  gallery_error_project_mismatch:
    'Publish failed: the site’s sign-in and gallery backend use different Supabase projects. Align VITE_SUPABASE_* and SUPABASE_* on the host, then redeploy.',
  profile_settings_title: 'Your profile',
  profile_settings_intro:
    'Set the username, guild, and avatar shown on your community builds. Edit these in Tools & Settings anytime.',
  profile_display_name_label: 'Username',
  profile_display_name_hint: '1–40 characters. Must be unique (not case-sensitive). Shown as the author on builds you publish.',
  profile_display_name_save_btn: 'Save username',
  profile_display_name_saving: 'Saving…',
  profile_guild_label: 'Guild ID',
  profile_guild_hint:
    'Optional. Your guild ID (e.g. NTQDF9). Used to resolve your guild name when publishing.',
  profile_guild_save_btn: 'Save guild ID',
  profile_guild_saving: 'Saving…',
  profile_guild_name_label: 'Guild name',
  profile_guild_name_hint:
    'Readable name shown on your builds. You can correct it here if an incorrect name was entered.',
  profile_guild_name_save_btn: 'Save guild name',
  profile_guild_name_saving: 'Saving…',
  profile_notice_guild_saved: 'Guild saved.',
  profile_notice_guild_name_saved: 'Guild name saved.',
  profile_avatar_upload_btn: 'Upload avatar',
  profile_avatar_uploading: 'Uploading…',
  profile_avatar_remove_btn: 'Remove avatar',
  profile_avatar_hint: 'JPEG, PNG, WebP, or GIF up to 512 KB.',
  profile_notice_name_saved: 'Username saved.',
  profile_notice_avatar_saved: 'Avatar updated.',
  profile_notice_avatar_removed: 'Avatar removed.',
  profile_error_invalid_display_name: 'Username must be 1–40 characters.',
  profile_error_display_name_taken: 'That username is already taken.',
  profile_error_invalid_guild: 'Guild must be 1–40 characters, or leave it empty to clear.',
  profile_error_invalid_guild_name: 'Guild name must be 1–40 characters.',
  profile_error_guild_name_forbidden:
    'This guild name cannot be changed here. Save your guild ID on your profile first, or contact an admin.',
  profile_error_guild_name_not_found: 'No guild name is registered for this ID yet. Publish a build to set it.',
  profile_error_invalid_avatar_type: 'Choose a JPEG, PNG, WebP, or GIF image.',
  profile_error_avatar_too_large: 'Avatar must be 512 KB or smaller.',
  profile_error_network: 'Could not save your profile. Try again.',
  profile_error_unknown: 'Something went wrong while saving your profile.',
  gallery_search_label: 'Search builds',
  gallery_search_placeholder: 'Search by title, username, or guild…',
  gallery_submit_sign_in_hint: 'Sign in to submit your tower. Browsing and loading builds does not require an account.',
  gallery_submit_signed_in: 'You are signed in. Submissions use your profile username from Tools & Settings.',
  gallery_title: 'Community towers',
  gallery_intro:
    'Short share links (?build=…) load towers from the community gallery. Sign in to submit; browse and load builds without an account.',
  gallery_submit_title: 'Submit your tower',
  gallery_submit_hint:
    'Uses your current LAB levels and workshop snapshot (same data as a share link). Sign in to submit; pick a category and your profile name is shown as author.',
  gallery_submit_visibility_unlisted: 'Private (only people with the link can access)',
  gallery_field_title: 'Title',
  gallery_field_title_placeholder: 'e.g. Endgame damage build',
  gallery_field_category: 'Build category',
  gallery_field_category_placeholder: 'Select a category…',
  gallery_filter_category: 'Category',
  gallery_category_filter_all: 'All categories',
  gallery_error_invalid_category: 'Choose a build category before submitting.',
  gallery_error_invalid_guild: 'Guild name must be 1-40 characters if provided.',
  gallery_category_turtle: 'Turtle',
  gallery_category_turtle_desc:
    'Maximize defense (Defense %, absolute defense, and health) to absorb hits while enemy damage scales your Thorns. Best for Tier 1 and early-game progression; falls off when enemy damage outscales tower health.',
  gallery_category_ehp: 'eHP',
  gallery_category_ehp_desc:
    'Build effective HP (Health, Defense %, Defense Absolute) and survive long enough for passive killers—Orbs and Thorns—to clear heavy mobs and bosses. Best for mid-game runs and coin farming toward Ultimate Weapons.',
  gallery_category_blender: 'Blender',
  gallery_category_blender_desc:
    'Use Orbs and Extra Orbs efficiently with intentionally low tower range so orbs circle the tower edge like a blender. Best for reliable farming and fast wave clears.',
  gallery_category_devo: 'Devo',
  gallery_category_devo_desc:
    'Complex eHP build centered on the Death Wave Ultimate Weapon, using labs to multiply max health when enemies die to Death Wave. Orb Devo and SMAX Devo variants scale coins and stats. Best for end-game farming with heavy lab and coin investment.',
  gallery_category_glass_cannon: 'GC',
  gallery_category_glass_cannon_desc:
    'Abandon defense for pure Damage, Attack Speed, and Critical Hits—kill enemies before they reach your tower. Best for high-tier tournaments and max waves; often needs Ultimates like Chrono Field to survive hits.',
  gallery_category_hybrid: 'Hybrid',
  gallery_category_hybrid_desc:
    'Balance high-end damage with solid defense—often Attack-focused Cannon modules and Utility Generators for offensive/defensive pushes. Best for transitioning into end-game without getting one-shot by bosses.',
  gallery_category_other: 'Other',
  gallery_category_other_desc:
    'Experimental, niche, or unconventional strategies that do not fit the standard build archetypes above.',
  gallery_field_author: 'Author (optional)',
  gallery_field_author_placeholder: 'Player name',
  gallery_field_guild_id: 'Guild ID (optional)',
  gallery_field_guild_id_placeholder: 'e.g. NTQDF9',
  gallery_field_guild_id_hint:
    'Resolved to your guild name when published. Prefilled from your profile if set.',
  gallery_submit_btn: 'Submit to gallery',
  gallery_submitting: 'Submitting…',
  gallery_list_title: 'Browse submissions',
  gallery_list_paged_hint:
    'Newest or top-rated. Loads 20 at a time; use pagination to browse older builds.',
  gallery_sort_label: 'Sort builds',
  gallery_sort_newest: 'Newest',
  gallery_sort_top: 'Top rated',
  gallery_upvote_btn: 'Like',
  gallery_upvote_btn_active: 'Liked',
  gallery_upvote_sign_in: 'Sign in to like builds.',
  gallery_upvote_short: 'likes',
  gallery_error_cannot_vote_own: 'You cannot vote on your own build.',
  gallery_error_votes_unavailable:
    'Helpful votes are not available yet. Apply the build votes migration in Supabase.',
  sr_community_sort_label: 'Community build sort',
  gallery_load_more: 'Load more',
  gallery_loading_more: 'Loading more…',
  gallery_page_prev: 'Previous',
  gallery_page_next: 'Next',
  gallery_page_label: 'Page {{page}}',
  gallery_showing_count: 'Showing {{count}} builds',
  gallery_refresh: 'Refresh',
  gallery_loading: 'Loading gallery…',
  gallery_empty: 'No towers submitted yet. Be the first!',
  gallery_copy_link_btn: 'Copy link',
  gallery_notice_link_copied: 'Short share link copied to clipboard.',
  gallery_notice_set_public: 'Build is now public in gallery listings.',
  gallery_notice_set_unlisted: 'Build is now unlisted (link-only).',
  gallery_notice_category_updated: 'Build category updated.',
  gallery_notice_regenerated_link: 'New link generated and copied. Old link no longer works.',
  gallery_notice_regenerated_no_copy: 'New link generated. Copy it from the build row.',
  gallery_load_btn: 'Load',
  gallery_compare_btn: 'Compare',
  gallery_loading_tower: 'Loading…',
  gallery_error_network: 'Could not reach the gallery API. Try again later.',
  gallery_error_unavailable:
    'Gallery API is not available. On localhost, run npm run dev:netlify instead of npm run dev.',
  gallery_unavailable_title: 'Community gallery is offline',
  gallery_unavailable_disabled_body:
    'This build was compiled with the gallery disabled (VITE_TOWER_GALLERY_DISABLED). Remove that flag and redeploy, or run a normal build to browse and publish builds.',
  gallery_unavailable_local_body:
    'The gallery API needs Netlify Functions and Supabase. Plain npm run dev only serves the static app — API calls to /api/towers will fail.',
  gallery_unavailable_production_body:
    'The gallery API is not responding. Set Supabase env vars on your host (VITE_SUPABASE_* for the browser, SUPABASE_* for serverless functions) and apply supabase/schema.sql.',
  gallery_unavailable_local_cmd_hint: '— starts Vite and proxies /api to Netlify Dev',
  gallery_unavailable_setup_link: 'Gallery setup guide',
  gallery_publish_unavailable_hint:
    'Publish and browse need the gallery API.',
  gallery_filter_mine: 'My builds only',
  gallery_filter_tags_aria: 'Filter by build category',
  gallery_filter_author_aria: 'Filter builds by {{author}}',
  gallery_filter_guild_aria: 'Filter builds by guild {{guild}}',
  gallery_error_invalid_title: 'Title must be 1–40 characters.',
  gallery_error_invalid_payload: 'Tower data was invalid or too large.',
  gallery_error_disabled: 'Submissions are temporarily disabled.',
  gallery_error_not_found: 'That tower was not found.',
  gallery_error_unknown: 'Something went wrong.',
  gallery_error_apply:
    'Could not apply this tower. Open the LAB tab once, then try again.',
  gallery_notice_loaded: 'Loaded “{{title}}” into this browser.',
  gallery_notice_submitted: 'Submitted “{{title}}” to the gallery.',
  gallery_by_author: 'by {{author}}',
  gallery_visibility_public: 'Public',
  gallery_visibility_private: 'Private',
  gallery_visibility_select_aria: 'Visibility: {{value}}. Choose public or private.',
  gallery_category_select_aria: 'Category: {{value}}. Choose a build category.',
  gallery_category_filter_select_aria: 'Filter category: {{value}}.',
  gallery_admin_title: 'Gallery admin',
  gallery_admin_page_intro:
    'Remove spam or outdated community builds. Deletes are permanent for the public gallery.',
  gallery_admin_sign_in_required: 'Sign in to open the gallery admin page.',
  gallery_admin_access_denied: 'Your account is not an admin for this site.',
  gallery_admin_your_user_id:
    'Your user ID: {{userId}} — add it to TOWER_GALLERY_ADMIN_USER_IDS on Netlify to grant access.',
  gallery_admin_unlocked_hint:
    'Lists every build in the database (public and private). Use Load more if needed. Delete removes the short link and listing.',
  gallery_owner_make_public: 'Make public',
  gallery_owner_make_unlisted: 'Make Private',
  gallery_owner_regenerate_link: 'Regenerate link',
  gallery_owner_delete_confirm:
    'Delete this build? This cannot be undone, and the old link will stop working.',
  gallery_regenerate_confirm:
    'Generate a new link ID and revoke the old one for this build?',
  gallery_admin_delete: 'Delete',
  gallery_admin_deleting: 'Deleting…',
  gallery_admin_delete_confirm_title: 'Delete this build?',
  gallery_admin_delete_confirm_body:
    '“{{title}}” will be removed from the gallery. Anyone with the old ?build= link will get an error.',
  gallery_admin_notice_deleted: 'Deleted “{{title}}” from the gallery.',
  gallery_admin_error_network: 'Could not reach the admin API.',
  gallery_admin_error_unauthorized: 'You do not have admin access.',
  gallery_admin_error_not_configured:
    'Admin is not configured on the server (missing TOWER_GALLERY_ADMIN_USER_IDS).',
  app_settings_title: 'Settings',
  app_settings_color_scheme_label: 'Appearance',
  app_settings_color_scheme_aria: 'Color theme',
  app_settings_color_scheme_dark: 'Dark',
  app_settings_color_scheme_light: 'Light',
  app_settings_color_scheme_high_contrast: 'High contrast',
  app_settings_color_scheme_hint:
    'Dark is the default. High contrast uses stronger borders and text for long sessions.',
  app_settings_language_label: 'Language',
  app_settings_budget_panels_label: 'Show lab, workshop & themes budget panels',
  app_settings_budget_panels_hint:
    'LAB and WORKSHOP coin totals (spent, to max, next upgrade) and the THEMES passive coin bonus multiplier panel.',
  app_settings_modules_catalog_label: 'Show module wiki tables on Modules tab',
  app_settings_modules_catalog_hint:
    'When on, shows the full chassis module catalog below the hub. When off, equip modules via the hub slot picker.',
  app_settings_submodules_catalog_label: 'Show sub-module effects wiki table on Modules tab',
  app_settings_submodules_catalog_hint:
    'When on, shows the sub-module effects reference below the hub. When off, assign sub-effects in the module picker only.',
  app_settings_assist_wiki_label: 'Show assist modules wiki reference on Modules tab',
  app_settings_assist_wiki_hint:
    'When on, shows assist unlock costs, stone efficiency upgrade table, and wiki notes below the hub.',
  app_settings_relic_workshop_bonus_label: 'Show relic workshop bonus lines on Relics tab',
  app_settings_refresh_research_label: 'Refresh research data',
  app_settings_refresh_research_hint:
    'Reload lab and workshop definitions from the server. Use after a data update, or if cards look stale. Production uses the offline cache unless you refresh.',
  app_settings_refresh_research_busy: 'Refreshing…',
  app_wiki_data_stamp:
    'Game and wiki data in this build were aligned as of {{date}} (updated when maintainer scripts regenerate tables).',
  app_wiki_data_stamp_unknown:
    'Game and wiki alignment date is not recorded for this build.',
  app_settings_ep_section_title: 'Effective Paths (Google Sheets)',
  app_settings_ep_ids_master_label: 'IDS Master spreadsheet ID or URL',
  app_settings_ep_ids_master_placeholder: '1RnNttj_… or https://docs.google.com/spreadsheets/d/…',
  app_settings_ep_ids_master_hint:
    'Your IDS Master gateway spreadsheet. TowerSmith reads the IDS tab and linked workbook IDs from column D (“Go to my … Sheet”). Press Save to store locally and sync to your account when signed in.',
  app_settings_ep_ids_master_save_btn: 'Save IDS',
  app_settings_ep_ids_master_saving: 'Saving…',
  app_settings_ep_ids_master_saved: 'IDS Master saved.',
  app_settings_ep_ids_master_save_failed: 'Could not save IDS Master. Try again when signed in.',
  app_settings_ep_ids_master_save_invalid: 'IDS Master URL or ID is too long (max 500 characters).',
  app_settings_relic_workshop_bonus_hint:
    'When on, each relic card shows how its effect applies in the simulator (e.g. +10% workshop damage). Off by default.',
  settings_shortcuts_title: 'Keyboard shortcuts',
  settings_shortcuts_intro:
    'Shortcuts work on desktop when focus is not in a text field, number field, or dropdown.',
  settings_shortcut_search_key: '/',
  settings_shortcut_search_desc:
    'Focus search on Labs, Relics, and Themes (when that tab is open).',
  settings_shortcut_undo_key: 'Ctrl+Z',
  settings_shortcut_undo_desc:
    'Undo the last Max All, reset, or clear workspace (up to 20 steps).',
  settings_shortcut_escape_key: 'Esc',
  settings_shortcut_escape_desc: 'Close the topmost open dialog or panel.',
  settings_shortcut_tab_1_key: '1',
  settings_shortcut_tab_1_desc: 'Workshop tab',
  settings_shortcut_tab_2_key: '2',
  settings_shortcut_tab_2_desc: 'Labs tab',
  settings_shortcut_tab_3_key: '3',
  settings_shortcut_tab_3_desc: 'Cards tab',
  settings_shortcut_tab_4_key: '4',
  settings_shortcut_tab_4_desc: 'Modules tab',
  settings_shortcut_tab_5_key: '5',
  settings_shortcut_tab_5_desc: 'Bots tab',
  settings_shortcut_tab_6_key: '6',
  settings_shortcut_tab_6_desc: 'Guardians tab',
  settings_shortcut_tab_7_key: '7',
  settings_shortcut_tab_7_desc: 'Themes tab',
  settings_shortcut_tab_8_key: '8',
  settings_shortcut_tab_8_desc: 'Relics tab',
  settings_shortcut_tab_9_key: '9',
  settings_shortcut_tab_9_desc: 'Vault tab',
  settings_shortcut_tab_0_key: '0',
  settings_shortcut_tab_0_desc: 'Gallery tab',
  workspace_undo_done: 'Restored previous workspace snapshot.',
  catalog_section_expand: 'Expand section',
  catalog_section_collapse: 'Collapse section',
  themes_section_count: '{{count}} shown',
  app_install_title: 'Install app',
  app_install_intro:
    'Add TowerSmith to your home screen for a full-screen app experience and faster repeat visits.',
  app_install_button: 'Install TowerSmith',
  app_install_installed: 'Installed on this device',
  app_install_installed_hint:
    'You opened TowerSmith from your home screen. Updates apply automatically when you are online.',
  app_install_ios_hint:
    'In Safari, tap Share, then “Add to Home Screen”.',
  app_install_browser_hint:
    'Use your browser menu — Install app, Add to Home screen, or Install TowerSmith — when it appears.',
  ws_title: 'Workshop',
  ws_tab_upgrade: 'Upgrade',
  ws_tab_enhance: 'Enhance',
  ws_tab_enhance_unavailable_aria: 'Enhance (not available for ultimate weapons)',
  ws_tab_modules: 'Modules',
  ws_tab_cards: 'Cards',
  ws_section_modules: 'Assist modules',
  ws_section_cards: 'Cards',
  ws_section_relics: 'Relics',
  ws_relics_damage_total: 'Relic bonuses',
  ws_relics_summary_toggle_collapse: 'Collapse relic bonuses',
  ws_relics_summary_toggle_expand: 'Expand relic bonuses',
  ws_relics_owned_count: '{{owned}} / {{total}} owned',
  ws_relics_breakdown_title: 'Total bonuses',
  ws_relics_table_stat: 'Total bonuses',
  ws_relics_table_active: 'Active',
  ws_relics_table_total: 'Total',
  ws_relics_table_standard: 'Standard',
  ws_relics_table_premium: 'Premium',
  ws_relics_table_per_relic: 'Boost per new relic',
  ws_relics_group_misc: 'Misc.',
  ws_relics_group_damage: 'Damage',
  ws_relics_group_defense: 'Defense',
  ws_relics_group_utility: 'Utility',
  ws_relics_stat_labSpeed: 'Lab Speed',
  ws_relics_stat_botRange: 'Bot Range',
  ws_relics_stat_damage: 'Damage',
  ws_relics_stat_ultimateDamage: 'Ultimate Damage',
  ws_relics_stat_attackSpeed: 'Attack Speed',
  ws_relics_stat_critChance: 'Crit Chance',
  ws_relics_stat_critFactor: 'Crit Factor',
  ws_relics_stat_damagePerMeter: 'Damage / Meter',
  ws_relics_stat_superCritChance: 'Super Critical Chance',
  ws_relics_stat_superCritMult: 'Super Critical Mult',
  ws_relics_stat_rendArmorMult: 'Rend Armor Mult',
  ws_relics_stat_health: 'Health',
  ws_relics_stat_healthRegen: 'Health Regen',
  ws_relics_stat_defensePercent: 'Defense %',
  ws_relics_stat_defenseAbsolute: 'Defense Absolute',
  ws_relics_stat_thorns: 'Thorns',
  ws_relics_stat_knockbackForce: 'Knockback Force',
  ws_relics_stat_orbSpeed: 'Orb Speed',
  ws_relics_stat_landMineDamage: 'Land Mine Damage',
  ws_relics_stat_wallHealth: 'Wall Health',
  ws_relics_stat_wallRebuild: 'Wall Rebuild',
  ws_relics_stat_cash: 'Cash',
  ws_relics_stat_coins: 'Coins',
  ws_relics_stat_freeAttackUpgrade: 'Free Attack Upgrade',
  ws_relics_stat_freeDefenseUpgrade: 'Free Defense Upgrade',
  ws_relics_stat_freeUtilityUpgrade: 'Free Utility Upgrade',
  ws_relics_stat_recoveryAmount: 'Recovery Amount',
  ws_relics_stat_enemyAttackSkip: 'Enemy Attack Level Skip',
  ws_relics_stat_enemyHealthSkip: 'Enemy Health Level Skip',
  ws_relics_bonus_input_aria: 'Total relic damage bonus percent for displayed damage',
  ws_relics_tabs_aria: 'Relic filters',
  ws_relics_filter_all: 'All',
  ws_relics_filter_milestone: 'Milestone',
  ws_relics_filter_tournament: 'Tournament',
  ws_relics_filter_birthday: 'Birthday',
  ws_relics_filter_event: 'Event',
  ws_relics_filter_guild: 'Guild',
  ws_relics_filter_other: 'Other',
  ws_relics_filter_count: '{{owned}} owned · {{shown}} shown',
  ws_relics_search_label_hidden: 'Search relics',
  ws_relics_search_placeholder: 'Search… (press / to focus)',
  ws_relics_search_slash_hint:
    'Press the slash key anywhere on this page to focus the relic search field.',
  ws_relics_search_no_results: 'No relics match your search.',
  ws_relics_select_all_shown: 'Select all shown',
  ws_relics_clear_all_shown: 'Clear shown',
  ws_relics_select_all_shown_aria: 'Mark all {{count}} relics in this filter as owned',
  ws_relics_clear_all_shown_aria: 'Mark all {{count}} relics in this filter as not owned',
  ws_relics_rarity_rare: 'Rare',
  ws_relics_rarity_epic: 'Epic',
  ws_relics_rarity_legendary: 'Legendary',
  ws_relics_rarity_count: '{{owned}} / {{total}} owned',
  ws_relics_damage_line: '+{{percent}}% displayed damage',
  ws_relics_workshop_damage_line: '+{{percent}}% workshop damage',
  ws_relics_workshop_damage_meter_line: '+{{percent}}% workshop damage/meter',
  ws_relics_workshop_line: '+{{percent}}% workshop {{stat}}',
  ws_relics_bots_line: '+{{value}} bot range (all bots)',
  ws_relics_labs_line: '+{{percent}}% lab speed (× Labs Speed research)',
  ws_relics_owned_true: 'Owned',
  ws_relics_owned_false: 'Not owned',
  ws_relics_owned_toggle_on: 'Mark {{name}} as owned',
  ws_relics_owned_toggle_off: 'Mark {{name}} as not owned',
  ws_cards_presets_aria: 'Card loadout preset',
  ws_presets_rename_callout: 'Double-click a tab to rename.',
  ws_presets_rename_dialog_hint:
    'Syncs with your account when signed in; otherwise saved in this browser only. Does not change in-game names.',
  ws_cards_preset_1: 'Preset 1',
  ws_cards_preset_2: 'Preset 2',
  ws_cards_preset_3: 'Preset 3',
  ws_cards_preset_4: 'Preset 4',
  ws_cards_preset_5: 'Preset 5',
  ws_preset_rename_input_aria: 'Preset name',
  ws_preset_rename_title: 'Rename preset',
  ws_preset_rename_save: 'Save',
  ws_cards_active: 'Active',
  ws_cards_active_scroll_left: 'Scroll active cards left',
  ws_cards_active_scroll_right: 'Scroll active cards right',
  ws_cards_inventory: 'Inventory',
  ws_cards_sim_extras: 'Displayed-stat inputs',
  ws_cards_slots: 'Slots',
  ws_cards_slots_aria: 'Equipped card slot count (wiki max 28)',
  ws_cards_milestone: 'Milestone',
  ws_card_damage: 'Damage',
  ws_card_attack_speed: 'Attack Speed',
  ws_card_health: 'Health',
  ws_card_health_regen: 'Health Regen',
  ws_card_range: 'Range',
  ws_card_cash: 'Cash',
  ws_card_coins: 'Coins',
  ws_card_slow_aura: 'Slow Aura',
  ws_card_critical_chance: 'Critical Chance',
  ws_card_enemy_balance: 'Enemy Balance',
  ws_card_extra_defense: 'Extra Defense',
  ws_card_fortress: 'Fortress',
  ws_card_free_upgrades: 'Free Upgrades',
  ws_card_extra_orb: 'Extra Orb',
  ws_card_plasma_cannon: 'Plasma Cannon',
  ws_card_critical_coin: 'Critical Coin',
  ws_card_wave_skip: 'Wave Skip',
  ws_card_intro_sprint: 'Intro Sprint',
  ws_card_land_mine_stun: 'Land Mine Stun',
  ws_card_recovery_package_chance: 'Recovery Package Chance',
  ws_card_death_ray: 'Death Ray',
  ws_card_energy_net: 'Energy Net',
  ws_card_super_tower: 'Super Tower',
  ws_card_second_wind: 'Second Wind',
  ws_card_demon_mode: 'Demon Mode',
  ws_card_energy_shield: 'Energy Shield',
  ws_card_wave_accelerator: 'Wave Accelerator',
  ws_card_berserker: 'Berserker',
  ws_card_ultimate_crit: 'Ultimate Crit',
  ws_card_nuke: 'Nuke',
  ws_card_area_of_effect: 'Area of Effect',
  ws_cards_tile_damage: 'Damage',
  ws_cards_tile_attack_speed: 'Attack Speed',
  ws_cards_tile_berserker: 'Berserker',
  ws_cards_tile_cannon_as: 'Cannon AS',
  ws_cards_tile_relics: 'Relics',
  ws_cards_tile_perk: 'Perk Qty',
  ws_cards_tile_damage_taken: 'Dmg Taken',
  ws_sim_damage_card: 'Damage card (stars)',
  ws_sim_attack_speed_card: 'Attack Speed card (stars)',
  ws_sim_attack_speed_sub_effect: 'Cannon submodule attack speed (+)',
  ws_sim_attack_speed_sub_hint: 'Flat add inside (Workshop × Lab × Card + …); wiki 0.3–5 by rarity.',
  ws_sim_berserker_card: 'Berserker card (stars)',
  ws_sim_relics_bonus: 'Relics bonus',
  ws_sim_perk_damage_quantity: 'Damage perk quantity',
  ws_sim_berserker_damage_taken: 'Damage taken (Berserker)',
  ws_sim_stars_down_aria: 'Decrease card stars',
  ws_sim_stars_up_aria: 'Increase card stars',
  ws_sim_stars_input_aria: 'Card stars (type a number, Enter or blur to apply)',
  ws_sim_stars_max: 'Max stars:',
  ws_sim_number_input_aria: 'Simulator value (type a number, Enter or blur to apply)',
  ws_sim_relics_hint: 'Sum inside (1 + Relics) as a percent bonus.',
  ws_sim_perk_quantity_hint: 'Damage perk count for the Perk term in displayed damage.',
  ws_sim_berserker_taken_hint: 'Damage taken this round for Berserker flat bonus.',
  ws_sim_module_cannon: 'Cannon',
  ws_sim_module_armor: 'Armor',
  ws_sim_module_generator: 'Generator',
  ws_sim_module_core: 'Core',
  ws_sim_module_lab_substats: 'Assist substats (lab)',
  ws_sim_module_lab_bonus: 'Assist bonus (lab)',
  ws_sim_module_cannon_damage: 'Cannon module damage',
  ws_sim_module_substats_hint: 'From MODULES research for the selected chassis.',
  ws_sim_module_bonus_hint: 'Support module bonus labs for the selected chassis.',
  ws_sim_module_cannon_hint: 'Cannon % applies only when Cannon is the active assist slot.',
  ws_sim_module_not_cannon: '—',
  ws_modules_hub_aria: 'Assist module chassis',
  ws_modules_presets_aria: 'Module loadout preset',
  ws_modules_preset_1: 'Preset 1',
  ws_modules_preset_2: 'Preset 2',
  ws_modules_preset_3: 'Preset 3',
  ws_modules_preset_4: 'Preset 4',
  ws_modules_preset_5: 'Preset 5',
  ws_modules_none_selected: 'No module',
  ws_modules_picker_title: 'Select module',
  ws_modules_picker_rarity: 'Rarity',
  ws_modules_picker_rarity_aria: 'Module rarity tier',
  ws_modules_assist_active: 'Assist active',
  ws_modules_assist_label: 'Assist',
  ws_modules_assist_locked: 'Locked',
  ws_modules_picker_assist_title: 'Select assist module',
  ws_modules_picker_equipped: 'Equipped',
  ws_modules_picker_equipped_primary: 'Primary',
  ws_modules_picker_equipped_assist: 'Assist',
  ws_modules_equip: 'Equip',
  ws_modules_unequip: 'Unequip',
  ws_modules_equip_aria: 'Equip {{module}} as {{role}}',
  ws_modules_equipped_aria: '{{module}} equipped as {{role}} — click to unequip',
  ws_modules_picker_assist_unique_tier:
    'Unique effect: {{unique}} tier (module at {{module}}; raise Unique effect boost in Assist unlocks).',
  ws_modules_picker_module_aria: 'Chassis module',
  ws_modules_picker_effects: 'Effects',
  ws_modules_picker_options: 'Options',
  ws_modules_picker_options_aria: 'Sub-module effect options',
  ws_modules_picker_sub_effect_rarity: 'Effect tier',
  ws_modules_picker_apply_effect: 'Apply',
  ws_modules_picker_clear_effect: 'Remove effect',
  ws_modules_picker_unique_effect: 'Unique Effect',
  ws_modules_picker_done: 'Done',
  ws_modules_submodule_unlocks_at: 'Unlocks at Lv.',
  ws_modules_submodule_locked_rarity_max: 'Needs Lv. {{level}} (max {{max}} at this rarity)',
  ws_assist_unlocks_title: 'Assist unlocks',
  ws_assist_unlocks_unique: 'Unique effect boost',
  ws_assist_unlocks_multiplier: 'Multiplier efficiency',
  ws_assist_unlocks_substat: 'Substat efficiency',
  ws_assist_unlocks_unlock: 'Unlock assist slot',
  ws_assist_unlock: 'Unlock',
  ws_assist_unlock_cost_title:
    'Power stones to unlock this assist slot (1,000 each; starts Epic unique with 1% main and sub efficiency)',
  ws_assist_unlocks_toggle: 'Unlock',
  ws_modules_assist_stone_efficiency: 'Stone efficiency',
  ws_modules_assist_efficiency_prefix: 'Eff.',
  ws_modules_assist_efficiency_hint:
    'Assist applies a weaker copy of the module effect at your stone efficiency % (max 70% from stones; labs add more).',
  ws_modules_inventory_title: 'INVENTORY',
  ws_modules_inventory_aria: 'Chassis modules inventory',
  ws_modules_inventory_filter_aria: 'Filter modules by chassis',
  ws_modules_inventory_filter_all: 'All',
  ws_modules_inventory_detail_aria: 'Selected module configuration',
  ws_modules_module_select_aria: 'Select {{module}}',
  ws_modules_module_unowned_aria: '{{module}} (not owned)',
  ws_modules_catalog_select_hint: 'Click a module name or tier value to equip it on this chassis.',
  ws_modules_level_prefix: 'Lv.',
  ws_modules_level_input_aria: 'Module level for',
  ws_modules_cannons_title: 'Cannons',
  ws_modules_armor_title: 'Armor',
  ws_modules_generators_title: 'Generators',
  ws_modules_cores_title: 'Cores',
  ws_modules_notes_title: 'Notes',
  ws_submodules_title: 'Sub-Module Effects',
  ws_submodules_col_effect: 'Effect',
  ws_submodules_col_common: 'Common',
  ws_submodules_col_rare: 'Rare',
  ws_submodules_col_epic: 'Epic',
  ws_submodules_col_legendary: 'Legendary',
  ws_submodules_col_mythic: 'Mythic',
  ws_submodules_col_ancestral: 'Ancestral',
  ws_submodules_na: 'n/a',
  ws_submodules_catalog_select_hint:
    'Click a tier value to equip that sub-module effect on this chassis. Click again to clear.',
  ws_assist_wiki_title: 'Assist Modules',
  ws_assist_table_rarity_title: 'Unique effect rarity (stones)',
  ws_assist_table_rarity_hint:
    'Stone cost to raise the assist copy’s unique-effect tier (per chassis slot).',
  ws_assist_table_efficiency_title: 'Main / sub stone efficiency',
  ws_assist_table_efficiency_hint:
    'Stone cost per +1% main and sub efficiency on the assist copy (max 70% from stones).',
  ws_assist_col_rarity: 'Rarity',
  ws_assist_col_stones: 'Stones (this tier)',
  ws_assist_col_cumulative: 'Total stones',
  ws_assist_col_value: 'Value',
  ws_assist_col_marginal: 'Stones (this level)',
  ws_assist_col_to_max: 'Stones to max',
  ws_assist_rarity_unlock: 'unlock',
  ws_assist_row_total: 'Total',
  ws_assist_slot_unlock_note:
    'Unlocking each assist chassis slot costs 1,000 stones and starts at Epic unique with 1% main/sub efficiency.',
  ws_modules_col_module: 'Module',
  ws_modules_col_ability: 'Ability',
  ws_modules_col_epic: 'Epic',
  ws_modules_col_legendary: 'Legendary',
  ws_modules_col_mythic: 'Mythic',
  ws_modules_col_ancestral: 'Ancestral',
  ws_modules_merge_rare: 'Rare',
  ws_modules_merge_rare_plus: 'Rare+',
  ws_modules_merge_epic: 'Epic',
  ws_modules_merge_epic_plus: 'Epic+',
  ws_modules_merge_legendary: 'Legendary',
  ws_modules_merge_legendary_plus: 'Legendary+',
  ws_modules_merge_mythic: 'Mythic',
  ws_modules_merge_mythic_plus: 'Mythic+',
  ws_modules_merge_ancestral: 'Ancestral',
  ws_modules_merge_star_1: 'Ancestral 1★',
  ws_modules_merge_star_2: 'Ancestral 2★',
  ws_modules_merge_star_3: 'Ancestral 3★',
  ws_modules_merge_star_4: 'Ancestral 4★',
  ws_modules_merge_star_5: 'Ancestral 5★',
  ws_modules_merge_max_level: 'max {{max}}',
  ws_modules_catalog_soon: 'Module catalog for this chassis is not added yet.',
  ws_enhance_empty: 'Enhance is not modeled for this category yet.',
  ws_section_attack_enhance: 'Attack Enhancements',
  ws_section_defense_enhance: 'Defense Enhancements',
  ws_section_utility_enhance: 'Utility Enhancements',
  ws_stat_enhanceCashBonus: 'Cash Bonus +',
  ws_stat_enhanceCoinBonus: 'Coin Bonus +',
  ws_stat_enhanceCellsKillBonus: 'Cells/Kill Bonus +',
  ws_stat_enhanceFreeUpgrades: 'Free Upgrades +',
  ws_stat_enhanceRecoveryPackage: 'Recovery Package +',
  ws_stat_enhanceEnemyLevelSkip: 'Enemy Level Skip +',
  ws_enhance_cash_bonus_level_input_aria:
    'Cash bonus enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_coin_bonus_level_input_aria:
    'Coin bonus enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_cells_kill_bonus_level_input_aria:
    'Cells/kill bonus enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_free_upgrades_level_input_aria:
    'Free upgrades enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_recovery_package_level_input_aria:
    'Recovery package enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_enemy_level_skip_level_input_aria:
    'Enemy level skip enhancement level (type a number, Enter or blur to apply)',
  ws_stat_enhanceHealth: 'Health +',
  ws_stat_enhanceHealthRegen: 'Health Regen +',
  ws_stat_enhanceDefenseAbsolute: 'Defense Absolute +',
  ws_stat_enhanceLandMineDamage: 'Land Mine Damage +',
  ws_stat_enhanceWallHealth: 'Wall Health +',
  ws_stat_enhanceOrbSize: 'Orb Size +',
  ws_enhance_health_level_input_aria:
    'Health enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_health_regen_level_input_aria:
    'Health regen enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_defense_absolute_level_input_aria:
    'Defense absolute enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_land_mine_damage_level_input_aria:
    'Land mine damage enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_wall_health_level_input_aria:
    'Wall health enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_orb_size_level_input_aria:
    'Orb size enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_level_down_aria: 'Decrease enhancement level',
  ws_enhance_level_up_aria: 'Increase enhancement level',
  ws_enhance_locked_lab: 'Research Workshop Enhancements in the Lab',
  ws_enhance_locked_attack:
    'Spend {remaining} more on attack enhancements ({required} total)',
  ws_enhance_locked_attack_damage:
    'Spend {remaining} more on damage enhancements ({required} total)',
  ws_enhance_locked_defense:
    'Spend {remaining} more on defense enhancements ({required} total)',
  ws_enhance_locked_utility:
    'Spend {remaining} more on utility enhancements ({required} total)',
  ws_enhance_damage_level_input_aria: 'Damage enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_rend_armor_level_input_aria:
    'Rend armor enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_crit_factor_level_input_aria:
    'Critical factor enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_damage_per_meter_level_input_aria:
    'Damage per meter enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_super_crit_mult_level_input_aria:
    'Super crit mult enhancement level (type a number, Enter or blur to apply)',
  ws_enhance_attack_speed_level_input_aria:
    'Attack speed enhancement level (type a number, Enter or blur to apply)',
  ws_stat_enhanceDamage: 'Damage +',
  ws_stat_enhanceRendArmor: 'Rend Armor +',
  ws_stat_enhanceCritFactor: 'Critical Factor +',
  ws_stat_enhanceDamagePerMeter: 'Damage / Meter +',
  ws_stat_enhanceSuperCritMult: 'Super Crit Mult +',
  ws_stat_enhanceAttackSpeed: 'Attack Speed +',
  ws_budget_title: 'Workshop coins',
  ws_budget_stones_title: 'Workshop power stones',
  ws_budget_aria:
    'Spent {{spent}}, to max {{toMax}}, next visible upgrades {{next}}.',
  ws_budget_stones_aria:
    'Spent {{spent}} power stones, to max {{toMax}} power stones, next visible upgrades {{next}} power stones.',
  ws_budget_footnote:
    'Totals include attack, defense, and utility rows. “Next upgrade” sums only cards visible on the Upgrade tab for the selected category (respects Hide Completed).',
  ws_budget_stones_footnote:
    'Totals include all ultimate-weapon basic upgrades (power stones). “Next upgrade” sums only visible stat columns on the Ultimate tab (respects Hide Completed).',
  ws_budget_spent_dt: 'Spent (all workshop upgrades)',
  ws_budget_stones_spent_dt: 'Spent (all ultimate upgrades)',
  ws_budget_to_max_dt: 'To max (finite caps)',
  ws_budget_stones_to_max_dt: 'To max (finite caps)',
  ws_budget_next_dt: 'Next upgrade (visible)',
  ws_budget_stones_next_dt: 'Next upgrade (visible)',
  ws_budget_toggle_collapse: 'Collapse workshop budget',
  ws_budget_toggle_expand: 'Expand workshop budget',
  ws_bot_budget_title: 'Bot medals',
  ws_bot_budget_aria:
    'Spent {{spent}} medals, to max {{toMax}} medals, next visible upgrades {{next}} medals.',
  ws_bot_budget_footnote:
    'Totals include event-shop bot unlocks and medal upgrade tracks (basic stats and Bot+ levels). Bot+ stone unlocks (power stones) are omitted. “Next upgrade” sums only visible rows on active bots.',
  ws_bot_budget_spent_dt: 'Spent (all bot upgrades)',
  ws_bot_budget_to_max_dt: 'To max (finite caps)',
  ws_bot_budget_next_dt: 'Next upgrade (visible)',
  ws_bot_budget_toggle_collapse: 'Collapse bot budget',
  ws_bot_budget_toggle_expand: 'Expand bot budget',
  ws_section_attack: 'Attack Upgrades',
  ws_section_defense: 'Defense Upgrades',
  ws_section_utility: 'Utility Upgrades',
  ws_section_ultimate: 'Ultimate Upgrades',
  ws_section_bots: 'Bots',
  ws_multiplier_group_aria: 'Buy multiplier',
  ws_multiplier_toggle_expand: 'Show multiplier options (MAX, ×1, ×5, ×10, ×100)',
  ws_multiplier_toggle_collapse: 'Hide multiplier options',
  ws_cat_attack_aria: 'Attack upgrades category',
  ws_cat_defense_aria: 'Defense upgrades category',
  ws_cat_utility_aria: 'Utility upgrades category',
  ws_cat_ultimate_aria: 'Ultimate upgrades category',
  ws_cat_bots_aria: 'Bots upgrades category',
  ws_bot_flame: 'Flame Bot',
  ws_bot_thunder: 'Thunder Bot',
  ws_bot_golden: 'Golden Bot',
  ws_bot_amplify: 'Amplify Bot',
  ws_bot_botBot: 'Bot Bot',
  ws_bot_stat_linger: 'Linger',
  ws_bot_stat_damageReduction: 'Damage Reduction',
  ws_bot_stat_range: 'Range',
  ws_bot_special_burningGround: 'Burning Ground',
  ws_bot_toggle_on: 'ON',
  ws_bot_toggle_off: 'OFF',
  ws_bot_unlock: 'Unlock',
  ws_bot_unlock_bot: 'Unlock bot',
  ws_bot_unlock_cost_title: 'Medals to buy this bot in the event shop (cost rises with each bot owned)',
  ws_bot_medal_cost_title: 'Medals to purchase the next level',
  ws_bot_special_titanShock: 'Titan Shock',
  ws_bot_special_bonusCells: 'Bonus Cells',
  ws_bot_special_echoingShot: 'Echoing Shot',
  ws_bot_special_maximumPower: 'Maximum Power',
  ws_bot_special_unlock_btn: 'Unlock',
  ws_bot_special_purchase_btn: 'Purchase',
  ws_bot_special_unlock_cost_title: 'Power stones to unlock this Bot+ ability (1,250 each)',
  ws_bot_special_unlocked: 'Unlocked',
  ws_bot_special_unlock_requires_active: 'Turn this bot ON to unlock its Bot+ ability.',
  ws_bot_special_stat_damageMult: 'Damage mult',
  ws_bot_special_stat_attackSpeed: 'Attack speed',
  ws_bot_special_stat_cellsMult: 'Cells mult',
  ws_bot_special_stat_powerMult: 'Power mult',
  ws_bot_plus_locked_prereq: 'Unlock all 5 bots to buy Plus abilities.',
  ws_reset_bots_demo: 'Reset bots',
  ws_reset_bots_confirm_title: 'Reset bot upgrades?',
  ws_reset_bots_confirm_body:
    'This resets all bot ownership, stat levels, ON/OFF toggles, and special unlocks for this build.',
  ws_reset_demo: 'Reset Workshop',
  ws_reset_ultimate_demo: 'Reset Ultimate Weapons',
  ws_reset_confirm_title: 'Reset workshop upgrade levels?',
  ws_reset_confirm_body:
    'Resets workshop upgrade, enhance, and ultimate weapon levels to defaults. Export or copy a share link first if you want to keep these levels.',
  ws_reset_ultimate_confirm_title: 'Reset ultimate weapons?',
  ws_reset_ultimate_confirm_body:
    'Resets ultimate weapon upgrade levels, ownership, active toggles, and plus abilities to defaults. Export or copy a share link first if you want to keep these levels.',
  ws_damage_level_down_aria: 'Decrease workshop damage level',
  ws_damage_level_up_aria: 'Increase workshop damage level',
  ws_damage_level_input_aria: 'Workshop damage level (type a number, Enter or blur to apply)',
  ws_damage_max_label: 'Max',
  ws_attack_speed_level_down_aria: 'Decrease workshop attack speed level',
  ws_attack_speed_level_up_aria: 'Increase workshop attack speed level',
  ws_attack_speed_level_input_aria:
    'Workshop attack speed level (type a number, Enter or blur to apply)',
  ws_crit_chance_level_down_aria: 'Decrease workshop critical chance level',
  ws_crit_chance_level_up_aria: 'Increase workshop critical chance level',
  ws_crit_chance_level_input_aria:
    'Workshop critical chance level (type a number, Enter or blur to apply)',
  ws_crit_factor_level_down_aria: 'Decrease workshop critical factor level',
  ws_crit_factor_level_up_aria: 'Increase workshop critical factor level',
  ws_crit_factor_level_input_aria:
    'Workshop critical factor level (type a number, Enter or blur to apply)',
  ws_attack_range_level_down_aria: 'Decrease workshop attack range level',
  ws_attack_range_level_up_aria: 'Increase workshop attack range level',
  ws_attack_range_level_input_aria:
    'Workshop attack range level (type a number, Enter or blur to apply)',
  ws_damage_per_meter_level_down_aria: 'Decrease workshop damage per meter level',
  ws_damage_per_meter_level_up_aria: 'Increase workshop damage per meter level',
  ws_damage_per_meter_level_input_aria:
    'Workshop damage per meter level (type a number, Enter or blur to apply)',
  ws_multishot_chance_level_down_aria: 'Decrease workshop multishot chance level',
  ws_multishot_chance_level_up_aria: 'Increase workshop multishot chance level',
  ws_multishot_chance_level_input_aria:
    'Workshop multishot chance level (type a number, Enter or blur to apply)',
  ws_multishot_targets_level_down_aria: 'Decrease workshop multishot targets level',
  ws_multishot_targets_level_up_aria: 'Increase workshop multishot targets level',
  ws_multishot_targets_level_input_aria:
    'Workshop multishot targets level (type a number, Enter or blur to apply)',
  ws_rapid_fire_chance_level_down_aria: 'Decrease workshop rapid fire chance level',
  ws_rapid_fire_chance_level_up_aria: 'Increase workshop rapid fire chance level',
  ws_rapid_fire_chance_level_input_aria:
    'Workshop rapid fire chance level (type a number, Enter or blur to apply)',
  ws_rapid_fire_duration_level_down_aria: 'Decrease workshop rapid fire duration level',
  ws_rapid_fire_duration_level_up_aria: 'Increase workshop rapid fire duration level',
  ws_rapid_fire_duration_level_input_aria:
    'Workshop rapid fire duration level (type a number, Enter or blur to apply)',
  ws_bounce_shot_chance_level_down_aria: 'Decrease workshop bounce shot chance level',
  ws_bounce_shot_chance_level_up_aria: 'Increase workshop bounce shot chance level',
  ws_bounce_shot_chance_level_input_aria:
    'Workshop bounce shot chance level (type a number, Enter or blur to apply)',
  ws_bounce_shot_targets_level_down_aria: 'Decrease workshop bounce shot targets level',
  ws_bounce_shot_targets_level_up_aria: 'Increase workshop bounce shot targets level',
  ws_bounce_shot_targets_level_input_aria:
    'Workshop bounce shot targets level (type a number, Enter or blur to apply)',
  ws_bounce_shot_range_level_down_aria: 'Decrease workshop bounce shot range level',
  ws_bounce_shot_range_level_up_aria: 'Increase workshop bounce shot range level',
  ws_bounce_shot_range_level_input_aria:
    'Workshop bounce shot range level (type a number, Enter or blur to apply)',
  ws_super_crit_chance_level_down_aria: 'Decrease workshop super crit chance level',
  ws_super_crit_chance_level_up_aria: 'Increase workshop super crit chance level',
  ws_super_crit_chance_level_input_aria:
    'Workshop super crit chance level (type a number, Enter or blur to apply)',
  ws_super_crit_mult_level_down_aria: 'Decrease workshop super crit mult level',
  ws_super_crit_mult_level_up_aria: 'Increase workshop super crit mult level',
  ws_super_crit_mult_level_input_aria:
    'Workshop super crit mult level (type a number, Enter or blur to apply)',
  ws_rend_armor_chance_level_down_aria: 'Decrease workshop rend armor chance level',
  ws_rend_armor_chance_level_up_aria: 'Increase workshop rend armor chance level',
  ws_rend_armor_chance_level_input_aria:
    'Workshop rend armor chance level (type a number, Enter or blur to apply)',
  ws_rend_armor_mult_level_down_aria: 'Decrease workshop rend armor mult level',
  ws_rend_armor_mult_level_up_aria: 'Increase workshop rend armor mult level',
  ws_rend_armor_mult_level_input_aria:
    'Workshop rend armor mult level (type a number, Enter or blur to apply)',
  ws_stat_damage: 'Damage',
  ws_stat_attackSpeed: 'Attack Speed',
  ws_stat_critChance: 'Critical Chance',
  ws_stat_critFactor: 'Critical Factor',
  ws_stat_attackRange: 'Attack Range',
  ws_stat_damagePerMeter: 'Damage / Meter',
  ws_stat_multishotChance: 'Multishot Chance',
  ws_stat_multishotTargets: 'Multishot Targets',
  ws_stat_rapidFireChance: 'Rapid Fire Chance',
  ws_stat_rapidFireDuration: 'Rapid Fire Duration',
  ws_stat_bounceChance: 'Bounce Shot Chance',
  ws_stat_bounceTargets: 'Bounce Shot Targets',
  ws_stat_bounceShotRange: 'Bounce Shot Range',
  ws_stat_superCritChance: 'Super Crit Chance',
  ws_stat_superCritMult: 'Super Crit Mult',
  ws_stat_rendArmorChance: 'Rend Armor Chance',
  ws_stat_rendArmorMult: 'Rend Armor Multiplier',
  ws_defense_level_down_aria: 'Decrease workshop level',
  ws_defense_level_up_aria: 'Increase workshop level',
  ws_defense_level_input_aria: 'Workshop level (type a number, Enter or blur to apply)',
  ws_stat_defHealth: 'Health',
  ws_stat_defHealthRegen: 'Health Regen',
  ws_stat_defDefensePct: 'Defense %',
  ws_stat_defDefenseAbs: 'Defense Absolute',
  ws_stat_defThornDamage: 'Thorn Damage',
  ws_stat_defLifesteal: 'Lifesteal',
  ws_stat_defKnockbackChance: 'Knockback Chance',
  ws_stat_defKnockbackForce: 'Knockback Force',
  ws_stat_defOrbSpeed: 'Orb Speed',
  ws_stat_defOrbs: 'Orbs',
  ws_stat_defShockwaveSize: 'Shockwave Size',
  ws_stat_defShockwaveFreq: 'Shockwave Frequency',
  ws_stat_defLandMineChance: 'Land Mine Chance',
  ws_stat_defLandMineDamage: 'Land Mine Damage',
  ws_stat_defLandMineRadius: 'Land Mine Radius',
  ws_stat_defDeathDefy: 'Death Defy',
  ws_stat_defWallHealth: 'Wall Health',
  ws_stat_defWallRebuild: 'Wall Rebuild',
  ws_stat_utilCashBonus: 'Cash Bonus',
  ws_stat_utilCashPerWave: 'Cash / Wave',
  ws_stat_utilCoinsKillBonus: 'Coins / Kill Bonus',
  ws_stat_utilCoinsWave: 'Coins / Wave',
  ws_stat_utilFreeAttackUpgrade: 'Free Attack Upgrade',
  ws_stat_utilFreeDefenseUpgrade: 'Free Defense Upgrade',
  ws_stat_utilFreeUtilityUpgrade: 'Free Utility Upgrade',
  ws_stat_utilInterestPerWave: 'Interest / Wave',
  ws_stat_utilRecoveryAmount: 'Recovery Amount',
  ws_stat_utilMaxRecovery: 'Max Recovery',
  ws_stat_utilPackageChance: 'Package Chance',
  ws_stat_utilEnemyAttackLevelSkip: 'Enemy Attack Level Skip',
  ws_stat_utilEnemyHealthLevelSkip: 'Enemy Health Level Skip',
  ws_uw_chainLightning: 'Chain Lightning',
  ws_uw_smartMissiles: 'Smart Missiles',
  ws_uw_deathWave: 'Death Wave',
  ws_uw_chronoField: 'Chrono Field',
  ws_uw_innerLandMines: 'Inner Land Mines',
  ws_uw_goldenTower: 'Golden Tower',
  ws_uw_poisonSwamp: 'Poison Swamp',
  ws_uw_blackHole: 'Black Hole',
  ws_uw_spotlight: 'Spotlight',
  ws_uw_stat_damage: 'Damage',
  ws_uw_stat_quantity: 'Quantity',
  ws_uw_stat_chance: 'Chance',
  ws_uw_stat_cooldown: 'Cooldown',
  ws_uw_stat_duration: 'Duration',
  ws_uw_stat_slow: 'Slow',
  ws_uw_stat_bonus: 'Bonus',
  ws_uw_stat_size: 'Size',
  ws_uw_stat_angle: 'Angle',
  ws_uw_stones_cost_aria: 'power stones to upgrade',
  ws_uw_unlock: 'Unlock',
  ws_uw_unlock_cost_title:
    'Power stones to buy this ultimate weapon (cost rises with each weapon owned)',
  ws_uw_activate: 'Activate',
  ws_uw_deactivate: 'Deactivate',
  ws_uwp_section_title: 'Ultimate Weapon Plus',
  ws_uwp_section_intro:
    'Extra abilities that boost Ultimate Weapons and their base stats. After all 9 weapons are unlocked, buy Plus abilities in any order; each new unlock costs more power stones. Abilities start at level 0 and can be upgraded 10 times.',
  ws_uwp_unlock: 'Unlock',
  ws_uwp_unlock_cost_title: 'Power stones to unlock this Plus ability (cost rises with each unlock)',
  ws_uwp_level: 'Level',
  ws_uwp_effect: 'Effect',
  ws_uwp_locked: 'Locked',
  ws_uwp_locked_prereq: 'Unlock all 9 Ultimate Weapons to buy Plus abilities.',
  ws_uwp_chainLightningSmite: 'Chain Lightning — Smite',
  ws_uwp_smartMissilesCoverFire: 'Smart Missiles — Cover Fire',
  ws_uwp_poisonSwampDeathCreep: 'Poison Swamp — Death Creep',
  ws_uwp_goldenTowerGoldenCombo: 'Golden Tower — Golden Combo',
  ws_uwp_innerLandMinesChargedMines: 'Inner Land Mines — Charged Mines',
  ws_uwp_deathWaveKillWall: 'Death Wave — Kill Wall',
  ws_uwp_blackHoleConsume: 'Black Hole — Consume',
  ws_uwp_chronoFieldChronoLoop: 'Chrono Field — Chrono Loop',
  ws_uwp_spotlightLightRange: 'Spotlight — Light Range',
  ws_max: 'Max',

  sr_title: 'LAB',
  sr_toolbar_aria: 'Find and filter labs',
  sr_search_label_hidden: 'Search research',
  sr_search_placeholder: 'Search… (press / to focus)',
  sr_search_slash_hint:
    'Press slash (/) when not in a text field or number field to move focus to this search box.',

  sr_community_build_label: 'Community',
  sr_builds_row_label: 'Builds',
  sr_community_gallery_select_aria: 'Load a tower from the community gallery',
  sr_community_gallery_placeholder: 'Load from gallery…',
  sr_community_publish_btn: 'Publish…',
  sr_community_publish_title: 'Publish to community gallery',
  sr_community_publish_submit: 'Publish & copy link',
  sr_community_clear_workspace: 'Clear workspace',
  sr_community_clear_aria:
    'Clear lab levels, workshop upgrades, cards, modules, relics, bots, and themes in this browser',
  sr_community_clear_confirm_title: 'Clear workspace?',
  sr_community_clear_confirm:
    'This clears all lab levels and resets workshop upgrades, cards, modules, relics, bots, and themes to defaults in this browser. Export or copy a share link first if you want to keep this build.',
  sr_community_clear_done: 'Workspace cleared.',
  sr_preset_share_link: 'Copy link',
  sr_preset_share_link_aria:
    'Copy a short URL that opens this build (lab levels and workshop)',
  sr_hide_completed: 'Hide Completed',
  sr_max_all: 'Max All',
  sr_max_all_aria:
    'Set all visible lab levels to maximum (respects search, hide completed, and collapsed sections)',
  sr_max_all_cards_aria: 'Set all card star levels to maximum',
  sr_max_all_bots_aria:
    'Own all bots, activate them, max basic upgrades, and max Bot+ abilities',
  sr_reset_lab_levels: 'Reset Lab',
  ws_max_all_aria:
    'Set all visible workshop upgrades in the current category to maximum (respects hide completed)',
  sr_import_export_launcher: 'Import, export & share labs…',

  sr_budget_title: 'Lab coins',
  sr_budget_aria:
    'Spent {{spent}}, to max {{toMax}}, next visible upgrades {{next}}.',
  sr_budget_footnote:
    'Card Mastery rows omitted (stones). Missing toolkit coin data counts as 0 per step.',
  sr_budget_spent_dt: 'Spent (all coin labs)',
  sr_budget_to_max_dt: 'To max (finite caps)',
  sr_budget_next_dt: 'Next upgrade (visible)',
  sr_budget_toggle_collapse: 'Collapse lab budget',
  sr_budget_toggle_expand: 'Expand lab budget',

  sr_lab_data_title: 'Tower Backup & Sharing',
  sr_lab_data_intro:
    'Export/import one CSV with lab, workshop, cards, modules, relics, themes, guardians, and research-level data (tower_csv_v1), import a local The Tower playerInfo.dat save (labs + workshop + guardian chips), or copy a short share link.',
  sr_lab_data_files: 'Tower CSV (full backup)',
  sr_lab_data_save_game: 'Save Game',
  sr_lab_data_share: 'Share link',
  sr_lab_data_share_hint:
    'Share links are short URLs with ?build=… (tower stored on the server). If the gallery is unavailable, a long offline link is copied automatically.',
  sr_lab_import_file: 'Import tower CSV',
  sr_lab_import_player_save: 'Import Save',
  sr_lab_import_player_save_android_hint:
    'Android save: {{path}}/playerInfo.dat — the path is copied when you tap Import; pick that file in the file picker.',
  sr_lab_import_player_save_ios_hint:
    'iOS: playerInfo.dat lives in the game’s sandbox — you can’t browse to it here. Import a copy from Files, iCloud, or a backup extract.',
  sr_lab_import_player_save_stage_reading: 'Reading save file…',
  sr_lab_import_player_save_stage_decoding: 'Decoding save…',
  sr_lab_import_player_save_stage_applying: 'Applying lab and build…',
  sr_lab_import_player_save_stage_syncing: 'Syncing profile…',
  sr_notice_import_player_android_path:
    'Save folder path copied. In the file picker, open Android/data/com.TechTreeGames.TheTower/files and choose playerInfo.dat.',
  sr_notice_import_player_android_path_no_clip:
    'Opening file picker — in your file manager go to Android/data/com.TechTreeGames.TheTower/files/playerInfo.dat.',
  sr_lab_export_file: 'Export tower to CSV',
  ep_export_section: 'Effective Paths (Google Sheets)',
  ep_export_section_hint:
    'Sync owned relics and themes to your Effective Paths workbooks. Set your IDS Master URL in Settings first.',
  ep_labs_sync_section: 'Effective Paths (Google Sheets)',
  ep_labs_sync_section_hint:
    'Import or export build data with your Effective Paths workbooks. Set your IDS Master URL in Settings first.',
  ep_sync_open_btn: 'Effective Paths sync…',
  ep_sync_title: 'Effective Paths sync',
  ep_sync_intro:
    'Import from or export to your Effective Paths workbooks linked on the IDS tab.',
  ep_sync_step1: 'Set your IDS Master spreadsheet URL in Settings (Tools → Settings).',
  ep_sync_step2:
    'Click below to sign in with Google and choose your IDS Master spreadsheet in the file picker — separate from signing into TowerSmith.',
  ep_sync_step3:
    'Export requires Editor access on your linked workbooks. Exports create preview tabs first — review them, then apply or discard.',
  ep_sync_ids_master_account_hint:
    'If you saved IDS Master while signed in, it is stored on your account — sign in to load it, or paste and save it locally in Settings.',
  ep_sync_syncing: 'Syncing…',
  ep_export_open_btn: 'Sync to Effective Paths…',
  ep_export_labs_open_btn: 'Export to Effective Paths…',
  ep_import_labs_open_btn: 'Import from Effective Paths…',
  ep_export_title: 'Export to Effective Paths',
  ep_import_title: 'Import from Effective Paths',
  ep_import_intro:
    'Load linked workbooks from your IDS Master (set in Settings), then import build data from the linked child workbooks (same categories as export).',
  ep_import_labs_intro:
    'Load linked workbooks from your IDS Master (set in Settings), then import lab levels from the linked Laboratory Master Sheet.',
  ep_import_relics_btn: 'Import relics from Relics workbook',
  ep_import_themes_btn: 'Import themes from Themes workbook',
  ep_import_cards_btn: 'Import cards from Cards workbook',
  ep_import_labs_btn: 'Import labs from Laboratory workbook',
  ep_import_workshop_btn: 'Import workshop from Workshop workbook',
  ep_import_bots_btn: 'Import bots from Bots workbook',
  ep_import_uws_btn: 'Import UWs from UWs workbook',
  ep_import_guardians_btn: 'Import chips from Guardians workbook',
  ep_import_modules_btn: 'Import modules from Modules workbook',
  ep_import_row_btn: 'Import',
  ep_import_row_syncing: 'Importing…',
  ep_import_all_btn: 'Import all',
  ep_export_all_btn: 'Export all',
  ep_import_all_syncing: 'Importing all…',
  ep_export_all_syncing: 'Exporting all…',
  ep_import_all_success: 'Imported {{count}} categories from Effective Paths.',
  ep_export_all_success: 'Exported {{count}} categories to Effective Paths.',
  ep_export_all_staged_success:
    'Created {{count}} preview exports. Review them below, then apply or discard.',
  ep_export_staged_section_title: 'Preview exports',
  ep_export_staged_row_badge: 'Preview ready',
  ep_export_staged_verify_hint:
    'Open the preview tabs, compare them with the originals, then apply or discard. Apply copies onto the live tabs (it does not replace them), so IDS IMPORTRANGE links keep working.',
  ep_export_staged_open_preview: 'Open “{{sheet}}”',
  ep_export_staged_apply_btn: 'Apply changes',
  ep_export_staged_discard_btn: 'Discard preview',
  ep_export_staged_apply_all_btn: 'Apply all previews',
  ep_export_staged_discard_all_btn: 'Discard all previews',
  ep_export_staged_promoting: 'Applying…',
  ep_export_staged_discarding: 'Discarding…',
  ep_export_staged_apply_success: 'Live sheets updated.',
  ep_export_staged_discard_success: 'Preview tabs removed.',
  ep_import_all_none: 'No linked workbooks are available to import.',
  ep_export_all_none: 'No linked workbooks are available to export.',
  ep_import_syncing: 'Importing…',
  ep_import_syncing_workbook_named: 'Importing {{name}}…',
  ep_import_syncing_relics: 'Importing relics…',
  ep_import_syncing_themes: 'Importing themes…',
  ep_import_syncing_cards: 'Importing cards…',
  ep_import_syncing_labs: 'Importing labs…',
  ep_import_syncing_workshop: 'Importing workshop…',
  ep_import_syncing_bots: 'Importing bots…',
  ep_import_syncing_uws: 'Importing UWs…',
  ep_import_syncing_guardians: 'Importing guardian chips…',
  ep_import_syncing_modules: 'Importing modules…',
  ep_import_relics_success: 'Imported {{rows}} relic rows from “{{sheet}}”.',
  ep_import_themes_success: 'Imported {{rows}} theme rows from “{{sheet}}”.',
  ep_import_cards_success: 'Imported {{rows}} card rows from “{{sheet}}”.',
  ep_import_cards_presets_success_suffix:
    'Also imported {{presetRows}} preset slots on “{{presetSheet}}”.',
  ep_import_labs_success: 'Imported {{rows}} lab levels from “{{sheet}}”.',
  ep_import_workshop_success: 'Imported {{rows}} workshop upgrade levels from “{{sheet}}”.',
  ep_import_workshop_enhance_success_suffix:
    'Also imported {{enhanceRows}} workshop enhancement levels.',
  ep_import_bots_success: 'Imported {{rows}} bot farming levels from “{{sheet}}”.',
  ep_import_bots_lab_success_suffix: 'Also imported {{labRows}} BOTS laboratory levels.',
  ep_import_uws_success: 'Imported {{rows}} ultimate weapon levels from “{{sheet}}”.',
  ep_import_guardians_success: 'Imported {{rows}} guardian chip unlock rows from “{{sheet}}”.',
  ep_import_modules_success:
    'Imported {{rows}} equipped module columns ({{effects}} effects) from “{{sheet}}”.',
  ep_export_intro:
    'Load linked workbooks from your IDS Master (set in Settings), then export owned relics, themes, and other build data to the linked child workbooks.',
  ep_export_missing_ids_master:
    'Set your IDS Master spreadsheet URL in Settings (Tools → Settings) before loading linked workbooks.',
  ep_export_spreadsheet_label: 'IDS Master spreadsheet ID or URL',
  ep_export_spreadsheet_placeholder: '1RnNttj_… or https://docs.google.com/spreadsheets/d/…',
  ep_export_spreadsheet_hint:
    'Paste your IDS Master URL (any tab is fine — TowerSmith reads the IDS tab). Linked workbook IDs come only from column D (“Go to my … Sheet” hyperlinks).',
  ep_export_load_sheets_btn: 'Connect Google Sheets & load linked workbooks',
  ep_export_load_linked_workbooks_btn: 'Load linked workbooks',
  ep_export_loading_sheets: 'Connecting Google Sheets & checking linked workbooks…',
  ep_export_loading_linked_workbooks: 'Loading linked workbooks…',
  ep_export_loading_ids_gateway: 'Reading IDS Master…',
  ep_export_loading_workbook_named: 'Checking {{name}}…',
  ep_export_workbook_access_ok: 'Accessible',
  ep_export_workbook_access_denied: 'No access',
  ep_export_workbook_access_not_found: 'Not found',
  ep_export_linked_workbooks_denied:
    'TowerSmith cannot open these linked workbooks: {{names}}. Click “Connect Google Sheets & load linked workbooks” again and select them in the Google file picker, or fix the “Go to my … Sheet” link on the IDS tab.',
  ep_export_linked_sheets_title: 'IDS tab “{{tab}}” — linked workbooks',
  ep_export_relics_sync_target: 'relic sync target',
  ep_export_themes_sync_target: 'theme sync target',
  ep_export_cards_sync_target: 'card sync target',
  ep_export_workshop_sync_target: 'workshop sync target',
  ep_export_bots_sync_target: 'bots sync target',
  ep_export_labs_sync_target: 'laboratory sync target',
  ep_export_uws_sync_target: 'ultimate weapons sync target',
  ep_export_guardians_sync_target: 'guardian chips sync target',
  ep_export_modules_sync_target: 'modules sync target',
  ep_export_relics_missing_in_master:
    'No Relics row with a spreadsheet ID was found on the IDS tab.',
  ep_export_themes_missing_in_master:
    'No Themes & Songs row with a spreadsheet ID was found on the IDS tab.',
  ep_export_cards_missing_in_master:
    'No Cards row with a spreadsheet ID was found on the IDS tab.',
  ep_export_workshop_missing_in_master:
    'No Workshop row with a spreadsheet ID was found on the IDS tab.',
  ep_export_bots_missing_in_master:
    'No Bots row with a spreadsheet ID was found on the IDS tab.',
  ep_export_uws_missing_in_master:
    'IDS Master has no Ultimate Weapons workbook row. Add a UWs v3.1.2 link on the IDS tab.',
  ep_export_guardians_missing_in_master:
    'IDS Master has no Guardians workbook row. Add a Guardians v3.0.2 link on the IDS tab.',
  ep_export_modules_missing_in_master:
    'IDS Master has no Modules workbook row. Add a Modules v6.x link on the IDS tab.',
  ep_export_labs_missing_in_master:
    'No Laboratory row with a spreadsheet ID was found on the IDS tab.',
  ep_export_sync_targets_missing:
    'No Relics, Themes & Songs, Cards, Workshop, Bots, or Laboratory rows with spreadsheet IDs were found on the IDS tab.',
  ep_export_relics_missing_loaded:
    'Loaded: {{names}}. Fix the “Go to my Relics Sheet” link in column D on the IDS tab.',
  ep_export_row_btn: 'Export',
  ep_export_row_syncing: 'Exporting…',
  ep_export_sync_relics_btn: 'Export relics to Relics workbook',
  ep_export_sync_themes_btn: 'Export themes to Themes & Songs workbook',
  ep_export_sync_cards_btn: 'Export cards & presets to Cards workbook',
  ep_export_sync_workshop_btn: 'Export workshop to Workshop workbook',
  ep_export_sync_bots_btn: 'Export bots to Bots workbook',
  ep_export_sync_labs_btn: 'Export labs to Laboratory workbook',
  ep_export_sync_uws_btn: 'Export ultimate weapons to UWs workbook',
  ep_export_sync_guardians_btn: 'Export guardian chips to Guardians workbook',
  ep_export_sync_modules_btn: 'Export modules to Modules workbook',
  ep_export_syncing_workbook_named: 'Exporting {{name}}…',
  ep_export_syncing_relics: 'Exporting relics…',
  ep_export_syncing_themes: 'Exporting themes…',
  ep_export_syncing_cards: 'Exporting cards & presets…',
  ep_export_syncing_workshop: 'Exporting workshop…',
  ep_export_syncing_bots: 'Exporting bots…',
  ep_export_syncing_labs: 'Exporting labs…',
  ep_export_syncing_uws: 'Exporting ultimate weapons…',
  ep_export_syncing_guardians: 'Exporting guardian chips…',
  ep_export_syncing_modules: 'Exporting modules…',
  ep_export_relics_success: 'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} relic rows).',
  ep_export_themes_success: 'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} theme rows).',
  ep_export_cards_success: 'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} card rows).',
  ep_export_workshop_success:
    'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} workshop rows).',
  ep_export_workshop_enhance_success_suffix:
    'Also wrote {{enhanceRows}} workshop enhancement levels to the preview tab.',
  ep_export_bots_success: 'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} bot stat rows).',
  ep_export_labs_success: 'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} lab rows).',
  ep_export_uws_success:
    'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} ultimate weapon level rows).',
  ep_export_guardians_success:
    'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} guardian chip level rows).',
  ep_export_modules_success:
    'Wrote {{cells}} cells to preview tab “{{sheet}}” ({{rows}} equipped module columns, {{effects}} effects).',
  ep_export_bots_lab_success_suffix: 'Also wrote {{labRows}} BOTS laboratory levels to the preview tab.',
  ep_export_cards_presets_success_suffix:
    'Also wrote {{presetRows}} preset slots to preview tab “{{presetSheet}}”.',
  ep_export_relics_unmapped_hint: '{{count}} sheet relic names were not mapped and were left unchanged.',
  ep_export_relics_unmapped_sample: 'Examples: {{names}}',
  ep_export_themes_unmapped_hint: '{{count}} sheet theme names were not mapped and were left unchanged.',
  ep_export_cards_unmapped_hint: '{{count}} sheet card names were not mapped and were left unchanged.',
  ep_export_workshop_unmapped_hint:
    '{{count}} sheet workshop names were not mapped and were left unchanged.',
  ep_export_themes_unmapped_sample: 'Examples: {{names}}',
  ep_export_cards_unmapped_sample: 'Examples: {{names}}',
  ep_export_workshop_unmapped_sample: 'Examples: {{names}}',
  ep_export_bots_unmapped_hint:
    '{{count}} sheet bot names were not mapped and were left unchanged.',
  ep_export_bots_unmapped_sample: 'Examples: {{names}}',
  ep_export_labs_unmapped_hint:
    '{{count}} sheet lab names were not mapped and were left unchanged.',
  ep_export_labs_unmapped_sample: 'Examples: {{names}}',
  ep_export_invalid_spreadsheet: 'Enter a valid Google Spreadsheet ID or docs.google.com URL.',
  ep_export_oauth_not_configured:
    'Google Sheets sync is not configured on this site (OAuth client ID and Picker API key required).',
  ep_export_cancelled: 'Google sign-in was cancelled.',
  ep_export_picker_cancelled: 'Google file picker was closed before any spreadsheets were selected.',
  ep_export_picker_failed:
    'Could not open the Google file picker. Use Chrome or Firefox, allow popups for this site, then try again.',
  ep_export_picker_wrong_ids_master:
    'The spreadsheet you selected does not match your saved IDS Master URL. Select that exact spreadsheet in the picker, or update the URL in Settings.',
  ep_picker_ids_master_title: 'Select your IDS Master spreadsheet',
  ep_picker_all_workbooks_title: 'Select your IDS Master and linked workbooks',
  ep_picker_linked_workbooks_title: 'Select linked Effective Paths workbooks',
  ep_export_oauth_timeout:
    'Google sign-in timed out. Allow popups for this site, complete the consent screen, then try again. Embedded IDE browsers (including Cursor) cannot finish Google sign-in — use Chrome or Firefox instead.',
  ep_export_error_network: 'Could not reach the export service. Try npm run dev:netlify locally.',
  ep_export_error_invalid_spreadsheet: 'Invalid spreadsheet ID.',
  ep_export_error_sheets_auth_failed:
    'Google sign-in failed or spreadsheet access was not granted. Sign in again and select your spreadsheets in the Google file picker.',
  ep_export_error_sheet_not_found: 'Spreadsheet or tab not found. Check the ID, URL, and gid.',
  ep_export_error_ids_master_not_found: 'Could not read the IDS Master table tab.',
  ep_export_error_ids_master_empty: 'IDS Master has no linked workbook rows.',
  ep_export_error_relic_workbook_not_found:
    'IDS Master has no Relics workbook row. Check the linked-ID table.',
  ep_export_error_relic_workbook_access_denied:
    'Cannot edit the IDS-linked Relics workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Relics Sheet” link on the IDS tab.',
  ep_export_error_relic_tab_not_found: 'Could not find the Relics tab in the Relics workbook.',
  ep_export_error_themes_workbook_not_found:
    'IDS Master has no Themes & Songs workbook row. Check the linked-ID table.',
  ep_export_error_themes_workbook_access_denied:
    'Cannot edit the IDS-linked Themes & Songs workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Themes & Songs Sheet” link on the IDS tab.',
  ep_export_error_themes_tab_not_found:
    'Could not find the Themes & Songs input tab in the Themes & Songs workbook.',
  ep_export_error_no_theme_rows:
    'No theme rows were found on the Themes & Songs input tab. Check the sheet layout or tab name.',
  ep_export_error_cards_workbook_not_found:
    'IDS Master has no Cards workbook row. Check the linked-ID table.',
  ep_export_error_cards_workbook_access_denied:
    'Cannot edit the IDS-linked Cards workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Cards Sheet” link on the IDS tab.',
  ep_export_error_cards_tab_not_found:
    'Could not find the Cards input tab in the Cards workbook.',
  ep_export_error_no_card_rows:
    'No card rows were found on the Cards Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_no_card_preset_rows:
    'No card preset slots were found on the Card Preset tab. Check the sheet layout or tab name.',
  ep_export_error_workshop_workbook_not_found:
    'IDS Master has no Workshop workbook row. Check the linked-ID table.',
  ep_export_error_workshop_workbook_access_denied:
    'Cannot edit the IDS-linked Workshop workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Workshop Sheet” link on the IDS tab.',
  ep_export_error_workshop_tab_not_found:
    'Could not find the Workshop input tab in the Workshop workbook.',
  ep_export_error_no_workshop_rows:
    'No workshop rows were found on the Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_bots_workbook_not_found:
    'IDS Master has no Bots workbook row. Check the linked-ID table.',
  ep_export_error_bots_workbook_access_denied:
    'Cannot edit the IDS-linked Bots workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Bots Sheet” link on the IDS tab.',
  ep_export_error_bots_tab_not_found:
    'Could not find the Bots input tab in the Bots workbook.',
  ep_export_error_no_bot_rows:
    'No bot rows were found on the Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_laboratory_workbook_not_found:
    'IDS Master has no Laboratory workbook row. Check the linked-ID table.',
  ep_export_error_laboratory_workbook_access_denied:
    'Cannot edit the IDS-linked Laboratory workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the “Go to my Laboratory Sheet” link on the IDS tab.',
  ep_export_error_laboratory_tab_not_found:
    'Could not find the Master Sheet tab in the Laboratory workbook.',
  ep_export_error_no_lab_rows:
    'No lab rows were found on the Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_uws_workbook_not_found:
    'IDS Master has no Ultimate Weapons workbook row. Check the linked-ID table.',
  ep_export_error_uws_workbook_access_denied:
    'Cannot edit the IDS-linked UWs workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the link on the IDS tab.',
  ep_export_error_uws_tab_not_found:
    'Could not find the Master Sheet tab in the UWs workbook.',
  ep_export_error_no_uws_rows:
    'No ultimate weapon rows were found on the Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_guardians_workbook_not_found:
    'IDS Master has no Guardians workbook row. Check the linked-ID table.',
  ep_export_error_guardians_workbook_access_denied:
    'Cannot edit the IDS-linked Guardians workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the link on the IDS tab.',
  ep_export_error_guardians_tab_not_found:
    'Could not find the Master Sheet tab in the Guardians workbook.',
  ep_export_error_no_guardians_rows:
    'No guardian chip rows were found on the Master Sheet tab. Check the sheet layout or tab name.',
  ep_export_error_modules_workbook_not_found:
    'IDS Master has no Modules workbook row. Check the linked-ID table.',
  ep_export_error_modules_workbook_access_denied:
    'Cannot edit the IDS-linked Modules workbook ({{id}}). Open it in Google Sheets and confirm you have Editor access, or fix the link on the IDS tab.',
  ep_export_error_modules_tab_not_found:
    'Could not find the Inventory tab in the Modules workbook.',
  ep_export_error_no_modules_rows:
    'No equipped chassis modules to sync. On Workshop → Modules, pick a main or assist module for each slot, or import a player save with module data.',
  ep_export_error_no_relic_rows:
    'No relic rows found on the Relics workbook tab. Open the Relics sheet in Google Sheets and confirm the Relics tab has relic names and an Unlocked column.',
  ep_export_error_sheets_api_error: 'Google Sheets returned an error. Try again in a moment.',
  ep_export_error_sheets_quota:
    'Google Sheets read quota was exceeded. Wait about a minute, then import one category at a time or try Import all again.',
  ep_export_error_unknown: 'Export failed. Try again.',
  sr_compare_launcher: 'Compare builds…',
  sr_compare_title: 'Compare two lab snapshots',
  sr_compare_intro:
    'Paste a tower CSV (first line tower_csv_v1; lab, ws, card, module, relic, theme, guardian, and build rows), a short URL with ?build=…, a long URL with ?tower=…, a raw share payload (u… / z…), or JSON { "v":4, "o", "w", "t", "n" }. Imports restore lab, workshop, cards, module loadout presets, relics, guardian chips, and owned themes. Each compare side uses its own Labs Coin Discount level.',
  sr_compare_build_a: 'Build A',
  sr_compare_build_b: 'Build B',
  sr_compare_label_yours: 'Your build',
  sr_compare_highlights_title: 'Key differences',
  sr_compare_displayed_damage_a: 'Displayed damage (A)',
  sr_compare_displayed_damage_b: 'Displayed damage (B)',
  sr_compare_displayed_damage_delta: 'Damage change (B − A)',
  sr_compare_ws_spent_a: 'Workshop coins spent (A)',
  sr_compare_ws_spent_b: 'Workshop coins spent (B)',
  sr_compare_ws_coin_delta: 'Workshop coin delta (B − A)',
  sr_compare_top_lab_diffs: 'Largest lab level gaps',
  sr_compare_relic_diff_title: 'Relics',
  sr_compare_theme_diff_title: 'Themes',
  sr_compare_relics_only_side_one: '{{side}} has 1 relic the other lacks.',
  sr_compare_relics_only_side_many: '{{side}} has {{count}} relics the other lacks.',
  sr_compare_themes_only_side_one: '{{side}} has 1 theme the other lacks.',
  sr_compare_themes_only_side_many: '{{side}} has {{count}} themes the other lacks.',
  sr_compare_placeholder: 'Tower CSV, URL, share payload, or JSON…',
  sr_compare_use_current: 'Insert current tower CSV',
  sr_compare_ws_title: 'Workshop snapshot',
  sr_compare_ws_identical: 'No workshop field differences (or both sides used defaults).',
  sr_compare_ws_diff_one: '1 workshop field differs.',
  sr_compare_ws_diff_many: '{{count}} workshop fields differ.',
  sr_compare_ws_col_field: 'Field',
  sr_ws_field_hide_maxed: 'Hide maxed',
  sr_ws_field_main_tab: 'Main tab',
  sr_ws_field_category: 'Category',
  sr_ws_field_multiplier: 'Buy multiplier',
  sr_compare_run: 'Compare',
  sr_compare_busy: 'Comparing…',
  sr_compare_clear: 'Clear',
  sr_compare_spent_a: 'Spent coins (A)',
  sr_compare_spent_b: 'Spent coins (B)',
  sr_compare_coin_delta: 'Coin delta (B − A)',
  sr_compare_footnote:
    'Card Mastery rows are ignored in coin totals (same as the budget panel). Missing toolkit data counts as 0 per upgrade step.',
  sr_compare_table_section: 'Section',
  sr_compare_table_lab: 'Lab',
  sr_compare_table_lv_a: 'Lv. A',
  sr_compare_table_lv_b: 'Lv. B',
  sr_compare_table_delta: 'ΔLv.',
  sr_compare_parse_empty: 'That side is empty.',
  sr_compare_parse_invalid_csv:
    'Invalid CSV: first line must be tower_csv_v1, then type,key,value rows.',
  sr_compare_parse_invalid_payload:
    'Could not parse as CSV or share text.',
  sr_compare_parse_share_fail:
    'Could not load that share link (?build=… or ?tower= / u… / z…).',
  sr_compare_diff_count_none:
    'No level differences — effective levels match for every lab.',
  sr_compare_diff_count_one: '1 lab has a different level.',
  sr_compare_diff_count_many: '{{count}} labs have different levels.',
  sr_copy_short_link: 'Copy share link',
  sr_share_publishing: 'Publishing…',
  sr_qr_share: 'Show QR for share link',
  sr_close: 'Close',

  sr_sections_aria: 'Research lab sections',
  sr_collapse_all: 'Collapse all',
  sr_bulk_collapse_aria:
    'When checked, every research section is collapsed. When cleared, every section is expanded.',

  sr_qr_dialog_title: 'Scan to load lab levels',
  sr_qr_image_alt: 'QR code that opens the lab share link in a browser',
  sr_qr_hint:
    'Encodes the short ?build=… gallery link for this tower. Anyone who scans it can open the build.',
  sr_qr_copy_link: 'Copy link',

  sr_reset_confirm_title: 'Reset all lab levels?',
  sr_reset_confirm_body:
    'Restores default research levels for all lab cards in this browser. Export or copy a share link first if you want to keep these levels.',
  sr_cancel: 'Cancel',
  sr_reset_all: 'Reset all',

  sr_reset_cards: 'Reset Cards',
  sr_reset_cards_aria: 'Reset card stars, loadouts, and equip slots',
  sr_reset_cards_confirm_title: 'Reset cards only?',
  sr_reset_cards_confirm_body: 'Clears card stars, all preset loadouts, and equip slots.',

  sr_reset_relics: 'Reset Relics',
  sr_reset_relics_aria: 'Reset relic ownership and displayed-damage relic bonus',
  sr_reset_relics_confirm_title: 'Reset relics only?',
  sr_reset_relics_confirm_body:
    'Clears owned relics and the displayed-damage relic bonus.',
  sr_reset_modules: 'Reset Modules',
  sr_reset_modules_aria: 'Reset assist module levels, chassis modules, and sub-module effect picks',
  sr_reset_modules_confirm_title: 'Reset modules only?',
  sr_reset_modules_confirm_body:
    'Clears module levels, equipped chassis modules, and sub-module effect picks.',

  sr_footer_nav_aria: 'App version, changelog, community, legal, and sponsorship',
  sr_footer_discord: 'Discord',
  sr_footer_discord_title: 'TowerSmith community on Discord (opens in a new tab)',
  sr_footer_privacy: 'Privacy Policy',
  sr_footer_terms: 'Terms of Service',
  sr_version_aria: 'Version {{version}}',
  sr_changelog: 'Changelog',
  sr_changelog_title: 'Release notes on GitHub (opens in a new tab)',
  sr_sponsor: 'Buy Me A Coffee ☕',
  sr_sponsor_title: 'Support AngryBrit on Buy Me a Coffee (opens in a new tab)',
  sr_locale_aria: 'Language',
  sr_locale_option_en: 'English',
  sr_locale_option_es: 'Spanish',
  sr_locale_option_de: 'German',

  sr_notice_share_cleared: 'Share link opened: lab levels cleared to defaults.',
  sr_notice_share_one: 'Share link opened: loaded 1 custom lab level.',
  sr_notice_share_many:
    'Share link opened: loaded {{count}} custom lab levels.',
  sr_notice_share_ws_suffix: 'Workshop snapshot from the link was applied.',
  sr_notice_share_build_suffix: 'Shared build: “{{name}}”.',
  sr_notice_reset_all: 'Lab levels reset to defaults in this browser.',
  sr_notice_copy_build_ok:
    'Share link copied — open the URL to load lab, workshop, cards, modules, relics, and themes.',
  sr_notice_copy_build_fail:
    'Could not copy link (clipboard blocked or unavailable).',
  sr_notice_copy_gallery_ok:
    'Short share link copied (?build=… — opens this tower for anyone).',
  sr_notice_copy_gallery_fail:
    'Could not publish a short link; copied a long embedded link instead.',
  sr_notice_copy_gallery_fallback:
    'Gallery unavailable here; copied a long embedded link instead.',
  sr_notice_copy_short_ok:
    'Short share link copied (includes workshop when it is not the default snapshot).',
  sr_notice_copy_short_fail:
    'Could not copy link (clipboard blocked or unavailable).',
  sr_notice_qr_fail: 'Could not create QR code.',
  sr_notice_import_cleared: 'Imported file: all custom levels cleared.',
  sr_notice_import_one: 'Imported 1 lab level.',
  sr_notice_import_many: 'Imported {{count}} lab levels.',
  sr_notice_import_read_fail:
    'Could not read file. Use a valid CSV export from this app.',
  sr_notice_import_invalid_tower_csv:
    'Invalid tower CSV: first line must be tower_csv_v1, then type,key,value rows (build / lab / ws / card / module / theme).',
  sr_notice_import_tower_ok: 'Imported lab levels and workshop from tower CSV.',
  sr_notice_import_tower_named:
    'Imported tower CSV for build “{{name}}” (loaded into scratch workspace).',
  sr_notice_import_tower_many:
    'Imported {{count}} builds from tower CSV (first build is now active).',
  sr_notice_import_player_ok:
    'Imported lab, workshop, relics, themes, modules, bots, and ultimates from playerInfo.dat.',
  sr_notice_account_sync_loaded:
    'Loaded your tower data from your account.',
  sr_notice_account_sync_failed:
    'Could not sync tower data with your account. Your data is saved on this device only.',
  sr_notice_account_sync_auth_failed:
    'Account sync failed — your sign-in may have expired. Sign out and sign in again.',
  sr_notice_account_sync_project_mismatch:
    'Account sync is misconfigured (Supabase project mismatch). Gallery sign-in and server env must use the same project.',
  sr_notice_account_sync_storage_failed:
    'Could not reach cloud storage for your account. Ensure the tower-payloads bucket exists in Supabase (see supabase/schema.sql).',
  sr_notice_account_sync_too_large:
    'Your tower data is too large for cloud backup. Try exporting a Tower CSV as a fallback.',
  sr_notice_account_sync_load_failed:
    'Could not read your saved tower data from the cloud. Try importing your save again on desktop.',
  sr_notice_account_sync_network_failed:
    'Network error while syncing with your account. Check your connection and try again.',
  sr_notice_account_sync_save_failed:
    'Imported on this device, but could not save to your account. Check your connection and try importing again.',
  sr_notice_import_player_invalid:
    'Could not read playerInfo.dat — expected a gzip-compressed BinaryFormatter save from The Tower.',
  sr_notice_import_player_dat_only: 'Choose a .dat save file (e.g. playerInfo.dat).',
  sr_notice_import_player_too_large:
    'That file is too large for a playerInfo.dat save (max 200 KB). Pick your tower backup file, not another .dat.',
  sr_notice_import_player_gzip_unsupported:
    'This browser cannot decompress gzip saves. Try Chrome, Edge, or Firefox.',
  sr_preset_import_default_name: 'Imported build',
  sr_preset_prompt_title: 'Name this build — lab + workshop (saved in this browser only)',
  sr_preset_name_label: 'Build name',
  sr_preset_dialog_save: 'Save build',
  sr_notice_preset_empty_name: 'Preset name was empty; nothing saved.',
  sr_notice_preset_saved: 'Saved preset "{{name}}".',
  sr_notice_delete_confirm_prefix: 'Delete saved build',
  sr_notice_delete_confirm_suffix: '? This cannot be undone.',
  sr_notice_preset_deleted: 'Preset deleted; restored scratch workspace.',
  sr_notice_qr_link_copied: 'Link copied from QR dialog.',
  sr_notice_copy_fail_short: 'Could not copy link.',

  sr_load_manifest: 'Could not load research manifest ({{status}})',
  sr_load_section: 'Could not load {{path}} ({{status}})',

  research_empty_filter: 'No research matches filters.',

  researchCard_decrease_aria: 'Decrease level (hold to zero)',
  researchCard_decrease_hold_title: 'Hold to set level to 0',
  researchCard_increase_aria: 'Increase level (hold to max)',
  researchCard_increase_hold_title: 'Hold to set max level',
  researchCard_level_aria: '{{name}} level',
  researchCard_level_title: 'Level 0–{{max}}',
  researchCard_researching: 'Researching…',
  researchCard_max: 'Max',
  researchCard_cost_unknown_title:
    'Not on this CSV row. Set Level in the Lab Calculator sheet to match, export CSV, and run import so cost reflects that level.',
  researchCard_cost_stones_title: 'Stones (wiki unlock cost)',
  researchCard_cost_coins_title: 'Coins (next upgrade)',
} as const

export type StringId = keyof typeof STRINGS_EN


function replaceParams(
  template: string,
  params: Record<string, string | number>,
): string {
  let out = template
  for (const [k, v] of Object.entries(params)) {
    out = out.split(`{{${k}}}`).join(String(v))
  }
  return out
}

export type I18nFormatters = {
  shareOpenedLevels: (
    count: number,
    workshopFromLink?: boolean,
    buildName?: string,
  ) => string
  importedLevels: (count: number) => string
  deleteBuildConfirm: (nameOrId: string) => string
  savedPreset: (name: string) => string
  levelRangeTitle: (max: number) => string
  levelAriaLabel: (itemName: string) => string
  manifestLoadError: (status: number) => string
  sectionLoadError: (rel: string, status: number) => string
  simulatorBudgetAria: (spent: string, toMax: string, next: string) => string
  workshopBudgetAria: (spent: string, toMax: string, next: string) => string
  workshopStoneBudgetAria: (spent: string, toMax: string, next: string) => string
  botsBudgetAria: (spent: string, toMax: string, next: string) => string
  versionAria: (version: string) => string
  compareDifferingLabsCount: (count: number) => string
  compareDifferingWorkshopFields: (count: number) => string
  compareRelicsOnlySide: (side: string, count: number) => string
  compareThemesOnlySide: (side: string, count: number) => string
  importedTowerBuildNamed: (name: string) => string
  importedTowerBuilds: (count: number) => string
  galleryNoticeLoaded: (title: string) => string
  galleryShareLoadError: (error: TowerGalleryApiError | 'invalid_payload') => string
  galleryNoticeSubmitted: (title: string) => string
  galleryByAuthor: (author: string) => string
  galleryFilterAuthorAria: (author: string) => string
  galleryFilterGuildAria: (guild: string) => string
  galleryAdminDeleteConfirmBody: (title: string) => string
  galleryAdminNoticeDeleted: (title: string) => string
  galleryAdminYourUserId: (userId: string) => string
  galleryShowingCount: (count: number) => string
  panelErrorDesc: (panel: string) => string
}

function formatters(s: Record<StringId, string>): I18nFormatters {
  return {
    shareOpenedLevels(count, workshopFromLink = false, buildName?: string) {
      const base =
        count === 0
          ? s.sr_notice_share_cleared
          : count === 1
            ? s.sr_notice_share_one
            : replaceParams(s.sr_notice_share_many, { count })
      const trimmedName = buildName?.trim()
      const buildSuffix =
        trimmedName != null && trimmedName.length > 0
          ? ` ${replaceParams(s.sr_notice_share_build_suffix, { name: trimmedName })}`
          : ''
      const workshopSuffix = workshopFromLink ? ` ${s.sr_notice_share_ws_suffix}` : ''
      return `${base}${workshopSuffix}${buildSuffix}`
    },
    importedLevels(count) {
      if (count === 0) return s.sr_notice_import_cleared
      if (count === 1) return s.sr_notice_import_one
      return replaceParams(s.sr_notice_import_many, { count })
    },
    deleteBuildConfirm(nameOrId) {
      return `${s.sr_notice_delete_confirm_prefix} "${nameOrId}"${s.sr_notice_delete_confirm_suffix}`
    },
    savedPreset(name) {
      return replaceParams(s.sr_notice_preset_saved, { name })
    },
    levelRangeTitle(max) {
      return replaceParams(s.researchCard_level_title, { max })
    },
    levelAriaLabel(itemName) {
      return replaceParams(s.researchCard_level_aria, { name: itemName })
    },
    manifestLoadError(status) {
      return replaceParams(s.sr_load_manifest, { status })
    },
    sectionLoadError(rel, status) {
      return replaceParams(s.sr_load_section, { path: rel, status })
    },
    simulatorBudgetAria(spent, toMax, next) {
      return replaceParams(s.sr_budget_aria, { spent, toMax, next })
    },
    workshopBudgetAria(spent, toMax, next) {
      return replaceParams(s.ws_budget_aria, { spent, toMax, next })
    },
    workshopStoneBudgetAria(spent, toMax, next) {
      return replaceParams(s.ws_budget_stones_aria, { spent, toMax, next })
    },
    botsBudgetAria(spent, toMax, next) {
      return replaceParams(s.ws_bot_budget_aria, { spent, toMax, next })
    },
    versionAria(version) {
      return replaceParams(s.sr_version_aria, { version })
    },
    compareDifferingLabsCount(count) {
      if (count === 0) return s.sr_compare_diff_count_none
      if (count === 1) return s.sr_compare_diff_count_one
      return replaceParams(s.sr_compare_diff_count_many, { count })
    },
    compareDifferingWorkshopFields(count) {
      if (count === 1) return s.sr_compare_ws_diff_one
      return replaceParams(s.sr_compare_ws_diff_many, { count })
    },
    compareRelicsOnlySide(side, count) {
      if (count === 1) return replaceParams(s.sr_compare_relics_only_side_one, { side })
      return replaceParams(s.sr_compare_relics_only_side_many, { side, count })
    },
    compareThemesOnlySide(side, count) {
      if (count === 1) return replaceParams(s.sr_compare_themes_only_side_one, { side })
      return replaceParams(s.sr_compare_themes_only_side_many, { side, count })
    },
    importedTowerBuildNamed(name) {
      return replaceParams(s.sr_notice_import_tower_named, { name })
    },
    importedTowerBuilds(count) {
      return replaceParams(s.sr_notice_import_tower_many, { count })
    },
    galleryNoticeLoaded(title) {
      return replaceParams(s.gallery_notice_loaded, { title })
    },
    galleryShareLoadError(error) {
      switch (error) {
        case 'not_found':
          return s.gallery_error_not_found
        case 'network':
          return s.gallery_error_network
        case 'gallery_unavailable':
          return s.gallery_error_unavailable
        case 'invalid_payload':
          return s.gallery_error_apply
        default:
          return s.sr_compare_parse_share_fail
      }
    },
    galleryNoticeSubmitted(title) {
      return replaceParams(s.gallery_notice_submitted, { title })
    },
    galleryByAuthor(author) {
      return replaceParams(s.gallery_by_author, { author })
    },
    galleryFilterAuthorAria(author) {
      return replaceParams(s.gallery_filter_author_aria, { author })
    },
    galleryFilterGuildAria(guild) {
      return replaceParams(s.gallery_filter_guild_aria, { guild })
    },
    galleryAdminDeleteConfirmBody(title) {
      return replaceParams(s.gallery_admin_delete_confirm_body, { title })
    },
    galleryAdminNoticeDeleted(title) {
      return replaceParams(s.gallery_admin_notice_deleted, { title })
    },
    galleryAdminYourUserId(userId) {
      return replaceParams(s.gallery_admin_your_user_id, { userId })
    },
    galleryShowingCount(count) {
      return replaceParams(s.gallery_showing_count, { count })
    },
    panelErrorDesc(panel) {
      return replaceParams(s.panel_error_desc, { panel })
    },
  }
}

export const FORMAT_EN: I18nFormatters = formatters(
  STRINGS_EN as unknown as Record<StringId, string>,
)

export const FORMAT_ES: I18nFormatters = formatters(STRINGS_ES)

export const FORMAT_DE: I18nFormatters = formatters(STRINGS_DE)
