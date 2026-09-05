# Chapter 7: Friends & Family

## Overview
Chapter 7 ("Friends & Family") introduces the player to social interactions, introducing friends and family members, expressing emotions and preferences (`like`, `love`, `hate`), inviting people to social gatherings, and using the Present Continuous tense (`I am walking in the park`, `She is drinking coffee`) across COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores social scenes (Conversation Corner, Picnic Area, Apartment Living Room, Café, Ella's Apartment, Anna's Apartment), meets neighbours Clara & Leo, builds friendship scores (0-100) with Ella Bronx and Anna to unlock gated dialogue invitations, and completes a social reunion quest chain.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to introduce friends and family members, express personal likes, loves, and dislikes (`like` / `love` / `hate`), make and accept social invitations (`Would you like to come?`), describe actions currently in progress using Present Continuous, and build friendship scores with town residents.

### Communication Goals
- **Introducing Friends & Family**: Introduce companions (`This is my friend Ella`, `This is my brother/sister`).
- **Expressing Preferences**: Express positive and negative preferences (`I love meeting friends`, `I hate being late`).
- **Social Invitations**: Extend and accept invitations (`Would you like to come to the picnic?`, `I would love to join you!`).
- **Present Continuous Actions**: Describe active situations (`I am practicing pronunciation`, `She is drinking coffee`).
- **Building Friendship**: Interact with NPCs to increase friendship scores (0-100 FP) and unlock gated dialogue branches.

---

## Chapter Topology & Scenes (6 Main Scenes)

1. **Conversation Corner** (`conversation_corner`)
   - District: Community Quarter
   - Description: A outdoor seating lounge for social gatherings and conversations.
   - Hotspots: `sofa`, `coffee_table`, `bookshelf`, `plant`, `window`
   - NPCs: `ella_bronx`, `anna`, `neighbour_clara`

2. **Picnic Area** (`picnic_area`)
   - District: Community Quarter
   - Description: A park picnic meadow under trees equipped with picnic blankets and benches.
   - Hotspots: `bench`, `plant`, `coffee_table`
   - NPCs: `anna`, `neighbour_leo`

3. **Apartment Living Room** (`apartment_living`)
   - District: Residential District
   - Description: The player's home living room for hosting friends and neighbours.
   - Hotspots: `sofa`, `coffee_table`, `tv`, `bookshelf`, `plant`
   - NPCs: `james_york`

4. **Café** (`cafe`)
   - District: City Centre
   - Description: The local café for social coffee breaks and casual chats.
   - Hotspots: `espresso_machine`, `coffee_cup`, `cappuccino`, `tea_pot`
   - NPCs: `marco_barista`

5. **Ella's Apartment** (`ella_apartment`)
   - District: Residential District
   - Description: Ella's vibrant living room decorated with study materials and plants.
   - Hotspots: `sofa`, `coffee_table`, `bookshelf`, `lamp`, `plant`
   - NPCs: `ella_bronx`

6. **Anna's Apartment** (`anna_apartment`)
   - District: Residential District
   - Description: Anna's modern apartment lounge.
   - Hotspots: `sofa`, `coffee_table`, `bookshelf`, `lamp`, `plant`
   - NPCs: `anna`

---

## NPCs & Neighbours

- **Ella Bronx** (`ella_bronx`): Pronunciation & Oral Interaction Specialist. Offers friendship-gated invitations at 20+ FP.
- **Anna** (`anna`): Friendly competitor. Introduces her family members and shares continuous learning activities at 20+ FP.
- **Neighbour Clara** (`neighbour_clara`): Apartment neighbour living in Apartment 102. Welcomes new residents and invites them to local gatherings.
- **Neighbour Leo** (`neighbour_leo`): Apartment neighbour who enjoys outdoor walks and park picnics with his family.

---

## Friendship & Relationship System

- Every NPC tracks a `friendshipPoints` (FP) score ranging from `0` to `100`.
- FP is increased by selecting positive dialogue choices (`friendshipGain: +10`) and completing NPC quests.
- Relationship Levels:
  - **0-19 FP**: Acquaintance
  - **20-49 FP**: Friend 😊 (Unlocks gated dialogue invitations)
  - **50-79 FP**: Good Friend 💛
  - **80-100 FP**: Best Friend ❤️
- Relationship levels and FP scores are persisted in `SaveManager` (`state.npcRelationships`) and surfaced in the **Friends HUD Tab**.

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 7 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/ella_bronx_town_square.json`: Ella Bronx discussing Present Continuous actions, expressing like/love/hate, and offering gated invitations at 20+ FP (`minFriendship: 20`).
- `data/dialogues/anna_town_square.json`: Anna studying vocabulary cards, expressing likes/hates, and introducing her family members at 20+ FP (`minFriendship: 20`).
- `data/dialogues/neighbour_clara_hallway.json`: Clara greeting neighbours in the hallway and extending social invitations.
- `data/dialogues/neighbour_leo_apartment_entrance.json`: Leo describing current continuous actions (`I am walking...`, `We are eating...`) and family outings.

---

## Grammar Concepts & Patterns

1. **`gt_present_continuous`**: Present Continuous Tense (`Subject + am/is/are + Verb-ing` — `I am drinking coffee`, `She is walking in the park`).
2. **`gt_likes`**: Expressing Preferences (`I like...`, `I love...`, `I hate...`).

---

## Gameplay Quest Progression (5 Steps)

1. **Meet Ella Bronx** (`q_convo_ella`): Converse with Ella Bronx in the Town Square.
2. **Speech Articulation Clinic** (`q_pronunciation_ella`): Practice aloud speech repetition with Ella Bronx.
3. **Meet Your Neighbours** (`q_ch7_meet_neighbours`): Introduce yourself to neighbour Clara and neighbour Leo in the hallway / entrance.
4. **Build Friendship with Ella & Anna** (`q_ch7_friendship_bond`): Build 20+ FP with Ella Bronx to unlock her gated dialogue invitation to the conversation corner.
5. **Family & Friends Reunion** (`q_ch7_family_reunion`): Meet Anna's visiting family and neighbours at the picnic area or conversation corner, completing Chapter 7!

---

## Achievements

- `ach_ch7_social_butterfly`: Social Butterfly (Meet neighbours Clara & Leo, build friendship levels with Ella & Anna, master Present Continuous, and complete Chapter 7).
