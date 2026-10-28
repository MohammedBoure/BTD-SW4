/**
 * Bloons TD Battles — Core Battle Engine & Renderer (engine.js)
 * High-Performance Edition (60 FPS even on Round 30+ / Mobile Phones)
 * Features:
 *  - 7 Maps & 8 Complete Towers (Dart, Tack, Bomb, Super, Ninja, Sniper, Wizard, Boomerang)
 *  - Homing Shurikens, Ricochet Glaives, Orbiting Glaive Lord, Whirlwind/Tornado Blowback, Chain Lightning, Summon Phoenix, Sabotage Supply Lines, Supply Drop, Cripple MOAB, Turbo Charge
 *  - Camo & Regrow Bloon Sends + Pre-Baked Camo/Regrow Sprites + Entity Capping for Zero Lag
 */

class AssetCache {
  constructor() {
    this.images = {};
    this.tintedBloons = {};
  }

  async loadAll(onProgress) {
    const urls = new Set([
      // 7 Maps
      'assets/maps/battle_park_left.jpg', 'assets/maps/battle_park_right.jpg',
      'assets/maps/battle_sands_left.jpg', 'assets/maps/battle_sands_right.jpg',
      'assets/maps/yellow_brick_left.jpg', 'assets/maps/yellow_brick_right.jpg',
      'assets/maps/bloon_circles_left.jpg', 'assets/maps/bloon_circles_right.jpg',
      'assets/maps/park_left.jpg', 'assets/maps/park_right.jpg',
      'assets/maps/temple_left.jpg', 'assets/maps/temple_right.jpg',
      'assets/maps/temple_roof_left.png', 'assets/maps/temple_roof_right.png',
      'assets/maps/water_hazard_left.jpg', 'assets/maps/water_hazard_right.jpg',
      // Bloons
      'assets/bloons/stock_bloon.png', 'assets/bloons/stock_bloon_highlight.png',
      'assets/bloons/stock_bloon_shadow.png', 'assets/bloons/stock_regen_bloon.png',
      'assets/bloons/stock_regen_bloon_highlight.png', 'assets/bloons/camo_overlay.png',
      'assets/bloons/camo_regen_overlay.png', 'assets/bloons/lead.png', 'assets/bloons/lead_regen.png',
      'assets/bloons/zebra.png', 'assets/bloons/zebra_regen.png',
      'assets/bloons/rainbow.png', 'assets/bloons/rainbow_regen.png',
      'assets/bloons/ceramic_01.png', 'assets/bloons/ceramic_02.png', 'assets/bloons/ceramic_03.png',
      'assets/bloons/ceramic_04.png', 'assets/bloons/ceramic_05.png',
      'assets/bloons/ceramic_regen_01.png', 'assets/bloons/ceramic_regen_02.png',
      'assets/bloons/ceramic_regen_03.png', 'assets/bloons/ceramic_regen_04.png',
      'assets/bloons/ceramic_regen_05.png',
      'assets/bloons/moab.png', 'assets/bloons/bfb.png', 'assets/bloons/zomg.png',
      // MOABs
      'assets/moabs/moab_undamaged.png', 'assets/moabs/moab_eating_01.png', 'assets/moabs/moab_eating_02.png',
      'assets/moabs/moab_eating_03.png', 'assets/moabs/moab_eating_04.png', 'assets/moabs/moab_eating_05.png',
      'assets/moabs/bfb_undamaged.png', 'assets/moabs/bfb_eating_01.png', 'assets/moabs/bfb_eating_02.png',
      'assets/moabs/bfb_eating_03.png', 'assets/moabs/bfb_eating_04.png', 'assets/moabs/bfb_eating_05.png',
      'assets/moabs/zomg_undamaged.png', 'assets/moabs/zomg_eating_01.png', 'assets/moabs/zomg_eating_02.png',
      'assets/moabs/zomg_eating_03.png', 'assets/moabs/zomg_eating_04.png', 'assets/moabs/zomg_eating_05.png',
      // Composite Top-Down Towers (All 8 Towers)
      'assets/towers_composite/dart_base_1.png', 'assets/towers_composite/dart_base_2.png',
      'assets/towers_composite/dart_range1_1.png', 'assets/towers_composite/dart_range1_2.png',
      'assets/towers_composite/dart_range2_1.png', 'assets/towers_composite/dart_range2_2.png',
      'assets/towers_composite/dart_spikeopult_1.png', 'assets/towers_composite/dart_spikeopult_2.png',
      'assets/towers_composite/dart_juggernaut_1.png', 'assets/towers_composite/dart_juggernaut_2.png',
      'assets/towers_composite/dart_fanclub_1.png', 'assets/towers_composite/dart_fanclub_2.png',
      'assets/towers_composite/tack_base.png', 'assets/towers_composite/tack_faster.png',
      'assets/towers_composite/tack_sprayer.png', 'assets/towers_composite/tack_rof.png',
      'assets/towers_composite/tack_blade.png', 'assets/towers_composite/tack_maelstrom.png',
      'assets/towers_composite/bomb_base_1.png', 'assets/towers_composite/bomb_base_2.png',
      'assets/towers_composite/bomb_frag.png', 'assets/towers_composite/bomb_cluster.png',
      'assets/towers_composite/bomb_impact.png', 'assets/towers_composite/bomb_missile.png',
      'assets/towers_composite/bomb_mauler.png', 'assets/towers_composite/bomb_assassin.png',
      'assets/towers_composite/super_base_1.png', 'assets/towers_composite/super_base_2.png',
      'assets/towers_composite/super_laser_1.png', 'assets/towers_composite/super_laser_2.png',
      'assets/towers_composite/super_plasma_1.png', 'assets/towers_composite/super_plasma_2.png',
      'assets/towers_composite/super_epic_1.png', 'assets/towers_composite/super_sungod.png',
      'assets/towers_composite/super_temple.png', 'assets/towers_composite/super_robo.png',
      'assets/towers_composite/super_terror.png',
      'assets/towers_composite/ninja_base_1.png', 'assets/towers_composite/ninja_base_2.png',
      'assets/towers_composite/ninja_black_1.png', 'assets/towers_composite/ninja_black_2.png',
      'assets/towers_composite/ninja_flash_1.png', 'assets/towers_composite/ninja_flash_2.png',
      'assets/towers_composite/ninja_bloonjitsu_1.png', 'assets/towers_composite/ninja_bloonjitsu_2.png',
      'assets/towers_composite/ninja_sabotage_1.png', 'assets/towers_composite/ninja_sabotage_2.png',
      'assets/towers_composite/sniper_base_1.png', 'assets/towers_composite/sniper_base_2.png',
      'assets/towers_composite/sniper_fmj_1.png', 'assets/towers_composite/sniper_fmj_2.png',
      'assets/towers_composite/sniper_deadly_1.png', 'assets/towers_composite/sniper_deadly_2.png',
      'assets/towers_composite/sniper_cripple_1.png', 'assets/towers_composite/sniper_cripple_2.png',
      'assets/towers_composite/sniper_supply_1.png', 'assets/towers_composite/sniper_supply_2.png',
      'assets/towers_composite/wizard_base_1.png', 'assets/towers_composite/wizard_base_2.png',
      'assets/towers_composite/wizard_lightning_1.png', 'assets/towers_composite/wizard_lightning_2.png',
      'assets/towers_composite/wizard_dragon_1.png', 'assets/towers_composite/wizard_dragon_2.png',
      'assets/towers_composite/wizard_phoenix_1.png', 'assets/towers_composite/wizard_phoenix_2.png',
      'assets/towers_composite/wizard_tornado_1.png', 'assets/towers_composite/wizard_tornado_2.png',
      'assets/towers_composite/boomer_base_1.png', 'assets/towers_composite/boomer_base_2.png',
      'assets/towers_composite/boomer_glaive_1.png', 'assets/towers_composite/boomer_glaive_2.png',
      'assets/towers_composite/boomer_lord_1.png', 'assets/towers_composite/boomer_lord_2.png',
      'assets/towers_composite/boomer_bionic_1.png', 'assets/towers_composite/boomer_bionic_2.png',
      // 4 New Building Towers (Banana Farm, Monkey Village, Spike Factory, Mortar Tower)
      'assets/towers_composite/farm_base_1.png', 'assets/towers_composite/farm_base_2.png',
      'assets/towers_composite/farm_plantation_1.png', 'assets/towers_composite/farm_plantation_2.png',
      'assets/towers_composite/farm_republic_1.png', 'assets/towers_composite/farm_republic_2.png',
      'assets/towers_composite/farm_brf_1.png', 'assets/towers_composite/farm_brf_2.png',
      'assets/towers_composite/farm_bank_1.png', 'assets/towers_composite/farm_bank_2.png',
      'assets/towers_composite/farm_bia_1.png', 'assets/towers_composite/farm_bia_2.png',
      'assets/towers_composite/village_base_1.png', 'assets/towers_composite/village_base_2.png',
      'assets/towers_composite/village_drums_1.png', 'assets/towers_composite/village_drums_2.png',
      'assets/towers_composite/village_beacon_1.png', 'assets/towers_composite/village_beacon_2.png',
      'assets/towers_composite/village_mib_1.png', 'assets/towers_composite/village_mib_2.png',
      'assets/towers_composite/village_town_1.png', 'assets/towers_composite/village_town_2.png',
      'assets/towers_composite/spactory_base_1.png', 'assets/towers_composite/spactory_base_2.png',
      'assets/towers_composite/spactory_whitehot_1.png', 'assets/towers_composite/spactory_whitehot_2.png',
      'assets/towers_composite/spactory_mines_1.png', 'assets/towers_composite/spactory_mines_2.png',
      'assets/towers_composite/spactory_shredr_1.png', 'assets/towers_composite/spactory_shredr_2.png',
      'assets/towers_composite/spactory_storm_1.png', 'assets/towers_composite/spactory_storm_2.png',
      'assets/towers_composite/mortar_base_1.png', 'assets/towers_composite/mortar_base_2.png',
      'assets/towers_composite/mortar_bigone_1.png', 'assets/towers_composite/mortar_bigone_2.png',
      'assets/towers_composite/mortar_artillery_1.png', 'assets/towers_composite/mortar_artillery_2.png',
      // Extra Tower Effects
      'assets/towers_ingame/ring_of_fire.png',
      'assets/towers_ingame/bomb_tower_muzzle_smoke_01.png',
      // Projectiles & Effects
      'assets/projectiles/bananas.png', 'assets/projectiles/banana_box.png',
      'assets/projectiles/spiked_mine.png', 'assets/projectiles/road_spikes.png',
      'assets/projectiles/mortar_shell.png',
      'assets/projectiles/dart_monkey_dart.png', 'assets/projectiles/spikeopult_ball.png',
      'assets/projectiles/juggernaut_ball_01.png', 'assets/projectiles/tack_shooter_tack.png',
      'assets/projectiles/tack_shooter_blades_01.png', 'assets/projectiles/bomb_tower_bomb_01.png',
      'assets/projectiles/bomb_tower_bomb_red_01.png', 'assets/projectiles/bomb_tower_missile_full.png',
      'assets/projectiles/bomb_tower_moab_mauler_full.png', 'assets/projectiles/bomb_tower_moab_assassin_full.png',
      'assets/projectiles/supermonkey_laser_vision_projectile_single.png',
      'assets/projectiles/supermonkey_plasma_vision_projectile.png',
      'assets/projectiles/supermonkey_sun_god_projectile.png',
      'assets/projectiles/monkey_temple_main_projectile_01.png',
      'assets/projectiles/supermonkey_tech_terror_projectile.png',
      'assets/projectiles/ninja_throwing_star.png', 'assets/projectiles/silver_ninja_throwing_star.png',
      'assets/projectiles/gold_ninja_throwing_star.png', 'assets/projectiles/ninja_grenade.png',
      'assets/projectiles/monkey_apprentice_fireball_01.png', 'assets/projectiles/monkey_apprentice_magic_core.png',
      'assets/projectiles/lightning_bolt.png', 'assets/projectiles/tempest_tornado_01.png',
      'assets/projectiles/boomerang.png', 'assets/projectiles/boomerang_red.png',
      'assets/projectiles/boomerang_sonic_boom.png', 'assets/projectiles/glaive.png', 'assets/projectiles/glaive_red.png',
      'assets/projectiles/phoenix_bird.png',
      'assets/projectiles/explosion_01.png', 'assets/projectiles/pop.png',
      // HUD
      'assets/hud/centre_strip_bg.png', 'assets/hud/energy_bar_bg.png',
      'assets/hud/energy_bar_highlight.png', 'assets/hud/energy_bar_lightning.png',
      'assets/hud/lives_icon.png', 'assets/hud/cash_icon.png', 'assets/hud/energy_icon.png',
      'assets/hud/tower_boost_icon.png', 'assets/hud/bloon_boost_icon.png',
      'assets/hud/bloon_boost_star_01.png', 'assets/hud/bloon_button.png', 'assets/hud/tower_button.png'
    ]);

    for (const t of Object.values(window.GAME_DATA.towers)) {
      urls.add(t.shopIcon);
      urls.add(t.avatarIcon);
      for (const u of [...t.leftUpgrades, ...t.rightUpgrades]) {
        if (u.icon) urls.add(u.icon);
        if (u.avatar) urls.add(u.avatar);
        if (u.abilityIcon) urls.add(u.abilityIcon);
      }
    }

    const list = Array.from(urls);
    let loaded = 0;

    await Promise.all(list.map(url => new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        this.images[url] = img;
        loaded++;
        if (onProgress) onProgress(loaded / list.length);
        resolve();
      };
      img.onerror = () => {
        loaded++;
        if (onProgress) onProgress(loaded / list.length);
        resolve();
      };
      img.src = url;
    })));

    this.generateTintedBloons();
  }

  get(url) {
    return this.images[url] || null;
  }

  generateTintedBloons() {
    const stock = this.get('assets/bloons/stock_bloon.png');
    const highlight = this.get('assets/bloons/stock_bloon_highlight.png');
    const regenBase = this.get('assets/bloons/stock_regen_bloon.png');
    const regenHigh = this.get('assets/bloons/stock_regen_bloon_highlight.png');
    if (!stock) return;

    const colors = {
      red: '#ef2323',
      blue: '#2087f6',
      green: '#2dc62d',
      yellow: '#ffdf1b',
      pink: '#ff63a5',
      black: '#25252c',
      white: '#f2f6ff'
    };

    for (const [id, hex] of Object.entries(colors)) {
      this.tintedBloons[id] = this.tintSprite(stock, highlight, hex);
      if (regenBase) {
        this.tintedBloons[id + '_regen'] = this.tintSprite(regenBase, regenHigh, hex);
      }
    }
  }

  tintSprite(baseImg, highlightImg, hexColor) {
    const c = document.createElement('canvas');
    c.width = baseImg.width;
    c.height = baseImg.height;
    const ctx = c.getContext('2d');

    ctx.drawImage(baseImg, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(baseImg, 0, 0);

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(baseImg, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    if (highlightImg) {
      ctx.drawImage(highlightImg, 0, 0);
    }
    return c;
  }
}

window.ASSETS = new AssetCache();

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

let NEXT_ENTITY_ID = 1;

class BloonEntity {
  constructor(typeId, path, options = {}) {
    const def = window.GAME_DATA.bloons[typeId];
    this.id = NEXT_ENTITY_ID++;
    this.typeId = typeId;
    this.baseTypeId = options.baseTypeId || typeId;
    this.def = def;
    const hpScale = options.hpMultiplier || 1.0;
    this.hp = Math.round(def.hp * hpScale);
    this.maxHp = this.hp;
    this.path = path;
    this.waypointIdx = options.waypointIdx || 0;
    this.x = options.x !== undefined ? options.x : path[0][0];
    this.y = options.y !== undefined ? options.y : path[0][1];
    this.distanceTraveled = options.distanceTraveled || 0;
    this.camo = Boolean(options.camo) && !def.isMoab;
    this.regrow = Boolean(options.regrow) && !def.isMoab;
    this.regrowTimer = 2.2;
    this.stunTimer = 0;
    this.boosted = Boolean(options.boosted);
    this.angle = 0;
    this.dead = false;
    this.leaked = false;
  }

  // Push bloon backwards along the path (Distraction / Whirlwind / Tempest Tornado)
  knockback(distBack) {
    if (this.def.isMoab) return;
    let rem = distBack;
    while (rem > 0 && this.waypointIdx > 0) {
      const [px, py] = this.path[this.waypointIdx];
      const d = Math.hypot(this.x - px, this.y - py);
      if (d >= rem) {
        const dx = px - this.x;
        const dy = py - this.y;
        this.x += (dx / d) * rem;
        this.y += (dy / d) * rem;
        this.distanceTraveled = Math.max(0, this.distanceTraveled - rem);
        rem = 0;
      } else {
        this.x = px;
        this.y = py;
        this.distanceTraveled = Math.max(0, this.distanceTraveled - d);
        rem -= d;
        this.waypointIdx--;
      }
    }
  }

  update(dt, globalBloonBoost, sabotageSlowTimer) {
    if (this.dead || this.leaked) return;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    if (this.regrow && this.typeId !== this.baseTypeId && !this.def.isMoab) {
      this.regrowTimer -= dt;
      if (this.regrowTimer <= 0) {
        this.regrowTimer = 2.2;
        const order = ['red', 'blue', 'green', 'yellow', 'pink', 'black', 'zebra', 'rainbow', 'ceramic'];
        const curIdx = order.indexOf(this.typeId);
        const maxIdx = order.indexOf(this.baseTypeId);
        if (curIdx >= 0 && curIdx < maxIdx) {
          const nextType = order[curIdx + 1];
          this.typeId = nextType;
          this.def = window.GAME_DATA.bloons[nextType];
          this.hp = this.def.hp;
          this.maxHp = this.def.hp;
        }
      }
    }

    let speedMult = (this.boosted || globalBloonBoost > 0) ? 1.38 : 1.0;
    if (sabotageSlowTimer > 0) speedMult *= 0.5;
    let moveRemaining = this.def.speed * speedMult * dt;

    while (moveRemaining > 0 && this.waypointIdx < this.path.length - 1) {
      const [tx, ty] = this.path[this.waypointIdx + 1];
      const dx = tx - this.x;
      const dy = ty - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.001) {
        this.angle = Math.atan2(dy, dx);
      }

      if (dist <= moveRemaining) {
        this.x = tx;
        this.y = ty;
        this.distanceTraveled += dist;
        moveRemaining -= dist;
        this.waypointIdx++;
      } else {
        this.x += (dx / dist) * moveRemaining;
        this.y += (dy / dist) * moveRemaining;
        this.distanceTraveled += moveRemaining;
        moveRemaining = 0;
      }
    }

    if (this.waypointIdx >= this.path.length - 1) {
      this.leaked = true;
    }
  }

  draw(ctx, globalBloonBoost) {
    if (this.dead || this.leaked) return;
    const def = this.def;
    const scale = def.scale || 1.0;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (def.isMoab) {
      ctx.rotate(this.angle + Math.PI / 2);
      const dmgRatio = 1 - Math.max(0, this.hp) / this.maxHp;
      const idx = Math.min(def.sprites.length - 1, Math.floor(dmgRatio * def.sprites.length));
      const img = window.ASSETS.get(def.sprites[idx]);
      if (img) {
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
    } else {
      let img = null;
      if (def.sprites) {
        const arr = (this.regrow && def.regenSprites) ? def.regenSprites : def.sprites;
        const dmgRatio = 1 - Math.max(0, this.hp) / this.maxHp;
        const idx = Math.min(arr.length - 1, Math.floor(dmgRatio * arr.length));
        img = window.ASSETS.get(arr[idx]);
      } else if (def.sprite) {
        const url = (this.regrow && def.regenSprite) ? def.regenSprite : def.sprite;
        img = window.ASSETS.get(url);
      } else {
        const key = this.regrow ? `${this.typeId}_regen` : this.typeId;
        img = window.ASSETS.tintedBloons[key] || window.ASSETS.tintedBloons[this.typeId];
      }

      if (img) {
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);

        if (this.camo) {
          const camoUrl = this.regrow ? 'assets/bloons/camo_regen_overlay.png' : 'assets/bloons/camo_overlay.png';
          const camoImg = window.ASSETS.get(camoUrl);
          if (camoImg) {
            ctx.drawImage(camoImg, -w / 2, -h / 2, w, h);
          }
        }
      }
    }

    if (this.boosted || globalBloonBoost > 0) {
      const star = window.ASSETS.get('assets/hud/bloon_boost_star_01.png');
      if (star) {
        ctx.drawImage(star, -14, -22, 28, 28);
      }
    }

    if (this.stunTimer > 0) {
      ctx.strokeStyle = '#ffef3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -14, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class TowerEntity {
  constructor(typeId, x, y, ownerSide) {
    const def = window.GAME_DATA.towers[typeId];
    this.id = `${ownerSide}_${NEXT_ENTITY_ID++}`;
    this.typeId = typeId;
    this.def = def;
    this.x = x;
    this.y = y;
    this.ownerSide = ownerSide;
    this.leftTier = 0;
    this.rightTier = 0;
    this.totalSpent = def.cost;
    this.targetMode = 'First';
    this.angle = 0;
    this.cooldown = 0;
    this.secondaryCooldown = 0;
    this.fireAnimTimer = 0;
    this.popCount = 0;

    // Activated Ability state
    this.abilityCooldown = 0;
    this.abilityMaxCooldown = 0;
    this.abilityActiveTimer = 0;
    this.fanClubTransformedTimer = 0;
    this.maelstromAngle = 0;
    this.glaiveOrbitAngle = 0;

    this.recalculateStats();
  }

  canUpgradeLeft() {
    if (this.leftTier >= 4) return false;
    if (this.leftTier === 2 && this.rightTier >= 3) return false;
    return true;
  }

  canUpgradeRight() {
    if (this.rightTier >= 4) return false;
    if (this.rightTier === 2 && this.leftTier >= 3) return false;
    return true;
  }

  getLeftUpgradeInfo() {
    if (!this.canUpgradeLeft()) return null;
    return this.def.leftUpgrades[this.leftTier];
  }

  getRightUpgradeInfo() {
    if (!this.canUpgradeRight()) return null;
    return this.def.rightUpgrades[this.rightTier];
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.7);
  }

  recalculateStats() {
    const d = this.def;
    this.range = d.range;
    this.visualRange = d.visualRange || d.range;
    this.fireRate = d.fireRate;
    this.pierce = d.pierce;
    this.damage = d.damage;
    this.moabBonus = d.moabBonus || 0;
    this.ceramicBonus = 0;
    this.damageType = d.damageType;
    this.projectileSpeed = d.projectileSpeed;
    this.projectileSprite = d.projectileSprite;
    this.canDetectCamo = Boolean(d.canDetectCamo);
    this.multishot = 1;
    this.spreadAngle = 0.22;
    this.radialCount = 0;
    this.explosionRadius = d.explosionRadius || 0;
    this.fragCount = 0;
    this.clusterCount = 0;
    this.stunsBloons = false;
    this.stunsMoabs = false;
    this.isRingOfFire = false;
    this.dualStream = false;
    this.seeking = false;
    this.distractionChance = 0;
    this.flashBombEvery = 0;
    this.shotCounter = 0;
    this.ricochet = false;
    this.orbitingGlaives = false;
    this.hasLightning = false;
    this.hasWhirlwind = false;
    this.isTempestTornado = false;
    this.abilityIcon = null;

    const L = this.leftTier;
    const R = this.rightTier;

    if (this.typeId === 'DartMonkey') {
      if (L >= 1) this.range = Math.round(this.range * 1.25);
      if (L >= 2) {
        this.range = Math.round(this.range * 1.20);
        this.canDetectCamo = true;
      }
      if (R >= 1) this.pierce += 1;
      if (R >= 2) this.pierce += 2;
      if (R >= 3) {
        this.multishot = 3;
        this.spreadAngle = 0.24;
      }
      if (L >= 3) {
        this.pierce = 18 + (R >= 1 ? 4 : 0) + (R >= 2 ? 6 : 0);
        this.fireRate = 1.05;
        this.projectileSpeed = 330;
        this.projectileSprite = 'assets/projectiles/spikeopult_ball.png';
      }
      if (L >= 4) {
        this.pierce = 100;
        this.damage = 2;
        this.ceramicBonus = 3;
        this.damageType = 'juggernaut';
        this.projectileSpeed = 380;
        this.projectileSprite = 'assets/projectiles/juggernaut_ball_01.png';
      }
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'TackShooter') {
      this.radialCount = 8;
      if (L >= 1) this.fireRate *= 0.72;
      if (L >= 2) this.fireRate *= 0.65;
      if (L >= 3) this.radialCount = 16;
      if (R >= 1) this.range += 18;
      if (R >= 2) this.range += 22;
      if (R >= 3) {
        this.pierce = 2;
        this.projectileSprite = 'assets/projectiles/tack_shooter_blades_01.png';
      }
      if (L >= 4) {
        this.isRingOfFire = true;
        this.pierce = 60;
        this.damage = 1;
        this.fireRate = 0.42;
        this.damageType = 'plasma';
      }
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'BombTower') {
      if (L >= 1) this.range += 22;
      if (L >= 2) this.fragCount = 8;
      if (L >= 3) this.clusterCount = 8;
      if (L >= 4) {
        this.stunsBloons = true;
        this.damageType = 'plasma';
        this.pierce += 20;
      }
      if (R >= 1) {
        this.pierce += 10;
        this.explosionRadius += 12;
        this.projectileSprite = 'assets/projectiles/bomb_tower_bomb_red_01.png';
      }
      if (R >= 2) {
        this.fireRate *= 0.74;
        this.range += 20;
        this.projectileSpeed = 520;
        this.projectileSprite = 'assets/projectiles/bomb_tower_missile_full.png';
      }
      if (R >= 3) {
        this.moabBonus = 10;
        this.projectileSprite = 'assets/projectiles/bomb_tower_moab_mauler_full.png';
      }
      if (R >= 4) {
        this.moabBonus = 15;
        this.projectileSprite = 'assets/projectiles/bomb_tower_moab_assassin_full.png';
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'SuperMonkey') {
      if (L >= 1) {
        this.pierce = 2;
        this.projectileSprite = 'assets/projectiles/supermonkey_laser_vision_projectile_single.png';
      }
      if (L >= 2) {
        this.pierce = 3;
        this.fireRate = 0.042;
        this.damageType = 'plasma';
        this.projectileSprite = 'assets/projectiles/supermonkey_plasma_vision_projectile.png';
      }
      if (L >= 3) {
        this.pierce = 15;
        this.damage = 2;
        this.multishot = 3;
        this.spreadAngle = 0.16;
        this.projectileSprite = 'assets/projectiles/supermonkey_sun_god_projectile.png';
      }
      if (L >= 4) {
        this.pierce = 50;
        this.damage = 6;
        this.moabBonus = 12;
        this.range += 60;
        this.multishot = 3;
        this.canDetectCamo = true;
        this.projectileSprite = 'assets/projectiles/monkey_temple_main_projectile_01.png';
      }
      if (R >= 1) this.range += 38;
      if (R >= 2) {
        this.range += 48;
        this.canDetectCamo = true;
      }
      if (R >= 3) {
        this.dualStream = true;
        this.pierce += 2;
      }
      if (R >= 4) {
        this.dualStream = true;
        this.damage = 2;
        this.damageType = 'plasma';
        this.projectileSprite = 'assets/projectiles/supermonkey_tech_terror_projectile.png';
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'NinjaMonkey') {
      this.canDetectCamo = true;
      if (L >= 1) {
        this.range += 20;
        this.fireRate *= 0.76;
      }
      if (L >= 2) {
        this.pierce = 4;
        this.projectileSprite = 'assets/projectiles/silver_ninja_throwing_star.png';
      }
      if (L >= 3) {
        this.multishot = 2;
        this.spreadAngle = 0.18;
      }
      if (L >= 4) {
        this.multishot = 5;
        this.spreadAngle = 0.16;
        this.projectileSprite = 'assets/projectiles/gold_ninja_throwing_star.png';
      }
      if (R >= 1) this.seeking = true;
      if (R >= 2) this.distractionChance = 0.22;
      if (R >= 3) this.flashBombEvery = 4;
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'SniperMonkey') {
      this.range = 999;
      this.visualRange = 55;
      if (L >= 1) {
        this.damage = 4;
        this.damageType = 'plasma'; // Pops lead
      }
      if (L >= 2) this.damage = 7;
      if (L >= 3) this.damage = 18;
      if (L >= 4) {
        this.damage = 50;
        this.stunsMoabs = true;
      }
      if (R >= 1) this.fireRate *= 0.70;
      if (R >= 2) this.canDetectCamo = true;
      if (R >= 3) this.fireRate *= 0.34;
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
    } else if (this.typeId === 'MonkeyApprentice') {
      if (L >= 1) this.pierce = 7;
      if (L >= 2) this.hasLightning = true;
      if (L >= 3) this.hasWhirlwind = true;
      if (L >= 4) this.isTempestTornado = true;
      if (R >= 1) {
        this.explosionRadius = 38;
        this.projectileSprite = 'assets/projectiles/monkey_apprentice_fireball_01.png';
      }
      if (R >= 2) {
        this.canDetectCamo = true;
        this.range += 25;
      }
      if (R >= 3) {
        // Dragon's Breath rapid flame stream
        this.fireRate = 0.085;
        this.pierce = 5;
        this.damage = 1;
        this.explosionRadius = 0;
        this.projectileSprite = 'assets/projectiles/monkey_apprentice_fireball_01.png';
      }
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'BoomerangThrower') {
      if (L >= 1) this.pierce = 7;
      if (L >= 2) {
        this.pierce = 12;
        this.projectileSprite = R >= 2 ? 'assets/projectiles/glaive_red.png' : 'assets/projectiles/glaive.png';
      }
      if (L >= 3) {
        this.pierce = 35;
        this.ricochet = true;
      }
      if (L >= 4) {
        this.orbitingGlaives = true;
        this.canDetectCamo = true;
      }
      if (R >= 1) {
        this.range += 22;
        if (L < 2) this.projectileSprite = 'assets/projectiles/boomerang_sonic_boom.png';
      }
      if (R >= 2) {
        this.damageType = 'plasma'; // Red Hot Rangs pop lead
        this.projectileSprite = L >= 2 ? 'assets/projectiles/glaive_red.png' : 'assets/projectiles/boomerang_red.png';
      }
      if (R >= 3) this.fireRate *= 0.34;
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'BananaFarm') {
      this.bananaValue = 40;
      this.bananaInterval = 4.2;
      this.autoCollect = false;
      this.isBank = false;
      if (L >= 1) {
        this.bananaValue = 60;
        this.bananaInterval = 3.5;
      }
      if (L >= 2) {
        this.bananaValue = 100;
        this.bananaInterval = 2.6;
      }
      if (L >= 3) {
        this.bananaValue = 180;
        this.bananaInterval = 2.1;
      }
      if (L >= 4) {
        this.bananaValue = 380;
        this.bananaInterval = 1.85;
        this.projectileSprite = 'assets/projectiles/banana_box.png';
      }
      if (R >= 1) this.autoCollect = true;
      if (R >= 2) this.bananaValue = Math.round(this.bananaValue * 1.5);
      if (R >= 3) {
        this.isBank = true;
        this.autoCollect = true;
        this.bananaValue = 150;
        this.bananaInterval = 2.5;
      }
      if (R >= 4) {
        this.bananaValue = 280;
        this.bananaInterval = 2.0;
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'MonkeyVillage') {
      this.villageRangeBuff = 1.15;
      this.villageSpeedBuff = 1.0;
      this.villagePierceBuff = 0;
      this.villageGrantCamo = false;
      this.villageGrantMIB = false;
      this.villageCashBonus = 0;
      this.hasEnergyBeacon = false;

      if (L >= 1) {
        this.range = 175;
        this.villageRangeBuff = 1.25;
      }
      if (L >= 2) this.villageSpeedBuff = 1.22;
      if (L >= 3) this.villageCashBonus = 1;
      if (L >= 4) {
        this.hasEnergyBeacon = true;
        this.fireRate = 0.18;
        this.damage = 4;
        this.pierce = 15;
        this.damageType = 'plasma';
        this.canDetectCamo = true;
      }
      if (R >= 1) this.villagePierceBuff = 1;
      if (R >= 2) this.villageGrantCamo = true;
      if (R >= 3) this.villageGrantMIB = true;
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'SpikeFactory') {
      this.spikeStackSize = 5;
      this.spikeRate = 1.75;
      this.spikeDamage = 1;
      this.spikeMoabBonus = 0;
      this.isSpikedMines = false;
      this.canDetectCamo = true;

      if (L >= 1) this.spikeStackSize = 10;
      if (L >= 2) this.damageType = 'plasma'; // White Hot Spikes pop lead
      if (L >= 3) {
        this.spikeStackSize = 16;
        this.spikeDamage = 2;
      }
      if (L >= 4) {
        this.isSpikedMines = true;
        this.spikeStackSize = 20;
        this.spikeDamage = 2;
        this.projectileSprite = 'assets/projectiles/spiked_mine.png';
      }
      if (R >= 1) this.spikeRate *= 0.70;
      if (R >= 2) this.spikeRate *= 0.55;
      if (R >= 3) this.spikeMoabBonus = 4;
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = this.range;
    } else if (this.typeId === 'MortarTower') {
      this.explosionRadius = 48;
      this.stripCamo = false;
      this.burnyStuff = false;
      if (L >= 1) {
        this.explosionRadius = 64;
        this.pierce = 40;
      }
      if (L >= 2) this.damage = 2;
      if (L >= 3) {
        // The Big One!
        this.explosionRadius = 96;
        this.pierce = 85;
        this.damage = 5;
        this.damageType = 'plasma';
      }
      if (L >= 4) {
        this.fireRate *= 0.35;
        const u4 = d.leftUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      if (R >= 1) this.fireRate *= 0.72;
      if (R >= 2) this.burnyStuff = true;
      if (R >= 3) {
        this.canDetectCamo = true;
        this.stripCamo = true;
      }
      if (R >= 4) {
        const u4 = d.rightUpgrades[3];
        this.abilityIcon = u4.abilityIcon;
        this.abilityMaxCooldown = u4.abilityCooldown;
      }
      this.visualRange = 95;
    }
  }

  getCompositeSpriteUrl() {
    const fIdx = this.fireAnimTimer > 0 ? '2' : '1';
    const L = this.leftTier;
    const R = this.rightTier;

    if (this.fanClubTransformedTimer > 0) {
      return `assets/towers_composite/super_base_${fIdx}.png`;
    }

    if (this.typeId === 'DartMonkey') {
      if (L >= 4) return `assets/towers_composite/dart_juggernaut_${fIdx}.png`;
      if (L === 3) return `assets/towers_composite/dart_spikeopult_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/dart_fanclub_${fIdx}.png`;
      if (L === 2) return `assets/towers_composite/dart_range2_${fIdx}.png`;
      if (L === 1) return `assets/towers_composite/dart_range1_${fIdx}.png`;
      return `assets/towers_composite/dart_base_${fIdx}.png`;
    }

    if (this.typeId === 'TackShooter') {
      if (L >= 4) return 'assets/towers_composite/tack_rof.png';
      if (R >= 4) return 'assets/towers_composite/tack_maelstrom.png';
      if (R === 3) return 'assets/towers_composite/tack_blade.png';
      if (L === 3) return 'assets/towers_composite/tack_sprayer.png';
      if (L >= 1) return 'assets/towers_composite/tack_faster.png';
      return 'assets/towers_composite/tack_base.png';
    }

    if (this.typeId === 'BombTower') {
      if (R >= 4) return 'assets/towers_composite/bomb_assassin.png';
      if (R === 3) return 'assets/towers_composite/bomb_mauler.png';
      if (L >= 4) return 'assets/towers_composite/bomb_impact.png';
      if (L === 3) return 'assets/towers_composite/bomb_cluster.png';
      if (R === 2) return 'assets/towers_composite/bomb_missile.png';
      if (L === 2) return 'assets/towers_composite/bomb_frag.png';
      return `assets/towers_composite/bomb_base_${fIdx}.png`;
    }

    if (this.typeId === 'SuperMonkey') {
      if (L >= 4) return 'assets/towers_composite/super_temple.png';
      if (R >= 4) return 'assets/towers_composite/super_terror.png';
      if (L === 3) return 'assets/towers_composite/super_sungod.png';
      if (R === 3) return 'assets/towers_composite/super_robo.png';
      if (L === 2) return `assets/towers_composite/super_plasma_${fIdx}.png`;
      if (L === 1) return `assets/towers_composite/super_laser_${fIdx}.png`;
      if (R >= 2) return 'assets/towers_composite/super_epic_1.png';
      return `assets/towers_composite/super_base_${fIdx}.png`;
    }

    if (this.typeId === 'NinjaMonkey') {
      if (L >= 4) return `assets/towers_composite/ninja_bloonjitsu_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/ninja_sabotage_${fIdx}.png`;
      if (R === 3) return `assets/towers_composite/ninja_flash_${fIdx}.png`;
      if (L >= 2 || R >= 2) return `assets/towers_composite/ninja_black_${fIdx}.png`;
      return `assets/towers_composite/ninja_base_${fIdx}.png`;
    }

    if (this.typeId === 'SniperMonkey') {
      if (L >= 4) return `assets/towers_composite/sniper_cripple_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/sniper_supply_${fIdx}.png`;
      if (L === 3 || R === 3) return `assets/towers_composite/sniper_deadly_${fIdx}.png`;
      if (L >= 1 || R >= 2) return `assets/towers_composite/sniper_fmj_${fIdx}.png`;
      return `assets/towers_composite/sniper_base_${fIdx}.png`;
    }

    if (this.typeId === 'MonkeyApprentice') {
      if (L >= 4) return `assets/towers_composite/wizard_tornado_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/wizard_phoenix_${fIdx}.png`;
      if (R === 3) return `assets/towers_composite/wizard_dragon_${fIdx}.png`;
      if (L >= 2) return `assets/towers_composite/wizard_lightning_${fIdx}.png`;
      return `assets/towers_composite/wizard_base_${fIdx}.png`;
    }

    if (this.typeId === 'BoomerangThrower') {
      if (L >= 4) return `assets/towers_composite/boomer_lord_${fIdx}.png`;
      if (R >= 3) return `assets/towers_composite/boomer_bionic_${fIdx}.png`;
      if (L >= 2) return `assets/towers_composite/boomer_glaive_${fIdx}.png`;
      return `assets/towers_composite/boomer_base_${fIdx}.png`;
    }

    if (this.typeId === 'BananaFarm') {
      if (L >= 4) return `assets/towers_composite/farm_brf_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/farm_bia_${fIdx}.png`;
      if (L === 3) return `assets/towers_composite/farm_republic_${fIdx}.png`;
      if (R === 3) return `assets/towers_composite/farm_bank_${fIdx}.png`;
      if (L === 2) return `assets/towers_composite/farm_plantation_${fIdx}.png`;
      return `assets/towers_composite/farm_base_${fIdx}.png`;
    }

    if (this.typeId === 'MonkeyVillage') {
      if (L >= 4) return `assets/towers_composite/village_beacon_${fIdx}.png`;
      if (L === 3) return `assets/towers_composite/village_town_${fIdx}.png`;
      if (R >= 3) return `assets/towers_composite/village_mib_${fIdx}.png`;
      if (L >= 2 || R >= 2) return `assets/towers_composite/village_drums_${fIdx}.png`;
      return `assets/towers_composite/village_base_${fIdx}.png`;
    }

    if (this.typeId === 'SpikeFactory') {
      if (L >= 4) return `assets/towers_composite/spactory_mines_${fIdx}.png`;
      if (R >= 4) return `assets/towers_composite/spactory_storm_${fIdx}.png`;
      if (R === 3) return `assets/towers_composite/spactory_shredr_${fIdx}.png`;
      if (L >= 2) return `assets/towers_composite/spactory_whitehot_${fIdx}.png`;
      return `assets/towers_composite/spactory_base_${fIdx}.png`;
    }

    if (this.typeId === 'MortarTower') {
      if (L >= 4 || R >= 4) return `assets/towers_composite/mortar_artillery_${fIdx}.png`;
      if (L === 3) return `assets/towers_composite/mortar_bigone_${fIdx}.png`;
      return `assets/towers_composite/mortar_base_${fIdx}.png`;
    }

    return `assets/towers_composite/dart_base_1.png`;
  }

  getAvatarUrl() {
    const L = this.leftTier;
    const R = this.rightTier;
    if (L === 0 && R === 0) return this.def.avatarIcon;
    if (L >= R) {
      return this.def.leftUpgrades[L - 1].avatar || this.def.avatarIcon;
    } else {
      return this.def.rightUpgrades[R - 1].avatar || this.def.avatarIcon;
    }
  }
}

class Battlefield {
  constructor(side, mapDef, isPlayerControlled) {
    this.side = side;
    this.mapDef = mapDef;
    this.isPlayerControlled = isPlayerControlled;

    this.lives = window.GAME_DATA.startingLives;
    this.cash = window.GAME_DATA.startingCash;
    this.eco = window.GAME_DATA.startingEco;
    this.towerBoosts = window.GAME_DATA.startingBoosts;
    this.bloonBoosts = window.GAME_DATA.startingBoosts;
    this.towerBoostTimer = 0;
    this.bloonBoostTimer = 0;
    this.sabotageSlowTimer = 0;
    this.roundMultiplier = 1.0;

    const mirrorPt = ([x, y]) => (side === 'right' ? [480 - x, y] : [x, y]);
    this.naturalPath = mapDef.naturalPath.map(mirrorPt);
    this.sentPath = mapDef.sentPath.map(mirrorPt);
    this.waterObstacles = mapDef.waterObstacles.map(obs => {
      if (side !== 'right') return { ...obs };
      if (obs.type === 'rect') return { ...obs, x: 480 - obs.x - obs.w };
      return { ...obs, x: 480 - obs.x };
    });

    this.bloons = [];
    this.towers = [];
    this.projectiles = [];
    this.effects = [];
    this.spawnQueue = [];
    this.bananas = [];
    this.roadSpikes = [];
    this.callToArmsTimer = 0;
  }

  collectBananasNear(px, py, radius = 64) {
    let totalCollected = 0;
    for (const b of this.bananas) {
      if (b.collected) continue;
      if (Math.hypot(b.x - px, b.y - py) <= radius) {
        b.collected = true;
        b.flyProgress = 0;
        this.cash += b.value;
        if (b.tower) b.tower.popCount += b.value;
        totalCollected += b.value;
        this.addEffect({
          type: 'float_text', x: b.x, y: b.y - 8,
          text: `+$${b.value}`, color: '#38e54d',
          timer: 0.85, maxTimer: 0.85
        });
      }
    }
    if (totalCollected > 0 && this.isPlayerControlled) {
      window.SFX.play('buy', 60, 0.65);
    }
    return totalCollected;
  }

  getRandomTrackPointNear(x, y, maxDist) {
    const candidates = [];
    for (const path of [this.naturalPath, this.sentPath]) {
      for (let i = 0; i < path.length - 1; i++) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        const steps = Math.max(2, Math.floor(Math.hypot(x2 - x1, y2 - y1) / 24));
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const tx = x1 + (x2 - x1) * t;
          const ty = y1 + (y2 - y1) * t;
          if (Math.hypot(tx - x, ty - y) <= maxDist) {
            candidates.push({ x: tx + (Math.random() - 0.5) * 8, y: ty + (Math.random() - 0.5) * 8 });
          }
        }
      }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  addEffect(fx) {
    // Cap active effects to 80 for silky-smooth late-game performance
    if (this.effects.length >= 80) {
      this.effects.shift();
    }
    this.effects.push(fx);
  }

  queueBloonGroup(bloonType, count, spacing, isSent = false, options = {}) {
    let delay = options.initialDelay || 0;
    for (let i = 0; i < count; i++) {
      this.spawnQueue.push({
        timeUntilSpawn: delay,
        bloonType,
        path: isSent ? this.sentPath : this.naturalPath,
        options: {
          camo: Boolean(options.camo),
          regrow: Boolean(options.regrow),
          boosted: Boolean(options.boosted),
          hpMultiplier: this.roundMultiplier
        }
      });
      delay += spacing;
    }
  }

  canPlaceTower(typeId, x, y) {
    const def = window.GAME_DATA.towers[typeId];
    if (!def) return false;
    const r = def.footprint;

    if (x < r + 4 || x > 480 - r - 4 || y < r + 4 || y > 640 - r - 4) {
      return false;
    }

    const trackClearance = (this.mapDef.trackWidth / 2) + r * 0.62;
    for (const path of [this.naturalPath, this.sentPath]) {
      for (let i = 0; i < path.length - 1; i++) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        if (distToSegment(x, y, x1, y1, x2, y2) < trackClearance) {
          return false;
        }
      }
    }

    for (const obs of this.waterObstacles) {
      if (obs.type === 'rect') {
        const cx = Math.max(obs.x, Math.min(x, obs.x + obs.w));
        const cy = Math.max(obs.y, Math.min(y, obs.y + obs.h));
        if (Math.hypot(x - cx, y - cy) < r * 0.68) return false;
      } else if (obs.type === 'circle') {
        if (Math.hypot(x - obs.x, y - obs.y) < obs.r + r * 0.58) return false;
      }
    }

    for (const t of this.towers) {
      if (Math.hypot(x - t.x, y - t.y) < (r + t.def.footprint) * 0.80) {
        return false;
      }
    }

    return true;
  }

  placeTower(typeId, x, y, forcedId = null) {
    const def = window.GAME_DATA.towers[typeId];
    if (!def) return null;
    const tower = new TowerEntity(typeId, x, y, this.side);
    if (forcedId) tower.id = forcedId;
    this.towers.push(tower);
    this.addEffect({ type: 'ring', x, y, r: 10, maxR: 34, timer: 0.25, maxTimer: 0.25, color: '#ffffff' });
    if (this.isPlayerControlled) window.SFX.play('tower_place');
    return tower;
  }

  upgradeTower(towerId, pathSide) {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const info = pathSide === 'left' ? tower.getLeftUpgradeInfo() : tower.getRightUpgradeInfo();
    if (!info) return false;

    if (this.isPlayerControlled && this.cash < info.cost) return false;
    if (this.isPlayerControlled) {
      this.cash -= info.cost;
    }

    tower.totalSpent += info.cost;
    if (pathSide === 'left') {
      tower.leftTier++;
    } else {
      tower.rightTier++;
    }
    tower.recalculateStats();

    this.addEffect({
      type: 'ring', x: tower.x, y: tower.y,
      r: 12, maxR: 45, timer: 0.35, maxTimer: 0.35, color: '#58ff6e'
    });
    if (this.isPlayerControlled) window.SFX.play('upgrade');
    return true;
  }

  sellTower(towerId) {
    const idx = this.towers.findIndex(t => t.id === towerId);
    if (idx === -1) return null;
    const [tower] = this.towers.splice(idx, 1);
    const refund = tower.getSellValue();
    if (this.isPlayerControlled) {
      this.cash += refund;
      window.SFX.play('sell_tower');
    }
    return tower;
  }

  activateAbility(towerId) {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower || !tower.abilityIcon || tower.abilityCooldown > 0) return false;

    tower.abilityCooldown = tower.abilityMaxCooldown;
    window.SFX.play('tower_power');

    if (tower.typeId === 'DartMonkey' && tower.rightTier >= 4) {
      const candidates = this.towers
        .filter(t => t.typeId === 'DartMonkey' && t.leftTier < 3)
        .sort((a, b) => Math.hypot(a.x - tower.x, a.y - tower.y) - Math.hypot(b.x - tower.x, b.y - tower.y))
        .slice(0, 10);
      for (const c of candidates) {
        c.fanClubTransformedTimer = 12.0;
        this.addEffect({ type: 'ring', x: c.x, y: c.y, r: 8, maxR: 40, timer: 0.4, maxTimer: 0.4, color: '#38c6ff' });
      }
    } else if (tower.typeId === 'TackShooter' && tower.rightTier >= 4) {
      tower.abilityActiveTimer = 3.0;
      window.SFX.play('schwing');
    } else if (tower.typeId === 'BombTower' && tower.rightTier >= 4) {
      const target = [...this.bloons]
        .filter(b => !b.dead && !b.leaked)
        .sort((a, b) => b.def.rbe - a.def.rbe)[0];
      if (target) {
        this.addEffect({
          type: 'explosion', x: target.x, y: target.y,
          scale: 1.6, timer: 0.35, maxTimer: 0.35
        });
        window.SFX.play('explosion_small');
        this.damageBloon(target, 750, 'plasma', tower);
      }
    } else if (tower.typeId === 'SuperMonkey' && tower.rightTier >= 4) {
      this.addEffect({
        type: 'ring', x: tower.x, y: tower.y,
        r: 20, maxR: 195, timer: 0.55, maxTimer: 0.55, color: '#3dff57'
      });
      for (const b of [...this.bloons]) {
        if (!b.dead && !b.leaked && Math.hypot(b.x - tower.x, b.y - tower.y) <= 195) {
          this.damageBloon(b, 2000, 'plasma', tower);
        }
      }
    } else if (tower.typeId === 'NinjaMonkey' && tower.rightTier >= 4) {
      // Sabotage Supply Lines: slow all bloons on this battlefield by 50% for 15s
      this.sabotageSlowTimer = 15.0;
      this.addEffect({
        type: 'ring', x: 240, y: 320,
        r: 30, maxR: 280, timer: 0.6, maxTimer: 0.6, color: '#c56cf0'
      });
    } else if (tower.typeId === 'SniperMonkey' && tower.rightTier >= 4) {
      // Supply Drop: +$2,000 cash crate
      this.cash += 2000;
      this.addEffect({
        type: 'ring', x: tower.x, y: tower.y,
        r: 10, maxR: 65, timer: 0.5, maxTimer: 0.5, color: '#fed330'
      });
    } else if (tower.typeId === 'MonkeyApprentice' && tower.rightTier >= 4) {
      // Summon Phoenix: 16s flying firebird
      tower.abilityActiveTimer = 16.0;
    } else if (tower.typeId === 'BoomerangThrower' && tower.rightTier >= 4) {
      // Turbo Charge: 10s ultra-rapid attack speed
      tower.abilityActiveTimer = 10.0;
    } else if (tower.typeId === 'BananaFarm' && tower.rightTier >= 4) {
      // Banana Investments Advisory (BIA): +$2,500 Cash & +120 Eco!
      this.cash += 2500;
      this.eco += 120;
      tower.popCount += 2500;
      this.addEffect({
        type: 'ring', x: tower.x, y: tower.y,
        r: 12, maxR: 85, timer: 0.6, maxTimer: 0.6, color: '#38e54d'
      });
      this.addEffect({
        type: 'float_text', x: tower.x, y: tower.y - 18,
        text: '+$2,500 & +120 Eco', color: '#38e54d',
        timer: 1.2, maxTimer: 1.2
      });
    } else if (tower.typeId === 'MonkeyVillage' && tower.rightTier >= 4) {
      // Call to Arms: Double attack speed & pierce of all towers for 12s!
      this.callToArmsTimer = 12.0;
      this.addEffect({
        type: 'ring', x: tower.x, y: tower.y,
        r: 20, maxR: 260, timer: 0.65, maxTimer: 0.65, color: '#fed330'
      });
    } else if (tower.typeId === 'SpikeFactory' && tower.rightTier >= 4) {
      // Spike Storm: Blanket the entire track with MOAB-shredding spikes!
      for (const path of [this.naturalPath, this.sentPath]) {
        for (let i = 0; i < path.length - 1; i++) {
          const [x1, y1] = path[i];
          const [x2, y2] = path[i + 1];
          for (const f of [0.2, 0.5, 0.8]) {
            if (this.roadSpikes.length < 90) {
              this.roadSpikes.push({
                x: x1 + (x2 - x1) * f + (Math.random() - 0.5) * 10,
                y: y1 + (y2 - y1) * f + (Math.random() - 0.5) * 10,
                spikesLeft: 10,
                damage: 2,
                moabBonus: 4,
                damageType: 'plasma',
                isMine: false,
                sprite: 'assets/projectiles/road_spikes.png',
                timer: 18.0,
                tower
              });
            }
          }
        }
      }
    } else if (tower.typeId === 'MortarTower' && (tower.leftTier >= 4 || tower.rightTier >= 4)) {
      // Artillery Battery / Pop and Awe: Bombard & stun all bloons on screen for 8s!
      tower.abilityActiveTimer = 8.0;
      for (const b of [...this.bloons]) {
        if (!b.dead && !b.leaked) {
          b.stunTimer = 5.0;
          b.camo = false;
          this.damageBloon(b, 15, 'plasma', tower);
        }
      }
      this.addEffect({
        type: 'ring', x: 240, y: 320,
        r: 20, maxR: 300, timer: 0.65, maxTimer: 0.65, color: '#ff9f43'
      });
    }
    return true;
  }

  activateTowerBoost() {
    if (this.towerBoosts <= 0 || this.towerBoostTimer > 0) return false;
    this.towerBoosts--;
    this.towerBoostTimer = 12.0;
    window.SFX.play('tower_power');
    return true;
  }

  activateBloonBoost() {
    if (this.bloonBoosts <= 0 || this.bloonBoostTimer > 0) return false;
    this.bloonBoosts--;
    this.bloonBoostTimer = 12.0;
    window.SFX.play('bloon_boost');
    return true;
  }

  update(dt) {
    if (this.towerBoostTimer > 0) this.towerBoostTimer = Math.max(0, this.towerBoostTimer - dt);
    if (this.bloonBoostTimer > 0) this.bloonBoostTimer = Math.max(0, this.bloonBoostTimer - dt);
    if (this.sabotageSlowTimer > 0) this.sabotageSlowTimer = Math.max(0, this.sabotageSlowTimer - dt);
    if (this.callToArmsTimer > 0) this.callToArmsTimer = Math.max(0, this.callToArmsTimer - dt);

    // 1. Spawn queue (cap live bloons at 240 for late-round smoothness)
    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const item = this.spawnQueue[i];
      item.timeUntilSpawn -= dt;
      if (item.timeUntilSpawn <= 0 && this.bloons.length < 240) {
        this.bloons.push(new BloonEntity(item.bloonType, item.path, item.options));
        this.spawnQueue.splice(i, 1);
      }
    }

    // 2. Update bloons & handle leaks + road spikes collision
    for (let i = this.bloons.length - 1; i >= 0; i--) {
      const b = this.bloons[i];
      b.update(dt, this.bloonBoostTimer, this.sabotageSlowTimer);
      if (b.leaked) {
        this.lives = Math.max(0, this.lives - b.def.rbe);
        this.bloons.splice(i, 1);
      } else if (b.dead) {
        this.bloons.splice(i, 1);
      }
    }

    // Road Spikes (Spike Factory) collision with bloons
    for (let sIdx = this.roadSpikes.length - 1; sIdx >= 0; sIdx--) {
      const sp = this.roadSpikes[sIdx];
      sp.timer -= dt;
      if (sp.timer <= 0) {
        this.roadSpikes.splice(sIdx, 1);
        continue;
      }
      for (const b of [...this.bloons]) {
        if (b.dead || b.leaked) continue;
        const hitR = b.def.isMoab ? 34 : 20;
        if (Math.hypot(b.x - sp.x, b.y - sp.y) <= hitR) {
          const dmg = sp.damage + (b.def.isMoab ? sp.moabBonus : 0);
          this.damageBloon(b, dmg, sp.damageType, sp.tower);
          sp.spikesLeft--;
          if (sp.spikesLeft <= 0) {
            if (sp.isMine) {
              this.addEffect({
                type: 'explosion', x: sp.x, y: sp.y,
                scale: 1.25, timer: 0.28, maxTimer: 0.28
              });
              for (const nb of [...this.bloons]) {
                if (!nb.dead && !nb.leaked && Math.hypot(nb.x - sp.x, nb.y - sp.y) <= 58) {
                  this.damageBloon(nb, 6, 'plasma', sp.tower);
                }
              }
            }
            break;
          }
        }
      }
      if (sp.spikesLeft <= 0) {
        this.roadSpikes.splice(sIdx, 1);
      }
    }

    // Update Collectible Bananas (Banana Farm)
    for (let i = this.bananas.length - 1; i >= 0; i--) {
      const bn = this.bananas[i];
      if (bn.collected) {
        bn.flyProgress += dt * 3.8;
        bn.x += (45 - bn.x) * Math.min(1, dt * 8);
        bn.y += (15 - bn.y) * Math.min(1, dt * 8);
        if (bn.flyProgress >= 1) {
          this.bananas.splice(i, 1);
        }
      } else {
        bn.timer -= dt;
        // Auto-collect if AI or if Long Life / Bank or when banana is about to expire (so mobile players never lose cash!)
        if (!this.isPlayerControlled || bn.autoCollect || bn.timer <= 2.5) {
          bn.collected = true;
          bn.flyProgress = 0;
          this.cash += bn.value;
          if (bn.tower) bn.tower.popCount += bn.value;
          this.addEffect({
            type: 'float_text', x: bn.x, y: bn.y - 8,
            text: `+$${bn.value}`, color: '#38e54d',
            timer: 0.8, maxTimer: 0.8
          });
        }
      }
    }

    // Gather Monkey Villages for Aura Buffs
    const villages = this.towers.filter(tw => tw.typeId === 'MonkeyVillage');

    // 3. Update towers
    const boostMult = (this.towerBoostTimer > 0 ? 1.85 : 1.0) * (this.callToArmsTimer > 0 ? 1.85 : 1.0);
    for (const t of this.towers) {
      if (t.fireAnimTimer > 0) t.fireAnimTimer = Math.max(0, t.fireAnimTimer - dt);
      if (t.abilityCooldown > 0) t.abilityCooldown = Math.max(0, t.abilityCooldown - dt);
      if (t.fanClubTransformedTimer > 0) t.fanClubTransformedTimer = Math.max(0, t.fanClubTransformedTimer - dt);

      // Compute active Monkey Village buffs on tower `t`
      let vSpeedMult = 1.0;
      let vRangeMult = 1.0;
      let vPierceAdd = this.callToArmsTimer > 0 ? 2 : 0;
      let vCamo = false;
      let vMIB = false;
      for (const v of villages) {
        if (v.id === t.id) continue;
        if (Math.hypot(t.x - v.x, t.y - v.y) <= v.range) {
          vRangeMult = Math.max(vRangeMult, v.villageRangeBuff || 1.15);
          vSpeedMult = Math.max(vSpeedMult, v.villageSpeedBuff || 1.0);
          vPierceAdd += v.villagePierceBuff || 0;
          if (v.villageGrantCamo) vCamo = true;
          if (v.villageGrantMIB) vMIB = true;
          if (v.hasEnergyBeacon && t.abilityCooldown > 0) {
            t.abilityCooldown = Math.max(0, t.abilityCooldown - dt * 0.35);
          }
        }
      }
      t.buffedRange = Math.round(t.range * vRangeMult);
      t.buffedCamo = t.canDetectCamo || vCamo;
      t.buffedDamageType = vMIB ? 'plasma' : t.damageType;
      t.buffedPierce = t.pierce + vPierceAdd;

      // Banana Farm Production
      if (t.typeId === 'BananaFarm') {
        t.cooldown -= dt;
        if (t.cooldown <= 0) {
          t.cooldown = t.bananaInterval || 4.0;
          t.fireAnimTimer = 0.25;
          const ox = (Math.random() - 0.5) * 56;
          const oy = (Math.random() - 0.5) * 56;
          if (this.bananas.length < 35) {
            this.bananas.push({
              id: NEXT_ENTITY_ID++,
              x: Math.max(24, Math.min(456, t.x + ox)),
              y: Math.max(30, Math.min(610, t.y + oy)),
              value: t.bananaValue || 40,
              sprite: t.projectileSprite || 'assets/projectiles/bananas.png',
              timer: 14.0,
              autoCollect: Boolean(t.autoCollect),
              collected: false,
              flyProgress: 0,
              tower: t
            });
          } else {
            this.cash += t.bananaValue || 40;
            t.popCount += t.bananaValue || 40;
          }
        }
        continue;
      }

      // Spike Factory Production
      if (t.typeId === 'SpikeFactory') {
        t.cooldown -= dt * boostMult * vSpeedMult;
        if (t.cooldown <= 0) {
          t.cooldown = t.spikeRate || 1.75;
          t.fireAnimTimer = 0.18;
          const pt = this.getRandomTrackPointNear(t.x, t.y, t.buffedRange);
          if (pt && this.roadSpikes.length < 75) {
            this.roadSpikes.push({
              x: pt.x,
              y: pt.y,
              spikesLeft: (t.spikeStackSize || 5) + vPierceAdd,
              damage: t.spikeDamage || 1,
              moabBonus: t.spikeMoabBonus || 0,
              damageType: t.buffedDamageType,
              isMine: Boolean(t.isSpikedMines),
              sprite: t.projectileSprite || 'assets/projectiles/road_spikes.png',
              timer: 28.0,
              tower: t
            });
          }
        }
        continue;
      }

      // Monkey Village without High Energy Beacon doesn't shoot projectiles
      if (t.typeId === 'MonkeyVillage' && !t.hasEnergyBeacon) {
        continue;
      }

      // Glaive Lord orbiting glaives
      if (t.orbitingGlaives) {
        t.glaiveOrbitAngle += dt * 6.5;
        t.secondaryCooldown -= dt;
        if (t.secondaryCooldown <= 0) {
          t.secondaryCooldown = 0.14;
          for (const b of [...this.bloons]) {
            if (b.dead || b.leaked) continue;
            if (Math.hypot(b.x - t.x, b.y - t.y) <= 74) {
              this.damageBloon(b, 2, 'plasma', t);
            }
          }
        }
      }

      // Active Abilities (Blade Maelstrom / Summon Phoenix / Turbo Charge)
      if (t.abilityActiveTimer > 0) {
        t.abilityActiveTimer = Math.max(0, t.abilityActiveTimer - dt);

        if (t.typeId === 'TackShooter') {
          t.maelstromAngle += dt * 18;
          for (let arm = 0; arm < 4; arm++) {
            const ang = t.maelstromAngle + (arm * Math.PI) / 2;
            this.spawnProjectile({
              x: t.x, y: t.y,
              vx: Math.cos(ang) * 520,
              vy: Math.sin(ang) * 520,
              angle: ang,
              sprite: 'assets/projectiles/tack_shooter_blades_01.png',
              pierce: 25,
              damage: 1,
              damageType: 'sharp',
              canDetectCamo: false,
              maxDist: 700,
              tower: t
            });
          }
        } else if (t.typeId === 'MonkeyApprentice') {
          // Summon Phoenix orbits the center of the map and shoots rapid flames
          t.maelstromAngle += dt * 2.2;
          const px = 240 + Math.cos(t.maelstromAngle) * 140;
          const py = 320 + Math.sin(t.maelstromAngle) * 180;
          t.secondaryCooldown -= dt;
          if (t.secondaryCooldown <= 0 && this.bloons.length > 0) {
            t.secondaryCooldown = 0.09;
            const target = this.bloons[0];
            const ang = Math.atan2(target.y - py, target.x - px);
            this.spawnProjectile({
              x: px, y: py,
              vx: Math.cos(ang) * 560,
              vy: Math.sin(ang) * 560,
              angle: ang,
              sprite: 'assets/projectiles/monkey_apprentice_fireball_01.png',
              pierce: 6,
              damage: 2,
              damageType: 'plasma',
              canDetectCamo: true,
              maxDist: 650,
              tower: t
            });
          }
        }
      }

      let baseRate = t.fanClubTransformedTimer > 0 ? 0.085 : t.fireRate;
      if (t.typeId === 'BoomerangThrower' && t.abilityActiveTimer > 0) {
        baseRate *= 0.16; // Turbo Charge!
      }
      if (t.typeId === 'MortarTower' && t.abilityActiveTimer > 0) {
        baseRate *= 0.25; // Artillery Battery rapid barrage!
      }
      const effectiveRate = baseRate / (boostMult * vSpeedMult);
      t.cooldown -= dt;

      if (t.cooldown <= 0) {
        const target = this.findTarget(t);
        if (target) {
          t.cooldown = effectiveRate;
          t.fireAnimTimer = Math.min(0.14, effectiveRate * 0.65);
          this.fireTower(t, target);
        }
      }
    }

    // 4. Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      // Seeking / Homing adjustment (Ninja Seeking Shuriken)
      if (p.seeking && this.bloons.length > 0) {
        let nearest = null;
        let bestDist = 140;
        for (const b of this.bloons) {
          if (b.dead || b.leaked || p.hitIds.has(b.id)) continue;
          if (b.camo && !p.canDetectCamo) continue;
          const d = Math.hypot(b.x - p.x, b.y - p.y);
          if (d < bestDist) {
            bestDist = d;
            nearest = b;
          }
        }
        if (nearest) {
          const desired = Math.atan2(nearest.y - p.y, nearest.x - p.x);
          const spd = Math.hypot(p.vx, p.vy);
          p.angle = desired;
          p.vx = Math.cos(desired) * spd;
          p.vy = Math.sin(desired) * spd;
        }
      }

      const stepX = p.vx * dt;
      const stepY = p.vy * dt;
      p.x += stepX;
      p.y += stepY;
      p.traveled += Math.hypot(stepX, stepY);

      let expired = p.traveled >= p.maxDist || p.x < -30 || p.x > 510 || p.y < -30 || p.y > 670;

      if (!expired) {
        const hitRadiusBase = p.knockbackDist > 0 ? 38 : 16;
        for (const b of this.bloons) {
          if (b.dead || b.leaked || p.hitIds.has(b.id)) continue;
          if (b.camo && !p.canDetectCamo) continue;
          const hitRadius = b.def.isMoab ? 34 : hitRadiusBase;
          if (Math.hypot(p.x - b.x, p.y - b.y) <= hitRadius) {
            p.hitIds.add(b.id);

            if (p.explosionRadius > 0) {
              this.triggerExplosion(p, b.x, b.y);
              p.pierce = 0;
              break;
            } else {
              const totalDmg = p.damage
                + (b.def.isMoab ? p.moabBonus : 0)
                + (b.typeId === 'ceramic' ? p.ceramicBonus : 0);
              if (totalDmg > 0) {
                this.damageBloon(b, totalDmg, p.damageType, p.tower);
              }
              if (!b.dead && !b.leaked) {
                if (p.knockbackDist > 0) {
                  b.knockback(p.knockbackDist);
                } else if (p.distractionChance > 0 && Math.random() < p.distractionChance) {
                  b.knockback(65);
                }
              }
              p.pierce--;

              // Glaive Ricochet bounces to next nearby bloon
              if (p.ricochet && p.pierce > 0) {
                let nextB = null;
                let minD = 160;
                for (const cand of this.bloons) {
                  if (cand.dead || cand.leaked || p.hitIds.has(cand.id)) continue;
                  if (cand.camo && !p.canDetectCamo) continue;
                  const d = Math.hypot(cand.x - p.x, cand.y - p.y);
                  if (d < minD) {
                    minD = d;
                    nextB = cand;
                  }
                }
                if (nextB) {
                  const ang = Math.atan2(nextB.y - p.y, nextB.x - p.x);
                  const spd = Math.hypot(p.vx, p.vy);
                  p.angle = ang;
                  p.vx = Math.cos(ang) * spd;
                  p.vy = Math.sin(ang) * spd;
                  p.traveled = 0;
                }
              }

              if (p.pierce <= 0) break;
            }
          }
        }
      }

      if (expired || p.pierce <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // 5. Update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const fx = this.effects[i];
      fx.timer -= dt;
      if (fx.timer <= 0) {
        this.effects.splice(i, 1);
      }
    }
  }

  spawnProjectile(opts) {
    if (this.projectiles.length >= 260) return;
    this.projectiles.push({
      x: opts.x,
      y: opts.y,
      vx: opts.vx,
      vy: opts.vy,
      angle: opts.angle || 0,
      sprite: opts.sprite,
      pierce: opts.pierce || 1,
      damage: opts.damage !== undefined ? opts.damage : 1,
      moabBonus: opts.moabBonus || 0,
      ceramicBonus: opts.ceramicBonus || 0,
      damageType: opts.damageType || 'sharp',
      canDetectCamo: Boolean(opts.canDetectCamo),
      explosionRadius: opts.explosionRadius || 0,
      fragCount: opts.fragCount || 0,
      clusterCount: opts.clusterCount || 0,
      stunsBloons: Boolean(opts.stunsBloons),
      seeking: Boolean(opts.seeking),
      distractionChance: opts.distractionChance || 0,
      ricochet: Boolean(opts.ricochet),
      knockbackDist: opts.knockbackDist || 0,
      hitIds: new Set(),
      maxDist: opts.maxDist || 400,
      traveled: 0,
      tower: opts.tower
    });
  }

  findTarget(tower) {
    const candidates = [];
    const effRange = tower.buffedRange || tower.range;
    const effCamo = tower.buffedCamo !== undefined ? tower.buffedCamo : tower.canDetectCamo;
    for (const b of this.bloons) {
      if (b.dead || b.leaked) continue;
      if (b.camo && !effCamo) continue;
      const dist = Math.hypot(b.x - tower.x, b.y - tower.y);
      const pad = b.def.isMoab ? 22 : 6;
      if (dist <= effRange + pad) {
        candidates.push({ bloon: b, dist });
      }
    }
    if (candidates.length === 0) return null;

    if (tower.targetMode === 'First') {
      candidates.sort((a, b) => b.bloon.distanceTraveled - a.bloon.distanceTraveled);
    } else if (tower.targetMode === 'Last') {
      candidates.sort((a, b) => a.bloon.distanceTraveled - b.bloon.distanceTraveled);
    } else if (tower.targetMode === 'Close') {
      candidates.sort((a, b) => a.dist - b.dist);
    } else if (tower.targetMode === 'Strong') {
      candidates.sort((a, b) => b.bloon.def.rbe - a.bloon.def.rbe || b.bloon.distanceTraveled - a.bloon.distanceTraveled);
    }
    return candidates[0].bloon;
  }

  fireTower(tower, target) {
    const baseAngle = Math.atan2(target.y - tower.y, target.x - tower.x);
    if (tower.def.rotates) {
      tower.angle = baseAngle;
    }
    const effCamo = tower.buffedCamo !== undefined ? tower.buffedCamo : tower.canDetectCamo;
    const effDmgType = tower.buffedDamageType || tower.damageType;
    const effPierce = tower.buffedPierce || tower.pierce;

    // 1. Sniper Monkey Instant Hitscan Shot
    if (tower.typeId === 'SniperMonkey') {
      this.addEffect({
        type: 'pop', x: target.x, y: target.y,
        timer: 0.12, maxTimer: 0.12
      });
      if (tower.stunsMoabs && target.def.isMoab) {
        target.stunTimer = 2.0;
      }
      this.damageBloon(target, tower.damage, effDmgType, tower);
      return;
    }

    // 1b. Mortar Tower Instant Artillery Shell Drop at Target
    if (tower.typeId === 'MortarTower') {
      this.triggerExplosion({
        damage: tower.damage,
        moabBonus: tower.moabBonus || 0,
        pierce: effPierce,
        damageType: effDmgType,
        explosionRadius: tower.explosionRadius,
        stunsBloons: tower.leftTier >= 4 || tower.rightTier >= 4,
        stripCamo: Boolean(tower.stripCamo),
        burnyStuff: Boolean(tower.burnyStuff),
        clusterCount: 0,
        fragCount: 0,
        tower
      }, target.x, target.y);
      return;
    }

    // 2. Ring of Fire pulse
    if (tower.isRingOfFire) {
      this.addEffect({
        type: 'rof', x: tower.x, y: tower.y,
        r: tower.range, timer: 0.24, maxTimer: 0.24
      });
      let remaining = tower.pierce;
      for (const b of [...this.bloons]) {
        if (remaining <= 0) break;
        if (b.dead || b.leaked || (b.camo && !tower.canDetectCamo)) continue;
        if (Math.hypot(b.x - tower.x, b.y - tower.y) <= tower.range + 12) {
          this.damageBloon(b, tower.damage, 'plasma', tower);
          remaining--;
        }
      }
      return;
    }

    // 3. Radial Tack Shooter
    if (tower.radialCount > 0) {
      const n = tower.radialCount;
      for (let i = 0; i < n; i++) {
        const ang = (i * Math.PI * 2) / n;
        this.spawnProjectile({
          x: tower.x,
          y: tower.y,
          vx: Math.cos(ang) * tower.projectileSpeed,
          vy: Math.sin(ang) * tower.projectileSpeed,
          angle: ang,
          sprite: tower.projectileSprite,
          pierce: tower.pierce,
          damage: tower.damage,
          damageType: tower.damageType,
          canDetectCamo: tower.canDetectCamo,
          maxDist: tower.range + 18,
          tower
        });
      }
      return;
    }

    // 4. Monkey Apprentice Special Attacks (Chain Lightning & Whirlwind / Tempest Tornado)
    if (tower.typeId === 'MonkeyApprentice') {
      tower.shotCounter++;
      if (tower.hasWhirlwind && tower.shotCounter % 3 === 0) {
        this.spawnProjectile({
          x: tower.x,
          y: tower.y,
          vx: Math.cos(baseAngle) * 320,
          vy: Math.sin(baseAngle) * 320,
          angle: baseAngle,
          sprite: 'assets/projectiles/tempest_tornado_01.png',
          pierce: tower.isTempestTornado ? 60 : 24,
          damage: tower.isTempestTornado ? 2 : 0,
          damageType: 'plasma',
          canDetectCamo: tower.canDetectCamo,
          knockbackDist: tower.isTempestTornado ? 140 : 85,
          maxDist: tower.range + 90,
          tower
        });
        return;
      }
      if (tower.hasLightning && tower.shotCounter % 2 === 0) {
        if (this.isPlayerControlled) window.SFX.play('chainLightning', 120, 0.55);
        this.addEffect({
          type: 'lightning', x1: tower.x, y1: tower.y, x2: target.x, y2: target.y,
          timer: 0.16, maxTimer: 0.16
        });
        let jumps = 8;
        for (const b of [...this.bloons]) {
          if (jumps <= 0) break;
          if (b.dead || b.leaked || (b.camo && !tower.canDetectCamo)) continue;
          if (Math.hypot(b.x - target.x, b.y - target.y) <= 95) {
            this.damageBloon(b, 2, 'plasma', tower);
            jumps--;
          }
        }
        return;
      }
    }

    // 5. Ninja Flash Bomb every Nth shot
    if (tower.typeId === 'NinjaMonkey' && tower.flashBombEvery > 0) {
      tower.shotCounter++;
      if (tower.shotCounter % tower.flashBombEvery === 0) {
        this.spawnProjectile({
          x: tower.x,
          y: tower.y,
          vx: Math.cos(baseAngle) * 420,
          vy: Math.sin(baseAngle) * 420,
          angle: baseAngle,
          sprite: 'assets/projectiles/ninja_grenade.png',
          pierce: 40,
          damage: 1,
          damageType: 'plasma',
          canDetectCamo: true,
          explosionRadius: 56,
          stunsBloons: true,
          maxDist: tower.range + 40,
          tower
        });
        return;
      }
    }

    if (tower.typeId === 'BombTower') {
      this.addEffect({
        type: 'smoke',
        x: tower.x + Math.cos(baseAngle) * 24,
        y: tower.y + Math.sin(baseAngle) * 24,
        timer: 0.22,
        maxTimer: 0.22
      });
    }

    const offsets = tower.dualStream ? [-11, 11] : [0];
    const perpX = -Math.sin(baseAngle);
    const perpY = Math.cos(baseAngle);

    for (const off of offsets) {
      const count = tower.multishot;
      for (let i = 0; i < count; i++) {
        const delta = count === 1 ? 0 : (i - (count - 1) / 2) * tower.spreadAngle;
        const ang = baseAngle + delta;
        const projSprite = tower.fanClubTransformedTimer > 0
          ? 'assets/projectiles/supermonkey_laser_vision_projectile_single.png'
          : tower.projectileSprite;

        this.spawnProjectile({
          x: tower.x + perpX * off + Math.cos(ang) * 14,
          y: tower.y + perpY * off + Math.sin(ang) * 14,
          vx: Math.cos(ang) * tower.projectileSpeed,
          vy: Math.sin(ang) * tower.projectileSpeed,
          angle: ang,
          sprite: projSprite,
          pierce: tower.pierce,
          damage: tower.damage,
          moabBonus: tower.moabBonus,
          ceramicBonus: tower.ceramicBonus,
          damageType: tower.damageType,
          canDetectCamo: tower.canDetectCamo,
          explosionRadius: tower.explosionRadius,
          fragCount: tower.fragCount,
          clusterCount: tower.clusterCount,
          stunsBloons: tower.stunsBloons,
          seeking: tower.seeking,
          distractionChance: tower.distractionChance,
          ricochet: tower.ricochet,
          maxDist: tower.range * 1.45 + 45,
          tower
        });
      }
    }
  }

  triggerExplosion(proj, ex, ey) {
    this.addEffect({
      type: 'explosion', x: ex, y: ey,
      scale: proj.explosionRadius / 38,
      timer: 0.26, maxTimer: 0.26
    });
    if (this.isPlayerControlled) window.SFX.play('explosion_small', 55, 0.7);

    let remaining = proj.pierce;
    for (const b of [...this.bloons]) {
      if (remaining <= 0) break;
      if (b.dead || b.leaked) continue;
      const dist = Math.hypot(b.x - ex, b.y - ey);
      const pad = b.def.isMoab ? 26 : 10;
      if (dist <= proj.explosionRadius + pad) {
        if (proj.stripCamo && b.camo) {
          b.camo = false;
        }
        const totalDmg = proj.damage + (b.def.isMoab ? proj.moabBonus : 0) + (proj.burnyStuff ? 1 : 0);
        this.damageBloon(b, totalDmg, proj.damageType, proj.tower);
        if (proj.stunsBloons && !b.def.isMoab && !b.dead) {
          b.stunTimer = 1.4;
        }
        remaining--;
      }
    }

    if (proj.clusterCount > 0) {
      for (let i = 0; i < proj.clusterCount; i++) {
        const ang = (i * Math.PI * 2) / proj.clusterCount;
        const cx = ex + Math.cos(ang) * 28;
        const cy = ey + Math.sin(ang) * 28;
        this.addEffect({
          type: 'explosion', x: cx, y: cy,
          scale: 0.65, timer: 0.22, maxTimer: 0.22
        });
        for (const b of [...this.bloons]) {
          if (b.dead || b.leaked) continue;
          if (Math.hypot(b.x - cx, b.y - cy) <= 32) {
            this.damageBloon(b, 1, proj.damageType, proj.tower);
          }
        }
      }
    } else if (proj.fragCount > 0) {
      for (let i = 0; i < proj.fragCount; i++) {
        const ang = (i * Math.PI * 2) / proj.fragCount;
        this.spawnProjectile({
          x: ex, y: ey,
          vx: Math.cos(ang) * 420,
          vy: Math.sin(ang) * 420,
          angle: ang,
          sprite: 'assets/projectiles/tack_shooter_tack.png',
          pierce: 1,
          damage: 1,
          damageType: 'sharp',
          canDetectCamo: true,
          maxDist: 65,
          tower: proj.tower
        });
      }
    }
  }

  damageBloon(bloon, dmg, damageType, sourceTower) {
    if (bloon.dead || bloon.leaked || dmg <= 0) return;

    const imm = bloon.def.immunities || [];
    if (damageType === 'sharp' && imm.includes('sharp')) {
      if (this.isPlayerControlled) window.SFX.play('metal_bloon_hit', 70, 0.65);
      return;
    }
    if (damageType === 'explosion' && imm.includes('explosion')) {
      return;
    }

    if (sourceTower) sourceTower.popCount += Math.min(bloon.hp, dmg);

    if (dmg < bloon.hp) {
      bloon.hp -= dmg;
      if (this.isPlayerControlled) {
        if (bloon.def.isMoab) window.SFX.play('moab_damage_quieter', 60, 0.6);
        else if (bloon.typeId === 'ceramic') window.SFX.play('ceramic_bloon_hit', 50, 0.7);
      }
      return;
    }

    const leftover = dmg - bloon.hp;
    bloon.dead = true;

    this.addEffect({
      type: 'pop', x: bloon.x, y: bloon.y,
      timer: 0.14, maxTimer: 0.14
    });

    if (this.isPlayerControlled) {
      if (bloon.def.isMoab) window.SFX.play('moab_destroyed_short', 80, 0.85);
      else window.SFX.playPop();
    }

    const children = bloon.def.children || [];
    for (let idx = 0; idx < children.length; idx++) {
      if (this.bloons.length >= 260 && !bloon.def.isMoab) break;
      const childType = children[idx];
      const jitter = (idx - (children.length - 1) / 2) * 6;
      const child = new BloonEntity(childType, bloon.path, {
        waypointIdx: bloon.waypointIdx,
        x: bloon.x + Math.cos(bloon.angle) * jitter,
        y: bloon.y + Math.sin(bloon.angle) * jitter,
        distanceTraveled: Math.max(0, bloon.distanceTraveled + jitter),
        camo: bloon.camo,
        regrow: bloon.regrow,
        baseTypeId: bloon.baseTypeId,
        boosted: bloon.boosted
      });
      this.bloons.push(child);

      if (leftover > 0 && !bloon.def.isMoab && children.length === 1) {
        this.damageBloon(child, leftover, damageType, sourceTower);
      }
    }
  }

  draw(ctx, selectedTowerId, placementPreview) {
    const bgUrl = this.side === 'left' ? this.mapDef.leftImg : this.mapDef.rightImg;
    const bgImg = window.ASSETS.get(bgUrl);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, 480, 640);
    } else {
      ctx.fillStyle = '#3a6629';
      ctx.fillRect(0, 0, 480, 640);
    }

    // Sabotage tint overlay
    if (this.sabotageSlowTimer > 0) {
      ctx.fillStyle = 'rgba(155, 89, 182, 0.16)';
      ctx.fillRect(0, 0, 480, 640);
    }

    // Selected Tower Range Circle
    if (selectedTowerId) {
      const sel = this.towers.find(t => t.id === selectedTowerId);
      if (sel) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(sel.x, sel.y, sel.visualRange, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.stroke();
        ctx.restore();
      }
    }

    // Ring of Fire & Ground effects
    for (const fx of this.effects) {
      if (fx.type === 'rof') {
        const rofImg = window.ASSETS.get('assets/towers_ingame/ring_of_fire.png');
        ctx.save();
        ctx.globalAlpha = fx.timer / fx.maxTimer;
        if (rofImg) {
          ctx.drawImage(rofImg, fx.x - fx.r, fx.y - fx.r, fx.r * 2, fx.r * 2);
        }
        ctx.restore();
      }
    }

    // Draw Road Spikes & Spiked Mines (Spike Factory)
    for (const sp of this.roadSpikes) {
      const spImg = window.ASSETS.get(sp.sprite);
      if (spImg) {
        ctx.drawImage(spImg, sp.x - 16, sp.y - 16, 32, 32);
      }
    }

    // Draw Towers & Orbiting Glaives / Summon Phoenix
    for (const t of this.towers) {
      ctx.save();
      ctx.translate(t.x, t.y);

      if (this.towerBoostTimer > 0 || this.callToArmsTimer > 0 || (t.typeId === 'BoomerangThrower' && t.abilityActiveTimer > 0)) {
        ctx.beginPath();
        ctx.arc(0, 0, t.def.footprint + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 215, 40, 0.35)';
        ctx.fill();
      }

      // Orbiting Glaive Lord blades
      if (t.orbitingGlaives) {
        const gImg = window.ASSETS.get('assets/projectiles/glaive_red.png');
        if (gImg) {
          for (let k = 0; k < 2; k++) {
            const oa = t.glaiveOrbitAngle + k * Math.PI;
            const gx = Math.cos(oa) * 58;
            const gy = Math.sin(oa) * 58;
            ctx.drawImage(gImg, gx - 18, gy - 18, 36, 36);
          }
        }
      }

      if (t.def.rotates) {
        ctx.rotate(t.angle + Math.PI / 2);
      }

      const spriteUrl = t.getCompositeSpriteUrl();
      const img = window.ASSETS.get(spriteUrl);
      if (img) {
        const scale = t.typeId === 'SuperMonkey' && t.leftTier >= 4 ? 0.65 : 0.78;
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      }
      ctx.restore();

      // Draw Summon Phoenix bird if active
      if (t.typeId === 'MonkeyApprentice' && t.abilityActiveTimer > 0) {
        const px = 240 + Math.cos(t.maelstromAngle) * 140;
        const py = 320 + Math.sin(t.maelstromAngle) * 180;
        const tangentAngle = t.maelstromAngle + Math.PI / 2;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tangentAngle + Math.PI / 2);
        const phxImg = window.ASSETS.get('assets/projectiles/phoenix_bird.png');
        if (phxImg) {
          ctx.drawImage(phxImg, -52, -46, 104, 92);
        } else {
          ctx.fillStyle = 'rgba(255, 120, 0, 0.55)';
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // Draw Bloons
    const sortedBloons = [...this.bloons].sort((a, b) => a.distanceTraveled - b.distanceTraveled);
    for (const b of sortedBloons) {
      b.draw(ctx, this.bloonBoostTimer);
    }

    // Draw Map Foreground Overlays (e.g., Mayan Temple Roof so tunnel bloons walk UNDER the temple!)
    const overlayUrl = this.side === 'left' ? this.mapDef.overlayLeft : this.mapDef.overlayRight;
    if (overlayUrl) {
      const ovImg = window.ASSETS.get(overlayUrl);
      if (ovImg) {
        ctx.drawImage(ovImg, 0, 0, 480, 640);
      }
    }

    // Draw Collectible Bananas & Crates (Banana Farm)
    for (const bn of this.bananas) {
      const bImg = window.ASSETS.get(bn.sprite);
      ctx.save();
      ctx.translate(bn.x, bn.y);
      if (!bn.collected) {
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 225, 45, 0.28)';
        ctx.fill();
      }
      if (bImg) {
        ctx.drawImage(bImg, -19, -16, 38, 32);
      }
      ctx.restore();
    }

    // Draw Projectiles
    for (const p of this.projectiles) {
      const img = window.ASSETS.get(p.sprite);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle + Math.PI / 2);
      if (img) {
        const scale = p.knockbackDist > 0 ? 0.52 : 0.75;
        ctx.drawImage(img, (-img.width * scale) / 2, (-img.height * scale) / 2, img.width * scale, img.height * scale);
      } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Draw Pops, Explosions, Lightning, Smoke, Float Text & Rings
    for (const fx of this.effects) {
      if (fx.type === 'pop') {
        const popImg = window.ASSETS.get('assets/projectiles/pop.png');
        if (popImg) ctx.drawImage(popImg, fx.x - 18, fx.y - 18, 36, 36);
      } else if (fx.type === 'explosion') {
        const expImg = window.ASSETS.get('assets/projectiles/explosion_01.png');
        if (expImg) {
          const sz = 78 * (fx.scale || 1);
          ctx.save();
          ctx.globalAlpha = fx.timer / fx.maxTimer;
          ctx.drawImage(expImg, fx.x - sz / 2, fx.y - sz / 2, sz, sz);
          ctx.restore();
        }
      } else if (fx.type === 'smoke') {
        const smkImg = window.ASSETS.get('assets/towers_ingame/bomb_tower_muzzle_smoke_01.png');
        if (smkImg) {
          ctx.save();
          ctx.globalAlpha = fx.timer / fx.maxTimer;
          ctx.drawImage(smkImg, fx.x - 16, fx.y - 16, 32, 32);
          ctx.restore();
        }
      } else if (fx.type === 'lightning') {
        ctx.save();
        ctx.strokeStyle = '#70d6ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx.x1, fx.y1);
        ctx.lineTo((fx.x1 + fx.x2) / 2 + (Math.random() - 0.5) * 18, (fx.y1 + fx.y2) / 2 + (Math.random() - 0.5) * 18);
        ctx.lineTo(fx.x2, fx.y2);
        ctx.stroke();
        ctx.restore();
      } else if (fx.type === 'ring') {
        const p = 1 - fx.timer / fx.maxTimer;
        const curR = fx.r + (fx.maxR - fx.r) * p;
        ctx.save();
        ctx.strokeStyle = fx.color || '#fff';
        ctx.globalAlpha = 1 - p;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, curR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (fx.type === 'float_text') {
        const p = 1 - fx.timer / fx.maxTimer;
        ctx.save();
        ctx.font = '900 15px Tahoma, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, 1 - p);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(fx.text, fx.x, fx.y - p * 26);
        ctx.fillStyle = fx.color || '#38e54d';
        ctx.fillText(fx.text, fx.x, fx.y - p * 26);
        ctx.restore();
      }
    }

    // Placement Ghost Preview
    if (placementPreview && this.isPlayerControlled) {
      const { typeId, x, y, valid } = placementPreview;
      const def = window.GAME_DATA.towers[typeId];
      if (def) {
        const visR = def.visualRange || def.range;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, visR, 0, Math.PI * 2);
        ctx.fillStyle = valid ? 'rgba(100, 255, 120, 0.24)' : 'rgba(255, 60, 60, 0.30)';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = valid ? '#55ff6a' : '#ff4444';
        ctx.stroke();

        const previewMap = {
          DartMonkey: 'assets/towers_composite/dart_base_1.png',
          TackShooter: 'assets/towers_composite/tack_base.png',
          BombTower: 'assets/towers_composite/bomb_base_1.png',
          SuperMonkey: 'assets/towers_composite/super_base_1.png',
          NinjaMonkey: 'assets/towers_composite/ninja_base_1.png',
          SniperMonkey: 'assets/towers_composite/sniper_base_1.png',
          MonkeyApprentice: 'assets/towers_composite/wizard_base_1.png',
          BoomerangThrower: 'assets/towers_composite/boomer_base_1.png',
          BananaFarm: 'assets/towers_composite/farm_base_1.png',
          MonkeyVillage: 'assets/towers_composite/village_base_1.png',
          SpikeFactory: 'assets/towers_composite/spactory_base_1.png',
          MortarTower: 'assets/towers_composite/mortar_base_1.png'
        };
        const img = window.ASSETS.get(previewMap[typeId]);
        if (img) {
          ctx.globalAlpha = 0.88;
          const w = img.width * 0.78;
          const h = img.height * 0.78;
          ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
        }
        ctx.restore();
      }
    }
  }
}

class AIOpponent {
  constructor(aiField, playerFieldOrResolver, allowedLoadout) {
    this.field = aiField;
    this.enemyResolver = typeof playerFieldOrResolver === 'function'
      ? playerFieldOrResolver
      : () => playerFieldOrResolver;
    this.loadout = allowedLoadout && allowedLoadout.length > 0
      ? allowedLoadout
      : ['DartMonkey', 'NinjaMonkey', 'BombTower', 'SuperMonkey', 'BananaFarm', 'SpikeFactory'];
    this.decisionTimer = 1.3;
  }

  update(dt, currentRound) {
    if (this.field.lives <= 0) return;
    this.decisionTimer -= dt;
    if (this.decisionTimer > 0) return;
    this.decisionTimer = 1.2 + Math.random() * 0.8;

    const threat = this.field.bloons.reduce((sum, b) => sum + b.def.rbe, 0);

    if (threat > 140) {
      for (const t of this.field.towers) {
        if (t.abilityIcon && t.abilityCooldown <= 0) {
          this.field.activateAbility(t.id);
          break;
        }
      }
      if (threat > 260 && this.field.towerBoosts > 0 && this.field.towerBoostTimer <= 0) {
        this.field.activateTowerBoost();
      }
    }

    const desiredTowers = Math.min(14, 2 + Math.floor(currentRound * 0.7));
    if (this.field.towers.length < desiredTowers || threat > 90) {
      const affordable = this.loadout.filter(id => {
        const def = window.GAME_DATA.towers[id];
        return def && this.field.cash >= def.cost;
      });
      if (affordable.length > 0) {
        const choice = affordable[Math.floor(Math.random() * affordable.length)];
        const def = window.GAME_DATA.towers[choice];
        const spot = this.findGoodSpot(choice);
        if (spot) {
          this.field.cash -= def.cost;
          this.field.placeTower(choice, spot.x, spot.y);
          return;
        }
      }
    }

    if (this.field.towers.length > 0 && Math.random() < 0.75) {
      const t = this.field.towers[Math.floor(Math.random() * this.field.towers.length)];
      const preferLeft = Math.random() < 0.55;
      const side = preferLeft
        ? (t.canUpgradeLeft() ? 'left' : 'right')
        : (t.canUpgradeRight() ? 'right' : 'left');
      const info = side === 'left' ? t.getLeftUpgradeInfo() : t.getRightUpgradeInfo();
      if (info && this.field.cash >= info.cost) {
        this.field.upgradeTower(t.id, side);
        return;
      }
    }

    if (this.field.towers.length >= 2 && threat < 130) {
      const targetEnemyField = this.enemyResolver();
      if (!targetEnemyField || targetEnemyField.lives <= 0) return;

      const unlocked = window.GAME_DATA.bloonSends.filter(s => s.minRound <= currentRound && s.cost <= this.field.cash - 180);
      if (unlocked.length > 0) {
        const pick = unlocked[Math.floor(Math.random() * unlocked.length)];
        const sendCamo = currentRound >= 12 && pick.allowModifiers && Math.random() < 0.25;
        const sendRegrow = currentRound >= 9 && pick.allowModifiers && Math.random() < 0.25;
        const mult = (sendCamo ? 2.2 : 1) * (sendRegrow ? 1.8 : 1);
        const finalCost = Math.round(pick.cost * mult);
        if (this.field.cash >= finalCost + 120) {
          this.field.cash -= finalCost;
          this.field.eco = Math.max(100, +(this.field.eco + pick.eco).toFixed(1));
          const useBoost = pick.minRound >= 14 && this.field.bloonBoosts > 0 && Math.random() < 0.22;
          if (useBoost) this.field.activateBloonBoost();
          targetEnemyField.queueBloonGroup(pick.bloon, pick.count, pick.spacing, true, {
            boosted: this.field.bloonBoostTimer > 0,
            camo: sendCamo,
            regrow: sendRegrow
          });
        }
      }
    }
  }

  findGoodSpot(typeId) {
    for (let attempt = 0; attempt < 45; attempt++) {
      const segIdx = Math.floor(Math.random() * (this.field.naturalPath.length - 1));
      const [x1, y1] = this.field.naturalPath[segIdx];
      const [x2, y2] = this.field.naturalPath[segIdx + 1];
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      const dist = 38 + Math.random() * 44;
      const px = Math.round(x1 + (x2 - x1) * t + Math.cos(angle) * dist);
      const py = Math.round(y1 + (y2 - y1) * t + Math.sin(angle) * dist);
      if (this.field.canPlaceTower(typeId, px, py)) {
        return { x: px, y: py };
      }
    }
    return null;
  }
}

window.Battlefield = Battlefield;
window.AIOpponent = AIOpponent;
