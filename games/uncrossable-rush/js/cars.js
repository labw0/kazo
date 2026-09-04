/**
 * Vehicle Classes and Traffic System
 * Generates and manages dynamic highway traffic with realistic models:
 * Taxis, Sports Cars, Sedans, SUVs, and Semi-Trucks.
 */

class Vehicle {
    constructor(laneIndex, y, dir, speed, type = 'sedan') {
        this.laneIndex = laneIndex;
        this.y = y;
        this.dir = dir; // 1 = right, -1 = left
        this.speed = speed;
        this.baseSpeed = speed;
        this.type = type;

        // Dimensions per type
        switch (type) {
            case 'taxi':
                this.width = 68;
                this.height = 32;
                this.color = '#ffb300';
                break;
            case 'sports':
                this.width = 64;
                this.height = 30;
                this.color = '#e53935';
                break;
            case 'suv':
                this.width = 76;
                this.height = 36;
                this.color = '#2e7d32';
                break;
            case 'truck':
                this.width = 110;
                this.height = 38;
                this.color = '#eceff1';
                break;
            case 'sedan':
            default:
                this.width = 66;
                this.height = 32;
                this.color = '#0288d1';
                break;
        }

        this.x = 0;
        this.isStopped = false;
        this.hasHonked = false;
        this.brakingScreechPlayed = false;
    }

    update(dt, barrierX, chickenX, chickenY) {
        // Check barrier collision / obstacle detection ahead
        if (barrierX !== null) {
            const distToBarrier = (barrierX - this.x) * this.dir;
            if (distToBarrier > 0 && distToBarrier < 120) {
                // Brake smoothly
                this.speed = Math.max(0, this.speed - 600 * dt);
                if (this.speed === 0) {
                    this.isStopped = true;
                }
                if (!this.brakingScreechPlayed && distToBarrier < 70) {
                    this.brakingScreechPlayed = true;
                    if (window.soundEngine) {
                        window.soundEngine.playTireScreech();
                    }
                }
            } else {
                this.speed += (this.baseSpeed - this.speed) * 4 * dt;
                this.isStopped = false;
            }
        } else {
            this.speed += (this.baseSpeed - this.speed) * 4 * dt;
            this.isStopped = false;
        }

        this.x += this.speed * this.dir * dt;

        // Honk horn if chicken is very close in same lane or directly in front
        if (!this.hasHonked && Math.abs(chickenY - this.y) < 25) {
            const distToChicken = (chickenX - this.x) * this.dir;
            if (distToChicken > 0 && distToChicken < 95) {
                this.hasHonked = true;
                if (window.soundEngine) {
                    window.soundEngine.playCarHorn();
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.dir === -1) {
            ctx.scale(-1, 1); // Flip horizontally for leftward movement
        }

        const hw = this.width / 2;
        const hh = this.height / 2;

        // 1. Headlight Beams (Glowing luminous cones shining on the road)
        const beamGrad = ctx.createLinearGradient(hw, 0, hw + 90, 0);
        beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
        beamGrad.addColorStop(1, 'rgba(255, 255, 220, 0)');

        ctx.fillStyle = beamGrad;
        // Upper light cone
        ctx.beginPath();
        ctx.moveTo(hw - 2, -hh + 5);
        ctx.lineTo(hw + 85, -hh - 12);
        ctx.lineTo(hw + 85, -hh + 14);
        ctx.closePath();
        ctx.fill();

        // Lower light cone
        ctx.beginPath();
        ctx.moveTo(hw - 2, hh - 5);
        ctx.lineTo(hw + 85, hh - 14);
        ctx.lineTo(hw + 85, hh + 12);
        ctx.closePath();
        ctx.fill();

        // 2. Drop Shadow on asphalt
        ctx.fillStyle = 'rgba(5, 10, 18, 0.6)';
        ctx.beginPath();
        ctx.roundRect(-hw - 4, -hh - 2, this.width + 8, this.height + 6, 6);
        ctx.fill();

        // 3. Wheels (4 rubber tires with silver rims)
        ctx.fillStyle = '#1a202c';
        const wheelW = 14;
        const wheelH = 6;
        // Front wheels
        ctx.fillRect(hw - 20, -hh - 2, wheelW, wheelH);
        ctx.fillRect(hw - 20, hh - 4, wheelW, wheelH);
        // Rear wheels
        ctx.fillRect(-hw + 8, -hh - 2, wheelW, wheelH);
        ctx.fillRect(-hw + 8, hh - 4, wheelW, wheelH);

        // Truck extra rear axle
        if (this.type === 'truck') {
            ctx.fillRect(-hw + 24, -hh - 2, wheelW, wheelH);
            ctx.fillRect(-hw + 24, hh - 4, wheelW, wheelH);
        }

        // 4. Car Body
        const bodyGrad = ctx.createLinearGradient(0, -hh, 0, hh);
        bodyGrad.addColorStop(0, this.lightenColor(this.color, 25));
        bodyGrad.addColorStop(0.5, this.color);
        bodyGrad.addColorStop(1, this.darkenColor(this.color, 35));

        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 1.4;

        ctx.beginPath();
        ctx.roundRect(-hw, -hh, this.width, this.height, 5);
        ctx.fill();
        ctx.stroke();

        // 5. Specific Features by Type
        if (this.type === 'taxi') {
            // Checkered Taxi side stripes
            ctx.fillStyle = '#212121';
            for (let cx = -hw + 14; cx < hw - 14; cx += 10) {
                ctx.fillRect(cx, -hh + 3, 5, 4);
                ctx.fillRect(cx + 5, hh - 7, 5, 4);
            }
            // Taxi Roof Sign
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-10, -4, 20, 8);
            ctx.strokeStyle = '#212121';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-10, -4, 20, 8);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 6px sans-serif';
            ctx.fillText('TAXI', -7, 2);
        } else if (this.type === 'sports') {
            // Racing stripes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-hw + 6, -3, this.width - 12, 6);
            // Rear spoiler
            ctx.fillStyle = '#111111';
            ctx.fillRect(-hw - 3, -hh + 3, 4, this.height - 6);
        } else if (this.type === 'truck') {
            // Cargo box dividing line
            ctx.strokeStyle = '#90a4ae';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(hw - 28, -hh);
            ctx.lineTo(hw - 28, hh);
            ctx.stroke();
            // Cargo container ribs
            ctx.strokeStyle = '#b0bec5';
            ctx.lineWidth = 1;
            for (let rx = -hw + 10; rx < hw - 30; rx += 14) {
                ctx.beginPath();
                ctx.moveTo(rx, -hh + 3);
                ctx.lineTo(rx, hh - 3);
                ctx.stroke();
            }
        }

        // 6. Windshield and Windows (Tinted glass with reflection line)
        ctx.fillStyle = '#263238';
        const windW = (this.type === 'truck') ? 16 : 24;
        ctx.beginPath();
        ctx.roundRect(hw - windW - 6, -hh + 5, windW, this.height - 10, 3);
        ctx.fill();

        // Glass reflection highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(hw - windW - 2, -hh + 8);
        ctx.lineTo(hw - 8, hh - 8);
        ctx.stroke();

        // 7. Headlights (Bright Yellow/White)
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(hw - 2, -hh + 3, 3, 6);
        ctx.fillRect(hw - 2, hh - 9, 3, 6);

        // 8. Taillights (Glowing Red)
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(-hw - 1, -hh + 3, 2, 6);
        ctx.fillRect(-hw - 1, hh - 9, 2, 6);

        ctx.restore();
    }

