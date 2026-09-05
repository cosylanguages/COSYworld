# Chapter 1: Welcome to COSY Town

## Overview
Chapter 1 introduces the player to COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player arrives at the Town Entrance, follows mentor James York through COSYlanguages Headquarters, meets the Receptionist, completes their first introduction dialogue, collects their apartment key, walks down the hallway, and unlocks their apartment home.

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
   - Hotspots: `welcome_sign`, `street_lamp`, `signpost`, `welcome_arch`, `mailbox`, `cat`, `entrance_fountain`, `entrance_bench`, `dog`, `pigeons`, `trash_bin`, `bicycle_rack`, `bus_stop_shelter`, `parked_car`, `map_stand`, `flower_bed`, `tree`, `goodbye_sign`, `man_guide_sign`

2. **COSYlanguages Headquarters** (`cosylanguages_hq`)
   - District: Education Quarter
   - Description: The grand atrium of COSYlanguages HQ with educational displays and direct access to Reception.
   - Hotspots: `welcome_desk`, `hq_banner`, `language_chart`, `i_badge`, `teacher_desk`

3. **Reception** (`reception`)
   - District: Education Quarter
   - Description: The reception desk where the player meets the Receptionist, introduces themselves, and receives their key.
   - Hotspots: `reception_desk`, `apartment_key`, `sofa`, `reception_coffee_table`, `indoor_plant`, `reception_bookshelf`, `staircase`, `wall_clock`, `elevator`, `notice_board`, `coat_rack`, `umbrella_stand`, `backpack`, `reception_mat`, `yes_nod_card`, `no_sign`, `thank_you_banner`, `name_tag`, `you_badge`, `woman_reception_sign`

4. **Hallway** (`hallway`)
   - District: Residential District
   - Description: The residential corridor leading from HQ towards apartment residences.
   - Hotspots: `hallway_light`, `door_number_101`, `hallway_carpet`, `key`

5. **Apartment Entrance** (`apartment_entrance`)
   - District: Residential District
   - Description: The entrance hallway outside Apartment #101 where the key unlocks the front door.
   - Hotspots: `apartment_door`, `keyhole`, `welcome_mat`, `wall_mailboxes`, `bicycles`, `staircase`, `elevator`, `security_camera`, `apartment_door_number`, `coat_rack`, `shoe_rack`, `wicker_basket`, `key`, `home_mat`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 1 are stored as JSON files under `data/dialogues/` following the per-scene schema:

- `data/dialogues/james_york_town_entrance.json`: James York greeting & introduction at Town Entrance.
- `data/dialogues/james_york_cosylanguages_hq.json`: James York guiding the player through HQ Atrium.
- `data/dialogues/receptionist_reception.json`: Receptionist welcoming, asking name, and key handoff.
- `data/dialogues/james_york_reception.json`: James York assisting at Reception.
- `data/dialogues/james_york_hallway.json`: James York guiding down residential corridor.
- `data/dialogues/james_york_apartment_living.json`: James York welcoming the player into their new home.

---

## Vocabulary (17 Target Items)

| Word | CEFR | Category | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- |
| `hello` | A0 | social | `welcome_sign` | `town_entrance` |
| `goodbye` | A0 | social | `goodbye_sign` | `town_entrance` |
| `yes` | A0 | social | `yes_nod_card` | `reception` |
| `no` | A0 | social | `no_sign` | `reception` |
| `please` | A0 | social | `reception_desk` | `reception` |
| `thank you` | A0 | social | `thank_you_banner` | `reception` |
| `name` | A0 | identity | `name_tag` | `reception` |
| `I` | A0 | pronoun | `i_badge` | `cosylanguages_hq` |
| `you` | A0 | pronoun | `you_badge` | `reception` |
| `man` | A0 | people | `man_guide_sign` | `town_entrance` |
| `woman` | A0 | people | `woman_reception_sign` | `reception` |
| `friend` | A0 | people | `cat`, `dog` | `town_entrance` |
| `teacher` | A0 | people | `teacher_desk` | `cosylanguages_hq` |
| `door` | A0 | furniture/structure | `apartment_door` | `apartment_entrance` |
| `key` | A0 | tools/item | `apartment_key` | `reception` |
| `house` | A0 | places | `welcome_arch` | `town_entrance` |
| `home` | A0 | places | `home_mat` | `apartment_entrance` |

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

## Achievements

- `ach_welcome_town`: Welcome to COSY Town (Arrive and follow James).
- `ach_first_introduction`: First Introductions (Introduce yourself to the receptionist).
- `ach_key_collector`: Key Holder (Pick up your apartment key).
- `ach_home_sweet_home`: Home Sweet Home (Unlock and enter your apartment).
- `ach_ch1_first_steps`: First Steps (Complete Chapter 1 end-to-end).
