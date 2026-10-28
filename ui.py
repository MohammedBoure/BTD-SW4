"""
UI, Main Menu, and HUD Components with Authentic Assets for Bloons TD Battles
"""

import math
import os
import pygame
from config import (
    COLOR_BG, COLOR_PANEL_BG, COLOR_PANEL_BORDER, COLOR_TEXT_LIGHT,
    COLOR_TEXT_MUTED, COLOR_GOLD, COLOR_GREEN, COLOR_RED, COLOR_BLUE,
    TOWER_TYPES, BLOON_TYPES, ECO_INTERVAL_SECONDS
)
from towers import get_tower_sprite
from audio import SoundManager

_UI_SPRITE_CACHE = {}

def get_ui_sprite(name, size=None):
    cache_key = (name, size)
    if cache_key in _UI_SPRITE_CACHE:
        return _UI_SPRITE_CACHE[cache_key]

    path = os.path.join(os.path.dirname(__file__), "assets", "ui", f"{name}.png")
    sprite = None
    if os.path.exists(path):
        try:
            raw = pygame.image.load(path).convert_alpha()
            if size:
                raw = pygame.transform.smoothscale(raw, size)
            sprite = raw
        except Exception:
            sprite = None
    _UI_SPRITE_CACHE[cache_key] = sprite
    return sprite


