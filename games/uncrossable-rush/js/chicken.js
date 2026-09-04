/**
 * Chicken Character (Eggwina)
 * Vector/Canvas cartoon chicken with 3D-like shading, jump physics,
 * eye animations, fluttering wings, and feather explosion on impact.
 */
class Chicken {
    constructor(startX, startY, laneHeight) {
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.startY = startY;
        this.laneHeight = laneHeight;
        this.radius = 18;

        this.isJumping = false;
        this.jumpProgress = 0;
        this.jumpDuration = 0.22; // seconds
        this.jumpHeight = 28; // peak jump altitude in pixels
        this.altitude = 0;

        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;

        this.isDead = false;
        this.deathTimer = 0;
        this.deathVelX = 0;
        this.deathVelY = 0;
        this.deathRotSpeed = 0;

        this.feathers = [];
        this.idleTimer = 0;
        this.isPanicked = false;
    }

    reset(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.startY = startY;
        this.isJumping = false;
        this.jumpProgress = 0;
        this.altitude = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;
        this.isDead = false;
        this.deathTimer = 0;
        this.feathers = [];
        this.isPanicked = false;
    }

    hopTo(targetY) {
        if (this.isDead || this.isJumping) return;
        this.isJumping = true;
        this.jumpProgress = 0;
        this.startY = this.y;
        this.targetY = targetY;
        if (window.soundEngine) {
            window.soundEngine.playCluck();
        }
    }

