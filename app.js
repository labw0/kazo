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
        this.activeTab = 'home';
        this.init();
    }

    init() {
        window.wallet = new Wallet();

        // تحديث الرصيد في الواجهة حسب اللغة: د.ع بالعربي / دولار بالإنجليزي
        window.wallet.subscribe((bal) => this.renderWalletBalance(bal));

        this.bindNavigation();
        this.bindShellUI();
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
        const sections = ['home', 'crash', 'apple', 'sports', 'casino'];
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

    renderWalletBalance(balance = window.wallet?.balance || 0) {
        const lang = localStorage.getItem('kazo_lang') || 'ar';
        document.querySelectorAll('.wallet-balance-display').forEach(el => {
            if (lang === 'en') {
                const usd = balance / 1300;
                el.textContent = `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            } else {
                el.textContent = `${Math.round(balance).toLocaleString('en-US')} د.ع`;
            }
        });
    }

    bindShellUI() {
        const dict = {
            ar: {
                brandName:'كازو', profileTitle:'ملف التعريف', leave:'مغادرة', registeredAt:'تاريخ تسجيل الحساب', lastSession:'آخر جلسة للحساب', accountBalance:'رصيد الحساب', rewardBalance:'رصيد المكافأة', myAccount:'حسابي', wallet:'المحفظة', accountSettings:'إعدادات الحساب', copyId:'نسخ',
                search:'البحث عن لعبة أو مباراة...', todayEvents:'أحداث اليوم', finals:'النهائيات', casino:'كازينو',
                profile:'ملفي', deposit:'إيداع', withdraw:'سحب', bonus:'البونص', messages:'الرسائل', myBets:'رهاناتي',
                accountHistory:'سجل الحساب', logout:'تسجيل خروج', exclusiveOffers:'عروض حصرية', waitingYou:'بانتظارك!',
                offersSoon:'تابع جديد العروض ولا تفوتها', favorites:'المفضلة', today:'اليوم', football:'كرة القدم', basketball:'كرة السلة',
                tennis:'كرة المضرب', volleyball:'كرة طائرة', playNow:'إلعب الآن', liveMatches:'مباريات مباشرة', noGames:'لا توجد ألعاب متاحة',
                noEvents:'لا توجد أحداث ذات احتمالات معززة حالياً. حاول مرة أخرى لاحقاً.', chooseGame:'اختر لعبتك', crashGame:'لعبة الطائرة',
                appleGame:'لعبة التفاحة', offers:'العروض', betSlip:'قسيمة رهانك', upcoming:'مباريات لم تبدأ', depositBalance:'إيداع رصيد',
                depositSoonText:'سيتم إضافة وسائل الإيداع قريباً', soon:'قريباً', betDate:'تاريخ الرهان', betHistory:'سجل تاريخ الرهان'
            },
            en: {
                brandName:'Kazo', profileTitle:'Profile', leave:'Leave', registeredAt:'Account registration date', lastSession:'Last account session', accountBalance:'Account balance', rewardBalance:'Reward balance', myAccount:'My Account', wallet:'Wallet', accountSettings:'Account Settings', copyId:'Copy',
                search:'Search for a game or match...', todayEvents:"Today's Events", finals:'Finals', casino:'Casino',
                profile:'My Profile', deposit:'Deposit', withdraw:'Withdraw', bonus:'Bonus', messages:'Messages', myBets:'My Bets',
                accountHistory:'Account History', logout:'Log Out', exclusiveOffers:'Exclusive Offers', waitingYou:'Waiting for you!',
                offersSoon:'Follow the latest offers and do not miss out', favorites:'Favorites', today:'Today', football:'Football', basketball:'Basketball',
                tennis:'Tennis', volleyball:'Volleyball', playNow:'Play Now', liveMatches:'Live Matches', noGames:'No Games Available',
                noEvents:'There are no boosted-odds events right now. Try again later.', chooseGame:'Choose your game', crashGame:'Crash Plane',
                appleGame:'Apple Game', offers:'Offers', betSlip:'Bet Slip', upcoming:'Upcoming Matches', depositBalance:'Deposit Balance',
                depositSoonText:'Deposit methods will be added soon', soon:'Coming Soon', betDate:'Bet Date', betHistory:'Bet History'
            }
        };

        const applyLanguage = (lang) => {
            localStorage.setItem('kazo_lang', lang);
            document.documentElement.lang = lang;
            document.documentElement.dir = 'rtl'; // ثبات أماكن الهيدر والفوتر عند تغيير اللغة
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.dataset.i18n;
                if (dict[lang][key]) el.textContent = dict[lang][key];
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.dataset.i18nPlaceholder;
                if (dict[lang][key]) el.placeholder = dict[lang][key];
            });
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.dataset.i18nTitle;
                if (dict[lang][key]) el.title = dict[lang][key];
            });
            document.querySelectorAll('.kazo-language-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));

            // ترجمة النصوص الثابتة القديمة في صفحات الألعاب أيضاً، مع حفظ النص العربي للرجوع إليه.
            const legacy = {
                'الربح الحالي المتاح للسحب':'Current winnings available to cash out',
                'اختر تفاحة واحدة في كل طابق. تجنب التفاح الفاسد 🍏💀 واصعد للأعلى لمضاعفة أرباحك!':'Pick one apple on each floor. Avoid the bad apples and climb to multiply your winnings!',
                'رهان تفاحة الحظ':'Apple Fortune Bet', 'مبلغ الرهان ($)':'Bet amount ($)', 'بدء اللعبة الآن 🍏':'Start Game 🍏',
                'سحب الأرباح الآن 💰':'Cash Out 💰', 'دليل صعوبة الطوابق:':'Floor difficulty guide:',
                'المستويات 1 - 4:':'Levels 1 - 4:', 'المستويات 5 - 7:':'Levels 5 - 7:', 'المستويات 8 - 9:':'Levels 8 - 9:', 'المستوى الأخير 10:':'Final level 10:',
                'الرهانات الحية في هذه الجولة':'Live bets in this round', 'اللاعب':'Player', 'الرهان':'Bet', 'المضاعف':'Multiplier', 'النتيجة':'Result',
                'مبلغ الرهان':'Bet amount', 'سحب تلقائي عند مضاعف (اختياري)':'Auto cashout multiplier (optional)', 'راهن الآن (الجولة الحالية)':'Bet now (current round)',
                'في انتظار إقلاع الطائرة...':'Waiting for takeoff...', 'تبدأ الطائرة في: 5.0 ث':'Plane starts in: 5.0s', 'مبلغ السحب:':'Cashout amount:',
                'المراهنات الرياضية المباشرة (Kazo Sports)':'Live Sports Betting (Kazo Sports)', '● مباريات جارية الآن':'● Matches live now',
                'سجل الرهانات والأرباح':'Betting & Winnings History', 'اللعبة':'Game', 'الربح':'Win', 'الوقت':'Time',
                'نادي كازو VIP الذهبي':'Kazo Gold VIP Club', 'لعب مسؤول':'Responsible Gaming', 'إثبات العدالة':'Fairness Proof',
                'نسيت كلمة السر؟':'Forgot password?', 'تسجيل الدخول':'Log In', 'إنشاء حساب':'Create Account', 'الاسم':'Name', 'الإيميل':'Email',
                'الإيميل أو ID':'Email or ID', 'كلمة المرور':'Password', 'كلمة مرور جديدة':'New Password', 'استعادة كلمة المرور':'Password Recovery',
                'إرسال رابط الاستعادة':'Send Recovery Link', 'العودة إلى تسجيل الدخول':'Back to Login', 'حفظ كلمة المرور':'Save Password'
            };
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(node => {
                const value = node.nodeValue.trim(); if (!value) return;
                if (!node.parentElement?.dataset?.i18n) {
                    if (!node.parentElement.dataset.kazoAr && legacy[value]) node.parentElement.dataset.kazoAr = value;
                    const ar = node.parentElement.dataset.kazoAr;
                    if (ar && legacy[ar]) node.nodeValue = node.nodeValue.replace(value, lang === 'en' ? legacy[ar] : ar);
                }
            });
            this.renderWalletBalance();
        };

        const openDrawer = (kind) => {
            const shell = document.getElementById(kind === 'main' ? 'main-drawer-shell' : 'profile-drawer-shell');
            if (!shell) return;
            shell.classList.remove('hidden');
            shell.setAttribute('aria-hidden','false');
            document.body.style.overflow='hidden';
        };
        const closeDrawer = (kind) => {
            const shell = document.getElementById(kind === 'main' ? 'main-drawer-shell' : 'profile-drawer-shell');
            if (!shell) return;
            shell.classList.add('hidden');
            shell.setAttribute('aria-hidden','true');
            document.body.style.overflow='';
        };

        document.getElementById('open-main-drawer')?.addEventListener('click', () => openDrawer('main'));
        document.getElementById('open-profile-drawer')?.addEventListener('click', () => openDrawer('profile'));
        document.querySelectorAll('[data-close-drawer]').forEach(btn => btn.addEventListener('click', () => closeDrawer(btn.dataset.closeDrawer)));

        document.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));
        applyLanguage(localStorage.getItem('kazo_lang') || 'ar');
        setTimeout(() => applyLanguage(localStorage.getItem('kazo_lang') || 'ar'), 0);

        const openBets = () => {
            document.getElementById('bets-modal')?.classList.remove('hidden');
            document.body.style.overflow='hidden';
        };
        document.getElementById('open-bets-modal')?.addEventListener('click', openBets);
        document.getElementById('bottom-open-bets')?.addEventListener('click', openBets);
        document.getElementById('close-bets-modal')?.addEventListener('click', () => {
            document.getElementById('bets-modal')?.classList.add('hidden');
            document.body.style.overflow='';
        });

        document.querySelectorAll('[data-open-section]').forEach(btn => btn.addEventListener('click', () => {
            closeDrawer('main');
            closeDrawer('profile');
            this.switchTab(btn.dataset.openSection);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.soundEngine?.playClick?.();
        }));
        document.getElementById('kazo-home-logo')?.addEventListener('click', (e) => { e.preventDefault(); this.switchTab('home'); });

        document.querySelectorAll('.soon-action').forEach(btn => btn.addEventListener('click', () => {
            const lang = localStorage.getItem('kazo_lang') || 'ar';
            this.showToast(lang === 'en' ? 'Coming soon' : 'قريباً', 'info');
        }));

        // صفحة ملف التعريف الكاملة
        const fullProfileModal = document.getElementById('full-profile-modal');
        const openFullProfile = () => {
            closeDrawer('profile');
            this.refreshFullProfile();
            fullProfileModal?.classList.remove('hidden');
            document.body.style.overflow='hidden';
        };
        document.getElementById('open-full-profile')?.addEventListener('click', openFullProfile);
        document.getElementById('close-full-profile')?.addEventListener('click', () => {
            fullProfileModal?.classList.add('hidden');
            document.body.style.overflow='';
        });
        document.getElementById('profile-info-btn')?.addEventListener('click', () => document.getElementById('profile-info-box')?.classList.toggle('hidden'));
        document.getElementById('profile-copy-id')?.addEventListener('click', async () => {
            const id = window.kazoCurrentProfile?.public_id || '';
            if (!id) return this.showToast((localStorage.getItem('kazo_lang') || 'ar') === 'en' ? 'ID is not available' : 'الآيدي غير متوفر', 'info');
            try { await navigator.clipboard.writeText(String(id)); }
            catch { const t=document.createElement('textarea'); t.value=String(id); document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
            this.showToast((localStorage.getItem('kazo_lang') || 'ar') === 'en' ? 'ID copied' : 'تم نسخ الآيدي', 'success');
        });
        document.getElementById('profile-photo-input')?.addEventListener('change', (e) => {
            const file = e.target.files?.[0]; if (!file) return;
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = () => {
                const key = `kazo_${window.kazoCurrentUser?.id || 'guest'}_profile_photo`;
                try { localStorage.setItem(key, reader.result); } catch {}
                this.applyProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        });
        document.getElementById('profile-deposit-btn')?.addEventListener('click', () => {
            fullProfileModal?.classList.add('hidden');
            document.body.style.overflow='';
            document.getElementById('deposit-modal')?.classList.remove('hidden');
        });

        document.querySelectorAll('.kazo-home-search input').forEach(input => input.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.showToast((localStorage.getItem('kazo_lang') || 'ar') === 'en' ? 'Search is coming soon' : 'البحث قريباً', 'info');
        }));
        document.getElementById('drawer-search-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.showToast((localStorage.getItem('kazo_lang') || 'ar') === 'en' ? 'Search is coming soon' : 'البحث قريباً', 'info');
        });

        document.addEventListener('kazo:auth-ready', (e) => {
            const name = e.detail?.profile?.name || e.detail?.user?.user_metadata?.name || 'Kazo';
            const id = e.detail?.profile?.public_id;
            const nameEl = document.getElementById('profile-drawer-name');
            const idEl = document.getElementById('profile-drawer-id');
            if (nameEl) nameEl.textContent = name;
            if (idEl) idEl.textContent = id ? `ID ${id}` : 'ID ...';
            this.refreshFullProfile();
        }, { once:false });
        const currentName = window.kazoCurrentProfile?.name || window.kazoCurrentUser?.user_metadata?.name || 'Kazo';
        const currentId = window.kazoCurrentProfile?.public_id;
        if (document.getElementById('profile-drawer-name')) document.getElementById('profile-drawer-name').textContent = currentName;
        if (document.getElementById('profile-drawer-id')) document.getElementById('profile-drawer-id').textContent = currentId ? `ID ${currentId}` : 'ID ...';

        this.switchTab('home');
    }

    applyProfilePhoto(src) {
        const img = document.getElementById('full-profile-photo');
        const fallback = document.getElementById('full-profile-photo-fallback');
        if (!img || !fallback) return;
        if (src) { img.src = src; img.classList.remove('hidden'); fallback.classList.add('hidden'); }
        else { img.removeAttribute('src'); img.classList.add('hidden'); fallback.classList.remove('hidden'); }
    }

    refreshFullProfile() {
        const user = window.kazoCurrentUser;
        const profile = window.kazoCurrentProfile;
        const name = profile?.name || user?.user_metadata?.name || 'Kazo';
        const id = profile?.public_id;
        const nameEl = document.getElementById('full-profile-name');
        const idEl = document.getElementById('full-profile-id');
        if (nameEl) nameEl.textContent = name;
        if (idEl) idEl.textContent = id ? `ID ${id}` : 'ID ...';
        const formatDate = (v) => {
            if (!v) return '—';
            try { return new Intl.DateTimeFormat((localStorage.getItem('kazo_lang') || 'ar') === 'en' ? 'en-GB' : 'ar-IQ', {dateStyle:'medium', timeStyle:'short'}).format(new Date(v)); }
            catch { return String(v); }
        };
        const created = document.getElementById('profile-created-at');
        const last = document.getElementById('profile-last-session');
        if (created) created.textContent = formatDate(user?.created_at);
        if (last) last.textContent = formatDate(user?.last_sign_in_at || user?.updated_at);
        const key = `kazo_${user?.id || 'guest'}_profile_photo`;
        this.applyProfilePhoto(localStorage.getItem(key));
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
                        <span class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Kazo Live</span>
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
