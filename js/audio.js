/**
 * Uncrossable Rush - Procedural Audio Engine (Web Audio API)
 * All sound effects and background music are procedurally synthesized.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isMusicMuted = false;
        this.sfxVolume = 0.85;
        this.musicVolume = 0.32;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.sfxGain = null;
        this.musicGain = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
            this.sfxGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = (this.isMuted || this.isMusicMuted) ? 0 : this.musicVolume;
            this.musicGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // --- Chicken Sounds (أصوات الدجاجة) ---

    playCluck() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const baseFreq = 780 + Math.random() * 100;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(310, now + 0.08);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1350, now);
        filter.Q.setValueAtTime(3.2, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    playDeathSquawk() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // Main screech oscillator
        const carrier = this.ctx.createOscillator();
        const carrierGain = this.ctx.createGain();
        carrier.type = 'sawtooth';
        carrier.frequency.setValueAtTime(1350, now);
        carrier.frequency.exponentialRampToValueAtTime(2100, now + 0.07);
        carrier.frequency.exponentialRampToValueAtTime(290, now + 0.48);

        // Vocal raspiness modulator
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        mod.type = 'square';
        mod.frequency.setValueAtTime(280, now);
        modGain.gain.setValueAtTime(450, now);
        modGain.gain.exponentialRampToValueAtTime(40, now + 0.48);
        mod.connect(carrier.frequency);

        carrierGain.gain.setValueAtTime(0.01, now);
        carrierGain.gain.linearRampToValueAtTime(0.9, now + 0.025);
        carrierGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.frequency.exponentialRampToValueAtTime(850, now + 0.5);
        filter.Q.setValueAtTime(2.2, now);

        carrier.connect(filter);
        filter.connect(carrierGain);
        carrierGain.connect(this.sfxGain);

        carrier.start(now);
        mod.start(now);
        carrier.stop(now + 0.56);
        mod.stop(now + 0.56);

        // Feathers burst whoosh
        this.playFeathersBurst(now);
    }

    playFeathersBurst(startTime) {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1600;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(startTime);
    }

    // --- Concrete Barrier Sound (صوت هبوط الصبة الخرسانية) ---

    playBarrierDrop() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // Heavy concrete slab sub-thud
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(160, now);
        sub.frequency.exponentialRampToValueAtTime(35, now + 0.22);
        subGain.gain.setValueAtTime(1.0, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.28);

        // Gravel & stone crunch
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.16));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(500, now);
        filter.Q.setValueAtTime(1.8, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.75, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
    }

    // --- Car & Crash Sounds (أصوات السيارات والاصطدام) ---

    playCarHorn(freq1 = 430, freq2 = 520) {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        [freq1, freq2].forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
            gain.gain.setValueAtTime(0.22, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1900, now);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now);
            osc.stop(now + 0.29);
        });
    }

    playTireScreech() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.32);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + 0.32);
        filter.Q.setValueAtTime(6.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.42, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    playCrashImpact() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub blast
        const boom = this.ctx.createOscillator();
        const boomGain = this.ctx.createGain();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(140, now);
        boom.frequency.exponentialRampToValueAtTime(30, now + 0.42);
        boomGain.gain.setValueAtTime(1.0, now);
        boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

        boom.connect(boomGain);
        boomGain.connect(this.sfxGain);
        boom.start(now);
        boom.stop(now + 0.5);

        // Metal deformation crunch
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.35);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.85, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);
        noise.start(now);
    }

    // --- Cash Out & UI Sounds ---

    playCashOut() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];

        notes.forEach((freq, idx) => {
            const time = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.linearRampToValueAtTime(0.35, time + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(time);
            osc.stop(time + 0.42);
        });
    }

    playClick() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // --- Dynamic Background Music (BGM) ---

    startMusic() {
        this.init();
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        const bpm = 126;
        const stepTime = (60 / bpm) / 4; // ~0.119s per 16th note

        const chords = [
            { bass: 73.42, notes: [293.66, 349.23, 440.00] }, // Dm
            { bass: 87.31, notes: [349.23, 440.00, 523.25] }, // F
            { bass: 65.41, notes: [261.63, 329.63, 392.00] }, // C
            { bass: 98.00, notes: [293.66, 392.00, 440.00] }  // G
        ];

        let step = 0;
        this.musicInterval = setInterval(() => {
            if (!this.isPlayingMusic || !this.ctx || this.isMusicMuted || this.isMuted) {
                step = (step + 1) % 64;
                return;
            }

            const now = this.ctx.currentTime;
            const measure = Math.floor(step / 16) % 4;
            const currentChord = chords[measure];
            const beatInMeasure = step % 16;

            // Kick
            if (beatInMeasure % 4 === 0) {
                this.playSynthKick(now);
            }

            // Snare
            if (beatInMeasure === 4 || beatInMeasure === 12) {
                this.playSynthSnare(now);
            }

            // HiHat
            if (beatInMeasure % 2 === 0) {
                const isOpen = (beatInMeasure % 4 === 2);
                this.playSynthHiHat(now, isOpen);
            }

            // Rolling Synth Bass
            const bassPats = [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0];
            if (bassPats[beatInMeasure]) {
                const octave = (beatInMeasure === 8 || beatInMeasure === 14) ? 2 : 1;
                this.playSynthBass(now, currentChord.bass * octave, stepTime * 1.1);
            }

            // Arpeggiated Lead Synth
            if (beatInMeasure % 2 === 0) {
                const noteIdx = (step % 3);
                const leadNote = currentChord.notes[noteIdx] * (measure === 3 ? 1.5 : 1);
                this.playSynthLead(now, leadNote, stepTime * 1.4);
            }

            step = (step + 1) % 64;
        }, stepTime * 1000);
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    playSynthKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

        gain.gain.setValueAtTime(0.65, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playSynthSnare(time) {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1100;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
    }

    playSynthHiHat(time, isOpen = false) {
        const dur = isOpen ? 0.16 : 0.05;
        const bufferSize = Math.floor(this.ctx.sampleRate * dur);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 8500;
        filter.Q.value = 3.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(isOpen ? 0.2 : 0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
    }

    playSynthBass(time, freq, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, time);
        filter.frequency.exponentialRampToValueAtTime(130, time + dur);
        filter.Q.setValueAtTime(3.8, time);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur + 0.02);
    }

    playSynthLead(time, freq, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, time);
        filter.frequency.exponentialRampToValueAtTime(750, time + dur);

        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + dur + 0.02);
    }

    toggleMute() {
        this.init();
        this.isMuted = !this.isMuted;
        if (this.sfxGain) this.sfxGain.gain.value = this.isMuted ? 0 : this.sfxVolume;
        if (this.musicGain) this.musicGain.gain.value = (this.isMuted || this.isMusicMuted) ? 0 : this.musicVolume;
        return this.isMuted;
    }

    toggleMusic() {
        this.init();
        this.isMusicMuted = !this.isMusicMuted;
        if (this.musicGain) this.musicGain.gain.value = (this.isMuted || this.isMusicMuted) ? 0 : this.musicVolume;
        return this.isMusicMuted;
    }
}

window.soundEngine = new SoundEngine();
