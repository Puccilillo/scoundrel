// Scoundrel Card Game - Main Logic

class Card {
    constructor(suit, value) {
        this.suit = suit; // 'clubs', 'spades', 'hearts', 'diamonds'
        this.value = value; // 2-14 (14 = Ace)
        this.type = this.getType();
    }

    getType() {
        if (this.suit === 'clubs' || this.suit === 'spades') return 'monster';
        if (this.suit === 'hearts') return 'potion';
        if (this.suit === 'diamonds') return 'weapon';
        return 'unknown';
    }

    getDisplay() {
        const valueMap = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
        const suitMap = { 'clubs': '♣', 'spades': '♠', 'hearts': '♥', 'diamonds': '♦' };
        const displayValue = valueMap[this.value] || this.value;
        return `${displayValue}${suitMap[this.suit]}`;
    }
}

class GameState {
    constructor() {
        this.health = 20;
        this.maxHealth = 20;
        this.equippedWeapon = null;
        this.stackedMonsters = [];
        this.currentRoom = [];
        this.deck = [];
        this.discardPile = [];
        this.cardsUsedThisRoom = 0;
        this.potionUsedThisRoom = false;
        this.lastRoomSkipped = false;
        this.killedMonsters = [];
        this.roomNumber = 1;
        this.gameOver = false;
        this.playerDead = false;
        this.visitedRooms = [1];
    }

    getScore() {
        const killedScore = this.killedMonsters.reduce((sum, card) => sum + card.value, 0);
        const remainingInRoom = this.currentRoom.filter(c => c.type === 'monster').reduce((sum, card) => sum + card.value, 0);
        const remainingInDeck = this.deck.filter(c => c.type === 'monster').reduce((sum, card) => sum + card.value, 0);
        const remainingScore = remainingInDeck + remainingInRoom;
        
        // Only add value of remaining weapons and potions when player wins (not dead)
        let remainingWeaponsAndPotions = 0;
        if (!this.playerDead) {
            // Count unused weapons and potions only on winning condition
            remainingWeaponsAndPotions = this.deck.filter(c => c.type === 'weapon' || c.type === 'potion').reduce((sum, card) => sum + card.value, 0) + 
                                         this.currentRoom.filter(c => c.type === 'weapon' || c.type === 'potion').reduce((sum, card) => sum + card.value, 0);
        }
        
        return killedScore + remainingWeaponsAndPotions - remainingScore;
    }
}

class ScoundrelGame {
    constructor() {
        this.state = new GameState();
        this.selectedCard = null;
        this.currentAction = null; // 'weapon', 'monster', 'potion'
    }

    createDeck() {
        const suits = ['clubs', 'spades', 'hearts', 'diamonds'];
        const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const deck = [];

        for (let suit of suits) {
            for (let value of values) {
                // Skip red face cards and aces (11, 12, 13, 14)
                if ((suit === 'hearts' || suit === 'diamonds') && value >= 11) continue;

                deck.push(new Card(suit, value));
            }
        }

        return this.shuffleDeck(deck);
    }

    shuffleDeck(deck) {
        const newDeck = [...deck];
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }

    newGame() {
        document.querySelector('.modal').style.display = 'none';
        this.state = new GameState();
        this.state.deck = this.createDeck();
        this.state.currentRoom = [];
        this.selectedCard = null;
        this.currentAction = null;
        this.dealRoom();
        this.render();
    }

