/**
 * Concrete Barrier ("الصبة الخرسانية")
 * Heavy Jersey barrier dropped onto a lane upon successful crossing.
 * Features yellow/black hazard stripes, dust particles, and traffic blocking.
 */
class ConcreteBarrier {
    constructor(x, y, width = 64, height = 34) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        // Drop animation from sky
        this.isDropping = true;
        this.dropOffsetY = -100;
        this.dropVelocity = 0;
        this.hasHitGround = false;

        this.dustParticles = [];
    }

    update(dt) {
        // Update dust particles
        for (let i = this.dustParticles.length - 1; i >= 0; i--) {
            const p = this.dustParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.radius += p.grow * dt;
            p.alpha -= p.fade * dt;
            if (p.alpha <= 0) {
                this.dustParticles.splice(i, 1);
            }
        }

        if (this.isDropping) {
            this.dropVelocity += 1800 * dt; // gravity
            this.dropOffsetY += this.dropVelocity * dt;

            if (this.dropOffsetY >= 0) {
                this.dropOffsetY = 0;
                this.isDropping = false;
                this.hasHitGround = true;

                // Play sound
                if (window.soundEngine) {
                    window.soundEngine.playBarrierDrop();
                }

                // Spawn dust clouds
                this.spawnDust();

                // Trigger small screen shake
                if (window.gameInstance) {
                    window.gameInstance.triggerShake(5);
                }
            }
        }
    }

    spawnDust() {
        const count = 14;
        for (let i = 0; i < count; i++) {
            const dir = (i % 2 === 0) ? -1 : 1;
            this.dustParticles.push({
                x: this.x + (dir * (this.width * 0.4)),
                y: this.y + (this.height * 0.4),
                vx: dir * (40 + Math.random() * 80),
                vy: -(15 + Math.random() * 30),
                radius: 4 + Math.random() * 5,
                grow: 18 + Math.random() * 12,
                alpha: 0.65,
                fade: 1.8 + Math.random() * 0.8
            });
        }
    }

    draw(ctx) {
        // Draw dust behind or around barrier
        for (const p of this.dustParticles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = '#b0bec5';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        const currentY = this.y + this.dropOffsetY;
        ctx.translate(this.x, currentY);

        const w = this.width;
        const h = this.height;
        const hw = w / 2;
        const hh = h / 2;

        // 1. Drop shadow
        if (!this.isDropping) {
            ctx.fillStyle = 'rgba(10, 15, 25, 0.5)';
            ctx.beginPath();
            ctx.ellipse(0, hh + 4, hw + 8, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Concrete Base (Jersey Barrier trapezoidal block)
        // Back / Top face
        const topW = hw * 0.75;
        const topH = hh * 0.6;

        const baseGrad = ctx.createLinearGradient(0, -hh, 0, hh);
        baseGrad.addColorStop(0, '#90a4ae');
        baseGrad.addColorStop(0.4, '#78909c');
        baseGrad.addColorStop(1, '#546e7a');

        ctx.fillStyle = baseGrad;
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(-topW, -hh);
        ctx.lineTo(topW, -hh);
        ctx.lineTo(hw, hh);
        ctx.lineTo(-hw, hh);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. Diagonal Hazard Stripes (Yellow & Black ///)
        ctx.save();
        // Clip to barrier front face
        ctx.beginPath();
        ctx.moveTo(-topW + 2, -hh + 2);
        ctx.lineTo(topW - 2, -hh + 2);
        ctx.lineTo(hw - 2, hh - 2);
        ctx.lineTo(-hw + 2, hh - 2);
        ctx.closePath();
        ctx.clip();

        const stripeWidth = 14;
        const totalSpan = w + 40;
        let stripeIndex = 0;
        for (let sx = -hw - 20; sx < hw + 30; sx += stripeWidth) {
            ctx.fillStyle = (stripeIndex % 2 === 0) ? '#ffd600' : '#212121';
            ctx.beginPath();
            ctx.moveTo(sx, hh);
            ctx.lineTo(sx + stripeWidth, hh);
            ctx.lineTo(sx + stripeWidth + 12, -hh);
            ctx.lineTo(sx + 12, -hh);
            ctx.closePath();
            ctx.fill();
            stripeIndex++;
        }
        ctx.restore();

        // 4. Concrete top bevel highlight
        ctx.strokeStyle = '#cfd8dc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-topW + 1, -hh + 1);
        ctx.lineTo(topW - 1, -hh + 1);
        ctx.stroke();

        // 5. Red/Amber Safety Reflectors (عواكس تحذيرية جانبية)
        [-hw + 4, hw - 4].forEach((rx, idx) => {
            ctx.fillStyle = (idx === 0) ? '#ff5252' : '#ffab00';
            ctx.beginPath();
            ctx.arc(rx, hh - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#263238';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });

        // 6. Checkpoint Icon / Checkmark on center of barrier
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-3.5, 0);
        ctx.lineTo(-1, 3);
        ctx.lineTo(4, -2.5);
        ctx.stroke();

        ctx.restore();
    }
}
