/**
 * Kazo Golden Tree
 * لعبة سلوت أصلية لكازو تستخدم رصيد المحاكاة المحلي فقط.
 */
class GoldenTreeGame {
    constructor() {
        this.bet = 50;
        this.isSpinning = false;
        this.turbo = false;
        this.autoLeft = 0;
        this.freeSpins = 0;
        this.bonusMultiplier = 1;
        this.symbols = [
            { id:'orange', icon:'🍊', w:17, pay:[0,0,2,5,12] },
            { id:'grape', icon:'🍇', w:16, pay:[0,0,2,6,14] },
            { id:'cherry', icon:'🍒', w:16, pay:[0,0,2,5,12] },
            { id:'lemon', icon:'🍋', w:14, pay:[0,0,3,7,16] },
            { id:'melon', icon:'🍉', w:12, pay:[0,0,3,8,18] },
            { id:'bell', icon:'🔔', w:9, pay:[0,0,5,12,30] },
            { id:'seven', icon:'7️⃣', w:6, pay:[0,0,8,22,55] },
            { id:'wild', icon:'⭐', w:5, pay:[0,0,10,30,80] },
            { id:'tree', icon:'🌳', w:5, pay:[0,0,6,18,50] }
        ];
        this.paylines = [
            [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2],
            [0,1,2,1,0], [2,1,0,1,2], [0,0,1,2,2], [2,2,1,0,0]
        ];
        this.bind();
        this.renderInitial();
        window.wallet?.subscribe?.(() => this.refresh());
    }

