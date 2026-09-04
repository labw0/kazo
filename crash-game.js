/**
 * KAZO Crash Game (لعبة الطيارة - كازو كراش / أفياتور)
 * تحكم كامل بدورة اللعبة، Canvas للرسم النفاث والمسار المنحني، محاكاة اللاعبين، والسحب التلقائي.
 */

class CrashGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.state = 'WAITING'; // WAITING, COUNTDOWN, FLYING, CRASHED
        this.multiplier = 1.00;
        this.crashPoint = 1.00;
        this.startTime = null;
        this.countdownTimer = null;
        this.countdownRemaining = 5;
        this.animationFrame = null;

        // رهان المستخدم الحالي
        this.userBet = null; // { amount: number, autoCashout: number, cashedOut: boolean, winAmount: number }
        this.nextRoundBet = null;

        // تاريخ الجولات السابقة
        this.history = [1.45, 2.80, 1.15, 8.42, 1.02, 3.14, 15.60, 1.85, 4.20, 1.30];

        // اللاعبين المحاكين
        this.mockPlayers = [];

        // مؤثرات الانفجار والجزيئات
        this.particles = [];
        this.stars = [];

        this.init();
    }

    init() {
        this.canvas = document.getElementById('crash-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
            this.initStars();
        }

        this.bindEvents();
        this.renderHistory();
        this.startCountdown();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight || 420;
        this.initStars();
    }

    initStars() {
        if (!this.canvas) return;
        this.stars = [];
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.8,
                alpha: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }

    bindEvents() {
        const betBtn = document.getElementById('crash-bet-btn');
        const cashoutBtn = document.getElementById('crash-cashout-btn');

        if (betBtn) {
            betBtn.addEventListener('click', () => this.handleBetClick());
        }
        if (cashoutBtn) {
            cashoutBtn.addEventListener('click', () => this.cashOut());
        }

        // أزرار المضاعفة السريعة للرهان
        document.querySelectorAll('.crash-chip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const input = document.getElementById('crash-bet-amount');
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

    // توليد نقطة الانفجار عشوائياً بنظام نزيه
    generateCrashPoint() {
        // نسبة 4% لانفجار فوري عند 1.00x
        if (Math.random() < 0.04) {
            return 1.00;
        }
        // توزيع إحصائي قياسي للعبة الكراش
        const e = 100;
        const r = Math.random() * e;
        const result = (100 * 0.96) / (e - r);
        return Math.max(1.01, Math.min(Math.round(result * 100) / 100, 250.00));
    }

    startCountdown() {
        this.state = 'COUNTDOWN';
        this.countdownRemaining = 5;
        this.multiplier = 1.00;
        this.particles = [];
        this.updateControlsUI();
        this.generateMockPlayers();

        // تفعيل رهان المستخدم إذا كان قد جهز رهان للجولة القادمة
        if (this.nextRoundBet) {
            this.userBet = this.nextRoundBet;
            this.nextRoundBet = null;
            this.updateControlsUI();
        }

        if (this.countdownTimer) clearInterval(this.countdownTimer);

        const countdownEl = document.getElementById('crash-countdown');
        if (countdownEl) {
            countdownEl.classList.remove('hidden');
        }

        this.countdownTimer = setInterval(() => {
            this.countdownRemaining -= 0.1;
            const progress = (this.countdownRemaining / 5) * 100;
            const bar = document.getElementById('crash-countdown-bar');
            const text = document.getElementById('crash-countdown-text');

            if (bar) bar.style.width = `${Math.max(0, progress)}%`;
            if (text) text.textContent = `تبدأ الطائرة في: ${Math.max(0, this.countdownRemaining).toFixed(1)} ث`;

            if (this.countdownRemaining <= 0) {
                clearInterval(this.countdownTimer);
                if (countdownEl) countdownEl.classList.add('hidden');
                this.startFlight();
            }
        }, 100);

        this.renderCanvas();
    }

    startFlight() {
        this.state = 'FLYING';
        this.startTime = performance.now();
        this.crashPoint = this.generateCrashPoint();
        this.multiplier = 1.00;

        window.soundEngine.startJetSound();
        this.updateControlsUI();
        this.renderMockPlayersList();

        const loop = (currentTime) => {
            if (this.state !== 'FLYING') return;

            const elapsedSec = (currentTime - this.startTime) / 1000;
            // نمو أسي واقعي للمضاعف
            this.multiplier = Math.pow(Math.E, 0.065 * elapsedSec);
            this.multiplier = Math.round(this.multiplier * 100) / 100;

            window.soundEngine.updateJetMultiplier(this.multiplier);

            // فحص السحب التلقائي للمستخدم
            if (this.userBet && !this.userBet.cashedOut && this.userBet.autoCashout && this.multiplier >= this.userBet.autoCashout) {
                this.cashOut(this.userBet.autoCashout);
            }

            // فحص سحب اللاعبين المحاكين
            this.updateMockPlayersCashouts(this.multiplier);

            // التحقق من وصول نقطة الانفجار
            if (this.multiplier >= this.crashPoint) {
                this.multiplier = this.crashPoint;
                this.explode();
                return;
            }

            this.updateLiveMultiplierUI();
            this.renderCanvas();
            this.animationFrame = requestAnimationFrame(loop);
        };

        this.animationFrame = requestAnimationFrame(loop);
    }

    explode() {
        this.state = 'CRASHED';
        window.soundEngine.playExplosion();

        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        // إنشاء جزيئات الانفجار
        this.createExplosionParticles();

        // إضافة للارشيف
        this.history.unshift(this.multiplier);
        if (this.history.length > 15) this.history.pop();
        this.renderHistory();

        // إذا كان المستخدم يراهن ولم يسحب، خسر الرهان
        if (this.userBet && !this.userBet.cashedOut) {
            window.app.showToast(`💥 انفجرت الطائرة عند ${this.multiplier.toFixed(2)}x! خسرت ${this.userBet.amount} $`, 'danger');
            window.wallet.addHistory('لعبة الطيارة (Crash)', this.userBet.amount, 0, 'خسارة');
            this.userBet = null;
        }

        this.updateControlsUI();
        this.updateLiveMultiplierUI();

        // اهتزاز لوحة اللعبة
        const box = document.getElementById('crash-game-box');
        if (box) {
            box.classList.add('shake-anim');
            setTimeout(() => box.classList.remove('shake-anim'), 500);
        }

        // أنيميشن الانفجار على الـ Canvas
        let frames = 0;
        const explodeAnim = () => {
            if (this.state !== 'CRASHED') return;
            this.renderCanvas();
            frames++;
            if (frames < 80) {
                requestAnimationFrame(explodeAnim);
            }
        };
        requestAnimationFrame(explodeAnim);

        // العودة للعد التنازلي بعد 3.5 ثوانٍ
        setTimeout(() => {
            this.startCountdown();
        }, 3500);
    }

    handleBetClick() {
        const betInput = document.getElementById('crash-bet-amount');
        const autoInput = document.getElementById('crash-auto-cashout');
        const amount = parseFloat(betInput.value) || 10;
        const autoCashout = parseFloat(autoInput.value) || null;

        if (amount <= 0) {
            window.app.showToast('يرجى إدخال قيمة رهان صالحة', 'warning');
            return;
        }

        if (amount > window.wallet.balance) {
            window.app.showToast('رصيدك غير كافٍ! قم بشحن الرصيد التجريبي', 'warning');
            return;
        }

        // خصم قيمة الرهان
        window.wallet.deduct(amount);
        window.soundEngine.playClick();

        const betData = {
            amount: amount,
            autoCashout: (autoCashout && autoCashout > 1.01) ? autoCashout : null,
            cashedOut: false,
            winAmount: 0
        };

        if (this.state === 'COUNTDOWN') {
            this.userBet = betData;
            window.app.showToast(`تم تثبيت رهانك بمبلغ ${amount} $ للجولة الحالية!`, 'success');
        } else {
            this.nextRoundBet = betData;
            window.app.showToast(`تم حجز رهانك بمبلغ ${amount} $ للجولة القادمة!`, 'info');
        }

        this.updateControlsUI();
    }

    cashOut(overrideMultiplier = null) {
        if (!this.userBet || this.userBet.cashedOut || this.state !== 'FLYING') return;

        const mult = overrideMultiplier || this.multiplier;
        const win = Math.round(this.userBet.amount * mult * 100) / 100;

        this.userBet.cashedOut = true;
        this.userBet.winAmount = win;

        window.wallet.add(win);
        window.soundEngine.playCashOut();
        window.app.showToast(`🎉 مبروك! قمت بسحب ${win.toFixed(2)} $ عند المضاعف ${mult.toFixed(2)}x`, 'success');
        window.wallet.addHistory('لعبة الطيارة (Crash)', this.userBet.amount, win, 'فوز');

        this.updateControlsUI();
        this.renderMockPlayersList();
    }

    createExplosionParticles() {
        if (!this.canvas) return;
        const pPos = this.getPlanePosition();
        this.particles = [];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.particles.push({
                x: pPos.x,
                y: pPos.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 6 + 2,
                color: ['#ff4444', '#ffbb00', '#ffffff', '#ff8800'][Math.floor(Math.random() * 4)],
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015
            });
        }
    }

    getPlanePosition() {
        if (!this.canvas) return { x: 50, y: 350 };
        const w = this.canvas.width;
        const h = this.canvas.height;
        const marginX = 60;
        const marginY = 50;

        // حساب الموقع على منحنى بيزيه تصاعدي
        const t = Math.min((this.multiplier - 1) / 8, 1);
        const startX = marginX;
        const startY = h - marginY;
        const endX = w - marginX;
        const endY = marginY + 40;

        const x = startX + (endX - startX) * Math.pow(t, 0.7);
        const y = startY - (startY - endY) * Math.pow(t, 1.4);

        return { x, y };
    }

    renderCanvas() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // مسح الشاشة
        ctx.clearRect(0, 0, w, h);

        // خلفية السماء الليلية
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#0a101d');
        bgGrad.addColorStop(1, '#070b14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // شبكة إحداثيات فنية خافتة
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // حركة النجوم
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            if (this.state === 'FLYING') {
                star.x -= star.speed * (1 + (this.multiplier * 0.5));
                star.y += star.speed * 0.5;
                if (star.x < 0) star.x = w;
                if (star.y > h) star.y = 0;
            }
        });
        ctx.globalAlpha = 1.0;

        // محور الإحداثيات المنحني (Flight Path)
        const pPos = this.getPlanePosition();
        const startX = 60;
        const startY = h - 50;

        if (this.state === 'FLYING' || this.state === 'CRASHED') {
            // رسم المنطقة المضيئة تحت المنحنى
            const fillGrad = ctx.createLinearGradient(0, pPos.y, 0, startY);
            fillGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
            fillGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(startX + (pPos.x - startX) * 0.5, startY, pPos.x, pPos.y);
            ctx.lineTo(pPos.x, startY);
            ctx.closePath();
            ctx.fillStyle = fillGrad;
            ctx.fill();

            // رسم الخط النيون المتوهج
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(startX + (pPos.x - startX) * 0.5, startY, pPos.x, pPos.y);
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 15;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // رسم الطائرة أثناء الطيران
        if (this.state === 'FLYING') {
            this.drawAirplane(ctx, pPos.x, pPos.y);
        }

        // رسم جزيئات الانفجار
        if (this.state === 'CRASHED' && this.particles.length > 0) {
            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1; // جاذبية
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
        }
    }

    drawAirplane(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        // زاوية ميلان واقعية للطائرة للأعلى
        ctx.rotate(-0.35);

        // شعلة المحرك النفاث النارية (Jet Exhaust)
        const flameLength = 25 + Math.random() * 15;
        const flameGrad = ctx.createLinearGradient(-30, 0, -30 - flameLength, 0);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#ffcc00');
        flameGrad.addColorStop(1, 'rgba(255, 68, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(-25, -4);
        ctx.lineTo(-25 - flameLength, 0);
        ctx.lineTo(-25, 4);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();

        // هيكل الطائرة الرياضية الأنيقة (شعار كازو أفياتور أحمر وذهبي)
        // جسم الطائرة
        ctx.fillStyle = '#ff2a4b';
        ctx.beginPath();
        ctx.moveTo(35, 0);       // المقدمة
        ctx.lineTo(-25, -9);    // الجزء الخلفي العلوي
        ctx.lineTo(-28, -2);
        ctx.lineTo(-28, 2);
        ctx.lineTo(-25, 9);     // الجزء الخلفي السفلي
        ctx.closePath();
        ctx.fill();

        // قمرة القيادة الزجاجية المضيئة
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(10, -5);
        ctx.lineTo(24, 0);
        ctx.lineTo(10, 0);
        ctx.closePath();
        ctx.fill();

        // الجناح الرئيسي
        ctx.fillStyle = '#cc1433';
        ctx.beginPath();
        ctx.moveTo(2, -1);
        ctx.lineTo(-12, -22);
        ctx.lineTo(-18, -22);
        ctx.lineTo(-10, -1);
        ctx.closePath();
        ctx.fill();

        // الذيل الرأسي
        ctx.beginPath();
        ctx.moveTo(-18, -2);
        ctx.lineTo(-26, -14);
        ctx.lineTo(-29, -14);
        ctx.lineTo(-24, -2);
        ctx.closePath();
        ctx.fill();

        // وميض أجنحة
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-15, -21, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    updateLiveMultiplierUI() {
        const multEl = document.getElementById('crash-multiplier-val');
        const statusEl = document.getElementById('crash-flight-status');
        const liveCashoutBtn = document.getElementById('crash-cashout-btn');

        if (!multEl) return;

        if (this.state === 'COUNTDOWN') {
            multEl.textContent = '1.00x';
            multEl.className = 'text-5xl md:text-7xl font-black text-cyan-400 font-mono tracking-wider';
            if (statusEl) statusEl.textContent = 'في انتظار إقلاع الطائرة...';
        } else if (this.state === 'FLYING') {
            multEl.textContent = `${this.multiplier.toFixed(2)}x`;
            multEl.className = 'text-6xl md:text-8xl font-black text-white font-mono tracking-wider animate-pulse-fast';
            if (statusEl) statusEl.textContent = 'الطائرة تُحلّق الآن! اسحب أرباحك قبل الانفجار';

            if (liveCashoutBtn && this.userBet && !this.userBet.cashedOut) {
                const currentGain = (this.userBet.amount * this.multiplier).toFixed(2);
                document.getElementById('crash-cashout-gain').textContent = `${currentGain} $`;
            }
        } else if (this.state === 'CRASHED') {
            multEl.textContent = `${this.multiplier.toFixed(2)}x`;
            multEl.className = 'text-6xl md:text-8xl font-black text-red-500 font-mono tracking-wider';
            if (statusEl) statusEl.innerHTML = `<span class="text-red-400 font-bold">💥 انفجرت الطائرة عند ${this.multiplier.toFixed(2)}x</span>`;
        }
    }

    updateControlsUI() {
        const betBtn = document.getElementById('crash-bet-btn');
        const cashoutBtn = document.getElementById('crash-cashout-btn');
        const betBtnText = document.getElementById('crash-bet-btn-text');

        if (!betBtn || !cashoutBtn) return;

        if (this.state === 'FLYING' && this.userBet && !this.userBet.cashedOut) {
            betBtn.classList.add('hidden');
            cashoutBtn.classList.remove('hidden');
        } else {
            cashoutBtn.classList.add('hidden');
            betBtn.classList.remove('hidden');

            if (this.userBet && !this.userBet.cashedOut) {
                betBtn.disabled = true;
                betBtnText.textContent = `مراهن (${this.userBet.amount} $) في الجولة`;
                betBtn.className = 'w-full py-4 rounded-xl font-bold bg-gray-700 text-gray-300 cursor-not-allowed';
            } else if (this.nextRoundBet) {
                betBtn.disabled = true;
                betBtnText.textContent = `محجوز للجولة القادمة (${this.nextRoundBet.amount} $)`;
                betBtn.className = 'w-full py-4 rounded-xl font-bold bg-amber-600/60 text-white cursor-not-allowed';
            } else {
                betBtn.disabled = false;
                betBtnText.textContent = (this.state === 'COUNTDOWN') ? 'راهن الآن (الجولة الحالية)' : 'حجز رهان للجولة القادمة';
                betBtn.className = 'w-full py-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-900/30 transition transform active:scale-95';
            }
        }
    }

    renderHistory() {
        const container = document.getElementById('crash-history-pills');
        if (!container) return;

        container.innerHTML = '';
        this.history.forEach(mult => {
            const pill = document.createElement('span');
            let colorClass = 'bg-blue-900/50 text-blue-300 border-blue-600/40';
            if (mult >= 10) {
                colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold';
            } else if (mult >= 2.0) {
                colorClass = 'bg-purple-900/50 text-purple-300 border-purple-600/40';
            }
            pill.className = `px-2.5 py-1 rounded-full text-xs font-mono border ${colorClass} transition duration-300 transform hover:scale-110`;
            pill.textContent = `${mult.toFixed(2)}x`;
            container.appendChild(pill);
        });
    }

    // محاكاة مراهنين حقيقيين
    generateMockPlayers() {
        const names = [
            'أحمد_الملك', 'سلطان 77', 'كابتن_علي', 'خالد_VIP', 'رعد_الرياض', 
            'عمر_كازو', 'Mo_Salah_99', 'Abood_Pro', 'نجم_الليل', 'أسطورة_البحر'
        ];
        this.mockPlayers = [];
        const count = 7 + Math.floor(Math.random() * 4);

        for (let i = 0; i < count; i++) {
            const name = names[i % names.length];
            const amount = [10, 25, 50, 100, 250, 500][Math.floor(Math.random() * 6)];
            // نقطة سحب عشوائية
            const targetMult = Math.round((1.2 + Math.random() * 5) * 100) / 100;
            this.mockPlayers.push({
                name,
                amount,
                targetMult,
                cashedOut: false,
                win: 0
            });
        }
        this.renderMockPlayersList();
    }

    updateMockPlayersCashouts(currMult) {
        let changed = false;
        this.mockPlayers.forEach(p => {
            if (!p.cashedOut && currMult >= p.targetMult) {
                p.cashedOut = true;
                p.win = Math.round(p.amount * p.targetMult * 100) / 100;
                changed = true;
            }
        });
        if (changed) {
            this.renderMockPlayersList();
        }
    }

    renderMockPlayersList() {
        const tbody = document.getElementById('crash-players-tbody');
        const countEl = document.getElementById('crash-players-count');
        if (!tbody) return;

        let totalBets = this.mockPlayers.reduce((sum, p) => sum + p.amount, 0);
        if (this.userBet) totalBets += this.userBet.amount;
        if (countEl) countEl.textContent = `${this.mockPlayers.length + (this.userBet ? 1 : 0)} لاعب (${totalBets.toFixed(0)} $)`;

        let html = '';

        // إذا كان المستخدم يراهن، يظهر في أول القائمة بتمييز ذهبي
        if (this.userBet) {
            const cashed = this.userBet.cashedOut;
            html += `
                <tr class="bg-cyan-950/40 border-b border-cyan-800/30 text-cyan-300 font-semibold">
                    <td class="py-2 px-3 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        أنت (الحساب الحالي)
                    </td>
                    <td class="py-2 px-3 font-mono">${this.userBet.amount.toFixed(2)} $</td>
                    <td class="py-2 px-3 font-mono text-center">
                        ${cashed ? `<span class="text-green-400 font-bold">${(this.userBet.winAmount / this.userBet.amount).toFixed(2)}x</span>` : (this.state === 'CRASHED' ? '<span class="text-red-400">-</span>' : '<span class="text-cyan-400 animate-pulse">يُحلّق...</span>')}
                    </td>
                    <td class="py-2 px-3 font-mono text-left ${cashed ? 'text-green-400 font-bold' : (this.state === 'CRASHED' ? 'text-red-400' : 'text-gray-400')}">
                        ${cashed ? `+${this.userBet.winAmount.toFixed(2)} $` : (this.state === 'CRASHED' ? 'خسارة' : 'قيد اللعب')}
                    </td>
                </tr>
            `;
        }

        this.mockPlayers.forEach(p => {
            html += `
                <tr class="border-b border-gray-800/40 text-gray-300 text-xs hover:bg-gray-800/30 transition">
                    <td class="py-2 px-3 text-gray-200">${p.name}</td>
                    <td class="py-2 px-3 font-mono text-gray-400">${p.amount} $</td>
                    <td class="py-2 px-3 font-mono text-center">
                        ${p.cashedOut ? `<span class="text-green-400 font-semibold">${p.targetMult.toFixed(2)}x</span>` : (this.state === 'CRASHED' ? '<span class="text-red-400">-</span>' : '<span class="text-gray-500">...</span>')}
                    </td>
                    <td class="py-2 px-3 font-mono text-left">
                        ${p.cashedOut ? `<span class="text-green-400 font-semibold">+${p.win.toFixed(2)} $</span>` : (this.state === 'CRASHED' ? '<span class="text-red-500/70">خسارة</span>' : '-')}
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }
}

window.CrashGame = CrashGame;
