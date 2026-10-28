"""
Battlefield Manager with Authentic Textures & Explosions for Bloons TD Battles
"""

import math
import os
import random
import pygame
from config import (
    TRACK_WAYPOINTS_LOCAL, STARTING_LIVES, STARTING_CASH, STARTING_ECO,
    ECO_INTERVAL_SECONDS, COLOR_TRACK, COLOR_TRACK_BORDER, BLOON_TYPES
)
from bloons import Bloon
from towers import Tower, Projectile, ExplosionEffect
from audio import SoundManager

_MAP_BG_TEXTURE = None

def get_battle_map_texture(width, height):
    global _MAP_BG_TEXTURE
    if _MAP_BG_TEXTURE is None:
        path = os.path.join(os.path.dirname(__file__), "assets", "ui", "map_battle_sands.jpg")
        if os.path.exists(path):
            try:
                raw = pygame.image.load(path).convert()
                _MAP_BG_TEXTURE = pygame.transform.smoothscale(raw, (width, height))
            except Exception:
                _MAP_BG_TEXTURE = False
        else:
            _MAP_BG_TEXTURE = False
    return _MAP_BG_TEXTURE if _MAP_BG_TEXTURE is not False else None


class FloatingText:
    def __init__(self, text, x, y, color=(255, 255, 255), duration=0.8):
        self.text = text
        self.x = float(x)
        self.y = float(y)
        self.color = color
        self.duration = duration
        self.elapsed = 0.0

    def update(self, dt):
        self.elapsed += dt
        self.y -= 25.0 * dt

    def is_expired(self):
        return self.elapsed >= self.duration

    def draw(self, surface, font):
        alpha = max(0, min(255, int(255 * (1.0 - self.elapsed / self.duration))))
        rendered = font.render(self.text, True, self.color)
        rendered.set_alpha(alpha)
        surface.blit(rendered, (int(self.x), int(self.y)))


