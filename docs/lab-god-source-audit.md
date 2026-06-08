# tables/labs GOD source audit

Generated: 2026-06-08T14:38:44.725Z
Total JSON files: 217

## Summary by primary category

- **screenshot-transcribed**: 152
- **alias-copy**: 24
- **shared-cost-ladder**: 17
- **no-generator**: 16
- **has-generator-unclassified**: 7
- **bc-group3-shared-rows**: 1

## Category definitions

| Category | Meaning |
|----------|---------|
| screenshot-transcribed | Per-level rows hardcoded from that lab's calculator screenshot |
| shared-cost-ladder | Marginal time/gems/coins from another lab's screenshot ladder (per gen script comment) |
| formula-value-column | Benefit/value uses linear formula; cost/time may be screenshot or shared |
| alias-copy | JSON duplicated by ensure-all-lab-god-json.mjs (only `name` changed) |
| interpolated | Gen script documents interpolated cells |
| wiki-sourced | Gen script uses wiki data for some columns |
| bc-group3-shared-rows | BC Group 3 enemy ultimates share one row set |
| has-generator-unclassified | Has gen script but unclear header |
| no-generator | No matching gen script |

## Interpolated (documented in generator)

- (none)

## Wiki-sourced (documented in generator)

- (none)

## Alias-copied (ensure-all-lab-god-json.mjs)

- `battle-condition/death-defy-down.json` — Death Defy Down ← **Ultimate Weapon Durations**
- `battle-condition/death-ray-resistance.json` — Death Ray Resistance ← **Knockback Resistance**
- `battle-condition/enemy-attack-speed.json` — Enemy Attack Speed ← **Armored Enemies**
- `battle-condition/enemy-level-skip-reduction.json` — Enemy Level Skip Reduction ← **Ultimate Weapon Durations**
- `battle-condition/enemy-speed.json` — Enemy Speed ← **Armored Enemies**
- `battle-condition/energy-shields-down.json` — Energy Shields Down ← **Ultimate Weapon Durations**
- `battle-condition/more-enemies.json` — More Enemies ← **Armored Enemies**
- `battle-condition/orb-resistance.json` — Orb Resistance ← **Knockback Resistance**
- `battle-condition/plasma-cannon-resistance.json` — Plasma Cannon Resistance ← **Knockback Resistance**
- `battle-condition/thorns-resistance.json` — Thorns Resistance ← **Knockback Resistance**
- `enemies/ray-enemy-health.json` — Ray Enemy Health ← **Ray Enemy Attack**
- `enemies/scatter-enemy-attack.json` — Scatter Enemy Attack ← **Ray Enemy Attack**
- `enemies/scatter-enemy-health.json` — Scatter Enemy Health ← **Ray Enemy Attack**
- `enemies/vampire-enemy-attack.json` — Vampire Enemy Attack ← **Ray Enemy Attack**
- `enemies/vampire-enemy-health.json` — Vampire Enemy Health ← **Ray Enemy Attack**
- `main/enhancement-defense-coin-discount.json` — Enhancement Defense - Coin Discount ← **Enhancement Attack - Coin Discount**
- `main/enhancement-utility-coin-discount.json` — Enhancement Utility - Coin Discount ← **Enhancement Attack - Coin Discount**
- `modules/assist-module-bonus-armor.json` — Assist Module Bonus - Armor ← **Assist Module Substats - Cannon**
- `modules/assist-module-bonus-cannon.json` — Assist Module Bonus - Cannon ← **Assist Module Substats - Cannon**
- `modules/assist-module-bonus-core.json` — Assist Module Bonus - Core ← **Assist Module Substats - Cannon**
- `modules/assist-module-bonus-generator.json` — Assist Module Bonus - Generator ← **Assist Module Substats - Cannon**
- `modules/assist-module-substats-armor.json` — Assist Module Substats - Armor ← **Assist Module Substats - Cannon**
- `modules/assist-module-substats-core.json` — Assist Module Substats - Core ← **Assist Module Substats - Cannon**
- `modules/assist-module-substats-generator.json` — Assist Module Substats - Generator ← **Assist Module Substats - Cannon**

## Shared-cost-ladder (documented in generator)

- `attack/attack-speed.json` — Attack Speed (`gen-attack-speed-lab-table.mjs`)
- `attack/critical-factor.json` — Critical Factor (`gen-critical-factor-lab-table.mjs`)
- `attack/damage-per-meter.json` — Damage / Meter (`gen-damage-per-meter-lab-table.mjs`)
- `attack/range.json` — Range (`gen-range-lab-table.mjs`)
- `defense/defense-absolute.json` — Defense Absolute (`gen-defense-absolute-lab-table.mjs`)
- `defense/health-regen.json` — Health Regen (`gen-health-regen-lab-table.mjs`)
- `defense/health.json` — Health (`gen-health-lab-table.mjs`)
- `ultimate-weapon/chrono-field-range.json` — Chrono Field Range (`gen-chrono-field-range-lab-table.mjs`)
- `ultimate-weapon/chrono-field-reduction-percent.json` — Chrono Field Reduction % (`gen-chrono-field-reduction-percent-lab-table.mjs`)
- `ultimate-weapon/death-wave-coin-bonus.json` — Death Wave Coin Bonus (`gen-death-wave-coin-bonus-lab-table.mjs`)
- `ultimate-weapon/golden-tower-duration.json` — Golden Tower Duration (`gen-golden-tower-duration-lab-table.mjs`)
- `ultimate-weapon/inner-mine-blast-radius.json` — Inner Mine Blast Radius (`gen-inner-mine-blast-radius-lab-table.mjs`)
- `ultimate-weapon/inner-mine-rotation-speed.json` — Inner Mine Rotation Speed (`gen-inner-mine-rotation-speed-lab-table.mjs`)
- `ultimate-weapon/shock-multiplier.json` — Shock Multiplier (`gen-shock-multiplier-lab-table.mjs`)
- `ultimate-weapon/swamp-radius.json` — Swamp Radius (`gen-swamp-radius-lab-table.mjs`)
- `ultimate-weapon/swamp-stun-chance.json` — Swamp Stun Chance (`gen-swamp-stun-chance-lab-table.mjs`)
- `ultimate-weapon/swamp-stun-time.json` — Swamp Stun Time (`gen-swamp-stun-time-lab-table.mjs`)