    dealRoom() {
        // If this is not the first room, keep the last card
        if (this.state.roomNumber > 1 && this.state.currentRoom.length > 0) {
            // Last card carries over
            const carryOverCard = this.state.currentRoom[this.state.currentRoom.length - 1];
            this.state.currentRoom = [carryOverCard];
        } else {
            this.state.currentRoom = [];
        }

        // Draw needed cards
        const cardsNeeded = 4 - this.state.currentRoom.length;
        for (let i = 0; i < cardsNeeded; i++) {
            if (this.state.deck.length === 0) {
                // Deck is empty. Check if all monsters are killed - if so, player wins!
                if (this.isAllMonsterKilled()) {
                    this.state.gameOver = true;
                    this.state.playerDead = false;
                    this.endGame();
                }
                // If not all monsters are killed but deck is empty, just allow playing with remaining cards in room
                return;
            }
            this.state.currentRoom.push(this.state.deck.pop());
        }

        this.state.cardsUsedThisRoom = 0;
        this.state.potionUsedThisRoom = false;
        this.selectedCard = null;
        this.currentAction = null;
    }

    selectCard(cardIndex) {
        if (this.state.cardsUsedThisRoom >= 3 || this.state.gameOver) return;

        const card = this.state.currentRoom[cardIndex];
        if (!card) return;

        this.selectedCard = cardIndex;
        this.currentAction = null;

        if (card.type === 'weapon') {
            this.currentAction = 'weapon';
        } else if (card.type === 'monster') {
            this.currentAction = 'monster';
        } else if (card.type === 'potion') {
            this.currentAction = 'potion';
        }

        this.render();
    }

    equipWeapon() {
        if (this.selectedCard === null) return;

        const card = this.state.currentRoom[this.selectedCard];
        if (card.type !== 'weapon') return;

        // Discard old weapon and its stacked monsters
        if (this.state.equippedWeapon) {
            this.addToDiscard(this.state.equippedWeapon);
            this.state.stackedMonsters.forEach(monster => this.addToDiscard(monster));
        }
        this.state.equippedWeapon = card;
        this.state.stackedMonsters = [];

        // Remove card from room and use a card
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        this.showMessage(`Equipped weapon: ${card.getDisplay()}`, 'success');
        
        // Auto-advance if 3 cards used
        if (this.state.cardsUsedThisRoom >= 3) {
            this.autoAdvanceRoom();
        } else {
            this.render();
        }
    }

    fightMonster() {
        if (this.selectedCard === null) return;

        const card = this.state.currentRoom[this.selectedCard];
        if (card.type !== 'monster') return;

        const monsterValue = card.value;
        const weaponValue = this.state.equippedWeapon ? this.state.equippedWeapon.value : 0;
        let damage = 0;

        if (this.state.equippedWeapon) {
            // Check if weapon can be used (must be less valuable than last stacked monster)
            let canUseWeapon = true;
            if (this.state.stackedMonsters.length > 0) {
                const lastStackedValue = this.state.stackedMonsters[this.state.stackedMonsters.length - 1].value;
                if (monsterValue >= lastStackedValue) {
                    canUseWeapon = false;
                }
            }

            if (canUseWeapon) {
                // Weapon can be used
                if (monsterValue <= weaponValue) {
                    // Monster <= weapon: monster dies, no damage
                    damage = 0;
                    this.state.stackedMonsters.push(card);
                    this.showMessage(
                        `💥 Monster ${card.getDisplay()} defeated by ${this.state.equippedWeapon.getDisplay()}!`,
                        'success'
                    );
                } else {
                    // Monster > weapon: reduced damage = monster - weapon
                    damage = monsterValue - weaponValue;
                    this.state.stackedMonsters.push(card);
                    this.showMessage(
                        `⚔️ Monster ${card.getDisplay()} dealt ${damage} damage! (weapon reduced it)`,
                        'warning'
                    );
                }
            } else {
                // Weapon cannot be used, face bare handed
                damage = monsterValue;
                this.showMessage(
                    `Monster ${card.getDisplay()} dealt ${damage} damage! (couldn't use weapon)`,
                    'warning'
                );
            }
        } else {
            // No weapon equipped, take full damage
            damage = monsterValue;
            this.showMessage(
                `Monster ${card.getDisplay()} dealt ${damage} damage!`,
                'warning'
            );
        }

        this.state.health -= damage;
        if (this.state.health <= 0) {
            this.state.health = 0;
            this.state.gameOver = true;
            this.state.playerDead = true;
        }

        // Track all monsters removed from play (killed/defeated monsters)
        this.state.killedMonsters.push(card);
        this.addToDiscard(card);

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        // Check if all monsters are killed - if so, player wins! (only if player hasn't died)
        if (!this.state.playerDead && this.isAllMonsterKilled()) {
            this.state.gameOver = true;
            this.state.playerDead = false;
        }

        if (this.state.gameOver) {
            this.endGame();
        } else if (this.state.cardsUsedThisRoom >= 3) {
            this.autoAdvanceRoom();
        } else {
            this.render();
        }
    }

