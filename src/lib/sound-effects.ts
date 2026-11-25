/**
 * Sound Effects Engine using the Web Audio API.
 * Synthesizes subtle, organic UI sounds without external audio assets.
 */

const STORAGE_KEY = "portfolio_sound_muted";
const VOLUME_KEY = "portfolio_sound_volume";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  // Default to a subtle, low volume (0.35x baseline)
  private masterVolume: number = 0.15;
  private lastTypeSoundTime: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const savedMuted = localStorage.getItem(STORAGE_KEY);
        this.muted = savedMuted === "true";

        const savedVol = localStorage.getItem(VOLUME_KEY);
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.masterVolume = parsed;
          }
        }
      } catch {
        this.muted = false;
        this.masterVolume = 0.35;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, muted ? "true" : "false");
      } catch {}
    }
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(VOLUME_KEY, this.masterVolume.toString());
      } catch {}
    }
  }

  /**
   * 1. Screen Knock Sound
   * Two subtle, organic micro-taps replicating Clippy tapping on screen glass.
   */
  public playKnock(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const triggerTap = (time: number, pitch: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.045);

      gain.gain.setValueAtTime(0.06 * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    };

    const now = ctx.currentTime;
    triggerTap(now, 1050);
    triggerTap(now + 0.09, 1200);
  }

  /**
   * 2. Bubble Pop Sound
   * Soft, quiet organic pop when speech bubble or chat opens.
   */
  public playBubblePop(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

    gain.gain.setValueAtTime(0.05 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * 3. Dismiss / Close Sound
   * Very soft descending whisper when closing.
   */
  public playDismiss(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.03 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 4. Send Message Sound
   * Gentle aerodynamic upward swoosh.
   */
  public playSend(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.09);

    gain.gain.setValueAtTime(0.045 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * 5. Key Typing Sound
   * Whisper-quiet micro-click. Throttled to prevent clutter.
   */
  public playKeyTick(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const nowMs = Date.now();
    if (nowMs - this.lastTypeSoundTime < 65) return;
    this.lastTypeSoundTime = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "bandpass";
    filter.frequency.value = 2100 + (Math.random() * 200 - 100);
    filter.Q.value = 3.5;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.02);

    gain.gain.setValueAtTime(0.05 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * 6. Thinking Ambient Pulse
   * Soft, warm, low-level breathing tone (D4 / 293.66Hz).
   */
  public playThinkingPulse(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(293.66, now);

    gain.gain.setValueAtTime(0.0005, now);
    gain.gain.linearRampToValueAtTime(0.025 * this.masterVolume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * 7. Generating Stream Tick
   * Soft micro-droplet trickle during token stream.
   */
  public playGeneratingTick(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 1250 + Math.random() * 250;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.02);

    gain.gain.setValueAtTime(0.015 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * 8. Response Complete Chime
   * Very gentle two-note harmonic chime (E5 -> A5).
   */
  public playComplete(): void {
    if (this.muted || this.masterVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.035 * this.masterVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.0005, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.13);

    // Note 2: A5 (880Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.04 * this.masterVolume, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0005, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.3);
  }
}

export const sounds = new SoundEngine();
