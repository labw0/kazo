/**
 * Uncrossable Rush - UI Controller
 * Manages iChancy casino betting board, balance, difficulty modes,
 * multiplier ladder, round history, and keyboard shortcuts.
 */
class UIController {
    constructor() {
        this.balance = parseFloat(localStorage.getItem('ichancy_chicken_balance')) || 1000.00;
        this.betAmount = 10.00;
        this.currentDifficulty = 'medium';
        this.history = [
            { mult: 2.45, isWin: true },
            { mult: 0.00, isWin: false },
            { mult: 4.00, isWin: true },
            { mult: 1.62, isWin: true },
            { mult: 0.00, isWin: false }
        ];

        this.lang = 'ar'; // Default Arabic

        this.translations = {
            ar: {
                title: 'لعبة الدجاجة - UNCROSSABLE RUSH',
                subtitle: 'النسخة الأصلية من iChancy و Evoplay',
                balance: 'الرصيد:',
                refill: 'تعبئة',
                bet: 'قيمة الرهان:',
                min: 'أدنى',
                max: 'أقصى',
                difficulty: 'مستوى الصعوبة:',
                easy: 'سهل',
                medium: 'متوسط',
                hard: 'صعب',
                hardcore: 'هاردكور ⚡',
                startGo: 'ابدأ الرهان واعبر GO',
                stepGo: 'خطوة للأمام GO 🐾',
                cashOut: 'سحب الأرباح CASH OUT',
                waitingBet: 'ضع رهانك واضغط GO',
                recentRounds: 'سجل الجولات الأخيرة:',
                multiplierLadder: 'سلم المضاعفات (24 مسار)',
                barrierStatus: 'الصبة الخرسانية تحميك في المسار!',
                winTitle: 'مبروك! تم سحب الأرباح 🎉',
                crashTitle: 'دعست السيارة الدجاجة! 💥',
                grandJackpot: '🏆 إنجاز أسطوري! تم عبور الطريق كاملاً 🏆'
            },
            en: {
                title: 'UNCROSSABLE RUSH - CHICKEN CROSS',
                subtitle: 'Original iChancy & Evoplay Edition',
                balance: 'Balance:',
                refill: 'Refill',
                bet: 'Bet Amount:',
                min: 'Min',
                max: 'Max',
                difficulty: 'Difficulty Level:',
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard',
                hardcore: 'Hardcore ⚡',
                startGo: 'START BET & GO',
                stepGo: 'STEP FORWARD GO 🐾',
                cashOut: 'CASH OUT',
                waitingBet: 'Place your bet and press GO',
                recentRounds: 'Recent Rounds:',
                multiplierLadder: 'Multiplier Ladder (24 Lanes)',
                barrierStatus: 'Concrete barrier placed! Lane is safe.',
                winTitle: 'CONGRATULATIONS! CASHED OUT 🎉',
                crashTitle: 'CHICKEN SQUASHED! CRASHED 💥',
                grandJackpot: '🏆 LEGENDARY! CROSSED ALL 24 LANES 🏆'
            }
        };

        this.bindElements();
        this.bindEvents();
        this.updateBalanceUI();
        this.updateMultiplierLadder();
        this.renderHistory();
        this.updateButtons();
    }

    bindElements() {
        this.balanceEl = document.getElementById('balanceDisplay');
        this.betInput = document.getElementById('betAmountInput');
        this.btnGo = document.getElementById('btnGo');
        this.btnCashOut = document.getElementById('btnCashOut');
        this.ladderList = document.getElementById('multiplierLadderList');
        this.historyBar = document.getElementById('historyBar');
        this.statusMessage = document.getElementById('statusMessage');
        this.cashoutValue = document.getElementById('cashoutValue');
    }

