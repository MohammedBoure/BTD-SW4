"""
Tower and Projectile Mechanics with Authentic Sprites for Bloons TD Battles
"""

import math
import os
import pygame
from config import TOWER_TYPES
from audio import SoundManager

_TOWER_SPRITE_CACHE = {}
_PROJ_SPRITE_CACHE = {}

def get_tower_sprite(tower_key, size=(38, 38)):
    cache_key = (tower_key, size)
    if cache_key not in _TOWER_SPRITE_CACHE:
        path = os.path.join(os.path.dirname(__file__), "assets", "towers", f"{tower_key}.png")
        if os.path.exists(path):
            try:
                raw = pygame.image.load(path).convert_alpha()
                scaled = pygame.transform.smoothscale(raw, size)
                _TOWER_SPRITE_CACHE[cache_key] = scaled
            except Exception:
                _TOWER_SPRITE_CACHE[cache_key] = None
        else:
            _TOWER_SPRITE_CACHE[cache_key] = None
    return _TOWER_SPRITE_CACHE[cache_key]

def get_projectile_sprite(name, size=None):
    if name not in _PROJ_SPRITE_CACHE:
        path = os.path.join(os.path.dirname(__file__), "assets", "projectiles", f"{name}.png")
        if os.path.exists(path):
            try:
                raw = pygame.image.load(path).convert_alpha()
                if size:
                    raw = pygame.transform.smoothscale(raw, size)
                _PROJ_SPRITE_CACHE[name] = raw
            except Exception:
                _PROJ_SPRITE_CACHE[name] = None
        else:
            _PROJ_SPRITE_CACHE[name] = None
    return _PROJ_SPRITE_CACHE[name]