class Button:
    def __init__(self, rect, label, sublabel="", color=(40, 48, 64), hover_color=(55, 65, 88),
                 action_id=None, border_color=(70, 85, 110)):
        self.rect = pygame.Rect(rect)
        self.label = label
        self.sublabel = sublabel
        self.color = color
        self.hover_color = hover_color
        self.border_color = border_color
        self.action_id = action_id
        self.is_hovered = False

    def update(self, mouse_pos):
        self.is_hovered = self.rect.collidepoint(mouse_pos)

    def draw(self, surface, font_main, font_sub, enabled=True, icon_sprite=None):
        btn_tex = get_ui_sprite("rect_button_pressed" if (self.is_hovered and enabled) else "rect_button", (self.rect.w, self.rect.h))
        if btn_tex and enabled:
            surface.blit(btn_tex, self.rect)
        else:
            bg = self.hover_color if (self.is_hovered and enabled) else self.color
            if not enabled:
                bg = (30, 34, 44)
            pygame.draw.rect(surface, bg, self.rect, border_radius=6)
            border_col = self.border_color if enabled else (50, 55, 65)
            pygame.draw.rect(surface, border_col, self.rect, width=2, border_radius=6)

        text_offset_x = 0
        if icon_sprite:
            icon_rect = icon_sprite.get_rect(midleft=(self.rect.x + 6, self.rect.centery))
            surface.blit(icon_sprite, icon_rect)
            text_offset_x = 18

        text_col = COLOR_TEXT_LIGHT if enabled else (110, 115, 130)
        lbl_surf = font_main.render(self.label, True, text_col)
        surface.blit(lbl_surf, (self.rect.x + text_offset_x + (self.rect.w - text_offset_x - lbl_surf.get_width()) // 2, self.rect.y + 6))

        if self.sublabel:
            sub_col = COLOR_GOLD if enabled else (120, 110, 80)
            sub_surf = font_sub.render(self.sublabel, True, sub_col)
            surface.blit(sub_surf, (self.rect.x + text_offset_x + (self.rect.w - text_offset_x - sub_surf.get_width()) // 2, self.rect.y + 26))


class MainMenu:
    def __init__(self, screen_w, screen_h):
        self.w = screen_w
        self.h = screen_h
        self.anim_time = 0.0

        # Menu buttons
        btn_w = 320
        btn_h = 60
        cx = (screen_w - btn_w) // 2

        self.play_btn = Button((cx, 440, btn_w, btn_h), "⚔️ QUICK BATTLE (VS AI)", "Enter the arena!", color=(46, 125, 50), hover_color=(56, 150, 60))
        self.how_btn = Button((cx, 515, btn_w, 48), "📖 HOW TO PLAY", "Controls & Guide", color=(40, 70, 110), hover_color=(50, 90, 140))
        self.quit_btn = Button((cx, 575, btn_w, 45), "🚪 QUIT GAME", "", color=(120, 40, 40), hover_color=(150, 50, 50))

        self.show_how_to_play = False

    def update(self, dt, mouse_pos):
        self.anim_time += dt
        self.play_btn.update(mouse_pos)
        self.how_btn.update(mouse_pos)
        self.quit_btn.update(mouse_pos)

    def draw(self, surface, fonts):
        # 1. Sky & Sea Background
        surface.fill((90, 175, 235))

        sea_tex = get_ui_sprite("sea", (self.w, 400))
        if sea_tex:
            surface.blit(sea_tex, (0, self.h - 400))

        # 2. Island & Colosseum
        island_tex = get_ui_sprite("island", (500, 180))
        if island_tex:
            surface.blit(island_tex, (self.w // 2 - 250, self.h - 320))

        colosseum_tex = get_ui_sprite("colosseum", (260, 180))
        if colosseum_tex:
            surface.blit(colosseum_tex, (self.w - 320, 240))

        # 3. Buccaneer Ship with gentle bobbing
        buccaneer_tex = get_ui_sprite("buccaneer", (260, 320))
        if buccaneer_tex:
            bob = math.sin(self.anim_time * 2.0) * 8
            surface.blit(buccaneer_tex, (60, int(220 + bob)))

        # 4. Animated Clouds
        cloud_tex = get_ui_sprite("cloud_01", (360, 70))
        if cloud_tex:
            c_x1 = int((self.anim_time * 20) % (self.w + 400)) - 400
            surface.blit(cloud_tex, (c_x1, 40))
            c_x2 = int((self.anim_time * 14 + 600) % (self.w + 400)) - 400
            surface.blit(cloud_tex, (c_x2, 110))

        # 5. Floating "Bloons TD Battles" Logo
        logo = get_ui_sprite("title_text", (520, 260))
        if logo:
            logo_bob = math.sin(self.anim_time * 2.5) * 6
            surface.blit(logo, ((self.w - 520) // 2, int(80 + logo_bob)))
        else:
            t_surf = fonts["large"].render("BLOONS TD BATTLES", True, COLOR_GOLD)
            surface.blit(t_surf, ((self.w - t_surf.get_width()) // 2, 120))

        # 6. Buttons
        self.play_btn.draw(surface, fonts["header"], fonts["sub"], enabled=True)
        self.how_btn.draw(surface, fonts["header"], fonts["sub"], enabled=True)
        self.quit_btn.draw(surface, fonts["header"], fonts["sub"], enabled=True)

        # Version stamp
        v_surf = fonts["sub"].render("Reverse-Engineered with REA (Reverse Engineer Anything) — Python Edition", True, (240, 245, 255))
        surface.blit(v_surf, ((self.w - v_surf.get_width()) // 2, self.h - 24))

        # How to Play Modal
        if self.show_how_to_play:
            overlay = pygame.Surface((self.w, self.h), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 210))
            surface.blit(overlay, (0, 0))

            card = pygame.Rect(self.w // 2 - 320, 100, 640, 520)
            pygame.draw.rect(surface, (28, 35, 49), card, border_radius=10)
            pygame.draw.rect(surface, COLOR_GOLD, card, width=2, border_radius=10)

            title = fonts["large"].render("HOW TO PLAY BLOONS TD BATTLES", True, COLOR_GOLD)
            surface.blit(title, (card.x + (card.w - title.get_width()) // 2, card.y + 20))

            lines = [
                ("1. DEFEND YOUR SIDE (Left):", COLOR_BLUE),
                ("   - Build towers (Dart Monkey, Tack Shooter, Bomb Tower, Super Monkey).", COLOR_TEXT_LIGHT),
                ("   - Use keys 1, 2, 3, 4 to quickly select towers.", COLOR_TEXT_LIGHT),
                ("   - Click on towers to upgrade or sell them for extra cash.", COLOR_TEXT_LIGHT),
                ("", COLOR_TEXT_LIGHT),
                ("2. ATTACK OPPONENT (Right):", COLOR_RED),
                ("   - Use keys Q, W, E, R, T, Y, U, I to send bloon rushes directly to the AI!", COLOR_TEXT_LIGHT),
                ("   - Sending bloons costs money upfront, but PERMANENTLY INCREASES ECO!", COLOR_TEXT_LIGHT),
                ("   - Eco pays out free cash every 6 seconds.", COLOR_TEXT_LIGHT),
                ("", COLOR_TEXT_LIGHT),
                ("3. WINNING:", COLOR_GREEN),
                ("   - If the AI leaks all 150 lives first, YOU WIN!", COLOR_TEXT_LIGHT),
                ("   - If your defenses leak all 150 lives, DEFEAT!", COLOR_TEXT_LIGHT),
            ]

            y_cursor = card.y + 75
            for txt, col in lines:
                l_surf = fonts["body"].render(txt, True, col)
                surface.blit(l_surf, (card.x + 30, y_cursor))
                y_cursor += 24

            close_surf = fonts["header"].render("[CLICK ANYWHERE OR PRESS ESC TO CLOSE]", True, COLOR_GOLD)
            surface.blit(close_surf, (card.x + (card.w - close_surf.get_width()) // 2, card.y + card.h - 40))


class UIManager:
    def __init__(self, screen_w, screen_h):
        self.w = screen_w
        self.h = screen_h

        pygame.font.init()
        self.font_title = pygame.font.SysFont("Arial", 22, bold=True)
        self.font_header = pygame.font.SysFont("Arial", 16, bold=True)
        self.font_body = pygame.font.SysFont("Arial", 13)
        self.font_sub = pygame.font.SysFont("Arial", 11)
        self.font_large = pygame.font.SysFont("Arial", 36, bold=True)

        self.fonts = {
            "title": self.font_title,
            "header": self.font_header,
            "body": self.font_body,
            "sub": self.font_sub,
            "large": self.font_large
        }

        # Build tower buttons
        self.tower_buttons = []
        tower_keys = list(TOWER_TYPES.keys())
        btn_w = 110
        btn_h = 50
        start_x = 30
        start_y = 540
        for i, t_key in enumerate(tower_keys):
            spec = TOWER_TYPES[t_key]
            lbl = f"[{i+1}] {spec['name'][:8]}"
            sub = f"${spec['cost']}"
            btn = Button(
                (start_x + i * (btn_w + 12), start_y, btn_w, btn_h),
                lbl, sub, action_id=f"build_{t_key}"
            )
            self.tower_buttons.append((btn, t_key, spec["cost"]))

        # Rush bloon buttons
        self.rush_buttons = []
        rush_keys = ["Red", "Blue", "Green", "Yellow", "Pink", "Black", "Ceramic", "MOAB"]
        r_btn_w = 60
        r_btn_h = 50
        r_start_x = 740
        r_start_y = 540
        hotkeys = ["Q", "W", "E", "R", "T", "Y", "U", "I"]
        for i, r_key in enumerate(rush_keys):
            spec = BLOON_TYPES[r_key]
            hk = hotkeys[i] if i < len(hotkeys) else ""
            lbl = f"[{hk}] {r_key[:3]}"
            sub = f"${spec['send_cost']}"
            btn = Button(
                (r_start_x + i * (r_btn_w + 6), r_start_y, r_btn_w, r_btn_h),
                lbl, sub, action_id=f"rush_{r_key}",
                border_color=spec["color"]
            )
            self.rush_buttons.append((btn, r_key, spec["send_cost"]))

        self.upgrade_btn = Button((240, 604, 180, 52), "Upgrade", "", color=(46, 125, 50), hover_color=(56, 142, 60))
        self.sell_btn = Button((435, 604, 90, 52), "Sell", "", color=(160, 40, 40), hover_color=(190, 50, 50))

    def update(self, mouse_pos):
        for btn, _, _ in self.tower_buttons:
            btn.update(mouse_pos)
        for btn, _, _ in self.rush_buttons:
            btn.update(mouse_pos)
        self.upgrade_btn.update(mouse_pos)
        self.sell_btn.update(mouse_pos)

    def draw_hud(self, surface, player_bf, opponent_bf, selected_tower_to_place=None):
        # 1. Top Navigation Bar
        top_bar_rect = pygame.Rect(0, 0, self.w, 52)
        pygame.draw.rect(surface, COLOR_PANEL_BG, top_bar_rect)
        pygame.draw.line(surface, COLOR_PANEL_BORDER, (0, 52), (self.w, 52), 2)

        # Player stats
        p_lives = f"❤️ {player_bf.lives}"
        p_cash = f"💰 ${player_bf.cash}"
        p_eco = f"📈 +${int(player_bf.eco)}/6s"

        p_name_surf = self.font_header.render("PLAYER (YOU)", True, COLOR_BLUE)
        p_lives_surf = self.font_header.render(p_lives, True, COLOR_RED)
        p_cash_surf = self.font_header.render(p_cash, True, COLOR_GOLD)
        p_eco_surf = self.font_header.render(p_eco, True, COLOR_GREEN)

        surface.blit(p_name_surf, (30, 16))
        surface.blit(p_lives_surf, (160, 16))
        surface.blit(p_cash_surf, (240, 16))
        surface.blit(p_eco_surf, (340, 16))

        # Eco progress bar
        eco_ratio = min(1.0, player_bf.eco_timer / ECO_INTERVAL_SECONDS)
        pygame.draw.rect(surface, (30, 40, 50), (460, 20, 80, 12), border_radius=4)
        pygame.draw.rect(surface, COLOR_GREEN, (460, 20, int(80 * eco_ratio), 12), border_radius=4)

        # Center Match Time
        sec = int(player_bf.match_time) % 60
        mins = int(player_bf.match_time) // 60
        time_text = f"⏳ {mins:02d}:{sec:02d}"
        time_surf = self.font_header.render(time_text, True, COLOR_TEXT_LIGHT)
        surface.blit(time_surf, ((self.w - time_surf.get_width()) // 2, 16))

        # Opponent stats
        ai_name_surf = self.font_header.render("OPPONENT (AI)", True, COLOR_RED)
        ai_lives_surf = self.font_header.render(f"❤️ {opponent_bf.lives}", True, COLOR_RED)
        ai_cash_surf = self.font_header.render(f"💰 ${opponent_bf.cash}", True, COLOR_GOLD)
        ai_eco_surf = self.font_header.render(f"📈 +${int(opponent_bf.eco)}/6s", True, COLOR_GREEN)

        surface.blit(ai_name_surf, (740, 16))
        surface.blit(ai_lives_surf, (870, 16))
        surface.blit(ai_cash_surf, (950, 16))
        surface.blit(ai_eco_surf, (1050, 16))

        # 2. Authentic Lower HUD Background
        bot_bar_rect = pygame.Rect(0, 526, self.w, 194)
        lower_hud = get_ui_sprite("lower_hud_bg", (self.w, 194))
        if lower_hud:
            surface.blit(lower_hud, bot_bar_rect)
        else:
            pygame.draw.rect(surface, COLOR_PANEL_BG, bot_bar_rect)
            pygame.draw.line(surface, COLOR_PANEL_BORDER, (0, 526), (self.w, 526), 2)

        # Headers
        t_title = self.font_header.render("DEFENSE — BUILD TOWERS", True, COLOR_TEXT_LIGHT)
        surface.blit(t_title, (30, 515))

        r_title = self.font_header.render("OFFENSE — RUSH OPPONENT (Increases Eco!)", True, COLOR_TEXT_LIGHT)
        surface.blit(r_title, (740, 515))

        # Draw Build Buttons
        for btn, t_key, cost in self.tower_buttons:
            enabled = (player_bf.cash >= cost)
            is_active = (selected_tower_to_place == t_key)
            if is_active:
                btn.color = (60, 90, 130)
            else:
                btn.color = (40, 48, 64)
            sprite = get_tower_sprite(t_key, (34, 34))
            btn.draw(surface, self.font_body, self.font_sub, enabled=enabled, icon_sprite=sprite)

        # Draw Rush Buttons
        for btn, r_key, send_cost in self.rush_buttons:
            enabled = (player_bf.cash >= send_cost)
            btn.draw(surface, self.font_body, self.font_sub, enabled=enabled)

        # 3. Selected Tower Details
        sel_tower = player_bf.selected_tower
        if sel_tower:
            box_rect = pygame.Rect(30, 596, 505, 70)
            pygame.draw.rect(surface, (24, 30, 42), box_rect, border_radius=6)
            pygame.draw.rect(surface, COLOR_GOLD, box_rect, width=1, border_radius=6)

            icon_lg = get_tower_sprite(sel_tower.key, (54, 54))
            if icon_lg:
                surface.blit(icon_lg, (38, 604))
                text_x = 100
            else:
                text_x = 42

            name_text = f"{sel_tower.name} (Rank: {sel_tower.upgrades_applied})"
            n_surf = self.font_header.render(name_text, True, COLOR_GOLD)
            surface.blit(n_surf, (text_x, 606))

            desc_text = f"Range: {sel_tower.range} | Speed: {sel_tower.fire_rate}s"
            d_surf = self.font_sub.render(desc_text, True, COLOR_TEXT_MUTED)
            surface.blit(d_surf, (text_x, 630))

            up_spec = sel_tower.get_next_upgrade()
            if up_spec:
                self.upgrade_btn.label = f"Upgrade: {up_spec['name'][:10]}"
                self.upgrade_btn.sublabel = f"${up_spec['cost']} ({up_spec['desc'][:16]})"
                can_afford = (player_bf.cash >= up_spec["cost"])
                self.upgrade_btn.draw(surface, self.font_sub, self.font_sub, enabled=can_afford)
            else:
                max_surf = self.font_body.render("★ MAX LEVEL ★", True, COLOR_GOLD)
                surface.blit(max_surf, (260, 622))

            refund = int(sel_tower.spec["cost"] * 0.7)
            self.sell_btn.label = "Sell"
            self.sell_btn.sublabel = f"+${refund}"
            self.sell_btn.draw(surface, self.font_body, self.font_sub, enabled=True)
        else:
            hint = self.font_body.render("💡 Click a tower to view upgrades & targeting. Press 1-4 for towers, Q-I to rush!", True, (220, 230, 245))
            surface.blit(hint, (30, 620))

    def draw_game_over(self, surface, winner):
        overlay = pygame.Surface((self.w, self.h), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 200))
        surface.blit(overlay, (0, 0))

        if winner == "Player":
            msg = "🏆 VICTORY! YOU POPPED THE OPPONENT! 🏆"
            col = COLOR_GREEN
        else:
            msg = "💥 DEFEAT! YOUR DEFENSES LEAKED! 💥"
            col = COLOR_RED

        text_surf = self.font_large.render(msg, True, col)
        surface.blit(text_surf, ((self.w - text_surf.get_width()) // 2, self.h // 2 - 50))

        sub_surf = self.font_title.render("Press [R] or Click to Play Again", True, COLOR_TEXT_LIGHT)
        surface.blit(sub_surf, ((self.w - sub_surf.get_width()) // 2, self.h // 2 + 20))
