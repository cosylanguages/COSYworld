# Chapter 6: Café & Restaurant

## Overview
Chapter 6 ("Café & Restaurant") introduces the player to ordering food and beverages, understanding restaurant menus, listening to chef recommendations, and performing server/waiter role-play across COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores 3 hospitality scenes (Café, Restaurant, and Outdoor Terrace), interacts with food, drink, cutlery, and menu hotspots, practices polite requests (`I would like...`, `Can I have...`), unlocks collectible culinary recipes, and completes a server role-play challenge with Marco the Barista and Dylan the Executive Chef.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to place polite orders for food and beverages, ask for dish recommendations, read restaurant menus, and engage in both customer and server/waiter roles in dining contexts.

### Communication Goals
- **Polite Ordering**: Place food and drink orders using polite modal forms (`I would like an espresso, please`, `Can I have the artisan pasta plate?`).
- **Inquiring About Recommendations**: Ask for daily chef specials (`What dishes do you recommend today?`).
- **Server Role-Play**: Act as a waiter/server taking and fulfilling NPC orders (`One warm vegetable soup coming right up!`).
- **Culinary Vocabulary**: Identify dining items (`menu`, `espresso`, `cappuccino`, `tea pot`, `soup`, `pasta`, `cutlery`, `terrace table`, `dessert cake`).

---

## Chapter Topology & Scenes (3 Scenes)

1. **Café** (`cafe`)
   - District: City Centre
   - Description: A bustling coffee bar equipped with an espresso machine, coffee cups, cappuccinos, tea pots, and menu cards.
   - Hotspots: `espresso_machine`, `coffee_cup`, `cappuccino`, `tea_pot`, `menu_card`
   - NPCs: `marco_barista`

2. **Restaurant** (`restaurant`)
   - District: City Centre
   - Description: Chef Dylan's elegant dining room featuring soup bowls, pasta plates, cutlery sets, and restaurant menus.
   - Hotspots: `soup_bowl`, `pasta_plate`, `menu_card`, `cutlery_set`, `coffee_table`
   - NPCs: `dylan_chef`

3. **Outdoor Terrace** (`outdoor_terrace`)
   - District: City Centre
   - Description: An open-air dining patio connecting the Café and Restaurant, with terrace tables, sun parasols, and dessert cakes.
   - Hotspots: `terrace_table`, `terrace_umbrella`, `dessert_cake`, `coffee_cup`, `cutlery_set`
   - NPCs: `marco_barista`, `dylan_chef`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 6 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/marco_barista_cafe.json`: Marco the Barista greeting customers, taking drink orders using `Would like` / `Can I have...`, offering cake pairings, and inviting the player to play server.
- `data/dialogues/dylan_chef_restaurant.json`: Chef Dylan recommending daily specials (vegetable soup, handmade pasta), confirming orders, and directing server tasks.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `espresso` | A0 | food/drink | 3 | `coffee_cup` | `cafe` |
| `cappuccino` | A0 | food/drink | 4 | `cappuccino` | `cafe` |
| `tea` | A0 | food/drink | 5 | `tea_pot` | `cafe` |
| `menu` | A0 | item/dining | 0 | `menu_card` | `restaurant`, `cafe` |
| `soup` | A0 | food/dish | 12 | `soup_bowl` | `restaurant` |
| `pasta` | A0 | food/dish | 18 | `pasta_plate` | `restaurant` |
| `cutlery` | A0 | item/dining | 0 | `cutlery_set` | `restaurant`, `outdoor_terrace` |
| `terrace table` | A0 | furniture | 0 | `terrace_table` | `outdoor_terrace` |
| `parasol` | A0 | structure | 0 | `terrace_umbrella` | `outdoor_terrace` |
| `cake` | A0 | food/dessert | 8 | `dessert_cake` | `outdoor_terrace` |
| `waiter` | A1 | occupation | 0 | `cutlery_set` | `restaurant` |
| `customer` | A1 | role | 0 | `menu_card` | `cafe` |

---

## Collectible Recipes (`data/recipes/recipes.json`)

- `recipe_baguette`: Artisan Warm Baguette (Flour, Water, Yeast, Salt)
- `recipe_espresso`: Rich Italian Espresso (Coffee Beans, Hot Water)
- `recipe_vegetable_soup`: Chef Dylan's Vegetable Soup (Carrots, Potatoes, Tomatoes, Broth)
- `recipe_artisan_pasta`: Handmade Italian Pasta (Pasta Dough, Tomato Sauce, Basil)

---

## Grammar Concepts & Patterns

1. **`gt_likes`**: Preferences & Requests (`I would like [Noun]`, `Can I have [Noun]?`).
2. **Polite Question Forms**: Ordering drinks and meals politely (`What would you like?`, `Would you like to order food?`).

---

## Minigames

- `mg_cafe_server_1`: **Café & Restaurant Server Challenge** (Play server role, taking customer orders politely using 'Would like' and 'Can I have...').

---

## Gameplay Quest Progression (4 Steps)

1. **Bake Bakery Bread** (`q_cooking_bread`): Learn traditional bread baking with Lucas in the bakery.
2. **Order at the Café** (`q_ch6_cafe_order`): Order an espresso or cappuccino at COSY Café from Marco using `I would like...` or `Can I have...`.
3. **Serve COSY Town Customers** (`q_ch6_server_challenge`): Put on an apron and play server at the restaurant and outdoor terrace to fulfill customer orders.
4. **Master Culinary Explorer** (`q_ch6_culinary_master`): Enjoy a meal on the outdoor terrace to complete Chapter 6 and unlock culinary recipes!

---

## Achievements

- `ach_ch6_culinary_master`: Culinary Master (Order food and drinks using polite forms, serve customers as a waiter, unlock culinary recipes, and complete Chapter 6).