class Battlefield:
    def __init__(self, bounds, name="Player", is_ai=False):
        self.bounds = bounds
        self.name = name
        self.is_ai = is_ai

        self.origin = (bounds["x"], bounds["y"])
        self.width = bounds["w"]
        self.height = bounds["h"]

        self.waypoints = [
            (pt[0], pt[1]) for pt in TRACK_WAYPOINTS_LOCAL
        ]

        self.lives = STARTING_LIVES
        self.cash = STARTING_CASH
        self.eco = STARTING_ECO
        self.eco_timer = 0.0

        self.towers = []
        self.bloons = []
        self.projectiles = []
        self.explosions = []
        self.floating_texts = []
        self.selected_tower = None

        self.match_time = 0.0
        self.wave_spawn_timer = 0.0

        self.incoming_bloons_queue = []
        self.queue_timer = 0.0

    def get_track_mask_distance(self, x, y):
        local_x = x - self.origin[0]
        local_y = y - self.origin[1]
        min_dist = float("inf")

        for i in range(len(self.waypoints) - 1):
            p1 = self.waypoints[i]
            p2 = self.waypoints[i + 1]
            vx = p2[0] - p1[0]
            vy = p2[1] - p1[1]
            seg_len_sq = vx * vx + vy * vy
            if seg_len_sq == 0:
                dist = math.hypot(local_x - p1[0], local_y - p1[1])
            else:
                t = max(0.0, min(1.0, ((local_x - p1[0]) * vx + (local_y - p1[1]) * vy) / seg_len_sq))
                proj_x = p1[0] + t * vx
                proj_y = p1[1] + t * vy
                dist = math.hypot(local_x - proj_x, local_y - proj_y)
            if dist < min_dist:
                min_dist = dist

        return min_dist

    def can_place_tower(self, x, y):
        margin = 25
        if not (self.origin[0] + margin <= x <= self.origin[0] + self.width - margin and
                self.origin[1] + margin <= y <= self.origin[1] + self.height - margin):
            return False

        if self.get_track_mask_distance(x, y) < 32:
            return False

        for t in self.towers:
            if math.hypot(t.x - x, t.y - y) < 36:
                return False

        return True

    def place_tower(self, tower_key, x, y):
        from config import TOWER_TYPES
        cost = TOWER_TYPES[tower_key]["cost"]
        if self.cash >= cost and self.can_place_tower(x, y):
            self.cash -= cost
            tower = Tower(tower_key, x, y, is_ai=self.is_ai)
            self.towers.append(tower)
            if not self.is_ai:
                SoundManager.get_instance().play("place")
                self.floating_texts.append(FloatingText(f"-${cost}", x, y - 20, (230, 80, 80)))
            return tower
        return None

    def queue_rush_bloon(self, bloon_type):
        self.incoming_bloons_queue.append(bloon_type)

    def spawn_bloon(self, bloon_type):
        bloon = Bloon(bloon_type, self.waypoints, self.origin, progress_dist=0.0)
        self.bloons.append(bloon)

    def update(self, dt):
        self.match_time += dt

        # Eco tick
        self.eco_timer += dt
        if self.eco_timer >= ECO_INTERVAL_SECONDS:
            self.eco_timer -= ECO_INTERVAL_SECONDS
            self.cash += int(self.eco)
            if not self.is_ai:
                self.floating_texts.append(
                    FloatingText(f"+${int(self.eco)} Eco", self.origin[0] + 60, self.origin[1] + 20, (46, 204, 113), 1.2)
                )

        # Natural waves
        self.wave_spawn_timer += dt
        spawn_delay = max(0.8, 3.2 - self.match_time * 0.02)
        if self.wave_spawn_timer >= spawn_delay:
            self.wave_spawn_timer = 0.0
            if self.match_time < 20:
                self.spawn_bloon("Red")
            elif self.match_time < 45:
                self.spawn_bloon(random.choice(["Red", "Blue"]))
            elif self.match_time < 80:
                self.spawn_bloon(random.choice(["Blue", "Green", "Green"]))
            elif self.match_time < 120:
                self.spawn_bloon(random.choice(["Green", "Yellow", "Pink"]))
            elif self.match_time < 180:
                self.spawn_bloon(random.choice(["Yellow", "Pink", "Black", "White"]))
            else:
                self.spawn_bloon(random.choice(["Pink", "Black", "Ceramic"]))

        # Process incoming rushed bloons
        if self.incoming_bloons_queue:
            self.queue_timer += dt
            if self.queue_timer >= 0.25:
                self.queue_timer = 0.0
                rush_type = self.incoming_bloons_queue.pop(0)
                self.spawn_bloon(rush_type)

        # Update bloons
        for b in self.bloons:
            b.update(dt)
            if b.has_leaked:
                leak_damage = 1 if not b.is_blimp else 50
                self.lives = max(0, self.lives - leak_damage)
                self.floating_texts.append(
                    FloatingText(f"-{leak_damage} ❤️", b.x, b.y, (231, 76, 60), 1.0)
                )

        self.bloons = [b for b in self.bloons if not b.is_dead]

        # Update towers
        for t in self.towers:
            new_projs = t.update(dt, self.bloons)
            self.projectiles.extend(new_projs)

        # Update projectiles & collisions
        new_projectiles = []
        for p in self.projectiles:
            p.update(dt)
            if p.is_dead:
                continue

            for b in self.bloons:
                if b.is_dead or id(b) in p.hit_bloons:
                    continue

                dist = math.hypot(b.x - p.x, b.y - p.y)
                if dist <= (b.radius + 6):
                    p.hit_bloons.add(id(b))

                    if p.is_explosive:
                        SoundManager.get_instance().play("explosion")
                        self.explosions.append(ExplosionEffect(p.x, p.y, p.splash_radius))
                        p.is_dead = True
                        splash_r = p.splash_radius
                        for target_b in list(self.bloons):
                            if target_b.is_dead:
                                continue
                            b_dist = math.hypot(target_b.x - p.x, target_b.y - p.y)
                            if b_dist <= splash_r:
                                children, reward = target_b.take_damage(p.damage, is_explosive=True)
                                if reward > 0:
                                    self.cash += reward
                                    SoundManager.get_instance().play("pop")
                                if children:
                                    self.bloons.extend(children)

                        if p.has_cluster:
                            angles = [i * (math.pi / 3) for i in range(6)]
                            for ang in angles:
                                c_dx = math.cos(ang)
                                c_dy = math.sin(ang)
                                new_projectiles.append(
                                    Projectile(p.x, p.y, c_dx, c_dy, 5, 1, 3,
                                               is_explosive=True, splash_radius=25, max_range=40)
                                )
                        break

                    else:
                        children, reward = b.take_damage(p.damage, is_explosive=False)
                        if reward > 0:
                            self.cash += reward
                            SoundManager.get_instance().play("pop")
                        if children:
                            self.bloons.extend(children)

                        p.pierce -= 1
                        if p.pierce <= 0:
                            p.is_dead = True
                            break

            if not p.is_dead:
                new_projectiles.append(p)

        self.projectiles = new_projectiles

        # Update explosions
        for exp in self.explosions:
            exp.update(dt)
        self.explosions = [exp for exp in self.explosions if not exp.is_dead]

        # Update floating texts
        for ft in self.floating_texts:
            ft.update(dt)
        self.floating_texts = [ft for ft in self.floating_texts if not ft.is_expired()]

    def draw(self, surface, font):
        bf_rect = pygame.Rect(self.origin[0], self.origin[1], self.width, self.height)

        # 1. Authentic Ground Texture
        map_bg = get_battle_map_texture(self.width, self.height)
        if map_bg:
            surface.blit(map_bg, (self.origin[0], self.origin[1]))
        else:
            pygame.draw.rect(surface, (190, 160, 110), bf_rect, border_radius=8)

        # 2. Render Track S-curve
        track_width = 34
        border_width = 44

        # Track outer border
        for i in range(len(self.waypoints) - 1):
            p1 = (self.origin[0] + self.waypoints[i][0], self.origin[1] + self.waypoints[i][1])
            p2 = (self.origin[0] + self.waypoints[i + 1][0], self.origin[1] + self.waypoints[i + 1][1])
            pygame.draw.line(surface, COLOR_TRACK_BORDER, p1, p2, border_width)
            pygame.draw.circle(surface, COLOR_TRACK_BORDER, p1, border_width // 2)

        # Track road
        for i in range(len(self.waypoints) - 1):
            p1 = (self.origin[0] + self.waypoints[i][0], self.origin[1] + self.waypoints[i][1])
            p2 = (self.origin[0] + self.waypoints[i + 1][0], self.origin[1] + self.waypoints[i + 1][1])
            pygame.draw.line(surface, COLOR_TRACK, p1, p2, track_width)
            pygame.draw.circle(surface, COLOR_TRACK, p1, track_width // 2)

        start_pt = (self.origin[0] + self.waypoints[0][0], self.origin[1] + self.waypoints[0][1])
        end_pt = (self.origin[0] + self.waypoints[-1][0], self.origin[1] + self.waypoints[-1][1])
        pygame.draw.circle(surface, (46, 204, 113), start_pt, 10)
        pygame.draw.circle(surface, (231, 76, 60), end_pt, 10)

        # 3. Draw Towers
        for t in self.towers:
            is_sel = (t == self.selected_tower)
            t.draw(surface, is_selected=is_sel)

        # 4. Draw Projectiles
        for p in self.projectiles:
            p.draw(surface)

        # 5. Draw Explosions
        for exp in self.explosions:
            exp.draw(surface)

        # 6. Draw Bloons
        for b in self.bloons:
            b.draw(surface)

        # 7. Floating texts
        for ft in self.floating_texts:
            ft.draw(surface, font)

        # Border
        border_col = (52, 152, 219) if not self.is_ai else (231, 76, 60)
        pygame.draw.rect(surface, border_col, bf_rect, width=3, border_radius=8)
