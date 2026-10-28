"""
Bloon Entities with Authentic Sprites & Sounds for Bloons TD Battles
"""

import math
import os
import pygame
from config import BLOON_TYPES
from audio import SoundManager

_BLOON_SPRITE_CACHE = {}

def get_bloon_sprite(bloon_type_name, size=(32, 38)):
    cache_key = (bloon_type_name, size)
    if cache_key in _BLOON_SPRITE_CACHE:
        return _BLOON_SPRITE_CACHE[cache_key]

    base_dir = os.path.join(os.path.dirname(__file__), "assets", "bloons")
    sprite = None

    if bloon_type_name == "MOAB":
        moab_path = os.path.join(base_dir, "moab.png")
        if os.path.exists(moab_path):
            raw = pygame.image.load(moab_path).convert_alpha()
            sprite = pygame.transform.smoothscale(raw, size)

    elif bloon_type_name == "Ceramic":
        c_path = os.path.join(base_dir, "bloon_ceramic.png")
        if os.path.exists(c_path):
            raw = pygame.image.load(c_path).convert_alpha()
            sprite = pygame.transform.smoothscale(raw, size)

    elif bloon_type_name in ["Black", "White"]:
        lead_path = os.path.join(base_dir, "bloon_lead.png")
        if os.path.exists(lead_path):
            raw = pygame.image.load(lead_path).convert_alpha()
            sprite = pygame.transform.smoothscale(raw, size)

    # Standard bloons tinted from stock_bloon
    if sprite is None:
        stock_path = os.path.join(base_dir, "stock_bloon.png")
        if os.path.exists(stock_path):
            raw = pygame.image.load(stock_path).convert_alpha()
            scaled = pygame.transform.smoothscale(raw, size)
            # Tint with bloon color
            color = BLOON_TYPES.get(bloon_type_name, {}).get("color", (255, 50, 50))
            tinted = scaled.copy()
            tinted.fill(color, special_flags=pygame.BLEND_MULT)
            sprite = tinted

    _BLOON_SPRITE_CACHE[cache_key] = sprite
    return sprite


class Bloon:
    def __init__(self, bloon_type_name, path_waypoints, battlefield_origin, progress_dist=0.0):
        self.type_name = bloon_type_name
        self.spec = BLOON_TYPES.get(bloon_type_name, BLOON_TYPES["Red"])
        self.hp = self.spec["hp"]
        self.speed = self.spec["speed"]
        self.color = self.spec["color"]
        self.radius = self.spec["radius"]
        self.reward = self.spec["reward"]
        self.immune_explosion = self.spec.get("immune_explosion", False)
        self.is_blimp = self.spec.get("is_blimp", False)

        self.waypoints = path_waypoints
        self.bf_origin = battlefield_origin
        self.progress_dist = progress_dist

        # Compute path segments and total length
        self.segments = []
        self.total_path_len = 0.0
        for i in range(len(self.waypoints) - 1):
            p1 = self.waypoints[i]
            p2 = self.waypoints[i + 1]
            dx = p2[0] - p1[0]
            dy = p2[1] - p1[1]
            seg_len = math.hypot(dx, dy)
            self.segments.append((p1, p2, dx, dy, seg_len, self.total_path_len))
            self.total_path_len += seg_len

        self.x = 0
        self.y = 0
        self.has_leaked = False
        self.is_dead = False
        self._update_position()

    def _update_position(self):
        if self.progress_dist >= self.total_path_len:
            self.has_leaked = True
            self.is_dead = True
            return

        cur_dist = self.progress_dist
        for p1, p2, dx, dy, seg_len, seg_start in self.segments:
            if seg_start <= cur_dist <= seg_start + seg_len:
                t = (cur_dist - seg_start) / seg_len if seg_len > 0 else 0
                local_x = p1[0] + dx * t
                local_y = p1[1] + dy * t
                self.x = self.bf_origin[0] + local_x
                self.y = self.bf_origin[1] + local_y
                return

        last = self.waypoints[-1]
        self.x = self.bf_origin[0] + last[0]
        self.y = self.bf_origin[1] + last[1]

    def update(self, dt):
        if self.is_dead:
            return
        self.progress_dist += self.speed * (dt * 60.0)
        self._update_position()

    def take_damage(self, amount, is_explosive=False):
        if is_explosive and self.immune_explosion:
            SoundManager.get_instance().play("metal_hit")
            return None, 0

        self.hp -= amount
        reward = 0
        children = []

        if self.is_blimp:
            SoundManager.get_instance().play("moab_damage")

        if self.type_name == "Ceramic" and self.hp > 0:
            SoundManager.get_instance().play("ceramic_hit")

        if self.hp <= 0:
            self.is_dead = True
            reward = self.reward
            if self.is_blimp:
                SoundManager.get_instance().play("moab_destroy")

            child_types = self.spec.get("children", [])
            for c_type in child_types:
                child = Bloon(c_type, self.waypoints, self.bf_origin, progress_dist=max(0, self.progress_dist - 5))
                children.append(child)
            return children, reward

        return children, 0

    def draw(self, surface):
        if self.is_dead:
            return

        ix = int(self.x)
        iy = int(self.y)

        if self.is_blimp:
            # Render MOAB Airship Sprite
            moab_w = int(self.radius * 2.6)
            moab_h = int(self.radius * 2.4)
            sprite = get_bloon_sprite("MOAB", (moab_w, moab_h))
            if sprite:
                s_rect = sprite.get_rect(center=(ix, iy))
                surface.blit(sprite, s_rect)
            else:
                rect = pygame.Rect(ix - moab_w // 2, iy - moab_h // 2, moab_w, moab_h)
                pygame.draw.ellipse(surface, self.color, rect)

            # Health bar above MOAB
            bar_w = 46
            bar_h = 5
            max_hp = self.spec["hp"]
            ratio = max(0, min(1, self.hp / max_hp))
            pygame.draw.rect(surface, (20, 20, 20), (ix - bar_w // 2, iy - moab_h // 2 - 8, bar_w, bar_h))
            pygame.draw.rect(surface, (46, 204, 113), (ix - bar_w // 2, iy - moab_h // 2 - 8, int(bar_w * ratio), bar_h))

        else:
            bw = int(self.radius * 2.0)
            bh = int(self.radius * 2.6)
            sprite = get_bloon_sprite(self.type_name, (bw, bh))
            if sprite:
                s_rect = sprite.get_rect(center=(ix, iy))
                surface.blit(sprite, s_rect)
            else:
                # Fallback oval
                r = int(self.radius)
                oval_rect = pygame.Rect(ix - r, iy - int(r * 1.2), r * 2, int(r * 2.3))
                pygame.draw.ellipse(surface, self.color, oval_rect)
                pygame.draw.ellipse(surface, (40, 40, 40), oval_rect, 1)

            # Ceramic HP indicator
            if self.type_name == "Ceramic" and self.hp < 10:
                bar_w = 22
                ratio = max(0, min(1, self.hp / 10.0))
                pygame.draw.rect(surface, (30, 30, 30), (ix - bar_w // 2, iy - int(self.radius * 1.3) - 5, bar_w, 3))
                pygame.draw.rect(surface, (230, 160, 40), (ix - bar_w // 2, iy - int(self.radius * 1.3) - 5, int(bar_w * ratio), 3))
