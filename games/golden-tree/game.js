/**
 * Golden Tree - Demo Slot Engine
 * Fully Client-Side / Offline / Ready for GitHub & GitHub Pages
 */

// تعريف متجهات الرموز بدقة عالية (SVG Definitions)
const SYMBOLS_SVG = {
    tree: `<img src="tree-approved.png" alt="WILD" class="approved-tree-symbol">`,
    seven: `
        <svg viewBox="0 0 100 100">
            <defs>
                <linearGradient id="sevenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ff3b30" />
                    <stop offset="50%" stop-color="#c01c10" />
                    <stop offset="100%" stop-color="#7a0902" />
                </linearGradient>
            </defs>
            <!-- إطار ذهبي خارجي -->
            <path d="M22,16 L78,16 L78,26 L48,84 L32,84 L60,28 L22,28 Z" fill="#ffd700" stroke="#b8860b" stroke-width="3"/>
            <path d="M25,19 L75,19 L75,25 L47,81 L35,81 L61,27 L25,27 Z" fill="url(#sevenGrad)"/>
            <circle cx="72" cy="22" r="3" fill="#fff" opacity="0.8"/>
        </svg>
    `,
    bell: `
        <svg viewBox="0 0 100 100">
            <defs>
                <linearGradient id="bellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#fff099" />
                    <stop offset="50%" stop-color="#f5b000" />
                    <stop offset="100%" stop-color="#8a5700" />
                </linearGradient>
            </defs>
            <path d="M50,15 C42,15 36,25 34,42 C30,46 25,62 20,70 L80,70 C75,62 70,46 66,42 C64,25 58,15 50,15 Z" fill="url(#bellGrad)" stroke="#523200" stroke-width="2"/>
            <rect x="18" y="68" width="64" height="6" rx="3" fill="#ffd700" stroke="#7a4b00"/>
            <circle cx="50" cy="79" r="6" fill="#f5b000" stroke="#523200"/>
            <ellipse cx="44" cy="35" rx="4" ry="12" fill="#fff" opacity="0.4" transform="rotate(-15 44 35)"/>
        </svg>
    `,
    watermelon: `
        <svg viewBox="0 0 100 100">
            <defs>
                <linearGradient id="melonRed" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ff3b5c"/>
                    <stop offset="100%" stop-color="#b80927"/>
                </linearGradient>
            </defs>
            <path d="M15,40 C15,75 40,85 50,85 C60,85 85,75 85,40 Z" fill="#2e7d32" stroke="#1b5e20" stroke-width="2"/>
            <path d="M18,41 C18,72 40,82 50,82 C60,82 82,72 82,41 Z" fill="#e8f5e9"/>
            <path d="M21,42 C21,69 42,78 50,78 C58,78 79,69 79,42 Z" fill="url(#melonRed)"/>
            <!-- بذور البطيخ -->
            <ellipse cx="36" cy="54" rx="2" ry="3.5" fill="#212121" transform="rotate(15 36 54)"/>
            <ellipse cx="50" cy="62" rx="2" ry="3.5" fill="#212121"/>
            <ellipse cx="64" cy="54" rx="2" ry="3.5" fill="#212121" transform="rotate(-15 64 54)"/>
        </svg>
    `,
    grapes: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="grapeGrad" cx="35%" cy="35%">
                    <stop offset="0%" stop-color="#ba68c8"/>
                    <stop offset="70%" stop-color="#6a1b9a"/>
                    <stop offset="100%" stop-color="#38006b"/>
                </radialGradient>
            </defs>
            <!-- غصن العنب -->
            <path d="M50,15 Q55,25 48,32" stroke="#8d6e63" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M48,22 Q60,18 64,25 Q56,28 48,24" fill="#66bb6a"/>
            <!-- حبات العنب -->
            <circle cx="40" cy="38" r="9" fill="url(#grapeGrad)"/>
            <circle cx="58" cy="38" r="9" fill="url(#grapeGrad)"/>
            <circle cx="32" cy="52" r="9" fill="url(#grapeGrad)"/>
            <circle cx="50" cy="52" r="9" fill="url(#grapeGrad)"/>
            <circle cx="68" cy="52" r="9" fill="url(#grapeGrad)"/>
            <circle cx="41" cy="66" r="9" fill="url(#grapeGrad)"/>
            <circle cx="59" cy="66" r="9" fill="url(#grapeGrad)"/>
            <circle cx="50" cy="78" r="8" fill="url(#grapeGrad)"/>
        </svg>
    `,
    plum: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="plumGrad" cx="40%" cy="40%">
                    <stop offset="0%" stop-color="#ab47bc"/>
                    <stop offset="60%" stop-color="#4a148c"/>
                    <stop offset="100%" stop-color="#1a0033"/>
                </radialGradient>
            </defs>
            <path d="M50,16 Q54,26 50,32" stroke="#5d4037" stroke-width="4" fill="none"/>
            <path d="M50,22 Q65,15 62,28 Z" fill="#4caf50"/>
            <ellipse cx="50" cy="58" rx="26" ry="28" fill="url(#plumGrad)"/>
            <ellipse cx="42" cy="46" rx="5" ry="10" fill="#fff" opacity="0.3" transform="rotate(-20 42 46)"/>
        </svg>
    `,
    orange: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="orangeGrad" cx="35%" cy="35%">
                    <stop offset="0%" stop-color="#ffb74d"/>
                    <stop offset="70%" stop-color="#f57c00"/>
                    <stop offset="100%" stop-color="#b35400"/>
                </radialGradient>
            </defs>
            <path d="M50,16 Q52,24 50,28" stroke="#5d4037" stroke-width="3" fill="none"/>
            <circle cx="50" cy="56" r="28" fill="url(#orangeGrad)"/>
            <ellipse cx="40" cy="45" rx="5" ry="9" fill="#fff" opacity="0.3" transform="rotate(-25 40 45)"/>
        </svg>
    `,
    lemon: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="lemonGrad" cx="40%" cy="40%">
                    <stop offset="0%" stop-color="#fff59d"/>
                    <stop offset="70%" stop-color="#fbc02d"/>
                    <stop offset="100%" stop-color="#f57f17"/>
                </radialGradient>
            </defs>
            <path d="M30,35 C40,20 65,22 75,35 C88,48 88,68 75,78 C62,88 38,88 25,75 C14,64 16,46 30,35 Z" fill="url(#lemonGrad)"/>
            <ellipse cx="45" cy="45" rx="6" ry="12" fill="#fff" opacity="0.3" transform="rotate(-30 45 45)"/>
        </svg>
    `,
    cherry: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="cherryGrad" cx="35%" cy="35%">
                    <stop offset="0%" stop-color="#ff5252"/>
                    <stop offset="70%" stop-color="#d50000"/>
                    <stop offset="100%" stop-color="#5b0000"/>
                </radialGradient>
            </defs>
            <path d="M52,18 C50,35 34,50 34,60 M52,18 C54,35 68,52 68,64" stroke="#4e342e" stroke-width="3" fill="none"/>
            <path d="M52,20 Q65,15 62,26 Z" fill="#66bb6a"/>
            <circle cx="34" cy="64" r="14" fill="url(#cherryGrad)"/>
            <circle cx="68" cy="68" r="14" fill="url(#cherryGrad)"/>
            <circle cx="30" cy="60" r="3.5" fill="#fff" opacity="0.6"/>
            <circle cx="64" cy="64" r="3.5" fill="#fff" opacity="0.6"/>
        </svg>
    `,
    scatter_star: `
        <svg viewBox="0 0 100 100">
            <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#ffd700"/>
                    <stop offset="100%" stop-color="#ff9100"/>
                </linearGradient>
            </defs>
            <polygon points="50,10 63,38 93,40 70,60 77,90 50,74 23,90 30,60 7,40 37,38" fill="url(#starGrad)" stroke="#b8860b" stroke-width="3"/>
            <polygon points="50,22 59,41 79,42 63,55 68,75 50,64 32,75 37,55 21,42 41,41" fill="#fff" opacity="0.4"/>
            <text x="50" y="98" font-family="'Cinzel', serif" font-weight="900" font-size="8" fill="#ffd700" text-anchor="middle">SCATTER</text>
        </svg>
    `,
    scatter_dollar: `
        <svg viewBox="0 0 100 100">
            <defs>
                <radialGradient id="coinGrad" cx="40%" cy="40%">
                    <stop offset="0%" stop-color="#fff3a1"/>
                    <stop offset="60%" stop-color="#f5b000"/>
                    <stop offset="100%" stop-color="#7a4b00"/>
                </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="38" fill="url(#coinGrad)" stroke="#ffd700" stroke-width="3"/>
            <circle cx="50" cy="50" r="31" fill="none" stroke="#b8860b" stroke-dasharray="3,3" stroke-width="2"/>
            <text x="50" y="66" font-family="'Cinzel', serif" font-size="44" font-weight="900" fill="#422500" text-anchor="middle">$</text>
            <text x="49" y="65" font-family="'Cinzel', serif" font-size="44" font-weight="900" fill="#ffd700" text-anchor="middle">$</text>
            <text x="50" y="98" font-family="'Cinzel', serif" font-weight="900" font-size="8" fill="#ffd700" text-anchor="middle">SCATTER</text>
        </svg>
    `
};

// جدول المدفوعات (Paytable Multipliers x Line Bet)
const PAYTABLE = {
    seven:          { 3: 50, 4: 200, 5: 1000 },
    bell:           { 3: 30, 4: 100, 5: 400 },
    watermelon:     { 3: 25, 4: 80,  5: 250 },
    grapes:         { 3: 20, 4: 60,  5: 200 },
    plum:           { 3: 10, 4: 30,  5: 100 },
    orange:         { 3: 10, 4: 30,  5: 100 },
    lemon:          { 3: 10, 4: 30,  5: 100 },
    cherry:         { 2: 5,  3: 10, 4: 30, 5: 100 },
    scatter_star:   { 3: 20, 4: 100, 5: 500 }, // مضروبة بإجمالي الرهان (Total Bet)
    scatter_dollar: { 3: 30 }                  // تظهر فقط في البكرات 1 و 3 و 5
};

// خطوط الدفع العشرة القياسية (10 Fixed Paylines) [الصف في كل بكرة: 0=العلوي، 1=الأوسط، 2=السفلي]
const PAYLINES = [
    [1, 1, 1, 1, 1], // خط 1 (الأوسط)
    [0, 0, 0, 0, 0], // خط 2 (العلوي)
    [2, 2, 2, 2, 2], // خط 3 (السفلي)
    [0, 1, 2, 1, 0], // خط 4 (شكل V مقلوب)
    [2, 1, 0, 1, 2], // خط 5 (شكل V)
    [0, 0, 1, 2, 2], // خط 6
    [2, 2, 1, 0, 0], // خط 7
    [1, 2, 2, 2, 1], // خط 8
    [1, 0, 0, 0, 1], // خط 9
    [0, 1, 1, 1, 0]  // خط 10
];

const PAYLINE_COLORS = [
    "#ffd700", "#ff3b30", "#34c759", "#007aff", "#af52de",
    "#ff9500", "#5856d6", "#5ac8fa", "#ff2d55", "#4cd964"
];

// توزيع احتمالات الرموز على البكرات (Reel Strips Generation)
const SYMBOL_POOL = [
    'cherry', 'cherry', 'cherry', 'cherry',
    'lemon', 'lemon', 'lemon', 'lemon',
    'orange', 'orange', 'orange',
    'plum', 'plum', 'plum',
    'grapes', 'grapes',
    'watermelon', 'watermelon',
    'bell', 'bell',
    'seven',
    'scatter_star',
    'scatter_dollar'
];

// محاكي الصوت التوليدي الداخلي (Web Audio API Synthesizer)
class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playReelSpin() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playReelStop() {
        if (this.muted) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playWildExpand() {
        if (this.muted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.07);
            osc.stop(this.ctx.currentTime + idx * 0.07 + 0.35);
        });
    }

    playWin() {
        if (this.muted) return;
        this.init();
        const chord = [440, 554.37, 659.25, 880];
        chord.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.45);
        });
    }

    playBigWin() {
        if (this.muted) return;
        this.init();
        const melody = [523, 659, 784, 1046, 784, 1046, 1318];
        melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + i * 0.1);
            osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
        });
    }
}

// محرك السلوت الرئيسي (Slot Game Core)
class GoldenTreeGame {
    constructor() {
        this.sound = new SoundSynthesizer();

        this.balance = parseFloat(localStorage.getItem('gt_demo_balance')) || 5000.00;
        this.betOptions = [10, 20, 50, 100, 200, 500, 1000];
        this.betIndex = 0;
        this.lastWin = 0;

        this.isSpinning = false;
        this.isTurbo = false;
        this.isAuto = false;
        this.bonusGuaranteeTree = false;

        // مصفوفة البكرات 5x3 (الحالية)
        this.grid = [
            ['cherry', 'lemon', 'orange'],
            ['grapes', 'tree', 'watermelon'],
            ['bell', 'seven', 'plum'],
            ['tree', 'grapes', 'cherry'],
            ['scatter_star', 'orange', 'lemon']
        ];

        this.initDOM();
        this.buildPaytableUI();
        this.renderInitialGrid();
        this.updateDisplays();
        this.startJackpotTickers();
    }

    initDOM() {
        this.dom = {
            balance: document.getElementById('display-balance'),
            bet: document.getElementById('display-bet'),
            lastWin: document.getElementById('display-lastwin'),
            winAmount: document.getElementById('win-amount'),
            bonusCost: document.getElementById('bonus-cost'),
            btnSpin: document.getElementById('btn-spin'),
            btnTurbo: document.getElementById('btn-turbo'),
            btnAuto: document.getElementById('btn-auto'),
            btnBuyBonus: document.getElementById('btn-buy-bonus'),
            btnBetPlus: document.getElementById('btn-bet-plus'),
            btnBetMinus: document.getElementById('btn-bet-minus'),
            btnSound: document.getElementById('btn-sound'),
            btnResetBalance: document.getElementById('btn-reset-balance'),
            btnPaytable: document.getElementById('btn-paytable'),
            paytableModal: document.getElementById('paytable-modal'),
            closePaytable: document.getElementById('close-paytable'),
            celebrationOverlay: document.getElementById('celebration-overlay'),
            celebrationTitle: document.getElementById('celebration-title'),
            celebrationAmount: document.getElementById('celebration-amount'),
            btnClaimWin: document.getElementById('btn-claim-win'),
            paylinesSvg: document.getElementById('paylines-svg'),
            reelsContainer: document.getElementById('reels-container')
        };

        // ربط الأحداث
        this.dom.btnSpin.addEventListener('click', () => this.spin());
        this.dom.btnBetPlus.addEventListener('click', () => this.changeBet(1));
        this.dom.btnBetMinus.addEventListener('click', () => this.changeBet(-1));
        
        this.dom.btnTurbo.addEventListener('click', () => {
            this.isTurbo = !this.isTurbo;
            this.dom.btnTurbo.classList.toggle('active', this.isTurbo);
            this.sound.playClick();
        });

        this.dom.btnAuto.addEventListener('click', () => {
            this.isAuto = !this.isAuto;
            this.dom.btnAuto.classList.toggle('active', this.isAuto);
            this.dom.btnAuto.textContent = this.isAuto ? '⏹️ إيقاف' : '🔁 تلقائي';
            this.sound.playClick();
            if (this.isAuto && !this.isSpinning) {
                this.spin();
            }
        });

        this.dom.btnBuyBonus.addEventListener('click', () => this.buyBonus());

        this.dom.btnSound.addEventListener('click', () => {
            this.sound.muted = !this.sound.muted;
            this.dom.btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
        });

        this.dom.btnResetBalance.addEventListener('click', () => {
            this.balance = 5000.00;
            this.saveBalance();
            this.updateDisplays();
            this.sound.playClick();
        });

        this.dom.btnPaytable.addEventListener('click', () => {
            this.dom.paytableModal.classList.add('open');
            this.sound.playClick();
        });

        this.dom.closePaytable.addEventListener('click', () => {
            this.dom.paytableModal.classList.remove('open');
        });

        this.dom.btnClaimWin.addEventListener('click', () => {
            this.dom.celebrationOverlay.classList.remove('open');
            if (this.isAuto) setTimeout(() => this.spin(), 500);
        });

        // زر المسافة للدوران السريع
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning && !this.dom.paytableModal.classList.contains('open')) {
                e.preventDefault();
                this.spin();
            }
        });
    }

    getCurrentBet() {
        return this.betOptions[this.betIndex];
    }

    changeBet(delta) {
        if (this.isSpinning) return;
        this.betIndex = Math.max(0, Math.min(this.betOptions.length - 1, this.betIndex + delta));
        this.updateDisplays();
        this.sound.playClick();
    }

    updateDisplays() {
        const bet = this.getCurrentBet();
        this.dom.balance.textContent = this.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.dom.bet.textContent = bet.toFixed(2);
        this.dom.lastWin.textContent = this.lastWin.toFixed(2);
        this.dom.bonusCost.textContent = (bet * 50).toFixed(0);
    }

    saveBalance() {
        localStorage.setItem('gt_demo_balance', this.balance);
    }

    renderInitialGrid() {
        for (let r = 0; r < 5; r++) {
            const reelEl = document.getElementById(`reel-${r}`);
            const stripEl = reelEl.querySelector('.reel-strip');
            stripEl.innerHTML = '';
            for (let row = 0; row < 3; row++) {
                const sym = this.grid[r][row];
                const cell = document.createElement('div');
                cell.className = 'symbol-cell';
                cell.dataset.symbol = sym;
                cell.innerHTML = SYMBOLS_SVG[sym] || '';
                stripEl.appendChild(cell);
            }
        }
    }

    // شراء جولة البونص (Buy Bonus)
    buyBonus() {
        if (this.isSpinning) return;
        const cost = this.getCurrentBet() * 50;
        if (this.balance < cost) {
            alert('عفواً، رصيدك التجريبي غير كافٍ لشراء ميزة البونص!');
            return;
        }
        this.balance -= cost;
        this.bonusGuaranteeTree = true;
        this.saveBalance();
        this.updateDisplays();
        this.sound.playBigWin();
        this.spin();
    }

    // توليد مصفوفة نتيجة جديدة (RNG Generation)
    generateRandomGrid() {
        const newGrid = [];
        for (let r = 0; r < 5; r++) {
            newGrid[r] = [];
            for (let row = 0; row < 3; row++) {
                // تظهر الشجرة في البكرات 2 و 3 و 4 فقط
                const canHaveTree = (r >= 1 && r <= 3);
                let sym;
                if (canHaveTree && (this.bonusGuaranteeTree || Math.random() < 0.12)) {
                    sym = 'tree';
                } else {
                    sym = SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
                    // الـ Dollar Scatter لا تظهر إلا في البكرات 1 و 3 و 5
                    if (sym === 'scatter_dollar' && (r === 1 || r === 3)) {
                        sym = 'cherry';
                    }
                }
                newGrid[r][row] = sym;
            }
        }
        this.bonusGuaranteeTree = false;
        return newGrid;
    }

    // دوران البكرات
    async spin() {
        const bet = this.getCurrentBet();
        if (this.balance < bet) {
            this.isAuto = false;
            this.dom.btnAuto.classList.remove('active');
            this.dom.btnAuto.textContent = '🔁 تلقائي';
            alert('الرصيد التجريبي نفد! اضغط على زر التحديث 🔄 لإعادة شحن 5,000 رصيد مجاناً.');
            return;
        }

        this.isSpinning = true;
        this.dom.btnSpin.disabled = true;
        this.clearPaylines();

        this.balance -= bet;
        this.saveBalance();
        this.updateDisplays();
        this.dom.winAmount.textContent = '0.00';

        const nextGrid = this.generateRandomGrid();

        // تنفيذ حركة الدوران للبكرات
        const spinDuration = this.isTurbo ? 500 : 1200;
        const reelDelay = this.isTurbo ? 100 : 250;

        const reelPromises = [];

        for (let r = 0; r < 5; r++) {
            const p = new Promise(resolve => {
                setTimeout(() => {
                    this.animateReel(r, nextGrid[r], () => {
                        this.sound.playReelStop();
                        resolve();
                    });
                }, r * reelDelay);
            });
            reelPromises.push(p);
        }

        await Promise.all(reelPromises);

        this.grid = nextGrid;
        await this.evaluateOutcome();

        this.isSpinning = false;
        this.dom.btnSpin.disabled = false;

        if (this.isAuto) {
            setTimeout(() => {
                if (this.isAuto && !this.isSpinning) this.spin();
            }, this.isTurbo ? 400 : 900);
        }
    }

    // حركة انزلاق ودوران البكرة الفردية
    animateReel(reelIndex, targetSymbols, onComplete) {
        const reelEl = document.getElementById(`reel-${reelIndex}`);
        const stripEl = reelEl.querySelector('.reel-strip');

        // بناء شريط دوران عشوائي سريع
        const tempSymbols = [];
        const numFiller = this.isTurbo ? 8 : 16;
        for (let i = 0; i < numFiller; i++) {
            tempSymbols.push(SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)]);
        }
        tempSymbols.push(...targetSymbols);

        stripEl.innerHTML = '';
        tempSymbols.forEach(sym => {
            const cell = document.createElement('div');
            cell.className = 'symbol-cell';
            cell.dataset.symbol = sym;
            cell.innerHTML = SYMBOLS_SVG[sym] || '';
            stripEl.appendChild(cell);
        });

        const symbolHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--symbol-height')) || 120;
        const totalDistance = numFiller * symbolHeight;

        stripEl.style.transition = 'none';
        stripEl.style.transform = 'translateY(0px)';

        stripEl.getBoundingClientRect(); // reflow

        const duration = this.isTurbo ? 0.45 : 0.85;
        stripEl.style.transition = `transform ${duration}s cubic-bezier(0.25, 1, 0.5, 1)`;
        stripEl.style.transform = `translateY(-${totalDistance}px)`;

        // صوت دوران
        if (Math.random() > 0.4) this.sound.playReelSpin();

        setTimeout(() => {
            stripEl.style.transition = 'none';
            stripEl.style.transform = 'translateY(0px)';
            stripEl.innerHTML = '';
            targetSymbols.forEach(sym => {
                const cell = document.createElement('div');
                cell.className = 'symbol-cell';
                cell.dataset.symbol = sym;
                cell.innerHTML = SYMBOLS_SVG[sym] || '';
                stripEl.appendChild(cell);
            });
            onComplete();
        }, duration * 1000);
    }

    // فحص وتقييم النتيجة وتطبيق ميزة التمدد للشجرة (Expanding Wild)
    async evaluateOutcome() {
        const lineBet = this.getCurrentBet() / 10;
        let totalWin = 0;
        const winningLines = [];

        // فحص البكرات 2 و 3 و 4 لمعرفة هل تحتوي على شجرة ذهبية
        const expandingReels = [];
        for (let r = 1; r <= 3; r++) {
            if (this.grid[r].includes('tree')) {
                expandingReels.push(r);
            }
        }

        // تفعيل ميزة التمدد للشجرة الذهبية (Expanding Wilds)
        if (expandingReels.length > 0) {
            this.sound.playWildExpand();
            expandingReels.forEach(r => {
                // تحويل جميع صفوف البكرة للشجرة الذهبية
                this.grid[r] = ['tree', 'tree', 'tree'];
                const reelEl = document.getElementById(`reel-${r}`);
                const cells = reelEl.querySelectorAll('.symbol-cell');
                cells.forEach(c => {
                    c.innerHTML = SYMBOLS_SVG.tree;
                    c.classList.add('expanding-wild-symbol');
                });
            });
            await new Promise(r => setTimeout(r, 650));
        }

        // فحص خطوط الدفع العشرة
        PAYLINES.forEach((pattern, lineIdx) => {
            const lineSymbols = pattern.map((row, reel) => this.grid[reel][row]);
            
            // تحديد الرمز الأساسي للخط (أول رمز غير Wild من اليسار)
            let baseSymbol = null;
            for (let sym of lineSymbols) {
                if (sym !== 'tree') {
                    baseSymbol = sym;
                    break;
                }
            }

            if (!baseSymbol || baseSymbol.startsWith('scatter_')) return;

            let matchCount = 0;
            for (let sym of lineSymbols) {
                if (sym === baseSymbol || sym === 'tree') {
                    matchCount++;
                } else {
                    break;
                }
            }

            if (PAYTABLE[baseSymbol] && PAYTABLE[baseSymbol][matchCount]) {
                const payout = PAYTABLE[baseSymbol][matchCount] * lineBet;
                totalWin += payout;
                winningLines.push({
                    lineIndex: lineIdx,
                    pattern,
                    payout,
                    matchCount,
                    symbol: baseSymbol
                });
            }
        });

        // فحص رموز الـ Scatter (تعتمد على العدد الإجمالي في أي مكان بالشاشة)
        let starCount = 0;
        let dollarCount = 0;
        for (let r = 0; r < 5; r++) {
            for (let row = 0; row < 3; row++) {
                if (this.grid[r][row] === 'scatter_star') starCount++;
                if (this.grid[r][row] === 'scatter_dollar') dollarCount++;
            }
        }

        const totalBet = this.getCurrentBet();
        if (PAYTABLE.scatter_star[starCount]) {
            const starPayout = PAYTABLE.scatter_star[starCount] * totalBet;
            totalWin += starPayout;
            winningLines.push({ type: 'scatter', symbol: 'scatter_star', payout: starPayout, count: starCount });
        }

        if (dollarCount >= 3 && PAYTABLE.scatter_dollar[3]) {
            const dollarPayout = PAYTABLE.scatter_dollar[3] * totalBet;
            totalWin += dollarPayout;
            winningLines.push({ type: 'scatter', symbol: 'scatter_dollar', payout: dollarPayout, count: dollarCount });
        }

        // إظهار النتائج والمكافآت
        if (totalWin > 0) {
            this.balance += totalWin;
            this.lastWin = totalWin;
            this.saveBalance();
            this.updateDisplays();
            this.dom.winAmount.textContent = totalWin.toFixed(2);

            this.sound.playWin();
            this.highlightWinningSymbols(winningLines);
            this.drawPaylines(winningLines);

            // احتفال الفوز الكبير (Big Win) إذا تجاوز 15 ضعف الرهان
            if (totalWin >= totalBet * 15) {
                setTimeout(() => {
                    this.showCelebration(totalWin);
                }, 700);
            }
        }
    }

    // إبراز الرموز الفائزة بحركات نابضة
    highlightWinningSymbols(winningLines) {
        winningLines.forEach(line => {
            if (line.pattern) {
                for (let r = 0; r < line.matchCount; r++) {
                    const row = line.pattern[r];
                    const reelEl = document.getElementById(`reel-${r}`);
                    const cells = reelEl.querySelectorAll('.symbol-cell');
                    if (cells[row]) cells[row].classList.add('highlight');
                }
            }
        });
    }

    // رسم مسارات خطوط الفوز على قناع الـ SVG
    drawPaylines(winningLines) {
        const svg = this.dom.paylinesSvg;
        svg.innerHTML = '';

        const containerRect = this.dom.reelsContainer.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

        winningLines.forEach((win, i) => {
            if (!win.pattern) return;
            const points = [];
            for (let r = 0; r < win.matchCount; r++) {
                const row = win.pattern[r];
                const reelEl = document.getElementById(`reel-${r}`);
                const cell = reelEl.querySelectorAll('.symbol-cell')[row];
                if (cell) {
                    const cellRect = cell.getBoundingClientRect();
                    const x = cellRect.left - containerRect.left + cellRect.width / 2;
                    const y = cellRect.top - containerRect.top + cellRect.height / 2;
                    points.push(`${x},${y}`);
                }
            }

            if (points.length >= 2) {
                const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                polyline.setAttribute('points', points.join(' '));
                polyline.setAttribute('stroke', PAYLINE_COLORS[win.lineIndex % PAYLINE_COLORS.length]);
                polyline.setAttribute('stroke-width', '5');
                polyline.setAttribute('fill', 'none');
                polyline.setAttribute('stroke-linecap', 'round');
                polyline.setAttribute('stroke-linejoin', 'round');
                polyline.style.filter = 'drop-shadow(0 0 8px gold)';
                svg.appendChild(polyline);

                // إضاءة أرقام خطوط الدفع الجانبية
                const peg = document.querySelector(`.payline-pegs span[data-line="${win.lineIndex + 1}"]`);
                if (peg) peg.classList.add('active');
            }
        });
    }

    clearPaylines() {
        this.dom.paylinesSvg.innerHTML = '';
        document.querySelectorAll('.symbol-cell').forEach(c => {
            c.classList.remove('highlight', 'expanding-wild-symbol');
        });
        document.querySelectorAll('.payline-pegs span').forEach(p => p.classList.remove('active'));
    }

    showCelebration(amount) {
        this.sound.playBigWin();
        const bet = this.getCurrentBet();
        let title = 'BIG WIN!';
        if (amount >= bet * 50) title = 'MEGA WIN!';
        if (amount >= bet * 100) title = 'EPIC JACKPOT!';

        this.dom.celebrationTitle.textContent = title;
        this.dom.celebrationAmount.textContent = amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
        this.dom.celebrationOverlay.classList.add('open');
    }

    // بناء محتويات نافذة جدول الأرباح
    buildPaytableUI() {
        const grid = document.getElementById('paytable-symbols-grid');
        grid.innerHTML = '';

        const namesAr = {
            seven: 'الرقم 7 المحظوظ',
            bell: 'الجرس الذهبي',
            watermelon: 'البطيخ اللذيذ',
            grapes: 'عنقود العنب',
            plum: 'البرقوق الملكي',
            orange: 'البرتقال المنعش',
            lemon: 'الليمون الأصفر',
            cherry: 'الكرز التوأم',
            scatter_star: 'نجمة السكاتر',
            scatter_dollar: 'عملة الدولار'
        };

        for (let [sym, tiers] of Object.entries(PAYTABLE)) {
            const card = document.createElement('div');
            card.className = 'pay-card';

            let tiersHtml = '';
            for (let [cnt, mult] of Object.entries(tiers)) {
                tiersHtml += `<span>${cnt}x ⬅ ${mult}x</span>`;
            }

            card.innerHTML = `
                <div class="pay-card-icon">${SYMBOLS_SVG[sym]}</div>
                <div style="font-size:12px; font-weight:bold; margin-bottom:4px;">${namesAr[sym] || sym}</div>
                <div class="pay-tiers">${tiersHtml}</div>
            `;
            grid.appendChild(card);
        }

        // بناء مصغرات خطوط الدفع
        const diagGrid = document.getElementById('paylines-diag-grid');
        diagGrid.innerHTML = '';
        PAYLINES.forEach((line, idx) => {
            const item = document.createElement('div');
            item.className = 'line-mini-card';
            item.innerHTML = `<strong>خط ${idx + 1}</strong><br><span style="color:${PAYLINE_COLORS[idx]}">[${line.join('-')}]</span>`;
            diagGrid.appendChild(item);
        });
    }

    // عداد الجوائز التراكمية المتحرك (Jackpot Tickers)
    startJackpotTickers() {
        setInterval(() => {
            const grand = document.getElementById('jp-grand');
            const major = document.getElementById('jp-major');
            const mini = document.getElementById('jp-mini');

            grand.textContent = (25000 + Math.random() * 450).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            major.textContent = (5000 + Math.random() * 120).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            mini.textContent = (1000 + Math.random() * 40).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }, 3000);
    }
}

// تشغيل اللعبة فور تحميل الصفحة
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GoldenTreeGame();
});
