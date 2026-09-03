/**
 * KAZO Main Application Script (التطبيق الرئيسي لكازو)
 * إدارة المحفظة، التبديل بين الألعاب، المراهنات الرياضية المحاكاة، ونظام الإشعارات.
 */

class Wallet {
    constructor() {
        this.storagePrefix = `kazo_${window.kazoCurrentUser?.id || 'guest'}`;
        this.balance = parseFloat(localStorage.getItem(`${this.storagePrefix}_balance`)) || 1000.00;
        this.history = JSON.parse(localStorage.getItem(`${this.storagePrefix}_history`)) || [
            { game: 'مكافأة التسجيل الترحيبية', bet: 0, win: 1000, result: 'إيداع', time: 'اليوم 12:00' }
        ];
        this.listeners = [];
    }

    save() {
        localStorage.setItem(`${this.storagePrefix}_balance`, this.balance.toFixed(2));
        localStorage.setItem(`${this.storagePrefix}_history`, JSON.stringify(this.history));
        this.notify();
    }

    add(amount) {
        this.balance += amount;
        this.save();
    }

    deduct(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addHistory(game, bet, win, result) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        this.history.unshift({
            game,
            bet,
            win,
            result,
            time: timeStr
        });
        if (this.history.length > 30) this.history.pop();
        this.save();
    }

    subscribe(fn) {
        this.listeners.push(fn);
        fn(this.balance);
    }

    notify() {
        this.listeners.forEach(fn => fn(this.balance));
    }
}

class App {
    constructor() {
        this.activeTab = 'crash';
        this.init();
    }

