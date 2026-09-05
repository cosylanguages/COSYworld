# Chapter 2: My Home

## Overview
Chapter 2 continues the player's journey in COSY Town within their newly unlocked apartment under a Monolingual Learning Architecture without bilingual translations or cards. The player explores five distinct apartment rooms (Living room, Kitchen, Bedroom, Bathroom, Balcony), interacts with household items, helps James York organize the home, and masters essential home vocabulary and demonstrative grammar.

---

## Scenes & Room Topology (5 Scenes)

1. **Living Room** (`apartment_living`)
   - District: Residential District
   - Features: Sofa, coffee table, television, bookshelf, lamp.
   - Connected doors: Kitchen, Bedroom, Bathroom, Town Square, Apartment Entrance.

2. **Kitchen** (`apartment_kitchen`)
   - District: Residential District
   - Features: Refrigerator, kettle, cups.
   - Connected doors: Living Room.

3. **Bedroom** (`apartment_bedroom`)
   - District: Residential District
   - Features: Bed, desk, lamp, bookshelf.
   - Connected doors: Living Room, Balcony.

4. **Bathroom** (`apartment_bathroom`)
   - District: Residential District
   - Features: Towel, soap, vanity mirror.
   - Connected doors: Living Room.

5. **Balcony** (`apartment_balcony`)
   - District: Residential District
   - Features: Balcony chair, balcony plant.
   - Connected doors: Bedroom.

---

## Vocabulary Categories

### 1. Rooms
- `living room`, `kitchen`, `bedroom`, `bathroom`, `balcony`

### 2. Furniture
- `sofa`, `table`, `chair`, `bed`, `desk`

### 3. Electronics
- `television`, `lamp`, `fridge`, `kettle`

### 4. Household Objects
- `towel`, `soap`, `cup`, `key`

### 5. Colors
- `red`, `blue`, `green`, `yellow`, `white`, `black`

### 6. Numbers
- `one`, `two`, `three`, `four`, `five`

---

## Grammar Concepts & Patterns

1. **`There is`** (`gt_there_is`): Pointing out singular items (`There is a sofa in the living room`).
2. **`There are`** (`gt_there_are`): Pointing out plural items or quantities (`There are two lamps`).
3. **`This`** (`gt_this`): Demonstrative pronoun for near singular items (`This is my desk`).
4. **`That`** (`gt_that`): Demonstrative pronoun for distant singular items (`That is a blue bed`).
5. **`Possessive adjectives`** (`gt_my_your`): Showing ownership (`my home`, `your room`).

---

## Communication Goals

- **Describe your room**: Identify objects and colors (`There is a red sofa in the living room`).
- **Find objects**: Locate items using visual clues (`Where is the desk?`).
- **Ask where something is**: Inquire about item placement (`Where is the key?`).

---

## Gameplay Quest Progression (4 Steps)

1. **Explore Every Room** (`q_ch2_explore_rooms`): Visit living room, kitchen, bedroom, bathroom, and balcony.
2. **Find & Interact with Objects** (`q_ch2_interact_objects`): Discover and interact with electronics and household items across all rooms.
3. **Help James Organize the Apartment** (`q_ch2_organize_apartment`): Converse with James York and organize furniture and room layout.
4. **Unlock Furniture Vocabulary** (`q_ch2_unlock_furniture`): Inspect balcony furniture to master furniture, numbers, and demonstrative grammar.

---

## Modular Achievements

- `ach_apartment_explorer`: Apartment Explorer (Explore all 5 rooms).
- `ach_object_finder`: Object Finder (Interact with objects in every room).
- `ach_home_organizer`: Home Organizer (Help James organize the apartment).
- `ach_furniture_master`: Furniture Master (Master furniture, color, and number vocabulary).