    bind() {
        document.querySelectorAll('#kgt-bet-row [data-bet]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isSpinning || this.freeSpins > 0) return;
                this.bet = Number(btn.dataset.bet);
                document.querySelectorAll('#kgt-bet-row [data-bet]').forEach(b => b.classList.toggle('active', b === btn));
                this.refresh();
            });
        });
        document.getElementById('kgt-spin')?.addEventListener('click', () => this.spin());
        document.getElementById('kgt-turbo')?.addEventListener('click', (e) => {
            this.turbo = !this.turbo;
            e.currentTarget.classList.toggle('active', this.turbo);
        });
        document.getElementById('kgt-auto')?.addEventListener('click', (e) => {
            if (this.autoLeft > 0) {
                this.autoLeft = 0;
                e.currentTarget.classList.remove('active');
                e.currentTarget.querySelector('small').textContent = 'تلقائي';
                return;
            }
            this.autoLeft = 10;
            e.currentTarget.classList.add('active');
            e.currentTarget.querySelector('small').textContent = 'إيقاف';
            this.spin();
        });
        document.getElementById('kgt-buy-bonus')?.addEventListener('click', () => this.buyBonus());
    }

    refresh() {
        const bal = window.wallet?.balance || 0;
        const money = n => `${Math.round(n).toLocaleString('en-US')} د.ع`;
        const balanceEl = document.getElementById('kgt-balance');
        if (balanceEl) balanceEl.textContent = money(bal);
        const betEl = document.getElementById('kgt-bet-label');
        if (betEl) betEl.textContent = money(this.bet);
    }

    weightedSymbol() {
        const total = this.symbols.reduce((a,s)=>a+s.w,0);
        let r = Math.random()*total;
        for (const s of this.symbols) { r -= s.w; if (r <= 0) return s; }
        return this.symbols[0];
    }

    makeGrid(forceBonus=false) {
        const grid = Array.from({length:5}, () => Array.from({length:3}, () => this.weightedSymbol()));
        if (forceBonus) {
            const cols = [0,2,4];
            cols.forEach((c,i)=> grid[c][i%3] = this.symbols.find(s=>s.id==='tree'));
        }
        return grid;
    }

    renderInitial() {
        const grid = this.makeGrid(false);
        this.renderGrid(grid, false);
        this.refresh();
    }

    renderGrid(grid, animate=true) {
        const reels = [...document.querySelectorAll('#kgt-reels .kgt-reel')];
        reels.forEach((reel, c) => {
            reel.innerHTML = '';
            if (animate) reel.classList.add('spinning');
            grid[c].forEach(sym => {
                const cell = document.createElement('div');
                cell.className = `kgt-symbol symbol-${sym.id}`;
                cell.dataset.symbol = sym.id;
                cell.textContent = sym.icon;
                reel.appendChild(cell);
            });
        });
    }

    evaluate(grid) {
        let payoutMult = 0;
        const winningCells = new Set();
        for (const line of this.paylines) {
            const rowSymbols = line.map((r,c)=>grid[c][r]);
            let base = rowSymbols.find(s=>s.id!=='wild') || rowSymbols[0];
            let count = 0;
            for (let i=0; i<rowSymbols.length; i++) {
                const s=rowSymbols[i];
                if (s.id===base.id || s.id==='wild') count++; else break;
            }
            if (count >= 3) {
                const paySource = base.id==='wild' ? this.symbols.find(s=>s.id==='wild') : base;
                payoutMult += paySource.pay[count-1] || 0;
                for (let c=0;c<count;c++) winningCells.add(`${c}-${line[c]}`);
            }
        }
        let trees=[];
        grid.forEach((col,c)=>col.forEach((s,r)=>{ if(s.id==='tree') trees.push([c,r]); }));
        return { payoutMult, winningCells, treeCount:trees.length, treeCells:trees };
    }

    async spin(opts={}) {
        if (this.isSpinning) return;
        const isFree = this.freeSpins > 0 || opts.free;
        if (!isFree) {
            if (!window.wallet?.deduct(this.bet)) {
                this.message('رصيدك غير كافٍ لهذا الرهان', 'loss');
                this.stopAuto();
                return;
            }
        } else if (this.freeSpins > 0) {
            this.freeSpins--;
        }

        this.isSpinning = true;
        this.disableControls(true);
        this.message(isFree ? `جولة مجانية • المتبقي ${this.freeSpins}` : 'جاري تدوير البكرات…', '');
        const grid = this.makeGrid(!!opts.forceBonus);
        this.renderGrid(grid, true);
        const delay = this.turbo ? 280 : 820;
        await new Promise(r=>setTimeout(r,delay));
        document.querySelectorAll('#kgt-reels .kgt-reel').forEach(r=>r.classList.remove('spinning'));

        const result = this.evaluate(grid);
        result.treeCells.forEach(([c,r])=>document.querySelectorAll('#kgt-reels .kgt-reel')[c]?.children[r]?.classList.add('tree-hit'));
        result.winningCells.forEach(key=>{ const [c,r]=key.split('-').map(Number); document.querySelectorAll('#kgt-reels .kgt-reel')[c]?.children[r]?.classList.add('win'); });

        if (result.treeCount >= 3) {
            this.bonusMultiplier = result.treeCount >= 5 ? 5 : result.treeCount === 4 ? 3 : 2;
            this.freeSpins += result.treeCount >= 5 ? 5 : 3;
            this.showBonus(`×${this.bonusMultiplier} • ${this.freeSpins} جولات مجانية`);
        }

        let win = this.bet * result.payoutMult * (isFree ? this.bonusMultiplier : 1);
        if (result.treeCount >= 3 && win === 0) win = this.bet * this.bonusMultiplier;
        win = Math.round(win * 100) / 100;
        if (win > 0) {
            window.wallet?.add(win);
            window.wallet?.addHistory('Kazo Golden Tree', isFree ? 0 : this.bet, win, `ربح ×${(win/this.bet).toFixed(2)}`);
            this.message(`🎉 ربحت ${Math.round(win).toLocaleString('en-US')} د.ع`, 'win');
        } else {
            window.wallet?.addHistory('Kazo Golden Tree', isFree ? 0 : this.bet, 0, 'لم يفز');
            this.message('حظ أوفر في الجولة القادمة', 'loss');
        }
        const last=document.getElementById('kgt-last-win'); if(last) last.textContent=`${Math.round(win).toLocaleString('en-US')} د.ع`;
        this.refresh();
        this.isSpinning=false;
        this.disableControls(false);

        if (this.freeSpins > 0) {
            setTimeout(()=>this.spin({free:true}), this.turbo?350:900);
            return;
        }
        this.hideBonus();
        this.bonusMultiplier=1;
        if (this.autoLeft > 0) {
            this.autoLeft--;
            if (this.autoLeft > 0) setTimeout(()=>this.spin(), this.turbo?350:950); else this.stopAuto();
        }
    }

    async buyBonus() {
        if (this.isSpinning || this.freeSpins>0) return;
        const cost=this.bet*20;
        if (!window.wallet?.deduct(cost)) {
            this.message(`تحتاج ${cost.toLocaleString('en-US')} د.ع لشراء البونص`, 'loss');
            return;
        }
        window.wallet?.addHistory('Kazo Golden Tree - Bonus', cost, 0, 'شراء بونص');
        this.freeSpins=5;
        this.bonusMultiplier=2;
        this.showBonus('تم شراء البونص • ×2 • 5 جولات مجانية');
        this.refresh();
        this.spin({free:true,forceBonus:true});
    }

    showBonus(text) {
        const b=document.getElementById('kgt-bonus-banner');
        const t=document.getElementById('kgt-bonus-text');
        if(t)t.textContent=text;
        b?.classList.remove('hidden');
    }
    hideBonus(){ if(this.freeSpins<=0) document.getElementById('kgt-bonus-banner')?.classList.add('hidden'); }
    message(text,type='') { const el=document.getElementById('kgt-win-message'); if(!el)return; el.textContent=text; el.className='kgt-win-message '+type; }
    disableControls(disabled) { document.getElementById('kgt-spin')?.toggleAttribute('disabled',disabled); document.getElementById('kgt-buy-bonus')?.toggleAttribute('disabled',disabled); }
    stopAuto(){ this.autoLeft=0; const b=document.getElementById('kgt-auto'); b?.classList.remove('active'); if(b?.querySelector('small')) b.querySelector('small').textContent='تلقائي'; }
}
window.GoldenTreeGame = GoldenTreeGame;
