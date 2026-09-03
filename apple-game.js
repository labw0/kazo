/**
 * KAZO Apple of Fortune (لعبة التفاحة - كازو تفاحة الحظ)
 * مستوحاة بنسبة 100% من لعبة تفاحة 1xBet الشهيرة (10 مستويات × 5 تفاحات)
 * مع سلم المضاعفات التصاعدي والتفاح الذهبي والفاسد.
 */

class AppleGame {
    constructor() {
        this.rowsConfig = [
            { level: 1,  mult: 1.23,   goodCount: 4, rottenCount: 1 },
            { level: 2,  mult: 1.54,   goodCount: 4, rottenCount: 1 },
            { level: 3,  mult: 1.93,   goodCount: 4, rottenCount: 1 },
            { level: 4,  mult: 2.41,   goodCount: 4, rottenCount: 1 },
            { level: 5,  mult: 4.02,   goodCount: 3, rottenCount: 2 },
            { level: 6,  mult: 6.71,   goodCount: 3, rottenCount: 2 },
            { level: 7,  mult: 11.18,  goodCount: 3, rottenCount: 2 },
            { level: 8,  mult: 27.92,  goodCount: 2, rottenCount: 3 },
            { level: 9,  mult: 69.80,  goodCount: 2, rottenCount: 3 },
            { level: 10, mult: 349.00, goodCount: 1, rottenCount: 4 },
        ];

        this.state = 'IDLE'; // 'IDLE', 'PLAYING', 'FINISHED'
        this.currentLevel = 0; // 1 to 10
        this.betAmount = 10;
        this.currentWin = 0;
        this.levelOutcomes = []; // مصفوفة لتوزيع التفاح في كل طابق

        this.init();
    }

    init() {
        this.renderGrid();
        this.bindEvents();
    }

