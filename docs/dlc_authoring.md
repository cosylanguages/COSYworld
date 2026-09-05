# DLC Authoring Guide

COSY World DLCs are folder-based packages. The base game can load a package at runtime with:

```js
await COSY_WORLD.loadDLCFolder('data/dlc/my_expansion');
```

## Required manifest

Create `data/dlc/my_expansion/manifest.json`:

```json
{
  "id": "dlc_my_expansion",
  "name": "My Expansion",
  "version": "1.0.0",
  "description": "A short description.",
  "districts": ["district.json"],
  "content": {
    "objects": ["objects.json"],
    "npcs": ["npcs.json"],
    "quests": ["quests.json"],
    "chapters": ["chapters.json"],
    "dialogues": [
      { "key": "new_npc_new_place", "path": "dialogues/new_npc_new_place.json" }
    ],
    "buildings": ["buildings.json"],
    "rooms": ["rooms.json"]
  }
}
```

`districts` remains supported for existing packages. The optional `content` block is the extension point for new places, vocabulary, NPCs, quests, chapters/levels, dialogues, buildings, and interiors.

## Extension rules

- Use globally unique IDs for districts, objects, NPCs, quests, and chapters. Collisions are rejected during loading.
- Add new scenes to `districts` and connect them with `connections` or `doors`.
- Give every new scene a `level` such as `A0`, `A1`, or `B1` and a local `backgroundImage` when available.
- Put every visible vocabulary item in the scene `objects` list and provide its coordinates in the shared object data so it becomes a hotspot.
- Add NPC profiles to `npcs`, their scene placement to `npcSpawns`, and dialogue trees to `content.dialogues`.
- Use a new chapter entry for a new campaign arc. Its `startQuestId` and `completionQuestId` define the progression boundary.
- Keep DLC assets inside the DLC folder; paths in the manifest are resolved relative to that folder.
- Do not place people in generated background images. NPCs are runtime entities so schedules, expressions, dialogue, and relationships remain interactive.

The loader emits `dlcLoaded` after the world package is registered and `dlcContentLoaded` after educational content is merged.