# Chapter 2: My Home

## Overview
Chapter 2 ("My Home") immerses the player in exploring and organizing their new apartment home in COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player visits all 5 apartment rooms (Living Room, Kitchen, Bedroom, Bathroom, Balcony), interacts with household objects, learns colors and numbers through minigames, and collaborates with James York to organize furniture placement.

---

## Learning Goals & Communication Goals

### Learning Goal
The player explores their apartment and learns how to describe rooms, identify furniture and household objects, state item presence using existential placement (`There is` / `There are`), point out objects using demonstratives (`This` / `That`), and describe items using colors and numbers.

### Communication Goals
- **Existential Placement**: Identify single items (`There is a sofa`) and plural items (`There are two lamps`).
- **Demonstrative Pointing**: Distinguish nearby (`This is my desk`) and distant (`That is your bed`) objects.
- **Furniture & Room Identification**: Name rooms (`living room`, `kitchen`, `bedroom`, `bathroom`, `balcony`) and furniture (`sofa`, `table`, `chair`, `bed`, `desk`, `bookshelf`).
- **Describing Attributes**: Identify colors (`red`, `blue`, `green`, `yellow`, `white`, `black`) and quantities (`one`, `two`, `three`, `four`, `five`).

---

## Chapter Topology & Scenes (5 Scenes)

1. **Apartment Living Room** (`apartment_living`)
   - District: Residential District
   - Description: The central hub of the player's home featuring sofa, coffee table, television, bookshelf, lamp, window, and plant.
   - Hotspots: `key`, `door_lock`, `sofa`, `coffee_table`, `tv`, `bookshelf`, `lamp`, `window`, `plant`

2. **Apartment Kitchen** (`apartment_kitchen`)
   - District: Residential District
   - Description: The kitchen equipped with refrigerator, kettle, counter, and cups.
   - Hotspots: `fridge`, `kettle`, `cup`

3. **Apartment Bedroom** (`apartment_bedroom`)
   - District: Residential District
   - Description: The private bedroom featuring bed, study desk, lamp, bookshelf, window, plant, and alarm clock.
   - Hotspots: `bed`, `desk`, `lamp`, `bookshelf`, `window`, `plant`, `alarm_clock`

4. **Apartment Bathroom** (`apartment_bathroom`)
   - District: Residential District
   - Description: The bathroom containing towels, soap, vanity mirror, and window.
   - Hotspots: `towel`, `soap`, `bathroom_mirror`, `window`

5. **Apartment Balcony** (`apartment_balcony`)
   - District: Residential District
   - Description: The outdoor balcony overlook with balcony chair and potted balcony plants.
   - Hotspots: `balcony_chair`, `balcony_plant`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 2 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/james_york_apartment_living.json`: James York guiding living room furniture organization and existential placement.
- `data/dialogues/james_york_apartment_bedroom.json`: James York discussing bedroom items, demonstrative pointing, and alarm clock routines.
- `data/dialogues/james_york_apartment_kitchen.json`: James York organizing kitchen appliances, cups, and kettle.

---

## Vocabulary & Minigames

### Physical Hotspots (Household, Furniture & Electronics)
| Word | CEFR | Category | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- |
| `living room` | A0 | rooms | `sofa` | `apartment_living` |
| `kitchen` | A0 | rooms | `fridge` | `apartment_kitchen` |
| `bedroom` | A0 | rooms | `bed` | `apartment_bedroom` |
| `bathroom` | A0 | rooms | `towel` | `apartment_bathroom` |
| `balcony` | A0 | rooms | `balcony_chair` | `apartment_balcony` |
| `sofa` | A0 | furniture | `sofa` | `apartment_living` |
| `table` | A0 | furniture | `coffee_table` | `apartment_living` |
| `chair` | A0 | furniture | `balcony_chair` | `apartment_balcony` |
| `bed` | A0 | furniture | `bed` | `apartment_bedroom` |
| `desk` | A0 | furniture | `desk` | `apartment_bedroom` |
| `television` | A0 | electronics | `tv` | `apartment_living` |
| `lamp` | A0 | electronics | `lamp` | `apartment_living` |
| `fridge` | A0 | appliances | `fridge` | `apartment_kitchen` |
| `kettle` | A0 | appliances | `kettle` | `apartment_kitchen` |
| `towel` | A0 | household | `towel` | `apartment_bathroom` |
| `soap` | A0 | household | `soap` | `apartment_bathroom` |

### Abstract Concepts & Interactive Minigames (`data/minigames/minigames.json`)
- **Colors** (`red`, `blue`, `green`, `yellow`, `white`, `black`): Mastered through `mg_color_match_1` ("🎨 Name the Color Challenge").
- **Numbers** (`one`, `two`, `three`, `four`, `five`): Mastered through `mg_counting_1` ("🔢 Count the Objects Challenge").

---

## Grammar Concepts & Patterns

1. **`there is`** (`gt_there_is`): Singular existential placement (`There is a sofa in the living room`).
2. **`there are`** (`gt_there_are`): Plural existential placement (`There are two lamps on the desk`).
3. **`this`** (`gt_this`): Demonstrative for nearby objects (`This is my desk`).
4. **`that`** (`gt_that`): Demonstrative for distant objects (`That is a blue bed`).
5. **`my` / `your`** (`gt_my_your`): Possessive adjectives (`my sofa`, `your alarm clock`).

---

## Gameplay Quest Progression (4 Steps)

1. **Explore Every Room** (`q_ch2_explore_rooms`): Visit all 5 apartment rooms (living room, kitchen, bedroom, bathroom, balcony).
2. **Find and Interact with Objects** (`q_ch2_interact_objects`): Inspect household objects and electronics across the apartment.
3. **Help James Organize the Apartment** (`q_ch2_organize_apartment`): Converse with James York about furniture placement.
4. **Unlock Furniture Vocabulary** (`q_ch2_unlock_furniture`): Complete Chapter 2 and master furniture, colors, and numbers.

---

## Achievements

- `ach_apartment_explorer`: Apartment Explorer (Visit all five apartment rooms).
- `ach_object_finder`: Object Finder (Interact with objects in every room).
- `ach_home_organizer`: Home Organizer (Help James organize furniture).
- `ach_furniture_master`: Furniture Master (Master furniture, color, and number vocabulary).
- `ach_ch2_master_home`: Master of the House (Complete Chapter 2 end-to-end).
