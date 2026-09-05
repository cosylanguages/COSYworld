# Chapter 4: My Neighbourhood

## Overview
Chapter 4 ("My Neighbourhood") introduces the player to navigating their local neighbourhood in COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores 6 neighbourhood scenes (Street, Bus Stop, Bakery, Pharmacy, Crosswalk, Post Office), interacts with street furniture and direction signs, practices imperative commands (`go`, `turn left`, `turn right`) and prepositions of place (`next to`, `behind`, `between`), and gives directions to traveler Diana Voyager to unlock the interactive City Map system.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to give and ask for directions, navigate street intersections using imperative verbs, and locate neighbourhood places using prepositions of place in direct visual cause-and-effect contexts.

### Communication Goals
- **Giving Directions**: Instruct movement using imperative commands (`go straight`, `turn left`, `turn right`).
- **Describing Spatial Relations**: Express relative locations using prepositions (`next to the crosswalk`, `behind the pharmacy`, `between the cafe and town square`).
- **Identifying Places & Street Furniture**: Name neighbourhood landmarks (`bakery`, `pharmacy`, `crosswalk`, `post office`, `traffic light`, `direction sign`, `post box`).

---

## Chapter Topology & Scenes (6 Scenes)

1. **Street / City Avenue** (`street`)
   - District: City Centre
   - Description: The central neighbourhood thoroughfare connecting Town Square and Bus Stop.
   - Hotspots: `street_clock`, `street_lamp`, `work`, `afternoon`, `direction_sign`

2. **Bus Stop** (`bus_stop`)
   - District: City Centre
   - Description: The transit shelter featuring bus stop signs, timetable boards, and commuter Sam.
   - Hotspots: `bus_stop_sign`, `bus_timetable_board`, `evening`, `bench`

3. **Bakery** (`bakery`)
   - District: City Centre
   - Description: Lucas's artisan bakery displaying fresh baguettes, croissants, and baking ovens.
   - Hotspots: `baguette`, `croissant`, `oven`

4. **Pharmacy** (`pharmacy`)
   - District: City Centre
   - Description: The local health pharmacy with pharmacy counter, medicine shelves, and first aid kits.
   - Hotspots: `pharmacy_counter`, `medicine_shelf`, `first_aid_box`, `window`, `plant`, `lamp`

5. **Crosswalk** (`crosswalk`)
   - District: City Centre
   - Description: The pedestrian crossing intersection with traffic lights, direction signs, crosswalk stripes, and Diana Voyager.
   - Hotspots: `crosswalk_stripes`, `traffic_light`, `direction_sign`, `street_lamp`, `bench`

6. **Post Office** (`post_office`)
   - District: City Centre
   - Description: The community post office featuring post boxes, postage stamps, and service counter.
   - Hotspots: `post_box`, `stamps`, `post_counter`, `desk`, `bookshelf`, `lamp`, `window`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 4 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/james_york_street.json`: James York discussing street navigation, time, and routine frequency.
- `data/dialogues/commuter_sam_bus_stop.json`: Sam the Commuter asking the time and checking bus schedules.
- `data/dialogues/diana_voyager_crosswalk.json`: Diana Voyager requesting directions to the bakery at the crosswalk using imperatives and prepositions.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- |
| `crosswalk` | A0 | transport/structure | `crosswalk_stripes` | `crosswalk` |
| `traffic light` | A0 | transport/appliance | `traffic_light` | `crosswalk` |
| `direction sign` | A0 | directions/structure | `direction_sign` | `crosswalk`, `street` |
| `post office` | A0 | places/building | `post_counter` | `post_office` |
| `post box` | A0 | structure/street furniture | `post_box` | `post_office` |
| `stamps` | A0 | item | `stamps` | `post_office` |
| `pharmacy` | A0 | places/building | `pharmacy_counter` | `pharmacy` |
| `medicine` | A0 | household/health | `medicine_shelf` | `pharmacy` |
| `first aid` | A0 | item | `first_aid_box` | `pharmacy` |
| `oven` | A0 | appliance | `oven` | `bakery` |
| `go` | A0 | imperatives/actions | `direction_sign` | `crosswalk` |
| `turn left` | A1 | imperatives/directions | `direction_sign` | `crosswalk` |
| `turn right` | A1 | imperatives/directions | `direction_sign` | `crosswalk` |
| `next to` | A1 | prepositions | `direction_sign`, `diana_voyager` | `crosswalk` |
| `behind` | A1 | prepositions | `direction_sign`, `diana_voyager` | `crosswalk` |
| `between` | A1 | prepositions | `direction_sign`, `diana_voyager` | `crosswalk` |

---

## Grammar Concepts & Patterns

1. **`imperatives`** (`gt_imperatives`): Giving directional commands (`Go straight`, `Turn left`, `Turn right`).
2. **`prepositions of place`** (`gt_prepositions`): Stating relative positions (`next to the crosswalk`, `behind the pharmacy`, `between the cafe and town square`).

---

## Gameplay Quest Progression (3 Steps)

1. **Master Imperatives** (`q_grammar_imperative`): Complete the interactive imperative grammar exercise.
2. **Give Directions to the Bakery** (`q_directions_bakery`): Meet Diana Voyager at the crosswalk, give directions using imperatives and prepositions, and unlock the **City Map** feature!
3. **City Map Navigator** (`q_ch4_city_map_master`): Use the interactive World Map to navigate between neighbourhood places and complete Chapter 4.

---

## Achievements

- `ach_city_navigator`: Master Navigator (Give directions using imperatives and prepositions to unlock the interactive City Map).
