// Independent, reduced model: lateral springs between horizontal jelly layers.
// Deliberately simpler than the reference site's volumetric soft-body solver.
export const defaults = { frequency: 2.5, damping: 0.16, adhesion: 0.45, strength: 1, amplitude: 0.16 };
export const presets = {
  soft: { frequency: 1.4, damping: 0.12, adhesion: 0.18, strength: 1.25, amplitude: 0.22 },
  bouncy: { ...defaults },
  firm: { frequency: 4.2, damping: 0.32, adhesion: 0.85, strength: 0.65, amplitude: 0.09 },
};
export class JellyPhysics {
  constructor(count = 17) {
    this.count = count;
    this.x = new Float64Array(count); this.z = new Float64Array(count);
    this.vx = new Float64Array(count); this.vz = new Float64Array(count);
    this.reset();
  }
  reset() { for (const a of [this.x, this.z, this.vx, this.vz]) a.fill(0); this.peak = 0; }
  kick(strength = 1) {
    for (let i = 1; i < this.count; i++) {
      const y = i / (this.count - 1);
      this.vx[i] += strength * y * 1.7;
      this.vz[i] += strength * y * 0.55;
    }
  }
  step(dt, ax, az, p) {
    dt = Math.min(0.04, Math.max(0, dt));
    const steps = Math.max(1, Math.ceil(dt / 0.002)); const h = dt / steps;
    const w = 2 * Math.PI * p.frequency, k = w * w, c = 2 * p.damping * w;
    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < this.count; i++) {
        const y = i / (this.count - 1), above = Math.min(i + 1, this.count - 1);
        const wall = 1 + p.adhesion * (1 - y) * 2;
        const fx = -k * wall * this.x[i] - c * this.vx[i] + k * 1.5 * (this.x[i - 1] + this.x[above] - 2 * this.x[i]);
        const fz = -k * wall * this.z[i] - c * this.vz[i] + k * 1.5 * (this.z[i - 1] + this.z[above] - 2 * this.z[i]);
        this.vx[i] += (fx - ax * p.strength * y * (1 - p.adhesion * 0.6)) * h;
        this.vz[i] += (fz - az * p.strength * y * (1 - p.adhesion * 0.6)) * h;
      }
      for (let i = 1; i < this.count; i++) {
        this.x[i] += this.vx[i] * h; this.z[i] += this.vz[i] * h;
        const length = Math.hypot(this.x[i], this.z[i]);
        if (length > p.amplitude) {
          const scale = p.amplitude / length; this.x[i] *= scale; this.z[i] *= scale;
          const outward = (this.vx[i] * this.x[i] + this.vz[i] * this.z[i]) / (p.amplitude ** 2);
          if (outward > 0) { this.vx[i] -= outward * this.x[i]; this.vz[i] -= outward * this.z[i]; }
        }
      }
    }
    this.peak = Math.max(...this.x.map((x, i) => Math.hypot(x, this.z[i])));
    if (this.peak < 0.00001 && Math.max(...this.vx.map(Math.abs), ...this.vz.map(Math.abs)) < 0.0001 && !ax && !az) this.reset();
  }
}
