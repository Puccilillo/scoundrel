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

    getSVG() {
        if (this.type === 'monster') {
            return this.getMonsterSVG();
        } else if (this.type === 'weapon') {
            return this.getWeaponSVG();
        } else if (this.type === 'potion') {
            return this.getPotionSVG();
        }
        return '';
    }

    getMonsterSVG() {
        const weaponType = this.suit === 'spades' ? 'swords' : 'clubs';
        const isSpaces = this.suit === 'spades';
        let monsterSvg = '';

        if (this.value === 14) {
            // Dragon
            monsterSvg = this.createDragon(isSpaces);
        } else if (this.value === 13) {
            // King
            monsterSvg = this.createKing(isSpaces);
        } else if (this.value === 12) {
            // Queen
            monsterSvg = this.createQueen(isSpaces);
        } else if (this.value === 11) {
            // Army Leader
            monsterSvg = this.createArmyLeader(isSpaces);
        } else {
            // Soldiers (2-10)
            monsterSvg = this.createSoldier(this.value, isSpaces);
        }

        const baseColor = isSpaces ? '#4a4a4a' : '#5a5a5a';
        return `
            <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <defs>
                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ff9999;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="200" height="300" fill="url(#cardGrad)" rx="8"/>
                <rect x="5" y="5" width="190" height="290" fill="none" stroke="#333" stroke-width="2" rx="8"/>
                
                <!-- Attack value in corner -->
                <circle cx="25" cy="25" r="28" fill="${baseColor}" opacity="0.8"/>
                <text x="25" y="35" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">${this.value}</text>
                
                <!-- Monster graphic -->
                <g transform="translate(100, 140) scale(2)">
                    ${monsterSvg}
                </g>
                
                <!-- Suit indicator -->
                <text x="175" y="280" font-size="48" fill="#333" text-anchor="middle">${isSpaces ? '♠' : '♣'}</text>
            </svg>
        `;
    }

    createDragon(isSpades) {
        const fill = isSpades ? '#2c3e50' : '#34495e';
        return `
            <!-- Dragon head -->
            <circle cx="0" cy="-15" r="18" fill="${fill}"/>
            <!-- Dragon jaw -->
            <path d="M -8 -5 Q 0 5 8 -5" stroke="${fill}" stroke-width="3" fill="none" stroke-linecap="round"/>
            <!-- Dragon horns -->
            <line x1="-10" y1="-32" x2="-15" y2="-45" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
            <line x1="10" y1="-32" x2="15" y2="-45" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
            <!-- Dragon eyes -->
            <circle cx="-6" cy="-18" r="2" fill="#ff6b6b"/>
            <circle cx="6" cy="-18" r="2" fill="#ff6b6b"/>
            <!-- Dragon wings -->
            <path d="M -18 -5 Q -30 -20 -25 0" stroke="${fill}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M 18 -5 Q 30 -20 25 0" stroke="${fill}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <!-- Dragon fire breath -->
            <path d="M 0 5 Q 5 15 0 25" stroke="#ff6b6b" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M 0 5 Q -5 15 0 25" stroke="#ff6b6b" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
        `;
    }

    createKing(isSpades) {
        const fill = isSpades ? '#2c3e50' : '#34495e';
        return `
            <!-- Crown -->
            <path d="M -15 -20 L -8 -35 L 0 -38 L 8 -35 L 15 -20" stroke="${fill}" stroke-width="2" fill="none"/>
            <circle cx="-8" cy="-32" r="2" fill="#ffc107"/>
            <circle cx="0" cy="-35" r="2" fill="#ffc107"/>
            <circle cx="8" cy="-32" r="2" fill="#ffc107"/>
            <!-- Jewels -->
            <circle cx="-12" cy="-25" r="1.5" fill="#ff6b6b"/>
            <circle cx="12" cy="-25" r="1.5" fill="#ff6b6b"/>
            <!-- Face -->
            <circle cx="0" cy="-5" r="12" fill="${fill}"/>
            <circle cx="-5" cy="-8" r="2" fill="#ff6b6b"/>
            <circle cx="5" cy="-8" r="2" fill="#ff6b6b"/>
            <line x1="-2" y1="0" x2="2" y2="0" stroke="#333" stroke-width="1"/>
            <!-- Beard/Chin -->
            <path d="M -8 5 Q 0 10 8 5" stroke="${fill}" stroke-width="2" fill="none"/>
        `;
    }

    createQueen(isSpades) {
        const fill = isSpades ? '#2c3e50' : '#34495e';
        return `
            <!-- Crown with points -->
            <path d="M -16 -15 L -10 -30 L -4 -25 L 0 -35 L 4 -25 L 10 -30 L 16 -15" stroke="${fill}" stroke-width="2" fill="url(#queenGradient)"/>
            <defs><linearGradient id="queenGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#ffc107"/><stop offset="100%" style="stop-color:#daa520"/></linearGradient></defs>
            <!-- Jewels on crown -->
            <circle cx="-4" cy="-28" r="1.5" fill="#ff6b6b"/>
            <circle cx="0" cy="-34" r="1.5" fill="#ff6b6b"/>
            <circle cx="4" cy="-28" r="1.5" fill="#ff6b6b"/>
            <!-- Face -->
            <circle cx="0" cy="0" r="11" fill="${fill}"/>
            <!-- Eyes -->
            <circle cx="-5" cy="-3" r="1.5" fill="#ff6b6b"/>
            <circle cx="5" cy="-3" r="1.5" fill="#ff6b6b"/>
            <!-- Hair/Elegance -->
            <path d="M -11 0 Q -12 8 -8 12" stroke="${fill}" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M 11 0 Q 12 8 8 12" stroke="${fill}" stroke-width="2" fill="none" stroke-linecap="round"/>
        `;
    }

    createArmyLeader(isSpades) {
        const fill = isSpades ? '#2c3e50' : '#34495e';
        return `
            <!-- Helmet -->
            <path d="M -12 -20 Q -12 -30 0 -32 Q 12 -30 12 -20" stroke="${fill}" stroke-width="2" fill="${fill}"/>
            <!-- Face guard -->
            <circle cx="0" cy="-8" r="9" fill="${fill}"/>
            <!-- Eyes -->
            <circle cx="-4" cy="-10" r="1" fill="#ff6b6b"/>
            <circle cx="4" cy="-10" r="1" fill="#ff6b6b"/>
            <!-- Sword pointing up -->
            <line x1="0" y1="-35" x2="0" y2="15" stroke="#999" stroke-width="3" stroke-linecap="round"/>
            <!-- Sword guard -->
            <line x1="-8" y1="5" x2="8" y2="5" stroke="#999" stroke-width="2"/>
            <!-- Armor -->
            <path d="M -10 0 L -12 10 L 0 15 L 12 10 L 10 0" stroke="${fill}" stroke-width="1.5" fill="none"/>
        `;
    }

    createSoldier(level, isSpades) {
        const fill = isSpades ? '#2c3e50' : '#34495e';
        const helmetSize = 8 + (level > 5 ? 1 : 0);
        return `
            <!-- Helmet -->
            <circle cx="0" cy="-12" r="${helmetSize}" fill="${fill}"/>
            <!-- Face -->
            <circle cx="0" cy="-2" r="6" fill="${fill}"/>
            <!-- Eyes -->
            <circle cx="-2" cy="-3" r="1" fill="#ff6b6b"/>
            <circle cx="2" cy="-3" r="1" fill="#ff6b6b"/>
            <!-- Body armor -->
            <rect x="-8" y="5" width="16" height="12" rx="2" fill="${fill}" opacity="0.8"/>
            <!-- Shield or weapon -->
            ${level > 7 ? 
                `<!-- Shield -->
                <circle cx="-12" cy="8" r="5" fill="#999" opacity="0.6"/>
                <line x1="-12" y1="5" x2="-12" y2="11" stroke="${fill}" stroke-width="1"/>` 
                : 
                `<!-- Spear -->
                <line x1="10" y1="-10" x2="10" y2="18" stroke="#999" stroke-width="2" stroke-linecap="round"/>
                <path d="M 8 -10 L 10 -15 L 12 -10" fill="#999"/>`
            }
        `;
    }

    getWeaponSVG() {
        return `
            <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <defs>
                    <linearGradient id="weaponGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ffed4e;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="200" height="300" fill="url(#weaponGrad)" rx="8"/>
                <rect x="5" y="5" width="190" height="290" fill="none" stroke="#b8860b" stroke-width="2" rx="8"/>
                
                <!-- Attack value in corner -->
                <circle cx="25" cy="25" r="28" fill="#b8860b" opacity="0.8"/>
                <text x="25" y="35" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">${this.value}</text>
                
                <!-- Weapon graphic -->
                <g transform="translate(100, 140) scale(2)">
                    ${this.createWeaponGraphic()}
                </g>
                
                <!-- Suit indicator -->
                <text x="175" y="280" font-size="48" fill="#b8860b" text-anchor="middle">♦</text>
            </svg>
        `;
    }

    createWeaponGraphic() {
        return `
            <!-- Sword -->
            <line x1="0" y1="-40" x2="0" y2="30" stroke="#888" stroke-width="3" stroke-linecap="round"/>
            <!-- Blade shine -->
            <line x1="1" y1="-35" x2="1" y2="20" stroke="#ddd" stroke-width="1" opacity="0.5"/>
            <!-- Cross guard -->
            <line x1="-12" y1="8" x2="12" y2="8" stroke="#8b4513" stroke-width="4" stroke-linecap="round"/>
            <!-- Handle -->
            <rect x="-3" y="10" width="6" height="18" fill="#8b4513" rx="1"/>
            <!-- Grip texture -->
            <line x1="-2" y1="13" x2="2" y2="13" stroke="#654321" stroke-width="0.5"/>
            <line x1="-2" y1="17" x2="2" y2="17" stroke="#654321" stroke-width="0.5"/>
            <line x1="-2" y1="21" x2="2" y2="21" stroke="#654321" stroke-width="0.5"/>
            <!-- Pommel -->
            <circle cx="0" cy="32" r="4" fill="#8b4513"/>
        `;
    }

    getPotionSVG() {
        return `
            <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                <defs>
                    <linearGradient id="potionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ff69b4;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff1493;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="200" height="300" fill="url(#potionGrad)" rx="8"/>
                <rect x="5" y="5" width="190" height="290" fill="none" stroke="#c71585" stroke-width="2" rx="8"/>
                
                <!-- Healing value in corner -->
                <circle cx="25" cy="25" r="28" fill="#c71585" opacity="0.8"/>
                <text x="25" y="35" font-size="32" font-weight="bold" fill="#fff" text-anchor="middle">${this.value}</text>
                
                <!-- Potion bottle graphic -->
                <g transform="translate(100, 140) scale(2)">
                    <!-- Bottle neck -->
                    <rect x="-6" y="-30" width="12" height="15" fill="#8b0a50" rx="2"/>
                    <!-- Bottle cap -->
                    <rect x="-8" y="-36" width="16" height="8" fill="#654321" rx="1"/>
                    <!-- Main bottle -->
                    <path d="M -16 -15 Q -18 0 -16 20 Q -12 30 0 32 Q 12 30 16 20 Q 18 0 16 -15" fill="#8b0a50" stroke="#ff1493" stroke-width="1"/>
                    <!-- Liquid inside -->
                    <path d="M -14 -10 Q -16 0 -14 15 Q -10 23 0 25 Q 10 23 14 15 Q 16 0 14 -10" fill="#ff69b4" opacity="0.6"/>
                    <!-- Shine/shimmer -->
                    <ellipse cx="-8" cy="5" rx="4" ry="8" fill="#fff" opacity="0.3"/>
                    <!-- Plus sign for healing -->
                    <line x1="-3" y1="35" x2="3" y2="35" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                    <line x1="0" y1="32" x2="0" y2="38" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                </g>
                
                <!-- Suit indicator -->
                <text x="175" y="280" font-size="48" fill="#c71585" text-anchor="middle">♥</text>
            </svg>
        `;
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
        this.addToDiscard(card);

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
        this.addToDiscard(card);

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

        this.addToDiscard(card);

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
        this.addToDiscard(this.state.equippedWeapon);
        this.state.stackedMonsters.forEach(monster => this.addToDiscard(monster));
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
        this.updateDebugDisplay();
        this.checkGameState();
    }

    addToDiscard(card) {
        if (!card) return;
        if (this.state.discardPile.includes(card)) return;
        this.state.discardPile.push(card);
    }

    formatCardList(cards) {
        if (!cards || cards.length === 0) return 'empty';
        return cards.map(card => card.getDisplay()).join(' ');
    }

    updateDebugDisplay() {
        const deckCountEl = document.getElementById('debugDeckCount');
        const deckContentEl = document.getElementById('debugDeckContent');
        const tableCountEl = document.getElementById('debugTableCount');
        const tableContentEl = document.getElementById('debugTableContent');
        const discardCountEl = document.getElementById('debugDiscardCount');
        const discardContentEl = document.getElementById('debugDiscardContent');

        if (!deckCountEl || !deckContentEl || !tableCountEl || !tableContentEl || !discardCountEl || !discardContentEl) return;

        const tableCards = [...this.state.currentRoom];
        if (this.state.equippedWeapon) {
            tableCards.push(this.state.equippedWeapon);
        }
        if (this.state.stackedMonsters.length > 0) {
            tableCards.push(...this.state.stackedMonsters);
        }

        deckCountEl.textContent = this.state.deck.length;
        discardCountEl.textContent = this.state.discardPile.length;
        deckContentEl.textContent = this.formatCardList(this.state.deck);
        discardContentEl.textContent = this.formatCardList(this.state.discardPile);
        tableCountEl.textContent = tableCards.length;
        tableContentEl.textContent = this.formatCardList(tableCards);
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
            
            if (this.selectedCard === index) {
                cardEl.classList.add('selected');
            }

            // Insert SVG graphics directly
            cardEl.innerHTML = card.getSVG();

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

            const weaponSvg = weaponCard.getSVG();
            container.innerHTML = `
                <div style="width: 100%; height: 150px; margin-bottom: 15px;">
                    ${weaponSvg}
                </div>
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
