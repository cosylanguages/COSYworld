# Chapter 11: Health & Sports

## Overview
Chapter 11 ("Health & Sports") introduces the player to expressing health symptoms, body states, and physical needs (`I've got a headache`, `I feel sick`, `I need medicine`), visiting medical professionals, participating in sports activities, and practicing physical wellness across COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores Health & Sports Quarter scenes (Hospital, Doctor Office, Swimming Pool, Football Field, Basketball Court, Yoga Studio), interacts with medical tools and athletic equipment, practices `gt_have_got` and `gt_need_feel` grammar, and completes a fitness circuit and doctor consultation with Doctor Chloe.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to describe body symptoms and physical feelings using `have got`, `feel`, and `need`, communicate with healthcare providers, and engage in sports vocabulary across athletic venues.

### Communication Goals
- **Expressing Health Symptoms & Body States**: Describe physical ailments (`I've got a headache`, `You have got a slight fever`).
- **Expressing Feelings & Needs**: State internal feelings and requirements (`I feel sick`, `I need medicine and rest`).
- **Sports & Athletic Vocabulary**: Name sports equipment and venues (`football`, `swimming goggles`, `basketball hoop`, `yoga mat`, `swimming pool`, `football field`, `basketball court`, `yoga studio`).
- **Balancing Fitness & Wellness**: Participate in exercise circuits and relaxation stretches.

---

## Chapter Topology & Scenes (6 Main Scenes)

1. **Hospital** (`hospital`)
   - District: Health Quarter
   - Description: The community hospital lobby for medical consultations and checkups.
   - Hotspots: `thermometer_item`, `desk`, `chair`, `window`
   - NPCs: `doctor_chloe`

2. **Doctor Office** (`doctor_office`)
   - District: Health Quarter
   - Description: Doctor Chloe's private exam room outfitted with stethoscopes and examination tables.
   - Hotspots: `stethoscope_tool`, `desk`, `lamp`, `window`
   - NPCs: `doctor_chloe`

3. **Swimming Pool** (`swimming_pool`)
   - District: Sports Quarter
   - Description: An aquatic sports pool featuring swim lanes and swimming goggles.
   - Hotspots: `swimming_goggles`, `bench`, `window`
   - NPCs: None

4. **Football Field** (`football_field`)
   - District: Sports Quarter
   - Description: An outdoor athletic grass pitch for football matches.
   - Hotspots: `football_ball`, `bench`, `street_lamp`
   - NPCs: None

5. **Basketball Court** (`basketball_court`)
   - District: Sports Quarter
   - Description: A hardcourt basketball area with hoops and scoreboards.
   - Hotspots: `basketball_hoop`, `bench`, `window`
   - NPCs: None

6. **Yoga Studio** (`yoga_studio`)
   - District: Sports Quarter
   - Description: A tranquil wellness studio for stretching on yoga mats.
   - Hotspots: `yoga_mat_item`, `plant`, `window`
   - NPCs: None

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 11 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/doctor_chloe_hospital.json`: Doctor Chloe examining the player, taking temperatures with thermometers, diagnosing symptoms using `have got`, and offering prescriptions with `need` and `feel`.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `stethoscope` | A0 | item/medical | 0 | `stethoscope_tool` | `doctor_office` |
| `thermometer` | A0 | item/medical | 0 | `thermometer_item` | `hospital` |
| `football` | A0 | item/sports | 0 | `football_ball` | `football_field` |
| `goggles` | A0 | item/sports | 0 | `swimming_goggles` | `swimming_pool` |
| `basketball` | A0 | item/sports | 0 | `basketball_hoop` | `basketball_court` |
| `yoga mat` | A0 | item/wellness | 0 | `yoga_mat_item` | `yoga_studio` |

---

## Grammar Concepts & Patterns

1. **`gt_have_got`**: Possession & Symptoms (`I've got a headache`, `You have got a slight fever`).
2. **`gt_need_feel`**: Needs & Feelings (`I feel sick`, `I need medicine and rest`).

---

## Minigames

- `mg_sports_exercise_1`: **Sports & Fitness Circuit Challenge** (Complete your fitness circuit across the football field, swimming pool, and basketball court).

---

## Gameplay Quest Progression (3 Steps)

1. **Visit the Doctor & Express Feelings** (`q_ch11_doctor_visit`): Visit Doctor Chloe at the hospital and express health symptoms using `I've got...` and `I feel...`
2. **Sports & Fitness Circuit** (`q_ch11_sports_challenge`): Inspect sports equipment across football field, swimming pool, and basketball court.
3. **Master Health & Sports Champion** (`q_ch11_health_champion`): Visit the yoga studio to stretch on the yoga mat and complete Chapter 11!

---

## Achievements

- `ach_ch11_health_champion`: Health & Sports Champion (Visit Doctor Chloe, express health symptoms with Have got/Need/Feel, complete the sports circuit, and complete Chapter 11).