    bindEvents() {
        const startBtn = document.getElementById('apple-start-btn');
        const cashoutBtn = document.getElementById('apple-cashout-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (cashoutBtn) {
            cashoutBtn.addEventListener('click', () => this.cashOut());
        }

        // أزرار المبالغ السريعة
        document.querySelectorAll('.apple-chip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.state === 'PLAYING') return;
                const action = e.target.dataset.action;
                const input = document.getElementById('apple-bet-amount');
                let val = parseFloat(input.value) || 10;

                if (action === '+10') val += 10;
                else if (action === '+50') val += 50;
                else if (action === '+100') val += 100;
                else if (action === '2x') val *= 2;
                else if (action === 'half') val = Math.max(1, Math.floor(val / 2));
                else if (action === 'max') val = Math.floor(window.wallet.balance);

                input.value = Math.max(1, Math.min(val, Math.floor(window.wallet.balance || 1000)));
                window.soundEngine.playClick();
            });
        });
    }

    // بناء شبكة اللعبة (10 طوابق، كل طابق 5 تفاحات)
    // الطابق 10 في الأعلى، والطابق 1 في الأسفل مثل 1xBet
    renderGrid() {
        const gridContainer = document.getElementById('apple-grid-container');
        if (!gridContainer) return;

        let html = '';

        // نعرض من المستوى 10 (الأعلى) إلى المستوى 1 (الأسفل)
        for (let i = 9; i >= 0; i--) {
            const row = this.rowsConfig[i];
            const levelNum = row.level;
            const isCurrent = this.state === 'PLAYING' && this.currentLevel === levelNum;
            const isCompleted = this.state === 'PLAYING' && this.currentLevel > levelNum;

            let rowClass = 'opacity-40 pointer-events-none border-gray-800';
            if (this.state === 'IDLE') {
                rowClass = 'opacity-80 border-gray-800';
            } else if (isCurrent) {
                rowClass = 'opacity-100 ring-2 ring-cyan-400 bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-900/20 active-apple-row';
            } else if (isCompleted) {
                rowClass = 'opacity-90 bg-emerald-950/20 border-emerald-800/40';
            }

            html += `
                <div class="apple-row flex items-center justify-between gap-2 p-2 rounded-xl border transition-all duration-300 ${rowClass}" id="apple-row-${levelNum}" data-level="${levelNum}">
                    <!-- شارة المستوى والمضاعف -->
                    <div class="w-20 md:w-28 flex flex-col items-center justify-center bg-slate-900/80 px-2 py-1.5 rounded-lg border border-slate-700/60 text-center">
                        <span class="text-[10px] md:text-xs text-slate-400 font-semibold">المستوى ${levelNum}</span>
                        <span class="text-xs md:text-sm font-black text-amber-400 font-mono">${row.mult.toFixed(2)}x</span>
                    </div>

                    <!-- 5 خانات تفاحات -->
                    <div class="flex-1 grid grid-cols-5 gap-2 md:gap-3">
            `;

            for (let c = 0; c < 5; c++) {
                html += `
                    <button class="apple-cell aspect-square flex items-center justify-center rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/70 text-2xl md:text-3xl transition transform active:scale-95 shadow-inner"
                            data-level="${levelNum}" data-col="${c}" id="apple-cell-${levelNum}-${c}" onclick="window.appleGame.handleCellClick(${levelNum}, ${c})">
                        <span class="apple-icon opacity-70">❓</span>
                    </button>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        gridContainer.innerHTML = html;
    }

    startGame() {
        if (this.state === 'PLAYING') return;

        const input = document.getElementById('apple-bet-amount');
        const amount = parseFloat(input.value) || 10;

        if (amount <= 0) {
            window.app.showToast('يرجى تحديد مبلغ رهان صالح', 'warning');
            return;
        }

        if (amount > window.wallet.balance) {
            window.app.showToast('رصيدك غير كافٍ! قم بشحن الرصيد التجريبي', 'warning');
            return;
        }

        // خصم الرهان
        window.wallet.deduct(amount);
        window.soundEngine.playClick();

        this.betAmount = amount;
        this.currentLevel = 1;
        this.currentWin = 0;
        this.state = 'PLAYING';

        // توليد توزيعة التفاح لكل طابق مقدماً بنزاهة
        this.generateOutcomes();

        this.renderGrid();
        this.updateUI();

        window.app.showToast(`بدأت جولة تفاحة الحظ! رهانك: ${amount} $. ابدأ باختيار تفاحة في الطابق 1`, 'info');
    }

    generateOutcomes() {
        this.levelOutcomes = [];
        for (let i = 0; i < 10; i++) {
            const config = this.rowsConfig[i];
            const row = [];
            // إضافة التفاح السليم
            for (let g = 0; g < config.goodCount; g++) row.push('GOOD');
            // إضافة التفاح الفاسد
            for (let r = 0; r < config.rottenCount; r++) row.push('ROTTEN');

            // خلط عشوائي نزيه (Fisher-Yates Shuffle)
            for (let k = row.length - 1; k > 0; k--) {
                const j = Math.floor(Math.random() * (k + 1));
                [row[k], row[j]] = [row[j], row[k]];
            }
            this.levelOutcomes.push(row);
        }
    }

    handleCellClick(level, col) {
        if (this.state !== 'PLAYING' || level !== this.currentLevel) return;

        const rowOutcome = this.levelOutcomes[level - 1];
        const pickedOutcome = rowOutcome[col];
        const cellEl = document.getElementById(`apple-cell-${level}-${col}`);

        if (pickedOutcome === 'GOOD') {
            // تفاحة سليمة!
            window.soundEngine.playAppleSuccess();

            cellEl.innerHTML = `<span class="apple-icon animate-bounce text-2xl md:text-3xl">🍏</span>`;
            cellEl.className = 'apple-cell aspect-square flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-800 border-2 border-green-400 shadow-lg shadow-green-500/30';

            const config = this.rowsConfig[level - 1];
            this.currentWin = Math.round(this.betAmount * config.mult * 100) / 100;

            // كشف باقي التفاحات في الطابق الحالي بهدوء
            this.revealRow(level, col);

            // التحقق إذا وصل للطابق الأخير (المستوى 10 - الفوز الأكبر)
            if (this.currentLevel === 10) {
                this.celebrateGrandWin();
            } else {
                this.currentLevel++;
                this.updateUI();
                this.renderGrid();
                // إعادة فتح الخانات للطابق الجديد
                window.app.showToast(`تفاحة ممتازة! أرباحك الحالية: ${this.currentWin.toFixed(2)} $. تقدمت للمستوى ${this.currentLevel}`, 'success');
            }
        } else {
            // تفاحة فاسدة - خسارة!
            window.soundEngine.playAppleRotten();

            cellEl.innerHTML = `<span class="apple-icon text-2xl md:text-3xl animate-pulse">🍏💀</span>`;
            cellEl.className = 'apple-cell aspect-square flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-500 shadow-lg shadow-red-500/40';

            // كشف باقي الخانات
            this.revealRow(level, col);

            this.state = 'FINISHED';
            window.wallet.addHistory('لعبة التفاحة (Apple of Fortune)', this.betAmount, 0, 'خسارة');
            window.app.showToast(`للأسف اخترت تفاحة فاسدة! خسرت ${this.betAmount} $`, 'danger');

            // اهتزاز لوحة اللعبة
            const card = document.getElementById('apple-game-card');
            if (card) {
                card.classList.add('shake-anim');
                setTimeout(() => card.classList.remove('shake-anim'), 500);
            }

            setTimeout(() => {
                this.state = 'IDLE';
                this.currentLevel = 0;
                this.currentWin = 0;
                this.renderGrid();
                this.updateUI();
            }, 3000);
        }
    }

    revealRow(level, pickedCol) {
        const rowOutcome = this.levelOutcomes[level - 1];
        for (let c = 0; c < 5; c++) {
            if (c === pickedCol) continue;
            const otherCell = document.getElementById(`apple-cell-${level}-${c}`);
            if (!otherCell) continue;

            const isGood = rowOutcome[c] === 'GOOD';
            otherCell.innerHTML = `<span class="apple-icon opacity-50 text-xl">${isGood ? '🍏' : '🍏💀'}</span>`;
            otherCell.className = `apple-cell aspect-square flex items-center justify-center rounded-xl ${isGood ? 'bg-emerald-950/40 border-emerald-800/30' : 'bg-red-950/40 border-red-800/30'} pointer-events-none`;
        }
    }

    cashOut() {
        if (this.state !== 'PLAYING' || this.currentWin <= 0) return;

        const win = this.currentWin;
        window.wallet.add(win);
        window.soundEngine.playCashOut();

        window.wallet.addHistory('لعبة التفاحة (Apple of Fortune)', this.betAmount, win, 'فوز');
        window.app.showToast(`🎉 مبروك! قمت بسحب أرباحك بقيمة ${win.toFixed(2)} $ بنجاح!`, 'success');

        this.state = 'IDLE';
        this.currentLevel = 0;
        this.currentWin = 0;
        this.renderGrid();
        this.updateUI();
    }

    celebrateGrandWin() {
        const win = this.currentWin;
        window.wallet.add(win);
        window.soundEngine.playCashOut();

        window.wallet.addHistory('لعبة التفاحة (Apple of Fortune)', this.betAmount, win, 'جاكبوت فوز أقصى');
        window.app.showToast(`🏆 جاكبوت أسطوري! أكملت الطوابق العشرة وفزت بمبلغ ${win.toFixed(2)} $!`, 'success');

        this.state = 'IDLE';
        this.currentLevel = 0;
        this.currentWin = 0;
        this.renderGrid();
        this.updateUI();
    }

    updateUI() {
        const startBtn = document.getElementById('apple-start-btn');
        const cashoutBtn = document.getElementById('apple-cashout-btn');
        const winDisplay = document.getElementById('apple-current-win');
        const winContainer = document.getElementById('apple-win-container');

        if (this.state === 'PLAYING') {
            startBtn.classList.add('hidden');
            cashoutBtn.classList.remove('hidden');

            if (winDisplay) winDisplay.textContent = `${this.currentWin.toFixed(2)} $`;
            if (winContainer) winContainer.classList.remove('hidden');

            const cashoutWinVal = document.getElementById('apple-cashout-win-val');
            if (cashoutWinVal) cashoutWinVal.textContent = `${this.currentWin.toFixed(2)} $`;

            // إذا لم يربح أي طابق بعد (ما زال في الطابق 1)، لا يمكنه السحب
            cashoutBtn.disabled = (this.currentWin <= 0);
            if (this.currentWin <= 0) {
                cashoutBtn.className = 'w-full py-3.5 rounded-xl font-bold bg-gray-700 text-gray-400 cursor-not-allowed';
            } else {
                cashoutBtn.className = 'w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 transition transform active:scale-95 animate-pulse';
            }
        } else {
            cashoutBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
            if (winContainer) winContainer.classList.add('hidden');
        }
    }
}

window.AppleGame = AppleGame;
