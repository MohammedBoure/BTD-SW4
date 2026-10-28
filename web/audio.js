/**
 * Bloons TD Battles — Authentic Audio Manager (audio.js)
 * Plays the original extracted .wav sound effects from assets/audio/
 * With rate-limiting and multi-channel polyphony so rapid pops/explosions sound crisp
 */

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.7;
    this.pools = {};
    this.lastPlayed = {};

    this.soundList = [
      'pop1', 'pop2', 'pop3', 'pop4',
      'tower_place', 'tower_select', 'upgrade', 'sell_tower', 'tower_level_up',
      'explosion_small', 'ceramic_bloon_hit', 'metal_bloon_hit',
      'moab_damage_quieter', 'moab_destroyed_short',
      'bloon_boost', 'tower_power', 'schwing', 'juggerlanche',
      'button_click', 'soft_click', 'buy', 'playCard',
      'newRound', 'playerFound', 'playerReady',
      'game_win', 'game_over', 'tick', 'timeOut'
    ];
  }

  preload() {
    for (const name of this.soundList) {
      this.pools[name] = [];
      const poolSize = name.startsWith('pop') || name === 'explosion_small' || name === 'ceramic_bloon_hit' ? 5 : 2;
      for (let i = 0; i < poolSize; i++) {
        const audio = new Audio(`assets/audio/${name}.wav`);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.pools[name].push(audio);
      }
    }
  }

  play(name, minIntervalMs = 35, volumeScale = 1.0) {
    if (!this.enabled) return;
    const now = performance.now();
    if (this.lastPlayed[name] && now - this.lastPlayed[name] < minIntervalMs) {
      return;
    }
    this.lastPlayed[name] = now;

    const pool = this.pools[name];
    if (!pool || pool.length === 0) return;

    let chosen = pool.find(a => a.paused || a.ended) || pool[0];
    try {
      chosen.currentTime = 0;
      chosen.volume = Math.min(1, Math.max(0, this.volume * volumeScale));
      chosen.play().catch(() => {});
    } catch (e) {
      // Ignore autoplay errors prior to user gesture
    }
  }

  playPop() {
    const idx = 1 + Math.floor(Math.random() * 4);
    this.play(`pop${idx}`, 28, 0.75);
  }

  toggleMute() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

window.SFX = new SoundManager();