    fightMonsterBareHanded() {
        if (this.selectedCard === null) return;

        const card = this.state.currentRoom[this.selectedCard];
        if (card.type !== 'monster') return;

        const monsterValue = card.value;
        const damage = monsterValue;

        this.showMessage(
            `Fought ${card.getDisplay()} bare-handed! Took ${damage} damage.`,
            'warning'
        );

        this.state.health -= damage;
        if (this.state.health <= 0) {
            this.state.health = 0;
            this.state.gameOver = true;
            this.state.playerDead = true;
        }

        // Track all monsters removed from play (killed/defeated monsters)
        this.state.killedMonsters.push(card);
        this.addToDiscard(card);

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        // Check if all monsters are killed - if so, player wins! (only if player hasn't died)
        if (!this.state.playerDead && this.isAllMonsterKilled()) {
            this.state.gameOver = true;
            this.state.playerDead = false;
        }

        if (this.state.gameOver) {
            this.endGame();
        } else if (this.state.cardsUsedThisRoom >= 3) {
            this.autoAdvanceRoom();
        } else {
            this.render();
        }
    }

    usePotion() {
        if (this.selectedCard === null) return;

        const card = this.state.currentRoom[this.selectedCard];
        if (card.type !== 'potion') return;

        if (this.state.potionUsedThisRoom) {
            // Potion already used this room - discard without healing
            this.showMessage(`Potion ${card.getDisplay()} discarded! (already used one this room)`, 'warning');
        } else {
            // First potion in room - heal normally
            const potionValue = card.value;
            const oldHealth = this.state.health;
            this.state.health = Math.min(this.state.health + potionValue, this.state.maxHealth);
            const healed = this.state.health - oldHealth;

            this.showMessage(`Healed ${healed} HP with ${card.getDisplay()}!`, 'success');
            this.state.potionUsedThisRoom = true;
        }

        this.addToDiscard(card);

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        // Auto-advance if 3 cards used
        if (this.state.cardsUsedThisRoom >= 3) {
            this.autoAdvanceRoom();
        } else {
            this.render();
        }
    }

    skipRoom() {
        if (this.state.lastRoomSkipped) {
            this.showMessage('Cannot skip 2 rooms in a row!', 'error');
            return;
        }

        // Shuffle and put current room cards at bottom of deck (beginning of array)
        const shuffledCards = this.shuffleDeck([...this.state.currentRoom]);
        this.state.deck.unshift(...shuffledCards);
        this.state.currentRoom = []; // Clear current room to prevent duplicates
        this.state.lastRoomSkipped = true;
        this.showMessage('Skipped room!', 'info');

        // Deal new room
        this.state.roomNumber++;
        this.dealRoom();
        this.render();
    }

    autoAdvanceRoom() {
        // Keep last card for new room
        this.state.lastRoomSkipped = false;
        this.state.roomNumber++;
        this.state.visitedRooms.push(this.state.roomNumber);
        this.state.cardsUsedThisRoom = 0;
        this.state.potionUsedThisRoom = false;
        this.dealRoom();
        this.render();
    }

    isAllMonsterKilled() {
        // A standard deck has 26 monsters (13 clubs + 13 spades)
        // Check if all monsters have been killed
        const totalMonstersInGame = 26;
        return this.state.killedMonsters.length === totalMonstersInGame;
    }

