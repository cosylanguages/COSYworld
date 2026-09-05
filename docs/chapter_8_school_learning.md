# Chapter 8: School & Learning

## Overview
Chapter 8 ("School & Learning") introduces the player to school life, borrowing study materials, asking for help, practicing computer skills, and engaging in cooperative learning across COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores Education Quarter scenes (School Hall, School Library, Computer Lab, Language Classroom), interacts with classroom equipment and study supplies, practices modal verbs of ability and permission (`Can` / `Can't`), and completes a "Study Together" cooperative challenge with Ella Bronx and James York.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to express abilities and permissions using `can` and `can't`, ask for assistance, request to borrow books and study supplies, and collaborate with mentors in school settings.

### Communication Goals
- **Expressing Ability & Permission**: Express what you can or cannot do (`I can speak English`, `You can borrow books at the library`, `You can't make loud noise in the reading room`).
- **Asking for Assistance**: Ask teachers and classmates for help (`Can you help me find the textbook?`).
- **Borrowing & Studying**: Request study materials and use educational technology (`Can I borrow a dictionary?`, `I can use the computer terminal`).
- **Cooperative Teamwork**: Collaborate on study activities with Ella Bronx and James York (`James and I can study together with you!`).

---

## Chapter Topology & Scenes (4 Main Scenes)

1. **School Hall** (`school`)
   - District: Education Quarter
   - Description: The main atrium of COSY School connecting classrooms and offices.
   - Hotspots: `blackboard`, `student_desk`, `window`, `lamp`
   - NPCs: `ella_bronx`, `james_york`

2. **School Library** (`school_library`)
   - District: Education Quarter
   - Description: A quiet reading room with card catalogs, world globes, and bookshelves.
   - Hotspots: `globe`, `novel_stack`, `dictionary_book`, `bookshelf`, `desk`
   - NPCs: `ella_bronx`

3. **Computer Lab** (`computer_lab`)
   - District: Education Quarter
   - Description: A technology room equipped with computer terminals and study desks.
   - Hotspots: `computer_terminal`, `desk`, `lamp`, `chair`
   - NPCs: `james_york`

4. **Language Classroom** (`language_classroom`)
   - District: Education Quarter
   - Description: Teacher Ella Bronx's language classroom outfitted with pencil cases, desks, and study boards.
   - Hotspots: `pencil_case`, `desk`, `bookshelf`, `window`, `lamp`
   - NPCs: `ella_bronx`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 8 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/ella_bronx_school.json`: Teacher Ella Bronx introducing classroom activities, explaining library rules with `can` and `can't`, offering textbook borrowing help, and organizing cooperative study sessions with James York.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `blackboard` | A0 | structure/school | 0 | `blackboard` | `school` |
| `desk` | A0 | furniture/school | 0 | `student_desk` | `school` |
| `globe` | A0 | item/school | 0 | `globe` | `school_library` |
| `computer` | A0 | appliance/tech | 0 | `computer_terminal` | `computer_lab` |
| `pencil case` | A0 | item/stationery | 0 | `pencil_case` | `language_classroom` |
| `dictionary` | A0 | item/book | 20 | `dictionary_book` | `school_library` |
| `notebook` | A0 | item/stationery | 5 | `paper_notebook` | `school_library` |

---

## Grammar Concepts & Patterns

1. **`gt_can_cant`**: Modal Verbs `Can` & `Can't` (`Subject + can/can't + Base Verb` — `I can find the book`, `You can't make noise`).

---

## Minigames

- `mg_study_together_1`: **Study Together Cooperative Challenge** (Cooperate with Ella Bronx and James York in the school library using 'Can' and 'Can't' to solve grammar questions).

---

## Gameplay Quest Progression (3 Steps)

1. **School & Classroom Tour** (`q_ch8_school_tour`): Explore the school hall and inspect the blackboard in the Education Quarter.
2. **Borrow Books & Computer Study** (`q_ch8_borrow_books`): Visit the school library to inspect textbooks and practice on the computer terminal.
3. **Study Together with Ella & James** (`q_ch8_study_together`): Cooperate with Teacher Ella Bronx and James York in the language classroom to complete Chapter 8!

---

## Achievements

- `ach_ch8_master_scholar`: Master Scholar (Tour the school and library, master Can and Can't modal verbs, study together with Ella & James, and complete Chapter 8).
