# Standardized Branching Dialogue-Tree Schema

## Overview
This document defines the standardized JSON schema for per-scene, per-NPC dialogue trees in COSY World. Each dialogue file represents the interactive dialogue tree between a specific Non-Player Character (NPC) and the player in a given scene/location.

Dialogue trees are stored under `data/dialogues/` using the naming convention:
`data/dialogues/<npcId>_<sceneId>.json`

Example files:
- `data/dialogues/james_york_town_entrance.json`
- `data/dialogues/receptionist_reception.json`
- `data/dialogues/james_york_apartment_living.json`

---

## File Structure

The root JSON object represents a dialogue tree for a specific NPC in a specific scene.

```json
{
  "npcId": "james_york",
  "sceneId": "town_entrance",
  "initialNodeId": "node_0",
  "nodes": [
    {
      "id": "node_0",
      "npcLine": "Hello! Welcome to COSY Town. I am James York.",
      "emotion": "happy",
      "gestures": ["wave", "point_hq"],
      "highlights": ["welcome_sign"],
      "speechRate": 0.65,
      "grammarCheck": "Subject + Verb + Identity ('I am James')",
      "visualAction": "👋 Welcome",
      "playerOptions": [
        {
          "text": "👋 Hello James! Glad to be here.",
          "nextNodeId": "node_1",
          "vocabId": "hello",
          "grammarId": "gt_to_be",
          "rewardXP": 15,
          "friendshipGain": 10,
          "rewardQuestId": "q_ch1_follow_james"
        }
      ],
      "endConditions": null,
      "rewardQuestId": null
    }
  ]
}
```

---

## Schema Field Reference

### Root Object

| Field | Type | Description |
|---|---|---|
| `npcId` | `string` | Unique identifier matching the NPC ID in `data/npcs/npcs.json`. |
| `sceneId` | `string` | District or scene location ID matching `data/scenes/districts.json`. |
| `initialNodeId` | `string` | Node ID where the dialogue session starts. Defaults to the first node's `id`. |
| `nodes` | `array` | Array of branching dialogue nodes. |

### Dialogue Node Object (`nodes[]`)

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique node identifier within this dialogue file (e.g. `"node_0"`, `"welcome_start"`). |
| `npcLine` | `string` | The dialogue text spoken or displayed by the NPC. |
| `emotion` | `string` (optional) | Expression or portrait emotion state (`"happy"`, `"excited"`, `"curious"`, `"busy"`, `"neutral"`). |
| `gestures` | `array<string>` (optional) | Visual gesture tags (e.g., `["wave"]`). |
| `highlights` | `array<string>` (optional) | Scene hotspot objects highlighted during speech. |
| `speechRate` | `number` (optional) | Playback rate for speech synthesis (default: `1.0`, beginner: `0.65`-`0.8`). |
| `grammarCheck` | `string` (optional) | Brief description of the grammar rule being demonstrated. |
| `visualAction` | `string` (optional) | Visual emoji or icon cue displayed alongside speech. |
| `playerOptions` | `array<Option>` | Choices available to the player. |
| `endConditions` | `object` \| `null` | Optional termination or state requirements (e.g. `{ "questCompleted": "q_ch1_follow_james" }`). |
| `rewardQuestId` | `string` \| `null` | Optional Quest ID completed or triggered upon reaching this node. |

### Player Option Object (`playerOptions[]`)

| Field | Type | Description |
|---|---|---|
| `text` | `string` | Option button label displayed to the player. |
| `nextNodeId` | `string` \| `null` | Target node ID to navigate to next, or `null` to close/end dialogue. |
| `vocabId` | `string` (optional) | Associated vocabulary item ID mastered or reviewed by picking this option. |
| `grammarId` | `string` (optional) | Associated grammar pattern ID exercised by picking this option. |
| `rewardXP` | `number` (optional) | XP points awarded to the player upon selecting this option. |
| `friendshipGain` | `number` (optional) | Friendship/relationship points added with the NPC. |
| `rewardQuestId` | `string` (optional) | Quest ID triggered or completed upon selecting this option. |

---

## Loading and Integration

1. **Preloading / Discovery**: Dialogue files are located under `data/dialogues/` as `<npcId>_<sceneId>.json`.
2. **Runtime Loading**: `DialogueManager` loads dialogue trees dynamically when a player interacts with an NPC in a scene, falling back gracefully if a scene-specific file does not exist.