    endGame() {
        this.state.gameOver = true;
        this.render();
    }

    showMessage(text, type = 'info') {
        const container = document.getElementById('messageContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = text;
        container.innerHTML = '';
        container.appendChild(messageEl);

        setTimeout(() => {
            if (container.contains(messageEl)) {
                messageEl.remove();
            }
        }, 4000);
    }

    render() {
        this.updateStats();
        this.updateRoomDisplay();
        this.updateWeaponDisplay();
        this.updateActionButtons();
        this.updateButtons();
        this.checkGameState();
    }

    addToDiscard(card) {
        if (!card) return;
        if (this.state.discardPile.includes(card)) return;
        this.state.discardPile.push(card);
    }

    updateStats() {
        document.getElementById('healthDisplay').textContent = this.state.health;
        document.getElementById('deckCount').textContent = this.state.deck.length;
        document.getElementById('discardCount').textContent = this.state.discardPile.length;
        document.getElementById('roomDisplay').textContent = this.toRomanNumeral(this.state.roomNumber);
        
        // Update health bar display
        const healthBarDisplay = document.getElementById('healthBarDisplay');
        if (healthBarDisplay) {
            healthBarDisplay.textContent = this.state.health;
        }
        const healthBarMax = document.getElementById('healthBarMax');
        if (healthBarMax) {
            healthBarMax.textContent = this.state.maxHealth;
        }
    }

    toRomanNumeral(num) {
        const romanMap = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
            [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
            [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        let result = '';
        for (let [value, roman] of romanMap) {
            while (num >= value) {
                result += roman;
                num -= value;
            }
        }
        return result;
    }

    updateRoomDisplay() {
        const container = document.getElementById('roomCards');
        
        if (this.state.gameOver && this.state.currentRoom.length === 0) {
            container.innerHTML = '<div class="placeholder">Game Over</div>';
            return;
        }

        container.innerHTML = '';
        
        if (this.state.currentRoom.length === 0) {
            container.innerHTML = '<div class="placeholder">No more cards. Game Over!</div>';
            return;
        }

        this.state.currentRoom.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';

            if (card.suit === 'hearts' || card.suit === 'diamonds') {
                cardEl.classList.add('red-suit');
            } else {
                cardEl.classList.add('black-suit');
            }
            
            if (this.selectedCard === index) {
                cardEl.classList.add('selected');
            }

            // Traditional playing card layout: corners + center
            const typeEmoji = card.type === 'monster' ? '👹' : card.type === 'weapon' ? '🗡️' : '🧪';
            const valueMap = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
            const suitMap = { 'clubs': '♣', 'spades': '♠', 'hearts': '♥', 'diamonds': '♦' };
            const displayValue = valueMap[card.value] || card.value;
            const displaySuit = suitMap[card.suit];
            cardEl.innerHTML = `
                <span class="card-corner top-left">
                    <span class="corner-value">${displayValue}</span>
                    <span class="corner-suit">${displaySuit}</span>
                </span>
                <span class="card-center">${typeEmoji}</span>
                <span class="card-corner bottom-right">
                    <span class="corner-value">${displayValue}</span>
                    <span class="corner-suit">${displaySuit}</span>
                </span>
            `;

            if (!this.state.gameOver && this.state.cardsUsedThisRoom < 3) {
                cardEl.classList.add('selectable');
                cardEl.addEventListener('click', () => this.selectCard(index));
            }

            container.appendChild(cardEl);
        });
    }

    updateWeaponDisplay() {
        const container = document.getElementById('equipmentContent');

        if (this.state.equippedWeapon) {
            const card = this.state.equippedWeapon;
            const suitClass = (card.suit === 'hearts' || card.suit === 'diamonds') ? 'red-suit' : 'black-suit';
            const typeEmoji = card.type === 'monster' ? '👹' : card.type === 'weapon' ? '🗡️' : '🧪';
            const valueMap = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
            const suitMap = { 'clubs': '♣', 'spades': '♠', 'hearts': '♥', 'diamonds': '♦' };
            const displayValue = valueMap[card.value] || card.value;
            const displaySuit = suitMap[card.suit];
            
            let html = `<div class="equipped-card-wrapper">
                <div class="card equipped-weapon equipped-card ${suitClass}">
                    <span class="card-corner top-left">
                        <span class="corner-value">${displayValue}</span>
                        <span class="corner-suit">${displaySuit}</span>
                    </span>
                    <span class="card-center">${typeEmoji}</span>
                    <span class="card-corner bottom-right">
                        <span class="corner-value">${displayValue}</span>
                        <span class="corner-suit">${displaySuit}</span>
                    </span>
                </div>`;

            if (this.state.stackedMonsters.length > 0) {
                html += '<div class="stacked-monsters-container">';
                this.state.stackedMonsters.forEach((monster, index) => {
                    const monsterSuitClass = (monster.suit === 'hearts' || monster.suit === 'diamonds') ? 'red-suit' : 'black-suit';
                    const monsterEmoji = '👹';
                    const monsterDisplayValue = valueMap[monster.value] || monster.value;
                    const monsterDisplaySuit = suitMap[monster.suit];
                    
                    html += `<div class="card stacked-monster ${monsterSuitClass}" style="z-index: ${index + 1};">
                        <span class="card-corner top-left">
                            <span class="corner-value">${monsterDisplayValue}</span>
                            <span class="corner-suit">${monsterDisplaySuit}</span>
                        </span>
                        <span class="card-center">${monsterEmoji}</span>
                        <span class="card-corner bottom-right">
                            <span class="corner-value">${monsterDisplayValue}</span>
                            <span class="corner-suit">${monsterDisplaySuit}</span>
                        </span>
                    </div>`;
                });
                html += '</div>';
            }
            
            html += '</div>';

            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="equipment-slot"></div>';
        }
    }

    updateActionButtons() {
        const container = document.getElementById('actionButtons');
        const skipBtn = document.getElementById('skipRoomBtn');
        
        // Clear action buttons but preserve skip button
        const buttonsToRemove = container.querySelectorAll('button:not(#skipRoomBtn)');
        buttonsToRemove.forEach(btn => btn.remove());
        
        // Remove message if present
        const message = container.querySelector('.actions-empty');
        if (message) message.remove();

        if (this.selectedCard === null || this.state.gameOver || this.state.cardsUsedThisRoom >= 3) {
            // Only show message if no cards are selected
            if (this.selectedCard === null && !this.state.gameOver && this.state.cardsUsedThisRoom < 3) {
                const msg = document.createElement('p');
                msg.className = 'actions-empty';
                msg.textContent = 'Select a card to act';
                container.insertBefore(msg, skipBtn);
            }
            return;
        }

        const card = this.state.currentRoom[this.selectedCard];

        if (card.type === 'weapon') {
            const btn = document.createElement('button');
            btn.className = 'btn btn-equip';
            btn.textContent = `⚔️ Equip ${card.getDisplay()}`;
            btn.onclick = () => this.equipWeapon();
            container.insertBefore(btn, skipBtn);
        } else if (card.type === 'monster') {
            // Check if weapon is equipped and usable
            let canUseWeapon = false;
            if (this.state.equippedWeapon) {
                canUseWeapon = true;
                if (this.state.stackedMonsters.length > 0) {
                    const lastStackedValue = this.state.stackedMonsters[this.state.stackedMonsters.length - 1].value;
                    if (card.value >= lastStackedValue) {
                        canUseWeapon = false;
                    }
                }
            }

            if (canUseWeapon) {
                // Show both options: with weapon and bare-handed
                const btnWeapon = document.createElement('button');
                btnWeapon.className = 'btn btn-fight-weapon';
                btnWeapon.textContent = `⚔️ Fight ${card.getDisplay()} (with weapon)`;
                btnWeapon.onclick = () => this.fightMonster();
                container.insertBefore(btnWeapon, skipBtn);

                const btnBareHanded = document.createElement('button');
                btnBareHanded.className = 'btn btn-fight-bare';
                btnBareHanded.textContent = `👊 Fight ${card.getDisplay()} (bare-handed)`;
                btnBareHanded.onclick = () => this.fightMonsterBareHanded();
                container.insertBefore(btnBareHanded, skipBtn);
            } else {
                // Only bare-handed option (no weapon or weapon unusable)
                const btn = document.createElement('button');
                btn.className = 'btn btn-fight-bare';
                if (this.state.equippedWeapon && !canUseWeapon) {
                    btn.textContent = `👊 Fight ${card.getDisplay()} (weapon unusable)`;
                } else {
                    btn.textContent = `👊 Fight ${card.getDisplay()}`;
                }
                btn.onclick = () => this.fightMonsterBareHanded();
                container.insertBefore(btn, skipBtn);
            }
        } else if (card.type === 'potion') {
            const btn = document.createElement('button');
            if (this.state.potionUsedThisRoom) {
                btn.className = 'btn btn-potion-discard';
                btn.textContent = `🧪 Discard ${card.getDisplay()} (no heal)`;
            } else {
                btn.className = 'btn btn-potion-use';
                btn.textContent = `🧪 Use ${card.getDisplay()}`;
            }
            btn.onclick = () => this.usePotion();
            container.insertBefore(btn, skipBtn);
        }
    }

    updateButtons() {
        const skipBtn = document.getElementById('skipRoomBtn');

        if (this.state.gameOver) {
            skipBtn.disabled = true;
        } else {
            skipBtn.disabled = this.state.lastRoomSkipped || this.state.cardsUsedThisRoom > 0;
        }
    }

    checkGameState() {
        if (!this.state.gameOver) return;

        const modal = document.querySelector('.modal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const score = document.getElementById('finalScore');
        const killedScore = document.getElementById('killedMonstersScore');
        const remainingScore = document.getElementById('remainingMonstersScore');

        const killedMonstersCount = this.state.killedMonsters.length;
        const remainingInDeck = this.state.deck.filter(c => c.type === 'monster').length;
        const remainingInRoom = this.state.currentRoom.filter(c => c.type === 'monster').length;
        const remainingMonstersCount = remainingInDeck + remainingInRoom;

        if (this.state.playerDead) {
            title.textContent = '💀 YOU DIED 💀';
            message.textContent = `You survived ${this.state.roomNumber} rooms`;
        } else {
            title.textContent = '✨ VICTORY ✨';
            message.textContent = `You killed all monsters in ${this.state.roomNumber} rooms!`;
        }

        score.textContent = this.state.getScore();
        killedScore.textContent = killedMonstersCount;
        remainingScore.textContent = remainingMonstersCount;

        modal.style.display = 'flex';
    }
}

// Initialize and expose game globally
let game = new ScoundrelGame();
game.newGame();

// Handle Enter key for actions
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game.selectedCard !== null && !game.state.gameOver) {
        const card = game.state.currentRoom[game.selectedCard];
        if (card.type === 'weapon') {
            game.equipWeapon();
        } else if (card.type === 'monster') {
            // Check if weapon can be used
            let canUseWeapon = false;
            if (game.state.equippedWeapon) {
                canUseWeapon = true;
                if (game.state.stackedMonsters.length > 0) {
                    const lastStackedValue = game.state.stackedMonsters[game.state.stackedMonsters.length - 1].value;
                    if (card.value >= lastStackedValue) {
                        canUseWeapon = false;
                    }
                }
            }
            // Prefer weapon if available
            if (canUseWeapon) {
                game.fightMonster();
            } else {
                game.fightMonsterBareHanded();
            }
        } else if (card.type === 'potion') {
            game.usePotion();
        }
    }
});