    die(impactVelX = 100) {
        if (this.isDead) return;
        this.isDead = true;
        this.isJumping = false;
        this.deathVelX = (impactVelX > 0 ? 1 : -1) * (180 + Math.random() * 120);
        this.deathVelY = -(120 + Math.random() * 80);
        this.deathRotSpeed = (Math.random() > 0.5 ? 1 : -1) * 14;

        if (window.soundEngine) {
            window.soundEngine.playDeathSquawk();
        }

        // Generate feather explosion (White, ivory, and red comb feathers)
        this.feathers = [];
        const count = 32;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 180;
            const isRed = (i < 6); // red comb feathers
            this.feathers.push({
                x: this.x + (Math.random() * 14 - 7),
                y: this.y + (Math.random() * 14 - 7),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() * 2 - 1) * 8,
                size: 4 + Math.random() * 6,
                color: isRed ? '#e53935' : (Math.random() > 0.3 ? '#ffffff' : '#fff9c4'),
                alpha: 1,
                life: 1.0 + Math.random() * 0.8
            });
        }
    }

    update(dt) {
        this.idleTimer += dt * 4;

        // Update Feathers
        for (let i = this.feathers.length - 1; i >= 0; i--) {
            const f = this.feathers[i];
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            f.vy += 220 * dt; // gravity
            f.vx *= 0.96; // air drag
            f.rotation += f.rotSpeed * dt;
            f.life -= dt;
            f.alpha = Math.max(0, f.life);
            if (f.life <= 0) {
                this.feathers.splice(i, 1);
            }
        }

        if (this.isDead) {
            this.deathTimer += dt;
            this.x += this.deathVelX * dt;
            this.y += this.deathVelY * dt;
            this.deathVelY += 450 * dt; // gravity on dead chicken
            this.deathVelX *= 0.95;
            this.rotation += this.deathRotSpeed * dt;
            this.scaleX = 0.9;
            this.scaleY = 0.7;
            return;
        }

        if (this.isJumping) {
            this.jumpProgress += dt / this.jumpDuration;
            if (this.jumpProgress >= 1) {
                this.jumpProgress = 1;
                this.isJumping = false;
                this.y = this.targetY;
                this.altitude = 0;
                this.scaleX = 1.25;
                this.scaleY = 0.75; // landing squash
            } else {
                const t = this.jumpProgress;
                // Parabolic altitude arc
                this.altitude = Math.sin(t * Math.PI) * this.jumpHeight;
                this.y = this.startY + (this.targetY - this.startY) * t;

                // Squash and stretch
                if (t < 0.25) {
                    this.scaleX = 0.85;
                    this.scaleY = 1.2;
                } else if (t < 0.75) {
                    this.scaleX = 0.95;
                    this.scaleY = 1.05;
                } else {
                    this.scaleX = 1.15;
                    this.scaleY = 0.85;
                }
            }
        } else {
            // Smoothly restore normal scale
            this.scaleX += (1 - this.scaleX) * 15 * dt;
            this.scaleY += (1 - this.scaleY) * 15 * dt;
            this.altitude = 0;
        }
    }

    draw(ctx) {
        // Draw Feathers first
        for (const f of this.feathers) {
            ctx.save();
            ctx.globalAlpha = f.alpha;
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size * 0.5, f.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();

        // 1. Draw Drop Shadow (shrinks when jumping high)
        if (!this.isDead) {
            const shadowScale = Math.max(0.35, 1 - this.altitude / 45);
            ctx.save();
            ctx.translate(this.x, this.y + 12);
            ctx.scale(shadowScale, shadowScale * 0.45);
            ctx.fillStyle = 'rgba(10, 15, 25, 0.45)';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Position for chicken body (offset by jump altitude)
        const drawY = this.y - this.altitude;
        ctx.translate(this.x, drawY);
        ctx.rotate(this.rotation);
        ctx.scale(this.scaleX, this.scaleY);

        // Idle bounce
        const idleBob = (!this.isJumping && !this.isDead) ? Math.sin(this.idleTimer) * 1.5 : 0;
        ctx.translate(0, idleBob);

        // 2. Chicken Feet (Orange claws)
        if (!this.isDead) {
            ctx.fillStyle = '#ff9800';
            const legOffset = this.isJumping ? 4 : 0;
            // Left foot
            ctx.beginPath();
            ctx.ellipse(-7, 13 - legOffset, 4, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Right foot
            ctx.beginPath();
            ctx.ellipse(7, 13 - legOffset, 4, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Fluffy Tail Feathers (behind body)
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.ellipse(0, 11, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. Main Plump Body (Egg-shaped white cartoon body)
        const bodyGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, 20);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.75, '#f0f4f8');
        bodyGrad.addColorStop(1, '#d9e2ec');

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subtle outline for crisp arcade look
        ctx.strokeStyle = '#c4cdd5';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 5. Wings on sides (wobble slightly during jump)
        const wingFlap = this.isJumping ? Math.sin(this.jumpProgress * Math.PI * 3) * 0.35 : 0;
        ctx.fillStyle = '#e8ecf1';

        // Left wing
        ctx.save();
        ctx.translate(-14, 0);
        ctx.rotate(-0.2 + wingFlap);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.5, 9, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4cdd5';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Right wing
        ctx.save();
        ctx.translate(14, 0);
        ctx.rotate(0.2 - wingFlap);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.5, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c4cdd5';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // 6. Red Comb on Top of Head (3 juicy lobes)
        ctx.fillStyle = '#e53935';
        const combBob = (!this.isDead) ? Math.sin(this.idleTimer * 1.5) * 0.15 : 0;
        ctx.save();
        ctx.translate(0, -18);
        ctx.rotate(combBob);

        // Center lobe
        ctx.beginPath();
        ctx.arc(0, -3, 4.2, 0, Math.PI * 2);
        ctx.fill();
        // Left lobe
        ctx.beginPath();
        ctx.arc(-5, -0.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        // Right lobe
        ctx.beginPath();
        ctx.arc(5, -0.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 7. Red Wattle (under beak)
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.ellipse(0, -3, 2.8, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 8. Yellow/Orange Beak
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.moveTo(-4.5, -8);
        ctx.lineTo(4.5, -8);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#f57c00';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 9. Eyes (Big expressive cartoon eyes)
        if (this.isDead) {
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 2.2;
            [-6, 6].forEach(ex => {
                ctx.beginPath();
                ctx.moveTo(ex - 3, -13);
                ctx.lineTo(ex + 3, -7);
                ctx.moveTo(ex + 3, -13);
                ctx.lineTo(ex - 3, -7);
                ctx.stroke();
            });
        } else {
            const eyeSize = this.isPanicked ? 5.2 : 4.4;
            [-6, 6].forEach(ex => {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ex, -10, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#b0bec5';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                const pupilSize = this.isPanicked ? 1.6 : 2.2;
                const pupilOffY = this.isPanicked ? 0 : 0.8;
                ctx.fillStyle = '#102027';
                ctx.beginPath();
                ctx.arc(ex, -10 + pupilOffY, pupilSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(ex - 1.2, -11.5, 1.1, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.restore();
    }
}