    lightenColor(hex, amt) {
        return hex; // fallback or simple color
    }
    darkenColor(hex, amt) {
        return hex;
    }

    getBoundingBox() {
        return {
            left: this.x - this.width / 2 + 6,
            right: this.x + this.width / 2 - 6,
            top: this.y - this.height / 2 + 5,
            bottom: this.y + this.height / 2 - 5
        };
    }
}

class TrafficManager {
    constructor(canvasWidth, laneHeight, totalLanes = 24) {
        this.canvasWidth = canvasWidth;
        this.laneHeight = laneHeight;
        this.totalLanes = totalLanes;
        this.vehicles = [];
        this.laneConfigs = [];
        this.difficulty = 'medium';

        this.initLanes();
    }

    initLanes() {
        this.laneConfigs = [];
        const vehicleTypes = ['sedan', 'taxi', 'sports', 'suv', 'truck'];

        for (let i = 1; i <= this.totalLanes; i++) {
            // Alternating blocks of traffic direction
            const dir = (Math.floor((i - 1) / 3) % 2 === 0) ? 1 : -1;
            // Base speed increases with lane progression
            const speedFactor = 1 + (i / this.totalLanes) * 0.4;
            const primaryType = vehicleTypes[i % vehicleTypes.length];

            this.laneConfigs[i] = {
                dir: dir,
                baseSpeed: 140 * speedFactor,
                type: primaryType,
                spawnInterval: 2.2,
                timer: Math.random() * 2
            };
        }
    }