## Identical cost/time ladders (duplicate fingerprint)

### Group of 31
- `card-mastery/area-of-effect-mastery.json` — Area of Effect Mastery
- `card-mastery/attack-speed-mastery.json` — Attack Speed Mastery
- `card-mastery/berserker-mastery.json` — Berserker Mastery
- `card-mastery/cash-mastery.json` — Cash Mastery
- `card-mastery/coins-mastery.json` — Coins Mastery
- `card-mastery/critical-chance-mastery.json` — Critical Chance Mastery
- `card-mastery/critical-coin-mastery.json` — Critical Coin Mastery
- `card-mastery/damage-mastery.json` — Damage Mastery
- `card-mastery/death-ray-mastery.json` — Death Ray Mastery
- `card-mastery/demon-mode-mastery.json` — Demon Mode Mastery
- `card-mastery/enemy-balance-mastery.json` — Enemy Balance Mastery
- `card-mastery/energy-net-mastery.json` — Energy Net Mastery
- `card-mastery/energy-shield-mastery.json` — Energy Shield Mastery
- `card-mastery/extra-defense-mastery.json` — Extra Defense Mastery
- `card-mastery/extra-orb-mastery.json` — Extra Orb Mastery
- `card-mastery/fortress-mastery.json` — Fortress Mastery
- `card-mastery/free-upgrades-mastery.json` — Free Upgrades Mastery
- `card-mastery/health-mastery.json` — Health Mastery
- `card-mastery/health-regen-mastery.json` — Health Regen Mastery
- `card-mastery/intro-sprint-mastery.json` — Intro Sprint Mastery
- `card-mastery/land-mine-stun-mastery.json` — Land Mine Stun Mastery
- `card-mastery/nuke-mastery.json` — Nuke Mastery
- `card-mastery/plasma-cannon-mastery.json` — Plasma Cannon Mastery
- `card-mastery/range-mastery.json` — Range Mastery
- `card-mastery/recovery-package-chance-mastery.json` — Recovery Package Chance Mastery
- `card-mastery/second-wind-mastery.json` — Second Wind Mastery
- `card-mastery/slow-aura-mastery.json` — Slow Aura Mastery
- `card-mastery/super-tower-mastery.json` — Super Tower Mastery
- `card-mastery/ultimate-crit-mastery.json` — Ultimate Crit Mastery
- `card-mastery/wave-accelerator-mastery.json` — Wave Accelerator Mastery
- `card-mastery/wave-skip-mastery.json` — Wave Skip Mastery

### Group of 14
- `enemies/ray-enemy-attack.json` — Ray Enemy Attack
- `enemies/ray-enemy-health.json` — Ray Enemy Health (alias from Ray Enemy Attack)
- `enemies/scatter-enemy-attack.json` — Scatter Enemy Attack (alias from Ray Enemy Attack)
- `enemies/scatter-enemy-health.json` — Scatter Enemy Health (alias from Ray Enemy Attack)
- `enemies/vampire-enemy-attack.json` — Vampire Enemy Attack (alias from Ray Enemy Attack)
- `enemies/vampire-enemy-health.json` — Vampire Enemy Health (alias from Ray Enemy Attack)
- `modules/assist-module-bonus-armor.json` — Assist Module Bonus - Armor (alias from Assist Module Substats - Cannon)
- `modules/assist-module-bonus-cannon.json` — Assist Module Bonus - Cannon (alias from Assist Module Substats - Cannon)
- `modules/assist-module-bonus-core.json` — Assist Module Bonus - Core (alias from Assist Module Substats - Cannon)
- `modules/assist-module-bonus-generator.json` — Assist Module Bonus - Generator (alias from Assist Module Substats - Cannon)
- `modules/assist-module-substats-armor.json` — Assist Module Substats - Armor (alias from Assist Module Substats - Cannon)
- `modules/assist-module-substats-cannon.json` — Assist Module Substats - Cannon
- `modules/assist-module-substats-core.json` — Assist Module Substats - Core (alias from Assist Module Substats - Cannon)
- `modules/assist-module-substats-generator.json` — Assist Module Substats - Generator (alias from Assist Module Substats - Cannon)

### Group of 6
- `attack/attack-speed.json` — Attack Speed
- `attack/critical-factor.json` — Critical Factor
- `main/starting-cash.json` — Starting Cash
- `main/workshop-attack-discount.json` — Workshop Attack Discount
- `main/workshop-defense-discount.json` — Workshop Defense Discount
- `main/workshop-utility-discount.json` — Workshop Utility Discount

### Group of 6
- `battle-condition/basic-ultimate.json` — Basic's Ultimate
- `battle-condition/boss-ultimate.json` — Boss's Ultimate
- `battle-condition/fast-ultimate.json` — Fast's Ultimate
- `battle-condition/protector-ultimate.json` — Protector's Ultimate
- `battle-condition/ranged-ultimate.json` — Ranged Ultimate
- `battle-condition/tank-ultimate.json` — Tank's Ultimate

### Group of 6
- `enemies/fast-enemy-attack.json` — Fast Enemy Attack
- `enemies/fast-enemy-health.json` — Fast Enemy Health
- `enemies/ranged-enemy-attack.json` — Ranged Enemy Attack
- `enemies/ranged-enemy-health.json` — Ranged Enemy Health
- `enemies/tank-enemy-attack.json` — Tank Enemy Attack
- `enemies/tank-enemy-health.json` — Tank Enemy Health

### Group of 5
- `battle-condition/death-ray-resistance.json` — Death Ray Resistance (alias from Knockback Resistance)
- `battle-condition/knockback-resistance.json` — Knockback Resistance
- `battle-condition/orb-resistance.json` — Orb Resistance (alias from Knockback Resistance)
- `battle-condition/plasma-cannon-resistance.json` — Plasma Cannon Resistance (alias from Knockback Resistance)
- `battle-condition/thorns-resistance.json` — Thorns Resistance (alias from Knockback Resistance)