    bindEvents() {
        // Bet adjustments
        document.getElementById('btnBetMinus').addEventListener('click', () => this.adjustBet(-5));
        document.getElementById('btnBetPlus').addEventListener('click', () => this.adjustBet(5));
        document.getElementById('btnBetHalf').addEventListener('click', () => this.setBet(Math.max(1, this.betAmount / 2)));
        document.getElementById('btnBetDouble').addEventListener('click', () => this.setBet(this.betAmount * 2));
        document.getElementById('btnBetMin').addEventListener('click', () => this.setBet(1.00));
        document.getElementById('btnBetMax').addEventListener('click', () => this.setBet(Math.min(500, this.balance)));
        document.getElementById('btnRefill').addEventListener('click', () => this.refillBalance());

        // Quick chip buttons
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseFloat(btn.dataset.val);
                this.setBet(val);
            });
        });

        // Difficulty selector
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (window.gameInstance && (window.gameInstance.state === 'PLAYING' || window.gameInstance.state === 'HOPPING')) {
                    return; // disabled during active round
                }
                const diff = btn.dataset.diff;
                this.currentDifficulty = diff;
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (window.gameInstance) {
                    window.gameInstance.setDifficulty(diff);
                }
                this.updateMultiplierLadder();
                if (window.soundEngine) window.soundEngine.playClick();
            });
        });

        // GO / Step Forward
        this.btnGo.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.init();
            if (window.gameInstance) {
                window.gameInstance.stepForward();
            }
        });

        // CASH OUT
        this.btnCashOut.addEventListener('click', () => {
            if (window.gameInstance) {
                window.gameInstance.cashOut();
            }
        });

        // Audio Controls
        document.getElementById('btnToggleSfx').addEventListener('click', (e) => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMute();
                e.currentTarget.classList.toggle('muted', isMuted);
                e.currentTarget.innerHTML = isMuted ? '🔇' : '🔊';
            }
        });
        document.getElementById('btnToggleMusic').addEventListener('click', (e) => {
            if (window.soundEngine) {
                const isMuted = window.soundEngine.toggleMusic();
                e.currentTarget.classList.toggle('muted', isMuted);
                e.currentTarget.innerHTML = isMuted ? '🎵❌' : '🎵';
            }
        });

        // Language toggle
        document.getElementById('btnLang').addEventListener('click', () => {
            this.lang = (this.lang === 'ar') ? 'en' : 'ar';
            document.documentElement.dir = (this.lang === 'ar') ? 'rtl' : 'ltr';
            document.getElementById('btnLang').textContent = (this.lang === 'ar') ? 'EN' : 'عربي';
            this.applyTranslations();
        });

        // Keyboard Shortcuts: Space or Up to Step Forward, C to Cash Out
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
                e.preventDefault();
                if (window.soundEngine) window.soundEngine.init();
                if (window.gameInstance) {
                    window.gameInstance.stepForward();
                }
            } else if (e.code === 'KeyC') {
                e.preventDefault();
                if (window.gameInstance) {
                    window.gameInstance.cashOut();
                }
            }
        });
    }

    applyTranslations() {
        const t = this.translations[this.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });
        this.updateButtons();
    }

    adjustBet(delta) {
        this.setBet(Math.max(1, this.betAmount + delta));
        if (window.soundEngine) window.soundEngine.playClick();
    }

    setBet(val) {
        this.betAmount = Math.min(this.balance, Math.max(1, parseFloat(val.toFixed(2))));
        this.betInput.value = this.betAmount.toFixed(2);
    }

    refillBalance() {
        this.balance = 1000.00;
        this.saveBalance();
        this.updateBalanceUI();
        if (window.soundEngine) window.soundEngine.playCashOut();
        this.showMessage('تمت إعادة تعبئة الرصيد إلى $1,000.00 بنجاح!', 'info');
    }

    saveBalance() {
        localStorage.setItem('ichancy_chicken_balance', this.balance.toFixed(2));
    }

    updateBalanceUI() {
        this.balanceEl.textContent = '$' + this.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    placeBet() {
        if (this.betAmount > this.balance) {
            this.showMessage('رصيدك غير كافٍ! اضغط تعبئة لشحن الرصيد.', 'danger');
            return false;
        }

        this.balance -= this.betAmount;
        this.saveBalance();
        this.updateBalanceUI();

        if (window.gameInstance) {
            window.gameInstance.startRound(this.betAmount);
        }
        return true;
    }

    onRoundStarted() {
        this.updateButtons();
        this.disableBetInputs(true);
        const t = this.translations[this.lang];
        this.showMessage(t.waitingBet, 'info');
        this.highlightLadder();
    }

    onSafeLanding() {
        this.updateButtons();
        this.highlightLadder();
        const t = this.translations[this.lang];
        const mult = window.gameInstance.getCurrentMultiplier();
        const payout = (this.betAmount * mult).toFixed(2);
        this.showMessage(`🧱 ${t.barrierStatus} (المضاعف: ${mult.toFixed(2)}x - الربح: $${payout})`, 'success');
    }

    onCashOut(multiplier) {
        const winAmount = this.betAmount * multiplier;
        this.balance += winAmount;
        this.saveBalance();
        this.updateBalanceUI();

        this.history.unshift({ mult: multiplier, isWin: true });
        if (this.history.length > 12) this.history.pop();
        this.renderHistory();

        this.disableBetInputs(false);
        this.updateButtons();

        const t = this.translations[this.lang];
        this.showMessage(`${t.winTitle} +$${winAmount.toFixed(2)} (${multiplier.toFixed(2)}x)`, 'success');
        this.highlightLadder(true);
    }

    onCrash() {
        this.history.unshift({ mult: 0.00, isWin: false });
        if (this.history.length > 12) this.history.pop();
        this.renderHistory();

        this.disableBetInputs(false);
        this.updateButtons();

        const t = this.translations[this.lang];
        this.showMessage(t.crashTitle, 'danger');
        this.highlightLadder(false, true);
    }

    onVictory() {
        const mult = window.gameInstance.getCurrentMultiplier();
        const winAmount = this.betAmount * mult;
        this.balance += winAmount;
        this.saveBalance();
        this.updateBalanceUI();

        this.history.unshift({ mult: mult, isWin: true });
        if (this.history.length > 12) this.history.pop();
        this.renderHistory();

        this.disableBetInputs(false);
        this.updateButtons();

        const t = this.translations[this.lang];
        this.showMessage(`${t.grandJackpot} +$${winAmount.toFixed(2)} (${mult.toFixed(2)}x)`, 'gold');
    }

    updateButtons() {
        const t = this.translations[this.lang];
        const state = window.gameInstance ? window.gameInstance.state : 'IDLE';
        const currentLane = window.gameInstance ? window.gameInstance.currentLane : 0;

        if (state === 'IDLE' || state === 'CRASHED' || state === 'CASHED_OUT' || state === 'VICTORY') {
            this.btnGo.textContent = t.startGo;
            this.btnGo.disabled = false;
            this.btnCashOut.disabled = true;
            this.cashoutValue.textContent = '';
        } else if (state === 'PLAYING') {
            this.btnGo.textContent = t.stepGo;
            this.btnGo.disabled = false;

            if (currentLane > 0) {
                const mult = window.gameInstance.getCurrentMultiplier();
                const payout = (this.betAmount * mult).toFixed(2);
                this.btnCashOut.disabled = false;
                this.cashoutValue.textContent = `$${payout} (${mult.toFixed(2)}x)`;
            } else {
                this.btnCashOut.disabled = true;
                this.cashoutValue.textContent = '';
            }
        } else if (state === 'HOPPING') {
            this.btnGo.disabled = true;
            this.btnCashOut.disabled = true;
        }
    }

    disableBetInputs(disabled) {
        this.betInput.disabled = disabled;
        document.querySelectorAll('.chip-btn, #btnBetMinus, #btnBetPlus, #btnBetHalf, #btnBetDouble, #btnBetMin, #btnBetMax, .diff-btn').forEach(btn => {
            btn.disabled = disabled;
        });
    }

    updateMultiplierLadder() {
        if (!window.gameInstance) return;
        const list = window.gameInstance.multipliers[this.currentDifficulty];
        this.ladderList.innerHTML = '';

        // Display lanes from top (24) to bottom (1)
        for (let i = list.length - 1; i >= 0; i--) {
            const laneNum = i + 1;
            const mult = list[i];
            const li = document.createElement('div');
            li.className = 'ladder-item';
            li.dataset.lane = laneNum;
            li.innerHTML = `
                <span class="lane-number">مسار ${laneNum}</span>
                <span class="lane-mult">${mult.toFixed(2)}x</span>
            `;
            this.ladderList.appendChild(li);
        }
        this.highlightLadder();
    }

    highlightLadder(cashedOut = false, crashed = false) {
        if (!window.gameInstance) return;
        const currentLane = window.gameInstance.currentLane;

        document.querySelectorAll('.ladder-item').forEach(item => {
            const lane = parseInt(item.dataset.lane, 10);
            item.classList.remove('passed', 'active', 'next');

            if (lane < currentLane) {
                item.classList.add('passed');
            } else if (lane === currentLane && currentLane > 0) {
                item.classList.add('active');
            } else if (lane === currentLane + 1) {
                item.classList.add('next');
            }
        });

        // Auto-scroll ladder to show current target
        const activeItem = document.querySelector(`.ladder-item[data-lane="${currentLane + 1}"]`);
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    renderHistory() {
        this.historyBar.innerHTML = '';
        this.history.forEach(h => {
            const badge = document.createElement('div');
            badge.className = `history-pill ${h.isWin ? 'win' : 'crash'}`;
            badge.textContent = h.isWin ? `${h.mult.toFixed(2)}x` : '0.00x';
            this.historyBar.appendChild(badge);
        });
    }

    showMessage(msg, type = 'info') {
        this.statusMessage.className = `status-banner ${type}`;
        this.statusMessage.textContent = msg;
    }
}

// Instantiate after DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
    window.uiController = new UIController();
});
