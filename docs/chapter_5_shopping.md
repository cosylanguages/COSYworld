# Chapter 5: Shopping

## Overview
Chapter 5 ("Shopping") introduces the player to conducting shopping transactions and inquiring about prices and quantities across COSY Town under a Monolingual Learning Architecture without bilingual translations or cards. The player explores 5 market district scenes (Supermarket, Bakery, Fruit Market, Clothing Store, Bookshop), interacts with shoppable food, clothing, books, and currency items, practices quantifiers (`some`, `any`), countable vs. uncountable nouns, and asking prices/quantities (`How much is...`, `How many...`), and completes a multi-shop shopping list quest chain with Lucas the Artisan Baker and Maya the Market Shopkeeper.

---

## Learning Goals & Communication Goals

### Learning Goal
The player learns how to inquire about prices, ask for item quantities using countable and uncountable nouns, express offers and requests with quantifiers (`some` / `any`), and conduct shopping transactions using in-game coins.

### Communication Goals
- **Asking Prices & Quantities**: Ask item costs and quantities (`How much is...`, `How many... do you want?`).
- **Using Quantifiers**: Offer and request items naturally using `some` in affirmative statements and `any` in questions/negatives (`Do you have any apples?`, `I have some fresh bread.`).
- **Distinguishing Noun Types**: Differentiate between countable nouns (`baguette`, `apple`, `shirt`, `book`) and uncountable nouns (`bread`, `milk`, `cheese`, `flour`).
- **Handling Currency**: Pay for shoppable goods with in-game coins and manage shopping budgets.

---

## Chapter Topology & Scenes (5 Scenes)

1. **Supermarket** (`supermarket`)
   - District: Market District
   - Description: The central community grocery market stocked with shopping carts, baskets, dairy shelves, and coin purses.
   - Hotspots: `shopping_basket`, `shopping_cart`, `milk`, `cheese`, `coins_purse`
   - NPCs: `shopkeeper_maya`

2. **Bakery** (`bakery`)
   - District: City Centre / Market District
   - Description: Lucas's artisan bakery displaying fresh warm baguettes, croissants, and baking ovens.
   - Hotspots: `baguette`, `croissant`, `oven`
   - NPCs: `lucas_baker`

3. **Fruit Market** (`fruit_market`)
   - District: Market District
   - Description: An open-air fruit and vegetable market stall featuring fresh red apples, yellow bananas, and juicy oranges.
   - Hotspots: `apple`, `banana`, `orange`, `plant`, `bench`
   - NPCs: `shopkeeper_maya`

4. **Clothing Store** (`clothing_store`)
   - District: Market District
   - Description: A boutique clothing store displaying cotton shirts, summer dresses, warm jackets, and fitting mirrors.
   - Hotspots: `shirt`, `dress_rack`, `jacket`, `bathroom_mirror`, `lamp`

5. **Bookshop** (`bookshop`)
   - District: Market District
   - Description: A cozy neighborhood bookshop filled with adventure novels, polyglot dictionaries, notebooks, and reading desks.
   - Hotspots: `novel_stack`, `dictionary_book`, `paper_notebook`, `bookshelf`, `desk`

---

## Dialogue Trees & References

Branching dialogue trees for Chapter 5 are stored as JSON files under `data/dialogues/`:

- `data/dialogues/lucas_baker_bakery.json`: Lucas the Baker offering warm baguettes and croissants, explaining prices in coins, and practicing "How much" and "How many".
- `data/dialogues/shopkeeper_maya_fruit_market.json`: Maya the Market Shopkeeper assisting players with grocery lists, answering questions about produce prices using `some` and `any`, and completing transactions.

---

## Vocabulary & Hotspots Table

| Word / Term | CEFR | Category | Price (Coins) | Hotspot Object | Scene Location |
| --- | --- | --- | --- | --- | --- |
| `baguette` | A0 | food | 10 | `baguette` | `bakery` |
| `croissant` | A0 | food | 5 | `croissant` | `bakery` |
| `apple` | A0 | food/fruit | 3 | `apple` | `fruit_market` |
| `banana` | A0 | food/fruit | 4 | `banana` | `fruit_market` |
| `orange` | A0 | food/fruit | 4 | `orange` | `fruit_market` |
| `shopping basket` | A0 | item/shopping | 8 | `shopping_basket` | `supermarket` |
| `shopping cart` | A0 | item/shopping | 15 | `shopping_cart` | `supermarket` |
| `milk` | A0 | food/dairy | 6 | `milk` | `supermarket` |
| `cheese` | A0 | food/dairy | 12 | `cheese` | `supermarket` |
| `coin purse` | A0 | item/money | 0 | `coins_purse` | `supermarket` |
| `shirt` | A0 | clothing | 25 | `shirt` | `clothing_store` |
| `dress` | A0 | clothing | 40 | `dress_rack` | `clothing_store` |
| `jacket` | A0 | clothing | 50 | `jacket` | `clothing_store` |
| `novel` | A0 | item/book | 15 | `novel_stack` | `bookshop` |
| `dictionary` | A0 | item/book | 20 | `dictionary_book` | `bookshop` |
| `notebook` | A0 | item/stationery | 5 | `paper_notebook` | `bookshop` |

---

## Grammar Concepts & Patterns

1. **`gt_countable_uncountable`**: Countable vs Uncountable Nouns (`two apples`, `a baguette` vs `some bread`, `milk`).
2. **`gt_some_any`**: Quantifiers `Some` & `Any` (`I have some apples`, `Do you have any tea?`).
3. **`gt_how_much_many`**: Asking Quantities & Prices (`How much is the baguette?`, `How many apples do you want?`).

---

## Gameplay Quest Progression (3 Steps)

1. **Purchase Warm Baguette** (`q_shop_baguette`): Order a fresh warm baguette from Lucas at the bakery (10 coins).
2. **Shopping List Challenge** (`q_ch5_shopping_list`): Complete a multi-shop shopping list by purchasing a baguette at the bakery, apples at the fruit market, and milk at the supermarket.
3. **Master Town Shopper** (`q_ch5_master_shopper`): Visit the clothing store and bookshop to purchase clothing and books, mastering Chapter 5 shopping vocabulary and completing Chapter 5!

---

## Achievements

- `ach_ch5_master_shopper`: Master Shopper (Complete your shopping list across shops, master asking prices and quantifiers, and complete Chapter 5).
