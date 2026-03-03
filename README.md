# Scoundrel Card Game
Scoundrel is a single player card game where the player crawls in a dungeon.
The game is played with a standard deck of card, removing all red face cards, red aces and jokers.
Bkack cards (from 2 to A) represent monters
Diamonds cards represent weapons
Hearths cards represent health potions

After shuffling the game starts placing 4 cards on the table.
These cards represent the 1st room of the dungeon.
Each turn consists of using 3 of the 4 cards or skipping the room.
Alternatively the player can choose to skip the room.
When skipping all the cards on the table are put at the bottom of the deck.
Player cannot skip 2 rooms in a row.

The player starts with 20 health points.

Using weapons:
- weapons can be equipped (the card is placed on the player side)
- when equipping a weapon, any other equipped weapon is discarded
- the value of the equipped weapon represents the weapon damage
- a weapon reduces the attack value of a monster
- if a monster attack is <= the weapon attack, the monster dies
- if a monster attack is > than the weapon attack, the difference is removed from player's health as damage
- every killed monster is stacked upon the weapon
- a weapon can only be used to fight monsters that are < of the stacked monster
- when discarding a weapon, all stacked monsters are discarded with it

Fighting monsters:
- fighting a monster bare handed reduce the player's health by the monster attack value
- monsters can be attacked with a weapon only is the weapon hasnt already been used or if the last killed monster was > than the current monster attack value
- if a weapon cannot be used (monster is > than the stacked monster attack value) the monster must be faced bare handed (taking full damage)

Using potions:
- player can use potions to restore health points
- only 1 potion per turn can be used
- health is always capped at 20

Advancing:
- after 3 of the 4 cards the player brings the remaining card in a new room (3 more cards are added)
- the game ends when there are not enough cards to make a new room
- the player dies when its health reach 0

# Score
Scoring starts from 0 and can go + or -
At the end of the game the score is determined by:
- adding the value of killed monsters
- subtracting the value of remaining monsters