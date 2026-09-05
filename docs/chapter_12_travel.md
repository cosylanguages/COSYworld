# Chapter 12: Travel

## Overview

The finale takes the learner from COSY Town into the wider world. Diana Voyager supports the player at the airport, hotel, and tourist office, while the train station remains shared with Chapter 9. The chapter closes the loop with the arrival introduced by James York in Chapter 1.

## Learning Goals

- Use `gt_going_to_future` to describe plans and destinations.
- Ask for travel information, book a room, check in, and buy tickets.
- Recognize travel vocabulary: passport, luggage, ticket, gate, hotel, map, and reception.
- Prepare luggage and complete a first-journey exploration chain.

## Chapter Topology & Scenes

- `airport`: check-in desk, passport, luggage, and flight ticket hotspots.
- `hotel`: hotel reception and hotel key hotspots.
- `tourist_office`: information desk and tourist map hotspots.
- `train_station`: shared Chapter 9 and Chapter 12 transport hub.

The existing world map connects these scenes to the transport and city districts. No duplicate travel districts are created.

## NPCs & Daily Schedules

- `diana_voyager`: Chapter 12 travel and exploration specialist. Her Chapter 12 spawns are in `airport`, `hotel`, and `tourist_office`; she also appears at the shared train station and earlier city scenes as a recurring character.

## Dialogue Files

- `data/dialogues/diana_voyager_airport.json`
- `data/dialogues/diana_voyager_hotel.json`
- `data/dialogues/diana_voyager_tourist_office.json`

Each file follows the branching schema in `docs/dialogue_schema.md`. Dialogue text remains in the target language; translations belong in vocabulary data and Translation Mode.

## Progression

1. Complete `q_ch12_prepare_luggage` using `mg_prepare_luggage_1`.
2. Complete `q_ch12_first_journey` at the airport check-in hotspot.
3. Unlock `ach_ch12_world_traveler` after the final quest and the prior chapter completion achievements.
