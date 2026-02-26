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
        const fill = isSpades ? '#1a252f' : '#2d3e50';
        const accent = isSpades ? '#ff4444' : '#ff6b6b';
        return `
            <!-- Dragon body -->
            <ellipse cx="0" cy="0" rx="14" ry="20" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
            <!-- Dragon neck -->
            <path d="M -8 -15 Q -6 -25 0 -32" fill="${fill}" stroke="${fill}" stroke-width="1"/>
            <path d="M 8 -15 Q 6 -25 0 -32" fill="${fill}" stroke="${fill}" stroke-width="1"/>
            <!-- Dragon head -->
            <circle cx="0" cy="-38" r="10" fill="${fill}" stroke="#000" stroke-width="0.5"/>
            <!-- Dragon snout -->
            <ellipse cx="0" cy="-32" rx="8" ry="6" fill="${fill}" stroke="#000" stroke-width="0.5"/>
            <!-- Dragon jaw/mouth -->
            <path d="M -4 -30 L 4 -30 L 2 -26 L -2 -26 Z" fill="${accent}" opacity="0.6"/>
            <!-- Dragon eyes (glowing) -->
            <circle cx="-4" cy="-40" r="2.5" fill="${accent}"/>
            <circle cx="4" cy="-40" r="2.5" fill="${accent}"/>
            <circle cx="-4" cy="-40" r="1.2" fill="#fff" opacity="0.8"/>
            <circle cx="4" cy="-40" r="1.2" fill="#fff" opacity="0.8"/>
            <!-- Dragon horns/spikes -->
            <path d="M -6 -44 L -8 -52 L -5 -48" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
            <path d="M 0 -47 L 0 -56 L -1 -50" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
            <path d="M 6 -44 L 8 -52 L 5 -48" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
            <!-- Dragon wings -->
            <path d="M -14 -5 Q -26 -12 -24 5 L -16 2 Q -20 -4 -14 0" fill="${fill}" stroke="${fill}" stroke-width="0.5" opacity="0.9"/>
            <path d="M 14 -5 Q 26 -12 24 5 L 16 2 Q 20 -4 14 0" fill="${fill}" stroke="${fill}" stroke-width="0.5" opacity="0.9"/>
            <!-- Dragon tail -->
            <path d="M 0 18 Q 8 25 6 32" stroke="${fill}" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M -2 18 Q -10 26 -8 33" stroke="${fill}" stroke-width="3" fill="none" stroke-linecap="round"/>
            <!-- Fire breath -->
            <path d="M -2 -28 Q -6 -15 -8 5" stroke="${accent}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M 2 -28 Q 6 -15 8 5" stroke="${accent}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
        `;
    }

    createKing(isSpades) {
        const fill = isSpades ? '#1a252f' : '#2d3e50';
        const skin = '#d4a574';
        return `
            <!-- Crown base -->
            <ellipse cx="0" cy="-30" rx="14" ry="4" fill="#daa520" stroke="#b8860b" stroke-width="1"/>
            <!-- Crown points -->
            <path d="M -12 -30 L -10 -40 L -6 -32" fill="#ffc107" stroke="#b8860b" stroke-width="0.8"/>
            <path d="M 0 -30 L 0 -42 L 2 -32" fill="#ffc107" stroke="#b8860b" stroke-width="0.8"/>
            <path d="M 12 -30 L 10 -40 L 6 -32" fill="#ffc107" stroke="#b8860b" stroke-width="0.8"/>
            <!-- Jewels on crown -->
            <circle cx="-10" cy="-37" r="1.5" fill="#ff6b6b"/>
            <circle cx="0" cy="-39" r="1.5" fill="#ff6b6b"/>
            <circle cx="10" cy="-37" r="1.5" fill="#ff6b6b"/>
            <!-- Head -->
            <circle cx="0" cy="-10" r="11" fill="${skin}" stroke="${fill}" stroke-width="1"/>
            <!-- Eyes -->
            <circle cx="-5" cy="-12" r="1.5" fill="#333"/>
            <circle cx="5" cy="-12" r="1.5" fill="#333"/>
            <circle cx="-4" cy="-12.5" r="0.6" fill="#fff" opacity="0.8"/>
            <circle cx="5.4" cy="-12.5" r="0.6" fill="#fff" opacity="0.8"/>
            <!-- Nose -->
            <path d="M 0 -8 L -1 -2 L 1 -2" fill="${fill}" stroke="${fill}" stroke-width="0.5"/>
            <!-- Mouth -->
            <path d="M -3 0 Q 0 3 3 0" stroke="#333" stroke-width="0.8" fill="none" stroke-linecap="round"/>
            <!-- Beard -->
            <path d="M -8 4 Q 0 8 8 4" stroke="${fill}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <line x1="-6" y1="6" x2="-4" y2="10" stroke="${fill}" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="6.5" x2="0" y2="11" stroke="${fill}" stroke-width="1" opacity="0.6"/>
            <line x1="6" y1="6" x2="4" y2="10" stroke="${fill}" stroke-width="1" opacity="0.6"/>
            <!-- Neck -->
            <rect x="-6" y="0" width="12" height="6" fill="${skin}" stroke="${fill}" stroke-width="0.5"/>
            <!-- Royal robe -->
            <path d="M -10 6 L -12 18 L 0 20 L 12 18 L 10 6" fill="${fill}" stroke="#000" stroke-width="0.8"/>
            <!-- Robe trim -->
            <path d="M -11 8 Q -12 14 -10 18" stroke="#ffc107" stroke-width="1.2" fill="none"/>
            <path d="M 11 8 Q 12 14 10 18" stroke="#ffc107" stroke-width="1.2" fill="none"/>
        `;
    }

    createQueen(isSpades) {
        const fill = isSpades ? '#1a252f' : '#2d3e50';
        const skin = '#d4a574';
        return `
            <!-- Crown base -->
            <ellipse cx="0" cy="-27" rx="15" ry="5" fill="#e8d5b7" stroke="#b8860b" stroke-width="1"/>
            <!-- Crown ornate points -->
            <path d="M -12 -27 L -10 -38 L -7 -28" fill="#ffc107" stroke="#b8860b" stroke-width="0.8"/>
            <path d="M -4 -27 L -3 -42 L 0 -28" fill="#ff6b6b" stroke="#cc0000" stroke-width="0.8"/>
            <path d="M 4 -27 L 3 -42 L 0 -28" fill="#ff6b6b" stroke="#cc0000" stroke-width="0.8"/>
            <path d="M 12 -27 L 10 -38 L 7 -28" fill="#ffc107" stroke="#b8860b" stroke-width="0.8"/>
            <!-- Jewels -->
            <circle cx="-8" cy="-35" r="1.2" fill="#ff6b6b"/>
            <circle cx="-1" cy="-38" r="1.5" fill="#ff6b6b"/>
            <circle cx="1" cy="-38" r="1.5" fill="#ff6b6b"/>
            <circle cx="8" cy="-35" r="1.2" fill="#ff6b6b"/>
            <!-- Head -->
            <circle cx="0" cy="-5" r="12" fill="${skin}" stroke="${fill}" stroke-width="1"/>
            <!-- Hair -->
            <path d="M -12 -8 Q -14 -2 -10 4" stroke="#8b4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M 12 -8 Q 14 -2 10 4" stroke="#8b4513" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M -8 -16 Q -10 -14 -9 -8" stroke="#8b4513" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M 8 -16 Q 10 -14 9 -8" stroke="#8b4513" stroke-width="2" fill="none" stroke-linecap="round"/>
            <!-- Eyes (elegant) -->
            <ellipse cx="-5" cy="-7" rx="2" ry="1.5" fill="#333"/>
            <ellipse cx="5" cy="-7" rx="2" ry="1.5" fill="#333"/>
            <circle cx="-4.2" cy="-7.5" r="0.7" fill="#fff" opacity="0.9"/>
            <circle cx="5.4" cy="-7.5" r="0.7" fill="#fff" opacity="0.9"/>
            <!-- Eyebrows -->
            <path d="M -7 -9 Q -5 -10 -3 -9" stroke="#8b4513" stroke-width="0.6" fill="none" stroke-linecap="round"/>
            <path d="M 3 -9 Q 5 -10 7 -9" stroke="#8b4513" stroke-width="0.6" fill="none" stroke-linecap="round"/>
            <!-- Nose -->
            <line x1="0" y1="-4" x2="0" y2="0" stroke="${fill}" stroke-width="0.6"/>
            <!-- Lips -->
            <path d="M -2 2 Q 0 4 2 2" stroke="#c74461" stroke-width="0.8" fill="none" stroke-linecap="round"/>
            <!-- Necklace -->
            <path d="M -8 6 Q 0 10 8 6" stroke="#ffc107" stroke-width="1.5" fill="none"/>
            <circle cx="-5" cy="7" r="0.8" fill="#ff6b6b"/>
            <circle cx="0" cy="9" r="0.8" fill="#ff6b6b"/>
            <circle cx="5" cy="7" r="0.8" fill="#ff6b6b"/>
            <!-- Robe -->
            <path d="M -10 8 L -12 20 L 0 22 L 12 20 L 10 8" fill="#8b008b" stroke="#000" stroke-width="0.8"/>
            <!-- Robe trim -->
            <path d="M -11 10 Q -12 16 -10 20" stroke="#ff69b4" stroke-width="1" fill="none"/>
            <path d="M 11 10 Q 12 16 10 20" stroke="#ff69b4" stroke-width="1" fill="none"/>
        `;
    }

    createArmyLeader(isSpades) {
        const fill = isSpades ? '#1a252f' : '#2d3e50';
        const metalColor = '#888';
        return `
            <!-- Helmet -->
            <ellipse cx="0" cy="-22" rx="13" ry="10" fill="${metalColor}" stroke="#555" stroke-width="1"/>
            <!-- Helmet crest -->
            <ellipse cx="0" cy="-25" rx="7" ry="4" fill="#666" stroke="#555" stroke-width="0.8"/>
            <path d="M -3 -27 L -5 -35 L 0 -28" fill="#ff4444" stroke="#cc0000" stroke-width="0.6"/>
            <path d="M 3 -27 L 5 -35 L 0 -28" fill="#ff4444" stroke="#cc0000" stroke-width="0.6"/>
            <!-- Face mask -->
            <ellipse cx="0" cy="-10" rx="7" ry="9" fill="${metalColor}" stroke="#555" stroke-width="1"/>
            <!-- Eye slits -->
            <ellipse cx="-3" cy="-12" rx="1.5" ry="2" fill="#222"/>
            <ellipse cx="3" cy="-12" rx="1.5" ry="2" fill="#222"/>
            <!-- Eyes glowing through slits -->
            <circle cx="-3" cy="-12" r="0.8" fill="#ff6b6b"/>
            <circle cx="3" cy="-12" r="0.8" fill="#ff6b6b"/>
            <!-- Nose guard -->
            <path d="M -1 -8 L 0 -6 L 1 -8" fill="${metalColor}" stroke="#555" stroke-width="0.5"/>
            <!-- Mouth guard -->
            <rect x="-2" y="-4" width="4" height="3" fill="${metalColor}" stroke="#555" stroke-width="0.5"/>
            <!-- Sword blade -->
            <path d="M -2 -32 L -1 15 L 1 15 L 2 -32" fill="${metalColor}" stroke="#666" stroke-width="0.8"/>
            <!-- Blade shine -->
            <line x1="-0.5" y1="-30" x2="-0.5" y2="12" stroke="#ccc" stroke-width="0.4" opacity="0.6"/>
            <!-- Sword guard -->
            <ellipse cx="0" cy="5" rx="9" ry="2" fill="#8b4513" stroke="#654321" stroke-width="0.8"/>
            <!-- Sword handle -->
            <rect x="-1.5" y="6" width="3" height="12" fill="#8b4513" stroke="#654321" stroke-width="0.6"/>
            <!-- Handle grip -->
            <line x1="-1" y1="8" x2="1" y2="8" stroke="#654321" stroke-width="0.4"/>
            <line x1="-1" y1="11" x2="1" y2="11" stroke="#654321" stroke-width="0.4"/>
            <line x1="-1" y1="14" x2="1" y2="14" stroke="#654321" stroke-width="0.4"/>
            <!-- Pommel -->
            <circle cx="0" cy="20" r="2.5" fill="#8b4513" stroke="#654321" stroke-width="0.6"/>
            <!-- Armor breastplate -->
            <path d="M -8 2 L -10 16 L 0 18 L 10 16 L 8 2 Z" fill="${fill}" stroke="#555" stroke-width="1"/>
            <!-- Armor details -->
            <line x1="-5" y1="4" x2="-6" y2="14" stroke="${metalColor}" stroke-width="0.5" opacity="0.5"/>
            <line x1="5" y1="4" x2="6" y2="14" stroke="${metalColor}" stroke-width="0.5" opacity="0.5"/>
        `;
    }

    createSoldier(level, isSpades) {
        const fill = isSpades ? '#1a252f' : '#2d3e50';
        const metalColor = '#888';
        const helmetSize = 8 + (level > 5 ? 1.5 : 0);
        return `
            <!-- Helmet -->
            <ellipse cx="0" cy="-14" rx="${helmetSize}" ry="${helmetSize * 1.1}" fill="${metalColor}" stroke="#666" stroke-width="0.8"/>
            <!-- Helmet nasal -->
            <path d="M -1 -12 L 0 -8 L 1 -12" fill="${metalColor}" stroke="#666" stroke-width="0.5"/>
            <!-- Face -->
            <circle cx="0" cy="-2" r="6" fill="#d4a574" stroke="${fill}" stroke-width="0.5"/>
            <!-- Eyes -->
            <circle cx="-2" cy="-3" r="1" fill="#333"/>
            <circle cx="2" cy="-3" r="1" fill="#333"/>
            <circle cx="-1.5" cy="-3.5" r="0.4" fill="#fff" opacity="0.8"/>
            <circle cx="2.4" cy="-3.5" r="0.4" fill="#fff" opacity="0.8"/>
            <!-- Mouth -->
            <line x1="-1" y1="1" x2="1" y2="1" stroke="#8b4513" stroke-width="0.5"/>
            <!-- Body armor -->
            <ellipse cx="0" cy="8" rx="9" ry="10" fill="${fill}" stroke="#444" stroke-width="1"/>
            <!-- Armor segments -->
            <line x1="-8" y1="5" x2="8" y2="5" stroke="${metalColor}" stroke-width="0.8" opacity="0.5"/>
            <line x1="-8" y1="10" x2="8" y2="10" stroke="${metalColor}" stroke-width="0.8" opacity="0.5"/>
            <!-- Shield or weapon based on level -->
            ${level > 7 ? 
                `<!-- Shield (strong soldier) -->
                <circle cx="-12" cy="8" r="6" fill="#999" stroke="#666" stroke-width="0.8"/>
                <circle cx="-12" cy="8" r="4" fill="#777" opacity="0.6"/>
                <path d="M -14 6 L -10 6 L -12 10" fill="${fill}" opacity="0.7"/>
                <line x1="-12" y1="4" x2="-12" y2="12" stroke="${fill}" stroke-width="0.8" opacity="0.7"/>` 
                : 
                `<!-- Spear (regular soldier) -->
                <line x1="11" y1="-12" x2="11" y2="20" stroke="#999" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M 9 -12 L 11 -18 L 13 -12" fill="${metalColor}" stroke="#666" stroke-width="0.5"/>
                <line x1="10" y1="8" x2="12" y2="8" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>`
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
            <!-- Sword blade -->
            <path d="M -2.5 -42 L -1 10 L 0 32 L 1 10 L 2.5 -42" fill="#9ca3af" stroke="#666" stroke-width="0.8"/>
            <!-- Blade edges -->
            <line x1="-2.5" y1="-40" x2="0" y2="30" stroke="#555" stroke-width="0.5" opacity="0.7"/>
            <line x1="2.5" y1="-40" x2="0" y2="30" stroke="#555" stroke-width="0.5" opacity="0.7"/>
            <!-- Blade shine/edge highlight -->
            <line x1="-1" y1="-38" x2="-0.5" y2="25" stroke="#e8e8e8" stroke-width="0.6" opacity="0.8"/>
            <line x1="0.5" y1="-38" x2="1" y2="25" stroke="#e8e8e8" stroke-width="0.4" opacity="0.5"/>
            <!-- Spine/fuller detail -->
            <path d="M -0.8 -35 L -0.3 10 L 0 28 L 0.3 10 L 0.8 -35" fill="none" stroke="#999" stroke-width="0.4" opacity="0.6"/>
            <!-- Cross guard -->
            <ellipse cx="0" cy="8" rx="13" ry="2.5" fill="#8b4513" stroke="#654321" stroke-width="1"/>
            <ellipse cx="0" cy="8" rx="11" ry="2" fill="#a0522d" opacity="0.6"/>
            <!-- Guard detail -->
            <path d="M -10 6 Q -11 8 -10 10" stroke="#654321" stroke-width="0.5" fill="none" opacity="0.7"/>
            <path d="M 10 6 Q 11 8 10 10" stroke="#654321" stroke-width="0.5" fill="none" opacity="0.7"/>
            <!-- Handle -->
            <rect x="-2.5" y="10" width="5" height="18" fill="#8b4513" rx="1.5" stroke="#654321" stroke-width="0.8"/>
            <!-- Leather wrapping -->
            <line x1="-2" y1="12" x2="2" y2="12" stroke="#654321" stroke-width="0.6" opacity="0.8"/>
            <line x1="-2" y1="15" x2="2" y2="15" stroke="#654321" stroke-width="0.6" opacity="0.8"/>
            <line x1="-2" y1="18" x2="2" y2="18" stroke="#654321" stroke-width="0.6" opacity="0.8"/>
            <line x1="-2" y1="21" x2="2" y2="21" stroke="#654321" stroke-width="0.6" opacity="0.8"/>
            <line x1="-2" y1="24" x2="2" y2="24" stroke="#654321" stroke-width="0.6" opacity="0.8"/>
            <!-- Pommel -->
            <circle cx="0" cy="32" r="3.5" fill="#8b4513" stroke="#654321" stroke-width="1"/>
            <circle cx="0" cy="32" r="2" fill="#a0522d" opacity="0.6"/>
            <!-- Pommel detail -->
            <circle cx="-1" cy="31" r="0.6" fill="#daa520" opacity="0.7"/>
            <circle cx="1" cy="33" r="0.6" fill="#daa520" opacity="0.7"/>
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
        this.visitedRooms = [1];
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
                        `💥 Monster ${card.getDisplay()} defeated by ${this.state.equippedWeapon.getDisplay()}!`,
                        'success'
                    );
                } else {
                    // Monster > weapon: reduced damage = monster - weapon
                    damage = monsterValue - weaponValue;
                    monsterKilled = true;
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
        this.state.visitedRooms.push(this.state.roomNumber);
        this.state.cardsUsedThisRoom = 0;
        this.state.potionUsedThisRoom = false;
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
        this.checkGameState();
    }

    addToDiscard(card) {
        if (!card) return;
        if (this.state.discardPile.includes(card)) return;
        this.state.discardPile.push(card);
    }



    updateStats() {
        document.getElementById('healthDisplay').textContent = this.state.health;
        document.getElementById('deckDisplay').textContent = this.state.deck.length;
        document.getElementById('roomDisplay').textContent = this.toRomanNumeral(this.state.roomNumber);
        document.getElementById('cardsUsed').textContent = this.state.cardsUsedThisRoom;
        this.updateHealthBar();
        this.updateRoomProgressPath();
        this.updateDungeonDepthAtmosphere();
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

    updateHealthBar() {
        const healthPercent = (this.state.health / this.state.maxHealth) * 100;
        const style = healthPercent > 50 ? '#52b788' : healthPercent > 25 ? '#ffc107' : '#ff6b6b';
        const barEl = document.getElementById('healthBar');
        if (barEl) {
            barEl.style.width = healthPercent + '%';
            barEl.style.backgroundColor = style;
        }
    }

    updateRoomProgressPath() {
        const pathEl = document.getElementById('roomProgressPath');
        if (!pathEl) return;
        
        let path = '';
        for (let i = 1; i <= this.state.roomNumber; i++) {
            const isCurrent = i === this.state.roomNumber;
            const classes = isCurrent ? 'node current' : 'node visited';
            path += `<div class="${classes}" title="Room ${this.toRomanNumeral(i)}"></div>`;
            if (i < this.state.roomNumber) {
                path += '<div class="connector"></div>';
            }
        }
        pathEl.innerHTML = path;
    }

    updateDungeonDepthAtmosphere() {
        const depth = Math.min(this.state.roomNumber, 10);
        const darkness = 0.05 + (depth * 0.04);
        const container = document.querySelector('.container');
        if (container) {
            container.style.setProperty('--dungeon-depth', darkness);
        }
        
        const mainGame = document.querySelector('.main-game');
        if (mainGame) {
            const shadowIntensity = 0.1 + (depth * 0.05);
            mainGame.style.boxShadow = `inset 0 0 40px rgba(0, 0, 0, ${shadowIntensity})`;
        }
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
                stackInfo = `<div class="stacked-monsters">⚠️ THREATS (${this.state.stackedMonsters.length}):<br>`;
                this.state.stackedMonsters.forEach(m => {
                    stackInfo += `${m.getDisplay()} `;
                });
                stackInfo += '</div>';
            }

            const weaponSvg = weaponCard.getSVG();
            container.classList.add('equipped');
            container.innerHTML = `
                <div style="width: 100%; height: 150px; margin-bottom: 15px;">
                    ${weaponSvg}
                </div>
                ${stackInfo}
            `;
            discardBtn.disabled = false;
        } else {
            container.classList.remove('equipped');
            container.innerHTML = '<div style="opacity: 0.5;">⚔️ No weapon equipped</div>';
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
