/**
 * Uncrossable Rush - Core Game Engine
 * Manages game state, camera tracking, lane rendering, collision,
 * multipliers, concrete barrier placement, and betting resolution.
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Dimensions
        this.width = 680;
        this.height = 760;
        this.totalLanes = 24;
        this.laneHeight = 54;
        this.roadTotalHeight = (this.totalLanes + 2) * this.laneHeight; // 26 lanes total (sidewalks + road)

        // Adjust canvas resolution for HiDPI
        this.setupCanvas();

        // Game State
        this.state = 'IDLE'; // IDLE, PLAYING, HOPPING, CRASHED, CASHED_OUT, VICTORY
        this.currentLane = 0; // 0 = start sidewalk, 1..24 = road lanes, 25 = victory sidewalk
        this.difficulty = 'medium';

        // Camera
        this.cameraY = this.roadTotalHeight - this.height;
        this.targetCameraY = this.cameraY;

        // Screen Shake & Red Flash
        this.screenShake = 0;
        this.redFlash = 0;

        // Multipliers definitions per difficulty
        this.multipliers = {};
        this.initMultipliers();

        // Game Objects
        const startX = this.width / 2;
        const startY = this.getLaneCenterY(0);
        this.chicken = new Chicken(startX, startY, this.laneHeight);
        this.traffic = new TrafficManager(this.width, this.laneHeight, this.totalLanes);
        this.barriers = {}; // indexed by lane number

        // Cash Out & Win particles
        this.coinParticles = [];

        // Timing
        this.lastTime = performance.now();

        // Initialize traffic
        this.traffic.setDifficulty(this.difficulty);
        this.traffic.populateInitial(this.roadTotalHeight, this.barriers);

        // Bind resize
        window.addEventListener('resize', () => this.setupCanvas());

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        // Logical width/height
        this.width = 680;
        this.height = 760;
        
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    initMultipliers() {
        // 24 multiplier steps per difficulty
        this.multipliers = {
            easy: [
                1.12, 1.25, 1.40, 1.58, 1.80, 2.05, 2.35, 2.75, 3.25, 3.85,
                4.60, 5.55, 6.75, 8.30, 10.3, 13.0, 16.5, 21.5, 28.5, 38.5,
                53.0, 75.0, 110.0, 180.0
            ],
            medium: [
                1.35, 1.62, 1.98, 2.45, 3.10, 4.00, 5.25, 7.00, 9.50, 13.2,
                18.5, 26.5, 38.5, 57.0, 86.0, 132.0, 208.0, 335.0, 550.0, 920.0,
                1600.0, 2900.0, 5400.0, 10000.0
            ],
            hard: [
                1.75, 2.35, 3.20, 4.50, 6.40, 9.30, 13.8, 21.0, 32.5, 52.0,
                85.0, 142.0, 245.0, 430.0, 780.0, 1450.0, 2800.0, 5600.0, 11500.0, 24000.0,
                52000.0, 115000.0, 260000.0, 600000.0
            ],
            hardcore: [
                2.50, 4.10, 6.90, 12.0, 21.5, 39.0, 74.0, 145.0, 290.0, 600.0,
                1280.0, 2800.0, 6200.0, 14200.0, 33500.0, 82000.0, 205000.0, 530000.0,
                1400000.0, 3800000.0, 10000000.0, 28000000.0, 80000000.0, 250000000.0
            ]
        };
    }

    setDifficulty(diff) {
        if (this.state === 'PLAYING' || this.state === 'HOPPING') return;
        this.difficulty = diff;
        this.traffic.setDifficulty(diff);
        if (window.uiController) {
            window.uiController.updateMultiplierLadder();
        }
    }

    getCurrentMultiplier() {
        if (this.currentLane <= 0) return 1.0;
        const list = this.multipliers[this.difficulty];
        const idx = Math.min(this.currentLane - 1, list.length - 1);
        return list[idx];
    }

    getNextMultiplier() {
        const list = this.multipliers[this.difficulty];
        const nextIdx = Math.min(this.currentLane, list.length - 1);
        return list[nextIdx];
    }

    getLaneCenterY(laneIndex) {
        // Lane 0 is at bottom (sidewalk). Lane 25 is at top (sidewalk).
        return this.roadTotalHeight - (laneIndex * this.laneHeight) - (this.laneHeight * 0.5);
    }

    startRound(betAmount) {
        if (this.state === 'PLAYING' || this.state === 'HOPPING') return;

        this.currentLane = 0;
        this.barriers = {};
        this.coinParticles = [];
        this.state = 'PLAYING';

        const startX = this.width / 2;
        const startY = this.getLaneCenterY(0);
        this.chicken.reset(startX, startY);

        this.cameraY = this.roadTotalHeight - this.height;
        this.targetCameraY = this.cameraY;

        // Ensure background music is running
        if (window.soundEngine && !window.soundEngine.isPlayingMusic) {
            window.soundEngine.startMusic();
        }

        if (window.uiController) {
            window.uiController.onRoundStarted();
        }
    }

    stepForward() {
        if (this.state !== 'PLAYING' && this.state !== 'IDLE') return;

        // If IDLE, start round automatically using current bet
        if (this.state === 'IDLE') {
            if (window.uiController && !window.uiController.placeBet()) {
                return;
            }
        }

        if (this.currentLane >= this.totalLanes) return; // already at max

        this.state = 'HOPPING';
        const nextLane = this.currentLane + 1;
        const targetY = this.getLaneCenterY(nextLane);

        this.chicken.hopTo(targetY);

        if (window.uiController) {
            window.uiController.updateButtons();
        }
    }

    onLanding(landedLane) {
        this.currentLane = landedLane;

        // Drop a concrete barrier ("صبة خرسانية") on the crossed lane!
        const barrierX = this.chicken.x;
        const barrierY = this.getLaneCenterY(landedLane);
        this.barriers[landedLane] = new ConcreteBarrier(barrierX, barrierY, 68, 32);

        // Check if finished all 24 lanes
        if (this.currentLane >= this.totalLanes) {
            this.state = 'VICTORY';
            this.spawnCoinCelebration(this.chicken.x, this.chicken.y);
            if (window.soundEngine) {
                window.soundEngine.playCashOut();
            }
            if (window.uiController) {
                window.uiController.onVictory();
            }
        } else {
            this.state = 'PLAYING';
            if (window.uiController) {
                window.uiController.onSafeLanding();
            }
        }
    }

    cashOut() {
        if (this.currentLane === 0 || this.state !== 'PLAYING') return;

        this.state = 'CASHED_OUT';
        const mult = this.getCurrentMultiplier();

        this.spawnCoinCelebration(this.chicken.x, this.chicken.y);

        if (window.soundEngine) {
            window.soundEngine.playCashOut();
        }

        if (window.uiController) {
            window.uiController.onCashOut(mult);
        }
    }

    crash(car) {
        if (this.state === 'CRASHED') return;
        this.state = 'CRASHED';

        this.screenShake = 18;
        this.redFlash = 0.65;

        // Impact chicken with car velocity
        this.chicken.die(car.dir * car.speed);

        // Heavy crash sound and tire screech
        if (window.soundEngine) {
            window.soundEngine.playCrashImpact();
            window.soundEngine.playTireScreech();
        }

        if (window.uiController) {
            window.uiController.onCrash();
        }
    }

    triggerShake(amount) {
        this.screenShake = Math.max(this.screenShake, amount);
    }

    spawnCoinCelebration(x, y) {
        const count = 35;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 120 + Math.random() * 260;
            this.coinParticles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 100,
                radius: 6 + Math.random() * 4,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() * 2 - 1) * 10,
                color: (Math.random() > 0.3) ? '#ffd700' : '#ffeb3b',
                alpha: 1.0,
                life: 1.2 + Math.random() * 0.8
            });
        }
    }

    // --- Main Loop & Update ---

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05); // cap delta time
        this.lastTime = currentTime;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Update Chicken
        this.chicken.update(dt);

        // If chicken finished jump, trigger safe landing
        if (this.state === 'HOPPING' && !this.chicken.isJumping && !this.chicken.isDead) {
            this.onLanding(this.currentLane + 1);
        }

        // Update Concrete Barriers
        for (const lane in this.barriers) {
            this.barriers[lane].update(dt);
        }

        // Update Traffic
        this.traffic.update(dt, this.roadTotalHeight, this.barriers, this.chicken);

        // Collision Check: only if chicken is not protected by an existing barrier in that lane!
        if ((this.state === 'PLAYING' || this.state === 'HOPPING') && !this.chicken.isDead) {
            // If the chicken is standing inside a lane that ALREADY has an established barrier, it is safe
            const hasLandedBarrier = (this.barriers[this.currentLane] && !this.barriers[this.currentLane].isDropping);
            
            // If hopping into a lane, or on a lane without a placed barrier yet
            if (this.state === 'HOPPING' || !hasLandedBarrier) {
                const hitCar = this.traffic.checkCollision(this.chicken);
                if (hitCar) {
                    this.crash(hitCar);
                }
            }
        }

        // Update Coin Celebration Particles
        for (let i = this.coinParticles.length - 1; i >= 0; i--) {
            const p = this.coinParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 350 * dt; // gravity
            p.vx *= 0.98;
            p.rotation += p.rotSpeed * dt;
            p.life -= dt;
            p.alpha = Math.max(0, p.life);
            if (p.life <= 0) {
                this.coinParticles.splice(i, 1);
            }
        }

        // Screen Shake & Red Flash decay
        if (this.screenShake > 0) {
            this.screenShake = Math.max(0, this.screenShake - 35 * dt);
        }
        if (this.redFlash > 0) {
            this.redFlash = Math.max(0, this.redFlash - 1.8 * dt);
        }

        // Camera Smooth Tracking (keeps chicken in comfortable view, looking 4 lanes ahead)
        const targetViewY = this.chicken.y - this.height * 0.65;
        this.targetCameraY = Math.max(0, Math.min(this.roadTotalHeight - this.height, targetViewY));
        this.cameraY += (this.targetCameraY - this.cameraY) * 7.5 * dt;
    }

    // --- Rendering ---

    draw() {
        const ctx = this.ctx;
        ctx.save();

        // Clear Background (Deep night slate)
        ctx.fillStyle = '#0a0f18';
        ctx.fillRect(0, 0, this.width, this.height);

        // Apply Screen Shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() * 2 - 1) * this.screenShake;
            const shakeY = (Math.random() * 2 - 1) * this.screenShake;
            ctx.translate(shakeX, shakeY);
        }

        // Apply Camera Transform
        ctx.save();
        ctx.translate(0, -this.cameraY);

        // 1. Draw Highway Lanes & Sidewalks
        this.drawHighway(ctx);

        // 2. Draw Concrete Barriers (الصبات الخرسانية)
        for (const lane in this.barriers) {
            this.barriers[lane].draw(ctx);
        }

        // 3. Draw Vehicles & Traffic
        this.traffic.draw(ctx);

        // 4. Draw Chicken
        this.chicken.draw(ctx);

        // 5. Draw Coin Celebration Particles
        for (const p of this.coinParticles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            // Shiny coin
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b78103';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Dollar sign
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText('$', -2.5, 3);
            ctx.restore();
        }

        ctx.restore(); // restore camera

        // 6. Draw Red Flash Screen Overlay on Crash
        if (this.redFlash > 0) {
            ctx.fillStyle = `rgba(255, 23, 68, ${this.redFlash})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore(); // restore shake
    }

    drawHighway(ctx) {
        // Start Sidewalk (Lane 0)
        const startY = this.roadTotalHeight - this.laneHeight;
        this.drawSidewalk(ctx, startY, true);

        // Finish Sidewalk (Lane 25)
        const finishY = 0;
        this.drawSidewalk(ctx, finishY, false);

        // Road Asphalt Surface (Lanes 1 to 24)
        for (let i = 1; i <= this.totalLanes; i++) {
            const laneY = this.roadTotalHeight - ((i + 1) * this.laneHeight);

            // Alternating dark asphalt shades for high visibility
            ctx.fillStyle = (i % 2 === 0) ? '#18202c' : '#141a24';
            ctx.fillRect(0, laneY, this.width, this.laneHeight);

            // White/Yellow Dashed Lane Markers (top of each lane)
            if (i < this.totalLanes) {
                const isDoubleYellow = (i % 6 === 0);
                if (isDoubleYellow) {
                    // Double solid yellow line dividing highway sections
                    ctx.fillStyle = '#ffd600';
                    ctx.fillRect(0, laneY - 2, this.width, 2);
                    ctx.fillRect(0, laneY + 2, this.width, 2);
                } else {
                    // Dashed white highway stripe
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                    const dashLen = 28;
                    const gapLen = 22;
                    for (let dx = 10; dx < this.width; dx += dashLen + gapLen) {
                        ctx.fillRect(dx, laneY - 1, dashLen, 2.5);
                    }
                }
            }

            // Road Shoulder Curbs (Side Borders)
            ctx.fillStyle = (i % 2 === 0) ? '#ff5252' : '#ffffff';
            ctx.fillRect(0, laneY, 8, this.laneHeight);
            ctx.fillRect(this.width - 8, laneY, 8, this.laneHeight);

            // Multiplier Badge on side of each lane
            this.drawLaneMultiplierBadge(ctx, i, laneY);
        }
    }

    drawSidewalk(ctx, y, isStart = true) {
        // Pavement / grass
        ctx.fillStyle = isStart ? '#2e7d32' : '#1b5e20';
        ctx.fillRect(0, y, this.width, this.laneHeight);

        // Stone curb border
        ctx.fillStyle = '#90a4ae';
        ctx.fillRect(0, isStart ? y : y + this.laneHeight - 6, this.width, 6);

        // Decorative pavement tiles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let tx = 0; tx < this.width; tx += 40) {
            ctx.strokeRect(tx, y, 40, this.laneHeight);
        }

        // Start / Finish Text Banner
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        if (isStart) {
            ctx.fillText('🏁 منطقة البداية الآمنة - START ZONE', this.width / 2, y + 33);
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.fillText('🏆 خط النهاية والربح الأقصى - FINISH LINE 🏆', this.width / 2, y + 33);
        }
    }

    drawLaneMultiplierBadge(ctx, laneIndex, laneY) {
        const multList = this.multipliers[this.difficulty];
        const mult = multList[laneIndex - 1] || 1.0;
        const isPassed = laneIndex <= this.currentLane;
        const isNext = laneIndex === this.currentLane + 1;

        // Left Badge
        ctx.save();
        ctx.translate(16, laneY + this.laneHeight / 2);

        let bg = 'rgba(20, 30, 45, 0.75)';
        let border = '#37474f';
        let textCol = '#90a4ae';

        if (isPassed) {
            bg = 'rgba(0, 230, 118, 0.25)';
            border = '#00e676';
            textCol = '#00e676';
        } else if (isNext) {
            bg = 'rgba(0, 229, 255, 0.3)';
            border = '#00e5ff';
            textCol = '#00e5ff';
        }

        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(0, -11, 48, 22, 5);
        ctx.fill();
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = textCol;
        ctx.font = 'bold 10.5px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mult.toFixed(2) + 'x', 24, 0);

        ctx.restore();
    }
}

// Global game instance
window.gameInstance = null;
