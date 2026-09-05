# Chapter 3: Daily Life

## Overview
Chapter 3 ("Daily Life") immerses the player in describing daily routines, telling time, identifying times of day, and using adverbs of frequency in COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player completes a sequential morning routine in their apartment home (waking up, washing, eating, getting dressed, leaving), explores the street schedule with mentor James York, and interacts with commuter Sam at the bus stop to master telling time and daily habit expressions.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to express daily actions, tell the time, identify parts of the day, and describe the frequency of habits using present simple structures and adverbs of frequency in direct visual cause-and-effect contexts.

### Communication Goals
- **Expressing Routine Actions**: State daily habits (`wake up`, `brush`, `wash`, `eat`, `drink`, `cook`, `dress`, `work`, `study`, `sleep`).
- **Telling Time & Times of Day**: Inquire and state time (`What time is it? It is eight o'clock in the morning`) and distinguish times of day (`morning`, `afternoon`, `evening`).
- **Describing Frequency**: Express habit frequency using adverbs (`always`, `usually`, `never`).

---

## Chapter Topology & Scenes (5 Scenes)

1. **Apartment Bedroom** (`apartment_bedroom`)
   - District: Residential District
   - Description: The private bedroom where the player wakes up, studies at their desk, and checks the alarm clock.
   - Hotspots: `bed`, `desk`, `lamp`, `bookshelf`, `window`, `plant`, `alarm_clock`, `wake_up`, `sleep`, `study`, `morning`, `clock`

2. **Apartment Bathroom** (`apartment_bathroom`)
   - District: Residential District
   - Description: The bathroom area for morning hygiene routines such as brushing teeth and washing face.
   - Hotspots: `towel`, `soap`, `bathroom_mirror`, `window`, `brush`, `wash`

3. **Apartment Kitchen** (`apartment_kitchen`)
   - District: Residential District
   - Description: The kitchen equipped with refrigerator and kettle for cooking breakfast and enjoying beverages.
   - Hotspots: `fridge`, `kettle`, `cup`, `cook`, `eat`, `drink`

4. **Street / City Avenue** (`street`)
   - District: City Centre
   - Description: The urban street featuring the street clock where James York discusses daily schedules and habit frequency.
   - Hotspots: `street_clock`, `street_lamp`, `work`, `afternoon`

5. **Bus Stop** (`bus_stop`)
   - District: City Centre
   - Description: The transit shelter featuring bus stop signs, timetable boards, and commuter Sam asking for the time.
   - Hotspots: `bus_stop_sign`, `bus_timetable_board`, `evening`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 3 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/james_york_apartment_bedroom.json`: James York introducing bedroom layout and alarm clock routine.
- `data/dialogues/james_york_street.json`: James York discussing daily routines, time of day, and adverbs of frequency (`always`, `usually`, `never`).
- `data/dialogues/commuter_sam_bus_stop.json`: Sam the Commuter at the bus stop asking the time, reading the schedule, and practicing frequency expressions.

---

## Vocabulary & Interactive Action Chains

### Routine Actions & Verbs
| Action | CEFR | Category | Hotspot Object | Scene Location | Action Chain Next |
| --- | --- | --- | --- | --- | --- |
| `wake up` | A0 | actions | `wake_up` | `apartment_bedroom` | `wash` |
| `brush` | A0 | actions | `brush` | `apartment_bathroom` | `wash` |
| `wash` | A0 | actions | `wash` | `apartment_bathroom` | `towel` |
| `cook` | A0 | actions | `cook` | `apartment_kitchen` | `eat` |
| `eat` | A0 | actions | `eat` | `apartment_kitchen` | `drink` |
| `drink` | A0 | actions | `drink` | `apartment_kitchen` | `kettle` |
| `dress` | A0 | actions | `dress` / `coat_rack` | `apartment_entrance` | `apartment_door` |
| `work` | A1 | actions | `work` | `street` | `bus_stop_sign` |
| `study` | A1 | actions | `study` | `apartment_bedroom` | `desk` |
| `sleep` | A0 | actions | `sleep` | `apartment_bedroom` | `bed` |

### Time & Frequency Vocabulary
| Word | CEFR | Category | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- |
| `clock` | A0 | time | `alarm_clock`, `street_clock`, `clock` | `apartment_bedroom`, `street` |
| `morning` | A0 | time | `morning`, `alarm_clock` | `apartment_bedroom` |
| `afternoon` | A0 | time | `afternoon`, `street_clock` | `street` |
| `evening` | A0 | time | `evening`, `bus_timetable_board` | `bus_stop` |
| `always` | A1 | frequency | `james_york`, `commuter_sam` | `street`, `bus_stop` |
| `usually` | A1 | frequency | `james_york`, `commuter_sam` | `street`, `bus_stop` |
| `never` | A1 | frequency | `james_york`, `commuter_sam` | `street`, `bus_stop` |

---

## Grammar Concepts & Patterns

1. **`present simple`** (`gt_present_simple`): Expressing habit and routine actions (`I wake up at seven o'clock`, `I eat breakfast`).
2. **`time`** (`gt_time`): Inquiring and stating time (`What time is it? It is eight o'clock in the morning`).
3. **`frequency`** (`gt_frequency`): Positioning adverbs of frequency (`I always wake up early`, `I usually take the bus`, `I never miss work`).

---

## Gameplay Quest Progression (3 Steps)

1. **Complete Your Morning Routine** (`q_ch3_morning_routine`): Complete the full morning routine in sequence: wake up (`wake_up`) → wash (`wash`) → eat (`eat`) → dress (`dress`) → leave (`apartment_door`).
2. **Follow a Daily Schedule** (`q_ch3_daily_schedule`): Step out onto the street, check the street clock, and discuss daily work routines with James York.
3. **Unlock Routine Achievements** (`q_ch3_unlock_routine`): Travel to the bus stop, check bus schedules with Sam the Commuter, and master frequency adverbs.

---

## Achievements

- `ach_morning_master`: Early Bird (Complete full morning routine).
- `ach_early_riser`: Early Riser (Complete the sequential morning routine in order: wake up, wash, eat, dress, leave).
- `ach_schedule_tracker`: Schedule Tracker (Follow a daily schedule across town and tell the time).
- `ach_routine_habit_master`: Habit Master (Master routine verbs, time, and adverbs of frequency in Chapter 3).
