# Chapter 9: Exploring the City

## Overview
Chapter 9 ("Exploring the City") introduces the player to navigating civic and cultural landmarks across COSY Town, purchasing admission tickets using coins, asking about opening hours, and sharing past simple travel stories under a Monolingual Learning Architecture without bilingual translations or cards. The player explores Civic & Transport Quarter scenes (Museum, Cinema, Town Hall, Train Station, School Library), interacts with tickets, statue exhibits, movie posters, town archives, and train departure boards, practices Past Simple verbs (`visited`, `opened`, `arrived`) and past time expressions (`yesterday`, `two hours ago`, `50 years ago`), and interacts with Oliver the Ticket Clerk and recurring voyager Diana Voyager.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to purchase admission tickets with coins, inquire about operating schedules and opening hours, talk about historic city landmarks, and recount past travel experiences using the Past Simple tense and past time expressions.

### Communication Goals
- **Purchasing Admission Tickets**: Buy tickets for cultural venues with coins (`I will buy a museum ticket, please`).
- **Inquiring About Hours**: Ask operating hours and schedules (`Opening hours are 9:00 to 18:00`).
- **Narrating Past Travels**: Recount past visits using Past Simple (`Yesterday I visited the town hall archives`, `She arrived on the morning train`).
- **Using Time Expressions**: Specify past time frames (`yesterday`, `two hours ago`, `50 years ago`, `last night`).

---

## Chapter Topology & Scenes (5 Main Scenes)

1. **Museum** (`museum`)
   - District: Civic Quarter
   - Description: The historic town museum featuring sculpture exhibits and ticket counter.
   - Hotspots: `museum_ticket`, `sculpture_statue`, `bench`, `window`
   - NPCs: `ticket_clerk_oliver`

2. **Cinema** (`cinema`)
   - District: Civic Quarter
   - Description: The community cinema box office displaying movie posters and film tickets.
   - Hotspots: `cinema_ticket`, `movie_poster`, `lamp`, `window`
   - NPCs: `ticket_clerk_oliver`

3. **Town Hall** (`town_hall`)
   - District: Civic Quarter
   - Description: The municipal building storing historic archives and city records.
   - Hotspots: `town_archive_book`, `desk`, `lamp`, `window`
   - NPCs: `diana_voyager`

4. **Train Station** (`train_station`)
   - District: Transport Quarter
   - Description: The central railway concourse featuring travel ticket counters and train departure boards.
   - Hotspots: `train_ticket`, `train_schedule_board`, `bench`, `window`
   - NPCs: `ticket_clerk_oliver`, `diana_voyager`

5. **School Library** (`school_library`)
   - District: Education Quarter
   - Description: Reused learning center for historical reference books and city maps.
   - Hotspots: `globe`, `novel_stack`, `dictionary_book`, `bookshelf`, `desk`
   - NPCs: `ella_bronx`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 9 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/ticket_clerk_oliver_museum.json`: Oliver the ticket clerk explaining opening hours, selling admission tickets, and narrating town history using Past Simple (`The town hall opened in 1895`).
- `data/dialogues/diana_voyager_town_hall.json`: Recurring voyager Diana Voyager sharing her travel experiences using Past Simple and past time expressions (`Yesterday I arrived on the morning train`, `Two hours ago I visited the archives`).

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `museum ticket` | A0 | item/ticket | 15 | `museum_ticket` | `museum` |
| `statue` | A0 | structure/art | 0 | `sculpture_statue` | `museum` |
| `cinema ticket` | A0 | item/ticket | 12 | `cinema_ticket` | `cinema` |
| `movie poster` | A0 | structure/art | 0 | `movie_poster` | `cinema` |
| `town archive` | A0 | item/history | 0 | `town_archive_book` | `town_hall` |
| `train ticket` | A0 | item/travel | 20 | `train_ticket` | `train_station` |
| `timetable board` | A0 | structure/travel | 0 | `train_schedule_board` | `train_station` |

---

## Landmarks Discovered System

- Tracks visited landmark scenes (`museum`, `cinema`, `town_hall`, `train_station`, `school_library`) in `SaveManager` (`state.discoveredLandmarks`).

---

## Grammar Concepts & Patterns

1. **`gt_past_simple`**: Past Simple Tense (`Subject + Verb-ed / Irregular Past` — `I visited the museum`, `She arrived yesterday`).
2. **`gt_time_expressions`**: Past Time Expressions (`yesterday`, `two hours ago`, `last night`, `50 years ago`).

---

## Gameplay Quest Progression (3 Steps)

1. **Buy City Admission Tickets** (`q_ch9_buy_tickets`): Buy admission tickets for the museum or cinema using coins from Oliver the ticket clerk.
2. **Discover City Landmarks** (`q_ch9_visit_landmarks`): Explore civic landmarks across town (museum, cinema, town hall, and train station).
3. **Master City Historian** (`q_ch9_city_historian`): Share past travel experiences using Past Simple and Past Time Expressions with Diana Voyager to complete Chapter 9!

---

## Achievements

- `ach_ch9_city_explorer`: City Explorer & Historian (Buy admission tickets, discover historic civic landmarks, master Past Simple and time expressions, and complete Chapter 9).
