# Chapter 1: Welcome to COSY Town

## Overview
Chapter 1 introduces the player to COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player arrives at the Town Entrance, follows mentor James York to COSYlanguages Headquarters, meets the Receptionist, completes their first introduction dialogue, collects their apartment key, and unlocks their apartment home.

---

## Learning Goals & Communication Goals

### Learning Goal
The player arrives in COSY Town and learns how to introduce themselves using target language structures in natural visual cause-and-effect context.

### Communication Goals
- **Greeting**: Say hello (`hello`) and goodbye (`goodbye`).
- **Introducing yourself**: State your identity (`I am...`).
- **Asking someone's name**: Inquire using possessive pronouns (`What is your name?`).
- **Saying your name**: Answer name queries (`My name is...`).

---

## Chapter Topology & Scenes (5 Scenes)

1. **Town Entrance** (`town_entrance`)
   - District: City Centre
   - Description: The arrival point into COSY Town featuring the Welcome Sign, Town Gate, and initial meeting spot with James York.
   - Hotspots: `welcome_sign`

2. **COSYlanguages Headquarters** (`cosylanguages_hq`)
   - District: Education Quarter
   - Description: The grand atrium of COSYlanguages HQ with educational displays and direct access to Reception.
   - Hotspots: `welcome_desk`

3. **Reception** (`reception`)
   - District: Education Quarter
   - Description: The reception desk where the player meets the Receptionist, introduces themselves, and receives their key.
   - Hotspots: `reception_desk`, `apartment_key`

4. **Hallway** (`hallway`)
   - District: Residential District
   - Description: The residential corridor leading from HQ towards apartment residences.
   - Hotspots: `hallway_light`, `door_number_101`, `hallway_carpet`

5. **Apartment Entrance** (`apartment_entrance`)
   - District: Residential District
   - Description: The entrance hallway outside Apartment #101 where the key unlocks the front door.
   - Hotspots: `apartment_door`

---

## NPCs & Daily Schedules

### 1. James York (`james_york`)
- **Role**: Explorer Mentor & Guide
- **Daily Schedule**:
  - `08:00` — `town_entrance`: Greeting arriving visitors at Town Entrance
  - `10:00` — `cosylanguages_hq`: Guiding students through HQ Atrium
  - `12:00` — `reception`: Assisting at Reception
  - `14:00` — `hallway`: Showing residents to Apartment Entrance
  - `16:00` — `apartment_living`: Mentoring new residents in Living Room

### 2. Receptionist (`receptionist`)
- **Role**: COSYlanguages HQ Receptionist
- **Daily Schedule**:
  - `08:00` — `reception`: Welcoming new students
  - `13:00` — `cafe`: Lunch break
  - `15:00` — `reception`: Managing student registrations

---

## Vocabulary (18 Target Items)

| Word | CEFR | Category | Scene Location |
| --- | --- | --- | --- |
| `hello` | A0 | social | `town_entrance` |
| `goodbye` | A0 | social | `town_entrance` |
| `yes` | A0 | social | `reception` |
| `no` | A0 | social | `reception` |
| `please` | A0 | social | `reception` |
| `thank you` | A0 | social | `reception` |
| `name` | A0 | identity | `reception` |
| `I` | A0 | pronoun | `reception` |
| `you` | A0 | pronoun | `reception` |
| `man` | A0 | people | `town_entrance` |
| `woman` | A0 | people | `reception` |
| `friend` | A0 | people | `town_entrance` |
| `teacher` | A0 | people | `cosylanguages_hq` |
| `door` | A0 | furniture/structure | `apartment_entrance` |
| `key` | A0 | tools/item | `reception` |
| `house` | A0 | places | `town_entrance` |
| `home` | A0 | places | `apartment_entrance` |

---

## Grammar Concepts & Patterns

1. **`to be`** (`gt_to_be`): Connecting subject and identity (`I am James`).
2. **`personal pronouns`** (`gt_personal_pronouns`): Pronouns `I`, `you`, `he`, `she`.
3. **`this is`** (`gt_this_is`): Demonstrative introductions (`This is COSYlanguages HQ`).
4. **`my` / `your`** (`gt_my_your`): Possessive adjectives (`my name`, `your key`).
5. **`articles (a/an)`** (`gt_articles`): Indefinite articles before consonant/vowel sounds (`a key`, `an apartment`).
6. **`greetings`** (`gt_greetings`): Combined greetings and imperative action commands.

---

## Gameplay Quest Progression (5 Steps)

1. **Follow James** (`q_ch1_follow_james`): Follow James York into COSYlanguages HQ.
2. **Meet the Receptionist** (`q_ch1_meet_receptionist`): Enter Reception and approach the receptionist.
3. **Complete Your First Dialogue** (`q_ch1_first_dialogue`): Converse with the receptionist and introduce yourself.
4. **Pick Up Your Key** (`q_ch1_pick_up_key`): Collect your apartment key from the reception desk.
5. **Open Your Apartment** (`q_ch1_open_apartment`): Walk through the hallway and unlock your apartment living room.

---

## Modular Achievements

- `ach_welcome_town`: Welcome to COSY Town (Arrive and follow James).
- `ach_first_introduction`: First Introductions (Introduce yourself to the receptionist).
- `ach_key_collector`: Key Holder (Pick up your apartment key).
- `ach_home_sweet_home`: Home Sweet Home (Unlock and enter your apartment).