    init() {
        window.wallet = new Wallet();

        // تحديث الرصيد في الواجهة
        window.wallet.subscribe((bal) => {
            document.querySelectorAll('.wallet-balance-display').forEach(el => {
                el.textContent = `${bal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
            });
        });

        this.bindNavigation();
        this.bindModals();
        this.bindSoundToggle();
        this.initSportsbook();
        this.renderBetHistory();

        // تشغيل الألعاب
        window.crashGame = new CrashGame();
        window.appleGame = new AppleGame();
    }

    bindNavigation() {
        const tabs = document.querySelectorAll('.nav-tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.tab;
                this.switchTab(target);
                window.soundEngine.playClick();
            });
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // تحديث أزرار التنقل
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            const isTarget = btn.dataset.tab === tabName;
            if (isTarget) {
                btn.className = 'nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 transition';
            } else {
                btn.className = 'nav-tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-slate-800/60 transition';
            }
        });

        // إظهار/إخفاء الأقسام
        const sections = ['crash', 'apple', 'sports', 'casino'];
        sections.forEach(sec => {
            const el = document.getElementById(`section-${sec}`);
            if (el) {
                if (sec === tabName) {
                    el.classList.remove('hidden');
                    if (sec === 'crash' && window.crashGame) {
                        setTimeout(() => window.crashGame.resizeCanvas(), 50);
                    }
                } else {
                    el.classList.add('hidden');
                }
            }
        });
    }

    bindSoundToggle() {
        const btn = document.getElementById('sound-toggle-btn');
        const icon = document.getElementById('sound-toggle-icon');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isEnabled = window.soundEngine.toggle();
            if (icon) {
                icon.textContent = isEnabled ? '🔊' : '🔇';
            }
            this.showToast(isEnabled ? 'تم تفعيل المؤثرات الصوتية' : 'تم كتم الصوت', 'info');
        });
    }

    bindModals() {
        // نافذة الإيداع
        const depositBtn = document.getElementById('open-deposit-modal');
        const depositModal = document.getElementById('deposit-modal');
        const closeDeposit = document.getElementById('close-deposit-modal');

        if (depositBtn && depositModal) {
            depositBtn.addEventListener('click', () => {
                depositModal.classList.remove('hidden');
                window.soundEngine.playClick();
            });
        }
        if (closeDeposit && depositModal) {
            closeDeposit.addEventListener('click', () => {
                depositModal.classList.add('hidden');
            });
        }

        // إيداع مبالغ جاهزة
        document.querySelectorAll('.quick-deposit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseFloat(e.target.dataset.amount);
                window.wallet.add(amount);
                window.wallet.addHistory('إيداع رصيد تجريبي', 0, amount, 'إيداع');
                depositModal.classList.add('hidden');
                window.soundEngine.playCashOut();
                this.showToast(`تم شحن ${amount} $ في رصيدك التجريبي بنجاح!`, 'success');
            });
        });

        // نافذة السجل
        const historyBtn = document.getElementById('open-history-modal');
        const historyModal = document.getElementById('history-modal');
        const closeHistory = document.getElementById('close-history-modal');

        if (historyBtn && historyModal) {
            historyBtn.addEventListener('click', () => {
                this.renderBetHistory();
                historyModal.classList.remove('hidden');
                window.soundEngine.playClick();
            });
        }
        if (closeHistory && historyModal) {
            closeHistory.addEventListener('click', () => {
                historyModal.classList.add('hidden');
            });
        }

        // نافذة VIP
        const vipBtn = document.getElementById('open-vip-modal');
        const vipModal = document.getElementById('vip-modal');
        const closeVip = document.getElementById('close-vip-modal');

        if (vipBtn && vipModal) {
            vipBtn.addEventListener('click', () => {
                vipModal.classList.remove('hidden');
                window.soundEngine.playClick();
            });
        }
        if (closeVip && vipModal) {
            closeVip.addEventListener('click', () => {
                vipModal.classList.add('hidden');
            });
        }
    }

    renderBetHistory() {
        const tbody = document.getElementById('history-tbody');
        if (!tbody) return;

        let html = '';
        if (window.wallet.history.length === 0) {
            html = `<tr><td colspan="5" class="py-6 text-center text-gray-500">لا توجد عمليات مراهنة سابقة بعد</td></tr>`;
        } else {
            window.wallet.history.forEach(item => {
                const isWin = item.result.includes('فوز') || item.result.includes('جاكبوت') || item.result === 'إيداع';
                html += `
                    <tr class="border-b border-gray-800 text-sm hover:bg-slate-800/40 transition">
                        <td class="py-3 px-3 text-gray-300 font-medium">${item.game}</td>
                        <td class="py-3 px-3 font-mono text-gray-400">${item.bet > 0 ? `${item.bet.toFixed(2)} $` : '-'}</td>
                        <td class="py-3 px-3 font-mono ${isWin ? 'text-emerald-400 font-bold' : 'text-gray-500'}">
                            ${item.win > 0 ? `+${item.win.toFixed(2)} $` : '0.00 $'}
                        </td>
                        <td class="py-3 px-3">
                            <span class="px-2 py-0.5 rounded text-xs font-semibold ${isWin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'}">
                                ${item.result}
                            </span>
                        </td>
                        <td class="py-3 px-3 text-gray-400 font-mono text-xs">${item.time}</td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = html;
    }

    // محاكي المراهنات الرياضية (1xBet Sportsbook Live Simulator)
    initSportsbook() {
        const matchesContainer = document.getElementById('sports-matches-container');
        if (!matchesContainer) return;

        const matches = [
            {
                id: 1,
                league: 'دوري أبطال أوروبا 🏆',
                minute: "68'",
                teamA: 'ريال مدريد',
                teamB: 'مانشستر سيتي',
                score: '2 - 1',
                odds: { 1: 1.85, X: 3.40, 2: 4.10 }
            },
            {
                id: 2,
                league: 'الدوري الإسباني 🇪🇸',
                minute: "42'",
                teamA: 'برشلونة',
                teamB: 'أتلتيكو مدريد',
                score: '1 - 0',
                odds: { 1: 1.55, X: 3.90, 2: 5.60 }
            },
            {
                id: 3,
                league: 'الدوري الإنجليزي الممتاز 🇬🇧',
                minute: "81'",
                teamA: 'ليفربول',
                teamB: 'أرسنال',
                score: '2 - 2',
                odds: { 1: 3.10, X: 2.20, 2: 3.30 }
            },
            {
                id: 4,
                league: 'دوري روشن السعودي 🇸🇦',
                minute: "54'",
                teamA: 'الهلال',
                teamB: 'النصر',
                score: '1 - 1',
                odds: { 1: 2.10, X: 3.15, 2: 2.90 }
            }
        ];

        let html = '';
        matches.forEach(m => {
            html += `
                <div class="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 md:p-5 transition shadow-lg">
                    <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                        <span class="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            مباشر ${m.minute} - ${m.league}
                        </span>
                        <span class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">1xBet Live</span>
                    </div>

                    <div class="flex items-center justify-between my-3">
                        <div class="text-right flex-1">
                            <div class="font-bold text-white text-base md:text-lg">${m.teamA}</div>
                        </div>
                        <div class="px-4 py-1.5 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-center">
                            <span class="font-mono font-black text-cyan-300 text-xl tracking-wider">${m.score}</span>
                        </div>
                        <div class="text-left flex-1">
                            <div class="font-bold text-white text-base md:text-lg">${m.teamB}</div>
                        </div>
                    </div>

                    <!-- أزرار الاحتمالات (1 X 2) -->
                    <div class="grid grid-cols-3 gap-2 mt-4">
                        <button class="sports-bet-btn flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/90 hover:bg-cyan-600 hover:text-white transition group border border-slate-700/60"
                                onclick="window.app.placeSportsBet('${m.teamA}', '${m.odds[1]}')">
                            <span class="text-xs text-slate-400 group-hover:text-white mb-0.5">فوز 1</span>
                            <span class="font-mono font-bold text-amber-400 group-hover:text-white text-sm">${m.odds[1]}</span>
                        </button>
                        <button class="sports-bet-btn flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/90 hover:bg-cyan-600 hover:text-white transition group border border-slate-700/60"
                                onclick="window.app.placeSportsBet('تعادل', '${m.odds['X']}')">
                            <span class="text-xs text-slate-400 group-hover:text-white mb-0.5">تعادل X</span>
                            <span class="font-mono font-bold text-amber-400 group-hover:text-white text-sm">${m.odds['X']}</span>
                        </button>
                        <button class="sports-bet-btn flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/90 hover:bg-cyan-600 hover:text-white transition group border border-slate-700/60"
                                onclick="window.app.placeSportsBet('${m.teamB}', '${m.odds[2]}')">
                            <span class="text-xs text-slate-400 group-hover:text-white mb-0.5">فوز 2</span>
                            <span class="font-mono font-bold text-amber-400 group-hover:text-white text-sm">${m.odds[2]}</span>
                        </button>
                    </div>
                </div>
            `;
        });

        matchesContainer.innerHTML = html;
    }

    placeSportsBet(pick, odd) {
        const betAmount = 25; // رهان سريع افتراضي
        if (window.wallet.balance < betAmount) {
            this.showToast('رصيدك غير كافٍ لوضع هذا الرهان!', 'warning');
            return;
        }

        window.wallet.deduct(betAmount);
        window.soundEngine.playClick();

        const possibleWin = (betAmount * parseFloat(odd)).toFixed(2);
        this.showToast(`⚽ تم وضع رهان بقيمة ${betAmount} $ على [${pick}] بمضاعف ${odd} (الربح المتوقع: ${possibleWin} $)`, 'info');

        // محاكاة تسوية الرهان بعد 6 ثوانٍ
        setTimeout(() => {
            const isWin = Math.random() > 0.45;
            if (isWin) {
                window.wallet.add(parseFloat(possibleWin));
                window.soundEngine.playCashOut();
                window.wallet.addHistory(`مباراة رياضية (${pick})`, betAmount, parseFloat(possibleWin), 'فوز');
                this.showToast(`🎉 مبروك! فاز رهانك الرياضي بمبلغ ${possibleWin} $`, 'success');
            } else {
                window.wallet.addHistory(`مباراة رياضية (${pick})`, betAmount, 0, 'خسارة');
                this.showToast(`❌ للأسف انتهت نتيجة الرهان بخسارة ${betAmount} $`, 'danger');
            }
        }, 6000);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        let bgClass = 'bg-slate-900 border-cyan-500 text-white';
        let icon = 'ℹ️';

        if (type === 'success') {
            bgClass = 'bg-emerald-950 border-emerald-500 text-emerald-200';
            icon = '✅';
        } else if (type === 'danger') {
            bgClass = 'bg-red-950 border-red-500 text-red-200';
            icon = '💥';
        } else if (type === 'warning') {
            bgClass = 'bg-amber-950 border-amber-500 text-amber-200';
            icon = '⚠️';
        }

        toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 ${bgClass}`;
        toast.innerHTML = `
            <span class="text-xl">${icon}</span>
            <span class="text-sm font-semibold">${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

let kazoAppStarted = false;
document.addEventListener('kazo:auth-ready', () => {
    if (kazoAppStarted) return;
    kazoAppStarted = true;
    window.app = new App();
});