### Group of 5
- `ultimate-weapon/chrono-field-duration.json` — Chrono Field Duration
- `ultimate-weapon/chrono-field-reduction-percent.json` — Chrono Field Reduction %
- `ultimate-weapon/swamp-radius.json` — Swamp Radius
- `ultimate-weapon/swamp-stun-chance.json` — Swamp Stun Chance
- `ultimate-weapon/swamp-stun-time.json` — Swamp Stun Time

### Group of 4
- `attack/damage.json` — Damage
- `defense/defense-absolute.json` — Defense Absolute
- `defense/health-regen.json` — Health Regen
- `defense/health.json` — Health

### Group of 4
- `battle-condition/armored-enemies.json` — Armored Enemies
- `battle-condition/enemy-attack-speed.json` — Enemy Attack Speed (alias from Armored Enemies)
- `battle-condition/enemy-speed.json` — Enemy Speed (alias from Armored Enemies)
- `battle-condition/more-enemies.json` — More Enemies (alias from Armored Enemies)

### Group of 4
- `battle-condition/death-defy-down.json` — Death Defy Down (alias from Ultimate Weapon Durations)
- `battle-condition/enemy-level-skip-reduction.json` — Enemy Level Skip Reduction (alias from Ultimate Weapon Durations)
- `battle-condition/energy-shields-down.json` — Energy Shields Down (alias from Ultimate Weapon Durations)
- `battle-condition/ultimate-weapon-durations.json` — Ultimate Weapon Durations

### Group of 4
- `enemies/boss-enemy-attack.json` — Boss Attack
- `enemies/boss-enemy-health.json` — Boss Health
- `enemies/protector-enemy-health.json` — Protector Health
- `enemies/protector-enemy-radius.json` — Protector Radius

### Group of 4
- `main/dissonant-echo-attack.json` — Dissonant Echo - Attack
- `main/dissonant-echo-defense.json` — Dissonant Echo - Defense
- `main/dissonant-echo-ultimate-weapons.json` — Dissonant Echo - Ultimate Weapons
- `main/dissonant-echo-utility.json` — Dissonant Echo - Utility

### Group of 4
- `utility/cash-bonus.json` — Cash Bonus
- `utility/cash-wave.json` — Cash / Wave
- `utility/coins-kill-bonus.json` — Coins / Kill Bonus
- `utility/coins-wave.json` — Coins / Wave

### Group of 3
- `ultimate-weapon/chrono-field-range.json` — Chrono Field Range
- `ultimate-weapon/inner-mine-blast-radius.json` — Inner Mine Blast Radius
- `ultimate-weapon/inner-mine-rotation-speed.json` — Inner Mine Rotation Speed

### Group of 2
- `bots/amplify-bot-cooldown.json` — Amplify Bot - Cooldown
- `bots/thunder-bot-cooldown.json` — Thunder Bot - Cooldown

### Group of 2
- `bots/bot-bot-cooldown.json` — Bot Bot - Cooldown
- `bots/golden-bot-cooldown.json` — Golden Bot - Cooldown

### Group of 2
- `bots/bot-bot-duration.json` — Bot Bot - Duration
- `bots/golden-bot-duration.json` — Golden Bot - Duration

### Group of 2
- `cards/recharge-demon-mode.json` — Recharge Demon Mode
- `cards/recharge-second-wind.json` — Recharge Second Wind

### Group of 2
- `cards/recharge-nuke.json` — Recharge Nuke
- `ultimate-weapon/recharge-missile-barrage.json` — Recharge Missile Barrage

### Group of 2
- `enemies/common-enemy-attack.json` — Common Enemy Attack
- `enemies/common-enemy-health.json` — Common Enemy Health

### Group of 2
- `main/enhancement-defense-coin-discount.json` — Enhancement Defense - Coin Discount (alias from Enhancement Attack - Coin Discount)
- `main/enhancement-utility-coin-discount.json` — Enhancement Utility - Coin Discount (alias from Enhancement Attack - Coin Discount)

### Group of 2
- `modules/armor-effect-bans.json` — Armor Effect Bans
- `modules/cannon-effect-bans.json` — Cannon Effect Bans

### Group of 2
- `ultimate-weapon/black-hole-coin-bonus.json` — Black Hole Coin Bonus
- `ultimate-weapon/spotlight-coin-bonus.json` — Spotlight Coin Bonus

### Group of 2
- `ultimate-weapon/death-wave-damage-amplifier.json` — Death Wave Damage Amplifier
- `ultimate-weapon/lightning-amplifier-scatter.json` — Lightning Amplifier - Scatter

### Group of 2
- `utility/enemy-attack-level-skip.json` — Enemy Attack Level Skip
- `utility/enemy-health-level-skip.json` — Enemy Health Level Skip

### Group of 2
- `utility/recovery-package-amount.json` — Recovery Package Amount
- `utility/recovery-package-chance.json` — Recovery Package Chance

## Full inventory

