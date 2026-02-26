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

    getValueDisplay() {
        const valueMap = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
        return valueMap[this.value] || this.value;
    }

    getSuitDisplay() {
        const suitMap = { 'clubs': '♣', 'spades': '♠', 'hearts': '♥', 'diamonds': '♦' };
        return suitMap[this.suit];
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
    }

    getScore() {
        const killedScore = this.killedMonsters.reduce((sum, card) => sum + card.value, 0);
        const remainingInRoom = this.currentRoom.filter(c => c.type === 'monster').reduce((sum, card) => sum + card.value, 0);
        const remainingInDeck = this.deck.filter(c => c.type === 'monster').reduce((sum, card) => sum + card.value, 0);
        const remainingScore = remainingInDeck + remainingInRoom;
        return killedScore - remainingScore;
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
                // Skip red face cards, red aces
                if ((suit === 'hearts' || suit === 'diamonds') && value >= 11) continue;
                if ((suit === 'hearts' || suit === 'diamonds') && value === 14) continue;

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
        document.getElementById('gameOverModal').style.display = 'none';
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
                this.endGame();
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
        this.state.equippedWeapon = card;
        this.state.stackedMonsters = [];

        // Remove card from room and use a card
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        this.showMessage(`Equipped weapon: ${card.getDisplay()}`, 'success');
        this.render();
    }

    fightMonster() {
        if (this.selectedCard === null) return;

        const card = this.state.currentRoom[this.selectedCard];
        if (card.type !== 'monster') return;

        const monsterValue = card.value;
        const weaponValue = this.state.equippedWeapon ? this.state.equippedWeapon.value : 0;
        let damage = 0;
        let monsterKilled = false;

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
                    monsterKilled = true;
                    this.state.stackedMonsters.push(card);
                    this.showMessage(
                        `Monster ${card.getDisplay()} defeated by ${this.state.equippedWeapon.getDisplay()}!`,
                        'success'
                    );
                } else {
                    // Monster > weapon: reduced damage = monster - weapon
                    damage = monsterValue - weaponValue;
                    monsterKilled = true;
                    this.state.stackedMonsters.push(card);
                    this.showMessage(
                        `Monster ${card.getDisplay()} dealt ${damage} damage! (weapon reduced it)`,
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

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        if (this.state.gameOver) {
            this.endGame();
        }

        this.render();
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

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        if (this.state.gameOver) {
            this.endGame();
        }

        this.render();
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

        // Remove card from room
        this.state.currentRoom.splice(this.selectedCard, 1);
        this.state.cardsUsedThisRoom++;
        this.selectedCard = null;
        this.currentAction = null;

        this.render();
    }

    skipRoom() {
        if (this.state.lastRoomSkipped) {
            this.showMessage('Cannot skip 2 rooms in a row!', 'error');
            return;
        }

        // Put current room cards at bottom of deck
        this.state.deck.unshift(...this.state.currentRoom);
        this.state.lastRoomSkipped = true;
        this.showMessage('Skipped room!', 'info');

        // Deal new room
        this.state.roomNumber++;
        this.dealRoom();
        this.render();
    }

    advance() {
        if (this.state.cardsUsedThisRoom < 3) {
            this.showMessage('You must use 3 cards to advance!', 'error');
            return;
        }

        // Keep last card for new room
        this.state.lastRoomSkipped = false;
        this.state.roomNumber++;
        this.dealRoom();
        this.render();
    }

    discardWeapon() {
        if (!this.state.equippedWeapon) return;

        this.showMessage(`Discarded ${this.state.equippedWeapon.getDisplay()} and its stacked monsters!`, 'info');
        this.state.equippedWeapon = null;
        this.state.stackedMonsters = [];
        this.render();
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

    updateStats() {
        document.getElementById('healthDisplay').textContent = this.state.health;
        document.getElementById('deckDisplay').textContent = this.state.deck.length;
        document.getElementById('roomDisplay').textContent = this.state.roomNumber;
        document.getElementById('cardsUsed').textContent = this.state.cardsUsedThisRoom;
    }

    updateRoomDisplay() {
        const container = document.getElementById('roomCards');
        
        if (this.state.gameOver && this.state.currentRoom.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); grid-column: 1/-1;">Game Over</div>';
            return;
        }

        container.innerHTML = '';
        
        if (this.state.currentRoom.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); grid-column: 1/-1;">No more cards. Game Over!</div>';
            return;
        }

        this.state.currentRoom.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            
            // Add suit color
            if (card.suit === 'hearts' || card.suit === 'diamonds') {
                cardEl.classList.add('hearts');
            } else {
                cardEl.classList.add('clubs');
            }

            if (this.selectedCard === index) {
                cardEl.classList.add('selected');
            }

            // Add type-specific styling
            if (card.type === 'monster') {
                cardEl.style.color = '#333';
                cardEl.style.background = 'linear-gradient(135deg, #ff9999 0%, #ff6b6b 100%)';
            } else if (card.type === 'weapon') {
                cardEl.style.color = '#fff';
                cardEl.style.background = 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
            } else if (card.type === 'potion') {
                cardEl.style.color = '#fff';
                cardEl.style.background = 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)';
            }

            // Create card content
            const valueEl = document.createElement('div');
            valueEl.className = 'card-value';
            valueEl.textContent = card.getValueDisplay();

            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = card.getSuitDisplay();

            cardEl.appendChild(valueEl);
            cardEl.appendChild(suitEl);

            if (!this.state.gameOver && this.state.cardsUsedThisRoom < 3) {
                cardEl.classList.add('selectable');
                cardEl.addEventListener('click', () => this.selectCard(index));
            }

            container.appendChild(cardEl);
        });
    }

    updateWeaponDisplay() {
        const container = document.getElementById('weaponDisplay');
        const discardBtn = document.getElementById('discardWeaponBtn');

        if (this.state.equippedWeapon) {
            const weaponCard = this.state.equippedWeapon;
            let stackInfo = '';

            if (this.state.stackedMonsters.length > 0) {
                stackInfo = `<div class="stacked-monsters">Stacked Monsters (${this.state.stackedMonsters.length}):<br>`;
                this.state.stackedMonsters.forEach(m => {
                    stackInfo += `${m.getDisplay()} `;
                });
                stackInfo += '</div>';
            }

            container.innerHTML = `
                <div class="weapon-card">${weaponCard.getDisplay()}</div>
                <div class="weapon-info">Damage: ${weaponCard.value}</div>
                ${stackInfo}
            `;
            discardBtn.disabled = false;
        } else {
            container.innerHTML = '<div style="opacity: 0.5;">No weapon equipped</div>';
            discardBtn.disabled = true;
        }
    }

    updateActionButtons() {
        const container = document.getElementById('actionButtons');
        container.innerHTML = '';

        if (this.selectedCard === null || this.state.gameOver || this.state.cardsUsedThisRoom >= 3) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.7;">Select a card to act</p>';
            return;
        }

        const card = this.state.currentRoom[this.selectedCard];

        if (card.type === 'weapon') {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.textContent = `⚔️ Equip ${card.getDisplay()}`;
            btn.onclick = () => this.equipWeapon();
            container.appendChild(btn);
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
                btnWeapon.className = 'btn-primary';
                btnWeapon.textContent = `⚔️ Fight ${card.getDisplay()} (with weapon)`;
                btnWeapon.onclick = () => this.fightMonster();
                container.appendChild(btnWeapon);

                const btnBareHanded = document.createElement('button');
                btnBareHanded.className = 'btn-danger';
                btnBareHanded.textContent = `👊 Fight ${card.getDisplay()} (bare-handed)`;
                btnBareHanded.onclick = () => this.fightMonsterBareHanded();
                container.appendChild(btnBareHanded);
            } else {
                // Only bare-handed option (no weapon or weapon unusable)
                const btn = document.createElement('button');
                btn.className = 'btn-danger';
                if (this.state.equippedWeapon && !canUseWeapon) {
                    btn.textContent = `👊 Fight ${card.getDisplay()} (weapon unusable)`;
                } else {
                    btn.textContent = `👊 Fight ${card.getDisplay()}`;
                }
                btn.onclick = () => this.fightMonsterBareHanded();
                container.appendChild(btn);
            }
        } else if (card.type === 'potion') {
            const btn = document.createElement('button');
            if (this.state.potionUsedThisRoom) {
                btn.className = 'btn-danger';
                btn.textContent = `🧪 Discard ${card.getDisplay()} (no heal)`;
            } else {
                btn.className = 'btn-success';
                btn.textContent = `🧪 Use ${card.getDisplay()}`;
            }
            btn.onclick = () => this.usePotion();
            container.appendChild(btn);
        }
    }

    updateButtons() {
        const skipBtn = document.getElementById('skipRoomBtn');
        const advanceBtn = document.getElementById('advanceBtn');

        if (this.state.gameOver) {
            skipBtn.disabled = true;
            advanceBtn.disabled = true;
        } else {
            skipBtn.disabled = this.state.lastRoomSkipped || this.state.cardsUsedThisRoom > 0;
            advanceBtn.disabled = this.state.cardsUsedThisRoom < 3;
        }
    }

    checkGameState() {
        if (!this.state.gameOver) return;

        const modal = document.getElementById('gameOverModal');
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
            title.textContent = '✨ GAME COMPLETE ✨';
            message.textContent = 'You cleared all the monsters!';
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
