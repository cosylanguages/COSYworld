# Chapter 12: Travel (Grand Finale)

## Overview
Chapter 12 ("Travel") serves as the grand finale capstone chapter of COSY Town, concluding the player's A0-A1 polyglot journey under a Monolingual Learning Architecture without bilingual translations or cards. The player explores Transport & Travel Quarter scenes (Airport, Train Station, Hotel, Tourist Office), packs luggage, checks in at the hotel, asks for tourist information, expresses future plans using `be going to` (`I am going to check in at the hotel`, `She is going to visit the tourist office`), and reunites with James York at the airport in a narrative bookend that ties back to the player's initial arrival in Chapter 1.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to express future plans and travel intentions using `be going to`, handle travel procedures (packing luggage, airport check-in, hotel reservations, city map inquiries), and review all language concepts acquired across Chapters 1 through 12.

### Communication Goals
- **Expressing Future Plans & Intentions**: State planned actions using `going to` (`I am going to travel around the world`, `I am going to check in at the hotel`).
- **Preparing Luggage**: Pack essential travel items into suitcases (`passport`, `suitcase`, `hotel key card`, `tourist guide map`).
- **Hotel & Travel Services**: Inquire about reservations, keys, and city guides at hotel desks and tourist offices.
- **Narrative Bookend Reunion**: Reflect on the grand journey across all 12 chapters with Explorer Mentor James York.

---

## Chapter Topology & Scenes (4 Main Scenes)

1. **Airport** (`airport`)
   - District: Transport Quarter
   - Description: The international airport terminal connecting COSY Town to the world.
   - Hotspots: `travel_passport`, `travel_suitcase`, `desk`, `window`, `bench`
   - NPCs: `diana_voyager`, `james_york`

2. **Train Station** (`train_station`)
   - District: Transport Quarter
   - Description: The railway station concourse featuring departure boards and travel ticket counters.
   - Hotspots: `train_ticket`, `train_schedule_board`, `bench`, `window`
   - NPCs: `ticket_clerk_oliver`, `diana_voyager`

3. **Hotel** (`hotel`)
   - District: Travel Quarter
   - Description: A boutique hotel lobby for reservations, check-ins, and key card collection.
   - Hotspots: `hotel_key_card`, `desk`, `lamp`, `window`, `sofa`
   - NPCs: `diana_voyager`

4. **Tourist Office** (`tourist_office`)
   - District: Civic Quarter
   - Description: The community information center providing city maps and travel guidebooks.
   - Hotspots: `tourist_guide_map`, `desk`, `bookshelf`, `lamp`
   - NPCs: `diana_voyager`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 12 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/diana_voyager_airport.json`: Polyglot Voyager Diana Voyager discussing flight departures, luggage packing, hotel check-in, and future travel plans using `going to`.
- `data/dialogues/james_york_airport.json`: Explorer Mentor James York congratulating the player at the airport, creating a narrative bookend that references Chapter 1's opening and recognizes the player as a Citizen of the World.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `passport` | A0 | item/travel | 0 | `travel_passport` | `airport` |
| `suitcase` | A0 | item/travel | 0 | `travel_suitcase` | `airport` |
| `key card` | A0 | item/hotel | 0 | `hotel_key_card` | `hotel` |
| `guide map` | A0 | item/travel | 0 | `tourist_guide_map` | `tourist_office` |
| `train ticket` | A0 | item/travel | 20 | `train_ticket` | `train_station` |
| `departure board` | A0 | structure/travel | 0 | `train_schedule_board` | `train_station` |

---

## Grammar Concepts & Patterns

1. **`gt_going_to_future`**: Future Plans with 'Going to' (`Subject + am/is/are + going to + Base Verb` — `I am going to check in at the hotel`).

---

## Minigames

- `mg_pack_luggage_1`: **Prepare Travel Luggage Challenge** (Pack essential travel items into your suitcase before departure).

---

## Gameplay Quest Progression (3 Capstone Steps)

1. **Prepare Luggage & Travel Info** (`q_ch12_prepare_travel`): Pack essential travel items into your suitcase and inspect the tourist guide map.
2. **Hotel Check-in & Future Plans** (`q_ch12_hotel_checkin`): Check in at the hotel and discuss future travel plans with Diana Voyager using `going to`.
3. **Citizen of the World Capstone** (`q_ch12_citizen_of_world`): Reunite with James York at the airport for the final grand narrative bookend, completing COSY Town's 12-chapter polyglot journey!

---

## Grand Achievements Summary (All 12 Chapters)

1. **Chapter 1**: `ach_welcome_town` (Welcome to COSY Town), `ach_first_introduction`, `ach_key_collector`, `ach_home_sweet_home`, `ach_ch1_first_steps`
2. **Chapter 2**: `ach_apartment_explorer`, `ach_object_finder`, `ach_home_organizer`, `ach_furniture_master`, `ach_ch2_master_home`
3. **Chapter 3**: `ach_morning_master`, `ach_schedule_tracker`, `ach_routine_habit_master`, `ach_early_riser`
4. **Chapter 4**: `ach_city_navigator` (Master Navigator)
5. **Chapter 5**: `ach_ch5_master_shopper` (Master Shopper)
6. **Chapter 6**: `ach_ch6_culinary_master` (Culinary Master)
7. **Chapter 7**: `ach_ch7_social_butterfly` (Social Butterfly)
8. **Chapter 8**: `ach_ch8_master_scholar` (Master Scholar)
9. **Chapter 9**: `ach_ch9_city_explorer` (City Explorer & Historian)
10. **Chapter 10**: `ach_ch10_nature_master` (Wildlife Explorer & Photographer)
11. **Chapter 11**: `ach_ch11_health_champion` (Health & Sports Champion)
12. **Chapter 12**: `ach_ch12_citizen_of_world` (Citizen of the World)