class ExplosionEffect:
    def __init__(self, x, y, radius=45):
        self.x = int(x)
        self.y = int(y)
        self.radius = radius
        self.lifetime = 0.25
        self.elapsed = 0.0
        self.is_dead = False

    def update(self, dt):
        self.elapsed += dt
        if self.elapsed >= self.lifetime:
            self.is_dead = True

    def draw(self, surface):
        if self.is_dead:
            return
        frame_idx = int((self.elapsed / self.lifetime) * 3)
        sprite_names = ["explosion_01", "explosion_02", "explosion_05"]
        name = sprite_names[min(2, frame_idx)]
        sprite = get_projectile_sprite(name)
        if sprite:
            scaled_size = int(self.radius * 2.2)
            scaled = pygame.transform.smoothscale(sprite, (scaled_size, scaled_size))
            rect = scaled.get_rect(center=(self.x, self.y))
            surface.blit(scaled, rect)
        else:
            alpha = max(0, min(255, int(255 * (1.0 - self.elapsed / self.lifetime))))
            s = pygame.Surface((self.radius * 2, self.radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(s, (255, 120, 0, alpha), (self.radius, self.radius), self.radius)
            surface.blit(s, (self.x - self.radius, self.y - self.radius))


class Projectile:
    def __init__(self, x, y, dx, dy, speed, damage, pierce, is_explosive=False,
                 splash_radius=0, color=(255, 230, 100), max_range=300, is_laser=False,
                 is_tack=False, is_blade=False, has_cluster=False):
        self.x = float(x)
        self.y = float(y)
        self.dx = float(dx)
        self.dy = float(dy)
        self.speed = float(speed)
        self.damage = damage
        self.pierce = pierce
        self.is_explosive = is_explosive
        self.splash_radius = splash_radius
        self.color = color
        self.max_range = max_range
        self.traveled = 0.0
        self.is_laser = is_laser
        self.is_tack = is_tack
        self.is_blade = is_blade
        self.has_cluster = has_cluster

        self.hit_bloons = set()
        self.is_dead = False

    def update(self, dt):
        step = self.speed * (dt * 60.0)
        self.x += self.dx * step
        self.y += self.dy * step
        self.traveled += step

        if self.traveled >= self.max_range:
            self.is_dead = True

    def draw(self, surface):
        if self.is_dead:
            return
        ix = int(self.x)
        iy = int(self.y)

        if self.is_explosive:
            sprite = get_projectile_sprite("bomb_tower_bomb_01", (18, 20))
            if sprite:
                ang_deg = math.degrees(-math.atan2(self.dy, self.dx)) - 90
                rotated = pygame.transform.rotate(sprite, ang_deg)
                rect = rotated.get_rect(center=(ix, iy))
                surface.blit(rotated, rect)
            else:
                pygame.draw.circle(surface, (40, 40, 45), (ix, iy), 6)
                pygame.draw.circle(surface, (255, 100, 0), (ix, iy), 3)

        elif self.is_tack or self.is_blade:
            sprite_name = "tack_shooter_blades_01" if self.is_blade else "tacks_01"
            size = (16, 16) if self.is_blade else (12, 10)
            sprite = get_projectile_sprite(sprite_name, size)
            if sprite:
                ang_deg = math.degrees(-math.atan2(self.dy, self.dx))
                rotated = pygame.transform.rotate(sprite, ang_deg)
                rect = rotated.get_rect(center=(ix, iy))
                surface.blit(rotated, rect)
            else:
                tail_x = int(self.x - self.dx * 7)
                tail_y = int(self.y - self.dy * 7)
                pygame.draw.line(surface, self.color, (tail_x, tail_y), (ix, iy), 3)

        elif self.is_laser:
            tail_x = int(self.x - self.dx * 16)
            tail_y = int(self.y - self.dy * 16)
            pygame.draw.line(surface, self.color, (tail_x, tail_y), (ix, iy), 4)

        else:
            # Dart projectile
            tail_x = int(self.x - self.dx * 8)
            tail_y = int(self.y - self.dy * 8)
            pygame.draw.line(surface, self.color, (tail_x, tail_y), (ix, iy), 3)
            pygame.draw.circle(surface, (255, 215, 0), (ix, iy), 2)


class Tower:
    def __init__(self, tower_key, x, y, is_ai=False):
        self.key = tower_key
        self.spec = TOWER_TYPES[tower_key]
        self.name = self.spec["name"]
        self.x = int(x)
        self.y = int(y)
        self.is_ai = is_ai

        self.range = self.spec["range"]
        self.fire_rate = self.spec["fire_rate"]
        self.damage = self.spec["damage"]
        self.pierce = self.spec["pierce"]
        self.proj_speed = self.spec["proj_speed"]
        self.color = self.spec["color"]
        self.is_explosive = self.spec.get("is_explosive", False)
        self.splash_radius = self.spec.get("splash_radius", 0)
        self.is_omni = self.spec.get("is_omni", False)
        self.tacks_count = self.spec.get("tacks_count", 8)
        self.extra_projectiles = 0
        self.has_cluster = False
        self.is_laser = (tower_key == "SuperMonkey")
        self.is_blade = False

        self.upgrades_applied = 0
        self.cooldown_timer = 0.0
        self.angle = 0.0
        self.targeting_mode = "First"
        self.total_pops = 0

    def can_upgrade(self):
        return self.upgrades_applied < len(self.spec.get("upgrades", []))

    def get_next_upgrade(self):
        if self.can_upgrade():
            return self.spec["upgrades"][self.upgrades_applied]
        return None

    def apply_upgrade(self):
        if not self.can_upgrade():
            return False
        up = self.spec["upgrades"][self.upgrades_applied]
        if "range" in up:
            self.range = up["range"]
        if "fire_rate" in up:
            self.fire_rate = up["fire_rate"]
        if "damage" in up:
            self.damage = up["damage"]
        if "pierce" in up:
            self.pierce = up["pierce"]
        if "splash_radius" in up:
            self.splash_radius = up["splash_radius"]
        if "extra_projectiles" in up:
            self.extra_projectiles += up["extra_projectiles"]
        if "has_cluster" in up:
            self.has_cluster = up["has_cluster"]
        if "color" in up:
            self.color = up["color"]
        if self.key == "TackShooter" and self.upgrades_applied >= 1:
            self.is_blade = True

        self.upgrades_applied += 1
        SoundManager.get_instance().play("upgrade")
        return True

    def find_target(self, bloons):
        candidates = []
        for b in bloons:
            if b.is_dead:
                continue
            dist = math.hypot(b.x - self.x, b.y - self.y)
            if dist <= self.range:
                candidates.append((b, dist))

        if not candidates:
            return None

        if self.targeting_mode == "First":
            return max(candidates, key=lambda c: c[0].progress_dist)[0]
        elif self.targeting_mode == "Last":
            return min(candidates, key=lambda c: c[0].progress_dist)[0]
        elif self.targeting_mode == "Strong":
            return max(candidates, key=lambda c: (c[0].hp, c[0].progress_dist))[0]
        elif self.targeting_mode == "Close":
            return min(candidates, key=lambda c: c[1])[0]

        return candidates[0][0]

    def update(self, dt, bloons):
        new_projectiles = []
        if self.cooldown_timer > 0:
            self.cooldown_timer -= dt

        target = self.find_target(bloons)
        if target:
            dx = target.x - self.x
            dy = target.y - self.y
            self.angle = math.atan2(dy, dx)

        if self.cooldown_timer <= 0 and target:
            self.cooldown_timer = self.fire_rate

            if self.is_omni:
                angles = [i * (2 * math.pi / self.tacks_count) for i in range(self.tacks_count)]
                for ang in angles:
                    pdx = math.cos(ang)
                    pdy = math.sin(ang)
                    new_projectiles.append(
                        Projectile(self.x, self.y, pdx, pdy, self.proj_speed,
                                   self.damage, self.pierce, max_range=self.range,
                                   color=(240, 240, 240), is_tack=not self.is_blade,
                                   is_blade=self.is_blade)
                    )

            elif self.is_explosive:
                dist = math.hypot(target.x - self.x, target.y - self.y)
                pdx = math.cos(self.angle)
                pdy = math.sin(self.angle)
                new_projectiles.append(
                    Projectile(self.x, self.y, pdx, pdy, self.proj_speed,
                               self.damage, self.pierce, is_explosive=True,
                               splash_radius=self.splash_radius, max_range=dist + 15,
                               has_cluster=self.has_cluster)
                )

            else:
                pdx = math.cos(self.angle)
                pdy = math.sin(self.angle)
                proj_color = (255, 50, 50) if self.is_laser else (240, 190, 80)
                new_projectiles.append(
                    Projectile(self.x, self.y, pdx, pdy, self.proj_speed,
                               self.damage, self.pierce, max_range=self.range + 20,
                               color=proj_color, is_laser=self.is_laser)
                )

                if self.extra_projectiles > 0:
                    spread_angles = [-0.22, 0.22]
                    for sp in spread_angles[:self.extra_projectiles]:
                        sp_ang = self.angle + sp
                        sp_pdx = math.cos(sp_ang)
                        sp_pdy = math.sin(sp_ang)
                        new_projectiles.append(
                            Projectile(self.x, self.y, sp_pdx, sp_pdy, self.proj_speed,
                                       self.damage, self.pierce, max_range=self.range + 20,
                                       color=proj_color, is_laser=self.is_laser)
                        )

        return new_projectiles

    def draw(self, surface, is_selected=False):
        if is_selected:
            range_surf = pygame.Surface((self.range * 2, self.range * 2), pygame.SRCALPHA)
            pygame.draw.circle(range_surf, (255, 255, 255, 40), (self.range, self.range), self.range)
            pygame.draw.circle(range_surf, (255, 255, 255, 140), (self.range, self.range), self.range, 2)
            surface.blit(range_surf, (self.x - self.range, self.y - self.range))

        # Base Platform
        base_color = (55, 60, 75) if not self.is_ai else (75, 45, 55)
        pygame.draw.circle(surface, base_color, (self.x, self.y), 22)
        pygame.draw.circle(surface, (25, 25, 30), (self.x, self.y), 22, 2)

        sprite = get_tower_sprite(self.key, (40, 40))
        if sprite:
            rect = sprite.get_rect(center=(self.x, self.y))
            surface.blit(sprite, rect)

            # Directional aim indicator
            aim_len = 24
            aim_x = int(self.x + math.cos(self.angle) * aim_len)
            aim_y = int(self.y + math.sin(self.angle) * aim_len)
            pointer_col = (255, 50, 50) if self.is_laser else (255, 215, 0)
            pygame.draw.circle(surface, pointer_col, (aim_x, aim_y), 4)
            pygame.draw.circle(surface, (20, 20, 20), (aim_x, aim_y), 4, 1)
        else:
            pygame.draw.circle(surface, self.color, (self.x, self.y), 15)
            pygame.draw.circle(surface, (20, 20, 20), (self.x, self.y), 15, 2)

        if self.upgrades_applied > 0:
            for i in range(self.upgrades_applied):
                star_x = self.x - 8 + i * 16
                star_y = self.y - 24
                pygame.draw.circle(surface, (255, 215, 0), (star_x, star_y), 3)