    setDifficulty(diff) {
        this.difficulty = diff;
        let speedMultiplier = 1.0;
        let spawnMultiplier = 1.0;

        switch (diff) {
            case 'easy':
                speedMultiplier = 0.8;
                spawnMultiplier = 1.4; // wider gaps
                break;
            case 'medium':
                speedMultiplier = 1.1;
                spawnMultiplier = 1.0;
                break;
            case 'hard':
                speedMultiplier = 1.45;
                spawnMultiplier = 0.75;
                break;
            case 'hardcore':
                speedMultiplier = 1.95; // very fast!
                spawnMultiplier = 0.55; // tight gaps!
                break;
        }

        this.laneConfigs.forEach((cfg, i) => {
            if (cfg) {
                const speedFactor = 1 + (i / this.totalLanes) * 0.4;
                cfg.currentSpeed = cfg.baseSpeed * speedMultiplier;
                cfg.currentInterval = cfg.spawnInterval * spawnMultiplier;
            }
        });
    }

    populateInitial(canvasHeight, barriers) {
        this.vehicles = [];
        for (let i = 1; i <= this.totalLanes; i++) {
            const laneY = this.getLaneY(i, canvasHeight);
            const cfg = this.laneConfigs[i];
            const speed = cfg.currentSpeed || cfg.baseSpeed;

            // Spawn 1 to 2 initial cars per lane staggered across the road
            const car1 = new Vehicle(i, laneY, cfg.dir, speed, cfg.type);
            car1.x = (this.canvasWidth * 0.25) + (Math.random() * this.canvasWidth * 0.5);
            this.vehicles.push(car1);

            if (Math.random() > 0.4) {
                const car2 = new Vehicle(i, laneY, cfg.dir, speed, cfg.type);
                car2.x = (car1.x + (this.canvasWidth * 0.5) * cfg.dir);
                if (car2.x < -100) car2.x += this.canvasWidth + 200;
                if (car2.x > this.canvasWidth + 100) car2.x -= this.canvasWidth + 200;
                this.vehicles.push(car2);
            }
        }
    }

    getLaneY(laneIndex, canvasHeight) {
        // Lane 0 is start sidewalk (bottom). Lane 1 is first road lane going up.
        return canvasHeight - (laneIndex * this.laneHeight) - (this.laneHeight * 0.5);
    }

    update(dt, canvasHeight, barriers, chicken) {
        // 1. Update existing vehicles
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const v = this.vehicles[i];
            const barrierX = barriers[v.laneIndex] ? barriers[v.laneIndex].x : null;

            v.update(dt, barrierX, chicken.x, chicken.y);

            // Despawn offscreen
            if (v.dir === 1 && v.x > this.canvasWidth + 150) {
                this.vehicles.splice(i, 1);
            } else if (v.dir === -1 && v.x < -150) {
                this.vehicles.splice(i, 1);
            }
        }

        // 2. Spawn new vehicles based on timer
        for (let i = 1; i <= this.totalLanes; i++) {
            const cfg = this.laneConfigs[i];
            if (!cfg) continue;

            cfg.timer += dt;
            const interval = cfg.currentInterval || cfg.spawnInterval;

            if (cfg.timer >= interval) {
                cfg.timer = 0;
                const laneY = this.getLaneY(i, canvasHeight);
                const speed = cfg.currentSpeed || cfg.baseSpeed;
                const spawnX = (cfg.dir === 1) ? -100 : this.canvasWidth + 100;

                // Check distance to closest car on that lane
                const carsInLane = this.vehicles.filter(v => v.laneIndex === i);
                const tooClose = carsInLane.some(v => Math.abs(v.x - spawnX) < 140);

                if (!tooClose) {
                    const vehicleTypes = ['sedan', 'taxi', 'sports', 'suv', 'truck'];
                    const chosenType = (Math.random() > 0.4) ? cfg.type : vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
                    const newCar = new Vehicle(i, laneY, cfg.dir, speed, chosenType);
                    newCar.x = spawnX;
                    this.vehicles.push(newCar);
                }
            }
        }
    }

    draw(ctx) {
        for (const v of this.vehicles) {
            v.draw(ctx);
        }
    }

    checkCollision(chicken) {
        if (chicken.isDead) return null;
        const cRadius = chicken.radius * 0.75;
        const cBox = {
            left: chicken.x - cRadius,
            right: chicken.x + cRadius,
            top: chicken.y - cRadius,
            bottom: chicken.y + cRadius
        };

        for (const v of this.vehicles) {
            const vBox = v.getBoundingBox();
            // AABB collision test
            if (cBox.right > vBox.left &&
                cBox.left < vBox.right &&
                cBox.bottom > vBox.top &&
                cBox.top < vBox.bottom) {
                return v;
            }
        }
        return null;
    }
}
