# Chapter 10: Nature & Animals

## Overview
Chapter 10 ("Nature & Animals") introduces the player to exploring the natural world, interacting with farm animals and forest wildlife, observing live weather conditions connected to `WorldSimulationEngine`, and using comparative adjectives (`bigger than`, `taller than`, `larger portion than`) under a Monolingual Learning Architecture without bilingual translations or cards. The player explores Nature Quarter scenes (Farm, Forest, Lake, Community Garden), feeds farm cows and sheep, snaps wildlife photographs of deer and ducks, checks live weather gauges (`clear`, `rain`, `clouds`), and learns from Thomas Farmer the Master Agriculturist.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to describe and compare animals, plants, and natural features using comparative adjectives, describe live weather states, feed farm animals according to size comparisons, and take photographs of wildlife.

### Communication Goals
- **Comparing Animals & Objects**: Form comparative sentences (`The cow is bigger than the sheep`, `The horse is taller than the cow`).
- **Describing Weather**: Connect live weather states to environmental actions (`When the sky is clear, animals graze in green pastures; when it rains, they rest inside the barn`).
- **Wildlife Photography**: Photograph wild deer in the forest and ducks at the lake.
- **Animal Care**: Feed farm animals using size-based comparisons.

---

## Chapter Topology & Scenes (4 Main Scenes)

1. **Farm** (`farm`)
   - District: Nature Quarter
   - Description: Thomas's farmyard featuring dairy cows, woolly sheep, barnyards, and weather gauges.
   - Hotspots: `farm_cow`, `farm_sheep`, `weather_indicator`, `plant`, `flower_bed`
   - NPCs: `thomas_farmer`

2. **Forest** (`forest`)
   - District: Nature Quarter
   - Description: A quiet woodland clearing inhabited by wild forest deer.
   - Hotspots: `forest_deer`, `plant`, `balcony_plant`, `flower_bed`
   - NPCs: None

3. **Lake** (`lake`)
   - District: Nature Quarter
   - Description: A peaceful lakeside shore where wild ducks swim.
   - Hotspots: `lake_duck`, `bench`, `plant`, `flower_bed`
   - NPCs: None

4. **Community Garden** (`community_garden`)
   - District: Community Quarter
   - Description: A shared garden bed area with vibrant flowers and vegetables.
   - Hotspots: `flower_bed`, `plant`, `balcony_plant`, `bench`
   - NPCs: None

---

## Weather Hooks & World Simulation Integration

- Hotspot `weather_indicator` ("Weather Station Gauge") directly hooks into `WorldSimulationEngine` (`js/world/world_simulation.js`), displaying live weather states (`clear` ☀️, `rain` 🌧️, `clouds` ☁️, `snow` 🌨️, `fog` 🌫️) and triggering weather-specific NPC dialogue responses from Thomas Farmer.

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 10 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/thomas_farmer_farm.json`: Thomas Farmer introducing farm animal size comparisons (`The cow is bigger than the sheep`), guiding animal feeding, and discussing live weather conditions.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `cow` | A0 | nature/animal | 0 | `farm_cow` | `farm` |
| `sheep` | A0 | nature/animal | 0 | `farm_sheep` | `farm` |
| `deer` | A0 | nature/wildlife | 0 | `forest_deer` | `forest` |
| `duck` | A0 | nature/wildlife | 0 | `lake_duck` | `lake` |
| `weather` | A0 | nature/weather | 0 | `weather_indicator` | `farm` |
| `flower` | A0 | nature/plant | 0 | `flower_bed` | `community_garden` |

---

## Grammar Concepts & Patterns

1. **`gt_comparatives`**: Comparative Adjectives (`Noun A + is + Adj-er + than + Noun B` — `The cow is bigger than the sheep`).

---

## Minigames

- `mg_wildlife_photo_1`: **Wildlife Photography Challenge** (Snap photos of forest deer and lake ducks).
- `mg_feed_animals_1`: **Feed Farm Animals Challenge** (Feed the cow and sheep using comparative adjectives).

---

## Gameplay Quest Progression (3 Steps)

1. **Feed Farm Animals & Comparatives** (`q_ch10_farm_animals`): Visit Thomas's farm to inspect and feed the farm cow and woolly sheep using comparatives.
2. **Wildlife Photography Tour** (`q_ch10_wildlife_photo`): Photograph wild deer in the forest clearing and ducks at the lake.
3. **Master Nature Explorer** (`q_ch10_nature_master`): Visit the community garden to water garden flowers and check live weather to complete Chapter 10!

---

## Achievements

- `ach_ch10_nature_master`: Wildlife Explorer & Photographer (Feed farm animals using comparative adjectives, complete the wildlife photography album, check weather gauges, and complete Chapter 10).