| File | Lab | Primary | Generator | Notes |
|------|-----|---------|-----------|-------|
| `attack/attack-speed.json` | Attack Speed | shared-cost-ladder | gen-attack-speed-lab-table.mjs | shared ladder |
| `attack/critical-factor.json` | Critical Factor | shared-cost-ladder | gen-critical-factor-lab-table.mjs | formula value; shared ladder |
| `attack/damage-per-meter.json` | Damage / Meter | shared-cost-ladder | gen-damage-per-meter-lab-table.mjs | shared ladder |
| `attack/damage.json` | Damage | screenshot-transcribed | gen-damage-lab-table.mjs | — |
| `attack/light-speed-shots.json` | Light Speed Shots | screenshot-transcribed | gen-light-speed-shots-lab-table.mjs | — |
| `attack/max-rend-armor-multiplier.json` | Max Rend Armor Multiplier | screenshot-transcribed | gen-max-rend-armor-multiplier-lab-table.mjs | — |
| `attack/range.json` | Range | shared-cost-ladder | gen-range-lab-table.mjs | formula value; shared ladder |
| `attack/super-crit-chance.json` | Super Crit Chance | screenshot-transcribed | gen-super-crit-chance-lab-table.mjs | — |
| `attack/super-crit-mult.json` | Super Crit Mult | screenshot-transcribed | gen-super-crit-mult-lab-table.mjs | — |
| `battle-condition/armored-enemies.json` | Armored Enemies | screenshot-transcribed | gen-armored-enemies-lab-table.mjs | — |
| `battle-condition/basic-ultimate.json` | Basic's Ultimate | no-generator | — | — |
| `battle-condition/battle-condition-reduction.json` | Battle Condition Reduction | no-generator | — | — |
| `battle-condition/boss-ultimate.json` | Boss's Ultimate | no-generator | — | — |
| `battle-condition/death-defy-down.json` | Death Defy Down | alias-copy | — | alias←Ultimate Weapon Durations |
| `battle-condition/death-ray-resistance.json` | Death Ray Resistance | alias-copy | — | alias←Knockback Resistance |
| `battle-condition/enemy-attack-speed.json` | Enemy Attack Speed | alias-copy | — | alias←Armored Enemies |
| `battle-condition/enemy-level-skip-reduction.json` | Enemy Level Skip Reduction | alias-copy | — | alias←Ultimate Weapon Durations |
| `battle-condition/enemy-speed.json` | Enemy Speed | alias-copy | gen-fast-enemy-speed-lab-table.mjs | alias←Armored Enemies |
| `battle-condition/energy-shields-down.json` | Energy Shields Down | alias-copy | — | alias←Ultimate Weapon Durations |
| `battle-condition/fast-ultimate.json` | Fast's Ultimate | bc-group3-shared-rows | gen-fast-ultimate-lab-table.mjs | — |
| `battle-condition/knockback-resistance.json` | Knockback Resistance | screenshot-transcribed | gen-knockback-resistance-lab-table.mjs | — |
| `battle-condition/more-enemies.json` | More Enemies | alias-copy | — | alias←Armored Enemies |
| `battle-condition/orb-resistance.json` | Orb Resistance | alias-copy | — | alias←Knockback Resistance |
| `battle-condition/plasma-cannon-resistance.json` | Plasma Cannon Resistance | alias-copy | — | alias←Knockback Resistance |
| `battle-condition/protector-ultimate.json` | Protector's Ultimate | no-generator | — | — |
| `battle-condition/ranged-ultimate.json` | Ranged Ultimate | no-generator | — | — |
| `battle-condition/tank-ultimate.json` | Tank's Ultimate | no-generator | — | — |
| `battle-condition/thorns-resistance.json` | Thorns Resistance | alias-copy | — | alias←Knockback Resistance |
| `battle-condition/ultimate-weapon-durations.json` | Ultimate Weapon Durations | screenshot-transcribed | gen-ultimate-weapon-durations-lab-table.mjs | — |
| `bots/amplify-bot-cooldown.json` | Amplify Bot - Cooldown | screenshot-transcribed | gen-amplify-bot-cooldown-lab-table.mjs | — |
| `bots/amplify-bot-duration.json` | Amplify Bot - Duration | screenshot-transcribed | gen-amplify-bot-duration-lab-table.mjs | — |
| `bots/bot-bot-cooldown.json` | Bot Bot - Cooldown | screenshot-transcribed | gen-bot-bot-cooldown-lab-table.mjs | — |
| `bots/bot-bot-duration.json` | Bot Bot - Duration | screenshot-transcribed | gen-bot-bot-duration-lab-table.mjs | — |
| `bots/flame-bot-burn-stack.json` | Flame Bot - Burn Stack | screenshot-transcribed | gen-flame-bot-burn-stack-lab-table.mjs | — |
| `bots/flame-bot-cooldown.json` | Flame Bot - Cooldown | screenshot-transcribed | gen-flame-bot-cooldown-lab-table.mjs | — |
| `bots/golden-bot-cooldown.json` | Golden Bot - Cooldown | screenshot-transcribed | gen-golden-bot-cooldown-lab-table.mjs | — |
| `bots/golden-bot-duration.json` | Golden Bot - Duration | no-generator | — | — |
| `bots/thunder-bot-cooldown.json` | Thunder Bot - Cooldown | screenshot-transcribed | gen-thunder-bot-cooldown-lab-table.mjs | — |
| `bots/thunder-bot-linger-time.json` | Thunder Bot - Linger Time | screenshot-transcribed | gen-thunder-bot-linger-time-lab-table.mjs | formula value |
| `card-mastery/area-of-effect-mastery.json` | Area of Effect Mastery | screenshot-transcribed | gen-area-of-effect-mastery-lab-table.mjs | formula value |
| `card-mastery/attack-speed-mastery.json` | Attack Speed Mastery | screenshot-transcribed | gen-attack-speed-mastery-lab-table.mjs | formula value |
| `card-mastery/berserker-mastery.json` | Berserker Mastery | screenshot-transcribed | gen-berserker-mastery-lab-table.mjs | formula value |
| `card-mastery/cash-mastery.json` | Cash Mastery | screenshot-transcribed | gen-cash-mastery-lab-table.mjs | formula value |
| `card-mastery/coins-mastery.json` | Coins Mastery | screenshot-transcribed | gen-coins-mastery-lab-table.mjs | formula value |
| `card-mastery/critical-chance-mastery.json` | Critical Chance Mastery | screenshot-transcribed | gen-critical-chance-mastery-lab-table.mjs | formula value |
| `card-mastery/critical-coin-mastery.json` | Critical Coin Mastery | screenshot-transcribed | gen-critical-coin-mastery-lab-table.mjs | formula value |
| `card-mastery/damage-mastery.json` | Damage Mastery | screenshot-transcribed | gen-damage-mastery-lab-table.mjs | formula value |
| `card-mastery/death-ray-mastery.json` | Death Ray Mastery | screenshot-transcribed | gen-death-ray-mastery-lab-table.mjs | formula value |
| `card-mastery/demon-mode-mastery.json` | Demon Mode Mastery | screenshot-transcribed | gen-demon-mode-mastery-lab-table.mjs | formula value |
| `card-mastery/enemy-balance-mastery.json` | Enemy Balance Mastery | screenshot-transcribed | gen-enemy-balance-mastery-lab-table.mjs | formula value |
| `card-mastery/energy-net-mastery.json` | Energy Net Mastery | screenshot-transcribed | gen-energy-net-mastery-lab-table.mjs | formula value |
| `card-mastery/energy-shield-mastery.json` | Energy Shield Mastery | screenshot-transcribed | gen-energy-shield-mastery-lab-table.mjs | formula value |
| `card-mastery/extra-defense-mastery.json` | Extra Defense Mastery | screenshot-transcribed | gen-extra-defense-mastery-lab-table.mjs | formula value |
| `card-mastery/extra-orb-mastery.json` | Extra Orb Mastery | screenshot-transcribed | gen-extra-orb-mastery-lab-table.mjs | formula value |
| `card-mastery/fortress-mastery.json` | Fortress Mastery | screenshot-transcribed | gen-fortress-mastery-lab-table.mjs | — |
| `card-mastery/free-upgrades-mastery.json` | Free Upgrades Mastery | screenshot-transcribed | gen-free-upgrades-mastery-lab-table.mjs | formula value |
| `card-mastery/health-mastery.json` | Health Mastery | screenshot-transcribed | gen-health-mastery-lab-table.mjs | formula value |
| `card-mastery/health-regen-mastery.json` | Health Regen Mastery | screenshot-transcribed | gen-health-regen-mastery-lab-table.mjs | formula value |
| `card-mastery/intro-sprint-mastery.json` | Intro Sprint Mastery | screenshot-transcribed | gen-intro-sprint-mastery-lab-table.mjs | formula value |
| `card-mastery/land-mine-stun-mastery.json` | Land Mine Stun Mastery | screenshot-transcribed | gen-land-mine-stun-mastery-lab-table.mjs | formula value |
| `card-mastery/nuke-mastery.json` | Nuke Mastery | screenshot-transcribed | gen-nuke-mastery-lab-table.mjs | formula value |
| `card-mastery/plasma-cannon-mastery.json` | Plasma Cannon Mastery | screenshot-transcribed | gen-plasma-cannon-mastery-lab-table.mjs | formula value |
| `card-mastery/range-mastery.json` | Range Mastery | screenshot-transcribed | gen-range-mastery-lab-table.mjs | formula value |
| `card-mastery/recovery-package-chance-mastery.json` | Recovery Package Chance Mastery | screenshot-transcribed | gen-recovery-package-chance-mastery-lab-table.mjs | formula value |
| `card-mastery/second-wind-mastery.json` | Second Wind Mastery | screenshot-transcribed | gen-second-wind-mastery-lab-table.mjs | formula value |
| `card-mastery/slow-aura-mastery.json` | Slow Aura Mastery | screenshot-transcribed | gen-slow-aura-mastery-lab-table.mjs | formula value |
| `card-mastery/super-tower-mastery.json` | Super Tower Mastery | screenshot-transcribed | gen-super-tower-mastery-lab-table.mjs | — |
| `card-mastery/ultimate-crit-mastery.json` | Ultimate Crit Mastery | screenshot-transcribed | gen-ultimate-crit-mastery-lab-table.mjs | formula value |
| `card-mastery/wave-accelerator-mastery.json` | Wave Accelerator Mastery | screenshot-transcribed | gen-wave-accelerator-mastery-lab-table.mjs | formula value |
| `card-mastery/wave-skip-mastery.json` | Wave Skip Mastery | screenshot-transcribed | gen-wave-skip-mastery-lab-table.mjs | formula value |
| `cards/double-death-ray.json` | Double Death Ray | screenshot-transcribed | gen-double-death-ray-lab-table.mjs | formula value |
| `cards/energy-shield-extra-hit.json` | Energy Shield Extra Hit | screenshot-transcribed | gen-energy-shield-extra-hit-lab-table.mjs | — |
| `cards/extra-extra-orbs.json` | Extra Extra Orbs | screenshot-transcribed | gen-extra-extra-orbs-lab-table.mjs | formula value |
| `cards/extra-orb-adjuster.json` | Extra Orb Adjuster | screenshot-transcribed | gen-extra-orb-adjuster-lab-table.mjs | — |
| `cards/recharge-demon-mode.json` | Recharge Demon Mode | screenshot-transcribed | gen-recharge-demon-mode-lab-table.mjs | — |
| `cards/recharge-nuke.json` | Recharge Nuke | screenshot-transcribed | gen-recharge-nuke-lab-table.mjs | — |
| `cards/recharge-second-wind.json` | Recharge Second Wind | screenshot-transcribed | gen-recharge-second-wind-lab-table.mjs | — |
| `cards/second-wind-blast.json` | Second Wind Blast | screenshot-transcribed | gen-second-wind-blast-lab-table.mjs | formula value |
| `cards/super-tower-bonus.json` | Super Tower Bonus | screenshot-transcribed | gen-super-tower-bonus-lab-table.mjs | — |
| `defense/defense-absolute.json` | Defense Absolute | shared-cost-ladder | gen-defense-absolute-lab-table.mjs | formula value; shared ladder |
| `defense/defense-percent.json` | Defense % | has-generator-unclassified | gen-defense-percent-lab-table.mjs | — |
| `defense/garlic-thorns.json` | Garlic Thorns | screenshot-transcribed | gen-garlic-thorns-lab-table.mjs | formula value |
| `defense/health-regen.json` | Health Regen | shared-cost-ladder | gen-health-regen-lab-table.mjs | formula value; shared ladder |
| `defense/health.json` | Health | shared-cost-ladder | gen-health-lab-table.mjs | formula value; shared ladder |
| `defense/land-mine-damage.json` | Land Mine Damage | screenshot-transcribed | gen-land-mine-damage-lab-table.mjs | formula value |
| `defense/land-mine-decay.json` | Land Mine Decay | has-generator-unclassified | gen-land-mine-decay-lab-table.mjs | formula value |
| `defense/orb-boss-hit.json` | Orb Boss Hit | screenshot-transcribed | gen-orb-boss-hit-lab-table.mjs | formula value |
| `defense/orbs-speed.json` | Orbs Speed | screenshot-transcribed | gen-orbs-speed-lab-table.mjs | formula value |
| `defense/shockwave-size.json` | Shockwave Size | screenshot-transcribed | gen-shockwave-size-lab-table.mjs | formula value |
| `defense/wall-fortification.json` | Wall Fortification | screenshot-transcribed | gen-wall-fortification-lab-table.mjs | formula value |
| `defense/wall-health.json` | Wall Health | has-generator-unclassified | gen-wall-health-lab-table.mjs | formula value |
| `defense/wall-invincibility.json` | Wall Invincibility | screenshot-transcribed | gen-wall-invincibility-lab-table.mjs | formula value |
| `defense/wall-rebuild.json` | Wall Rebuild | screenshot-transcribed | gen-wall-rebuild-lab-table.mjs | — |
| `defense/wall-regen.json` | Wall Regen | screenshot-transcribed | gen-wall-regen-lab-table.mjs | formula value |
| `defense/wall-thorns.json` | Wall Thorns | screenshot-transcribed | gen-wall-thorns-lab-table.mjs | formula value |
| `enemies/boss-enemy-attack.json` | Boss Attack | screenshot-transcribed | gen-boss-enemy-attack-lab-table.mjs | — |
| `enemies/boss-enemy-health.json` | Boss Health | screenshot-transcribed | gen-boss-enemy-health-lab-table.mjs | — |
| `enemies/common-enemy-attack.json` | Common Enemy Attack | screenshot-transcribed | gen-common-enemy-attack-lab-table.mjs | — |
| `enemies/common-enemy-health.json` | Common Enemy Health | screenshot-transcribed | gen-common-enemy-health-lab-table.mjs | — |
| `enemies/fast-enemy-attack.json` | Fast Enemy Attack | screenshot-transcribed | gen-fast-enemy-attack-lab-table.mjs | — |
| `enemies/fast-enemy-health.json` | Fast Enemy Health | screenshot-transcribed | gen-fast-enemy-health-lab-table.mjs | — |
| `enemies/fast-enemy-speed.json` | Fast Enemy Speed | screenshot-transcribed | gen-fast-enemy-speed-lab-table.mjs | — |
| `enemies/protector-damage-reduction.json` | Protector Damage Reduction | screenshot-transcribed | gen-protector-damage-reduction-lab-table.mjs | — |
| `enemies/protector-enemy-health.json` | Protector Health | screenshot-transcribed | gen-protector-enemy-health-lab-table.mjs | — |
| `enemies/protector-enemy-radius.json` | Protector Radius | screenshot-transcribed | gen-protector-enemy-radius-lab-table.mjs | — |
| `enemies/ranged-enemy-attack.json` | Ranged Enemy Attack | screenshot-transcribed | gen-ranged-enemy-attack-lab-table.mjs | — |
| `enemies/ranged-enemy-health.json` | Ranged Enemy Health | screenshot-transcribed | gen-ranged-enemy-health-lab-table.mjs | — |
| `enemies/ranged-enemy-range.json` | Ranged Enemy Range | screenshot-transcribed | gen-ranged-enemy-range-lab-table.mjs | — |
| `enemies/ray-enemy-attack.json` | Ray Enemy Attack | screenshot-transcribed | gen-ray-enemy-attack-lab-table.mjs | — |
| `enemies/ray-enemy-health.json` | Ray Enemy Health | alias-copy | — | alias←Ray Enemy Attack |
| `enemies/scatter-enemy-attack.json` | Scatter Enemy Attack | alias-copy | — | alias←Ray Enemy Attack |
| `enemies/scatter-enemy-health.json` | Scatter Enemy Health | alias-copy | — | alias←Ray Enemy Attack |
| `enemies/tank-enemy-attack.json` | Tank Enemy Attack | screenshot-transcribed | gen-tank-enemy-attack-lab-table.mjs | — |
| `enemies/tank-enemy-health.json` | Tank Enemy Health | screenshot-transcribed | gen-tank-enemy-health-lab-table.mjs | — |
| `enemies/vampire-enemy-attack.json` | Vampire Enemy Attack | alias-copy | — | alias←Ray Enemy Attack |
| `enemies/vampire-enemy-health.json` | Vampire Enemy Health | alias-copy | — | alias←Ray Enemy Attack |
| `main/buy-multiplier.json` | Buy Multiplier | no-generator | — | — |
| `main/card-presets.json` | Card Presets | no-generator | — | — |
| `main/dissonant-echo-attack.json` | Dissonant Echo - Attack | screenshot-transcribed | gen-dissonant-echo-attack-lab-table.mjs | — |
| `main/dissonant-echo-defense.json` | Dissonant Echo - Defense | screenshot-transcribed | gen-dissonant-echo-defense-lab-table.mjs | — |
| `main/dissonant-echo-ultimate-weapons.json` | Dissonant Echo - Ultimate Weapons | screenshot-transcribed | gen-dissonant-echo-ultimate-weapons-lab-table.mjs | — |
| `main/dissonant-echo-utility.json` | Dissonant Echo - Utility | screenshot-transcribed | gen-dissonant-echo-utility-lab-table.mjs | — |
| `main/enhancement-attack-coin-discount.json` | Enhancement Attack - Coin Discount | has-generator-unclassified | gen-enhancement-coin-discount-lab-table.mjs | — |
| `main/enhancement-defense-coin-discount.json` | Enhancement Defense - Coin Discount | alias-copy | — | alias←Enhancement Attack - Coin Discount |
| `main/enhancement-utility-coin-discount.json` | Enhancement Utility - Coin Discount | alias-copy | — | alias←Enhancement Attack - Coin Discount |
| `main/game-speed.json` | Game Speed | no-generator | — | — |
| `main/labs-coin-discount.json` | Labs Coin Discount | screenshot-transcribed | gen-labs-coin-discount-lab-table.mjs | — |
| `main/labs-speed.json` | Labs Speed | screenshot-transcribed | gen-labs-speed-lab-table.mjs | — |
| `main/more-round-stats.json` | More Round Stats | no-generator | — | — |
| `main/reroll-daily-mission.json` | Reroll Daily Mission | no-generator | — | — |
| `main/starting-cash.json` | Starting Cash | screenshot-transcribed | gen-starting-cash-lab-table.mjs | — |
| `main/target-priority.json` | Target Priority | no-generator | — | — |
| `main/workshop-attack-discount.json` | Workshop Attack Discount | has-generator-unclassified | gen-workshop-attack-discount-lab-table.mjs | — |
| `main/workshop-defense-discount.json` | Workshop Defense Discount | has-generator-unclassified | gen-workshop-defense-discount-lab-table.mjs | — |
| `main/workshop-enhancements.json` | Workshop Enhancements | no-generator | — | — |
| `main/workshop-respec.json` | Workshop Respec | no-generator | — | — |
| `main/workshop-utility-discount.json` | Workshop Utility Discount | no-generator | — | — |
| `modules/armor-effect-bans.json` | Armor Effect Bans | screenshot-transcribed | gen-armor-effect-bans-lab-table.mjs | — |
| `modules/assist-module-bonus-armor.json` | Assist Module Bonus - Armor | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-bonus-cannon.json` | Assist Module Bonus - Cannon | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-bonus-core.json` | Assist Module Bonus - Core | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-bonus-generator.json` | Assist Module Bonus - Generator | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-substats-armor.json` | Assist Module Substats - Armor | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-substats-cannon.json` | Assist Module Substats - Cannon | screenshot-transcribed | gen-assist-module-substats-cannon-lab-table.mjs | — |
| `modules/assist-module-substats-core.json` | Assist Module Substats - Core | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/assist-module-substats-generator.json` | Assist Module Substats - Generator | alias-copy | — | alias←Assist Module Substats - Cannon |
| `modules/cannon-effect-bans.json` | Cannon Effect Bans | screenshot-transcribed | gen-cannon-effect-bans-lab-table.mjs | — |
| `modules/common-drop-chance.json` | Common Drop Chance | screenshot-transcribed | gen-common-drop-chance-lab-table.mjs | formula value |
| `modules/core-effect-bans.json` | Core Effect Bans | screenshot-transcribed | gen-core-effect-bans-lab-table.mjs | — |
| `modules/daily-mission-shards.json` | Daily Mission Shards | screenshot-transcribed | gen-daily-mission-shards-lab-table.mjs | formula value |
| `modules/generator-effect-bans.json` | Generator Effect Bans | screenshot-transcribed | gen-generator-effect-bans-lab-table.mjs | — |
| `modules/module-coin-cost.json` | Module Coin Cost | screenshot-transcribed | gen-module-coin-cost-lab-table.mjs | — |
| `modules/module-shards-cost.json` | Module Shards Cost | screenshot-transcribed | gen-module-shards-cost-lab-table.mjs | — |
| `modules/rare-drop-chance.json` | Rare Drop Chance | screenshot-transcribed | gen-rare-drop-chance-lab-table.mjs | formula value |
| `modules/reroll-shards.json` | Reroll Shards | screenshot-transcribed | gen-reroll-shards-lab-table.mjs | formula value |
| `modules/shatter-shards.json` | Shatter Shards | screenshot-transcribed | gen-shatter-shards-lab-table.mjs | formula value |
| `modules/unmerge-module.json` | Unmerge Module | screenshot-transcribed | gen-unmerge-module-lab-table.mjs | — |
| `perks/auto-pick-perks.json` | Auto Pick Perks | screenshot-transcribed | gen-auto-pick-perks-lab-table.mjs | — |
| `perks/auto-pick-ranking.json` | Auto Pick Ranking | screenshot-transcribed | gen-auto-pick-ranking-lab-table.mjs | — |
| `perks/ban-perks.json` | Ban Perks | screenshot-transcribed | gen-ban-perks-lab-table.mjs | — |
| `perks/first-perk-choice.json` | First Perk Choice | screenshot-transcribed | gen-first-perk-choice-lab-table.mjs | — |
| `perks/improve-trade-off-perks.json` | Improve Trade-off Perks | screenshot-transcribed | gen-improve-trade-off-perks-lab-table.mjs | — |
| `perks/perk-option-quantity.json` | Perk Option Quantity | screenshot-transcribed | gen-perk-option-quantity-lab-table.mjs | — |
| `perks/standard-perks-bonus.json` | Standard Perks Bonus | has-generator-unclassified | gen-standard-perks-bonus-lab-table.mjs | — |
| `perks/unlock-perks.json` | Unlock Perks | screenshot-transcribed | gen-unlock-perks-lab-table.mjs | — |
| `perks/waves-required.json` | Waves Required | screenshot-transcribed | gen-waves-required-lab-table.mjs | — |
| `ultimate-weapon/black-hole-coin-bonus.json` | Black Hole Coin Bonus | screenshot-transcribed | gen-black-hole-coin-bonus-lab-table.mjs | formula value |
| `ultimate-weapon/black-hole-damage.json` | Black Hole Damage | screenshot-transcribed | gen-black-hole-damage-lab-table.mjs | formula value |
| `ultimate-weapon/black-hole-disable-ranged-enemies.json` | Black Hole Disable Ranged Enemies | screenshot-transcribed | gen-black-hole-disable-ranged-enemies-lab-table.mjs | — |
| `ultimate-weapon/chain-lightning-shock.json` | Chain Lightning Shock | screenshot-transcribed | gen-chain-lightning-shock-lab-table.mjs | — |
| `ultimate-weapon/chain-thunder.json` | Chain Thunder | screenshot-transcribed | gen-chain-thunder-lab-table.mjs | formula value |
| `ultimate-weapon/chrono-field-damage-reduction.json` | Chrono Field Damage Reduction | screenshot-transcribed | gen-chrono-field-damage-reduction-lab-table.mjs | — |
| `ultimate-weapon/chrono-field-duration.json` | Chrono Field Duration | screenshot-transcribed | gen-chrono-field-duration-lab-table.mjs | — |
| `ultimate-weapon/chrono-field-range.json` | Chrono Field Range | shared-cost-ladder | gen-chrono-field-range-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/chrono-field-reduction-percent.json` | Chrono Field Reduction % | shared-cost-ladder | gen-chrono-field-reduction-percent-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/death-wave-armor-stripping.json` | Death Wave Armor Stripping | screenshot-transcribed | gen-death-wave-armor-stripping-lab-table.mjs | formula value |
| `ultimate-weapon/death-wave-cells-bonus.json` | Death Wave Cells Bonus | screenshot-transcribed | gen-death-wave-cells-bonus-lab-table.mjs | formula value |
| `ultimate-weapon/death-wave-coin-bonus.json` | Death Wave Coin Bonus | shared-cost-ladder | gen-death-wave-coin-bonus-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/death-wave-damage-amplifier.json` | Death Wave Damage Amplifier | screenshot-transcribed | gen-death-wave-damage-amplifier-lab-table.mjs | formula value |
| `ultimate-weapon/death-wave-health.json` | Death Wave Health | screenshot-transcribed | gen-death-wave-health-lab-table.mjs | formula value |
| `ultimate-weapon/extra-black-hole.json` | Extra Black Hole | screenshot-transcribed | gen-extra-black-hole-lab-table.mjs | — |
| `ultimate-weapon/golden-tower-bonus.json` | Golden Tower Bonus | screenshot-transcribed | gen-golden-tower-bonus-lab-table.mjs | formula value |
| `ultimate-weapon/golden-tower-duration.json` | Golden Tower Duration | shared-cost-ladder | gen-golden-tower-duration-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/inner-land-mine-chrono-jump.json` | Inner Land Mine - Chrono Jump | screenshot-transcribed | gen-inner-land-mine-chrono-jump-lab-table.mjs | formula value |
| `ultimate-weapon/inner-mine-blast-radius.json` | Inner Mine Blast Radius | shared-cost-ladder | gen-inner-mine-blast-radius-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/inner-mine-rotation-speed.json` | Inner Mine Rotation Speed | shared-cost-ladder | gen-inner-mine-rotation-speed-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/inner-mine-stun.json` | Inner Mine Stun | screenshot-transcribed | gen-inner-mine-stun-lab-table.mjs | — |
| `ultimate-weapon/lightning-amplifier-scatter.json` | Lightning Amplifier - Scatter | screenshot-transcribed | gen-lightning-amplifier-scatter-lab-table.mjs | formula value |
| `ultimate-weapon/missile-amplifier.json` | Missile Amplifier | screenshot-transcribed | gen-missile-amplifier-lab-table.mjs | formula value |
| `ultimate-weapon/missile-barrage-quantity.json` | Missile Barrage Quantity | screenshot-transcribed | gen-missile-barrage-quantity-lab-table.mjs | formula value |
| `ultimate-weapon/missile-barrage.json` | Missile Barrage | screenshot-transcribed | gen-missile-barrage-lab-table.mjs | — |
| `ultimate-weapon/missile-despawn-time.json` | Missile Despawn Time | screenshot-transcribed | gen-missile-despawn-time-lab-table.mjs | — |
| `ultimate-weapon/missile-radius.json` | Missile Radius | screenshot-transcribed | gen-missile-radius-lab-table.mjs | formula value |
| `ultimate-weapon/missiles-explosion.json` | Missiles Explosion | screenshot-transcribed | gen-missiles-explosion-lab-table.mjs | — |
| `ultimate-weapon/recharge-missile-barrage.json` | Recharge Missile Barrage | screenshot-transcribed | gen-recharge-missile-barrage-lab-table.mjs | — |
| `ultimate-weapon/shock-chance.json` | Shock Chance | screenshot-transcribed | gen-shock-chance-lab-table.mjs | formula value |
| `ultimate-weapon/shock-multiplier.json` | Shock Multiplier | shared-cost-ladder | gen-shock-multiplier-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/spotlight-coin-bonus.json` | Spotlight Coin Bonus | screenshot-transcribed | gen-spotlight-coin-bonus-lab-table.mjs | formula value |
| `ultimate-weapon/spotlight-missiles.json` | Spotlight Missiles | screenshot-transcribed | gen-spotlight-missiles-lab-table.mjs | formula value |
| `ultimate-weapon/swamp-radius.json` | Swamp Radius | shared-cost-ladder | gen-swamp-radius-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/swamp-rend-additional-enemies.json` | Swamp Rend - Additional Enemies | screenshot-transcribed | gen-swamp-rend-additional-enemies-lab-table.mjs | — |
| `ultimate-weapon/swamp-rend-basic-enemies.json` | Swamp Rend - Basic Enemies | screenshot-transcribed | gen-swamp-rend-lab-table.mjs | formula value |
| `ultimate-weapon/swamp-stun-chance.json` | Swamp Stun Chance | shared-cost-ladder | gen-swamp-stun-chance-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/swamp-stun-time.json` | Swamp Stun Time | shared-cost-ladder | gen-swamp-stun-time-lab-table.mjs | formula value; shared ladder |
| `ultimate-weapon/swamp-stun.json` | Swamp Stun | screenshot-transcribed | gen-swamp-stun-lab-table.mjs | — |
| `utility/cash-bonus.json` | Cash Bonus | screenshot-transcribed | gen-cash-bonus-lab-table.mjs | formula value |
| `utility/cash-wave.json` | Cash / Wave | screenshot-transcribed | gen-cash-wave-lab-table.mjs | formula value |
| `utility/coins-kill-bonus.json` | Coins / Kill Bonus | screenshot-transcribed | gen-coins-kill-bonus-lab-table.mjs | formula value |
| `utility/coins-wave.json` | Coins / Wave | screenshot-transcribed | gen-coins-wave-lab-table.mjs | formula value |
| `utility/enemy-attack-level-skip.json` | Enemy Attack Level Skip | screenshot-transcribed | gen-enemy-attack-level-skip-lab-table.mjs | formula value |
| `utility/enemy-health-level-skip.json` | Enemy Health Level Skip | screenshot-transcribed | gen-enemy-health-level-skip-lab-table.mjs | formula value |
| `utility/interest.json` | Interest | screenshot-transcribed | gen-interest-lab-table.mjs | formula value |
| `utility/max-interest.json` | Max Interest | screenshot-transcribed | gen-max-interest-lab-table.mjs | — |
| `utility/package-after-boss.json` | Package After Boss | screenshot-transcribed | gen-package-after-boss-lab-table.mjs | — |
| `utility/recovery-package-amount.json` | Recovery Package Amount | screenshot-transcribed | gen-recovery-package-amount-lab-table.mjs | formula value |
| `utility/recovery-package-chance.json` | Recovery Package Chance | screenshot-transcribed | gen-recovery-package-chance-lab-table.mjs | formula value |
| `utility/recovery-package-max.json` | Recovery Package Max | screenshot-transcribed | gen-recovery-package-max-lab-table.mjs | formula value |
