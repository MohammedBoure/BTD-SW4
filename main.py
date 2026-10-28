"""
Bloons TD Battles — Main Game Entry Point
Recreated from scratch based on reverse-engineered structural mechanics, authentic graphics & audio.
"""

import sys
import pygame
from config import (
    SCREEN_WIDTH, SCREEN_HEIGHT, FPS, COLOR_BG, BF_PLAYER, BF_OPPONENT,
    TOWER_TYPES, BLOON_TYPES
)
from battlefield import Battlefield
from ai import AIController
from ui import UIManager, MainMenu
from audio import SoundManager

def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Bloons TD Battles — Python Edition")
    clock = pygame.time.Clock()

    sound_mgr = SoundManager.get_instance()
    ui_mgr = UIManager(SCREEN_WIDTH, SCREEN_HEIGHT)
    main_menu = MainMenu(SCREEN_WIDTH, SCREEN_HEIGHT)

    def init_match():
        p_bf = Battlefield(BF_PLAYER, name="Player", is_ai=False)
        ai_bf = Battlefield(BF_OPPONENT, name="Opponent", is_ai=True)
        ai_ctrl = AIController(ai_bf, p_bf)
        sound_mgr.play("new_round")
        return p_bf, ai_bf, ai_ctrl

    player_bf = None
    opponent_bf = None
    ai_controller = None

    selected_tower_to_place = None
    game_state = "MENU"  # MENU, PLAYING, PAUSED, GAME_OVER
    winner = None

    running = True
    while running:
        dt = clock.tick(FPS) / 1000.0
        dt = min(dt, 0.1)
        mouse_pos = pygame.mouse.get_pos()

        # Update hover states
        if game_state == "MENU":
            main_menu.update(dt, mouse_pos)
        else:
            ui_mgr.update(mouse_pos)

        # ----------------- EVENT HANDLING -----------------
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                break

            elif event.type == pygame.KEYDOWN:
                if game_state == "MENU":
                    if event.key == pygame.K_ESCAPE:
                        if main_menu.show_how_to_play:
                            main_menu.show_how_to_play = False
                        else:
                            running = False
                    elif event.key == pygame.K_RETURN:
                        sound_mgr.play("click")
                        player_bf, opponent_bf, ai_controller = init_match()
                        game_state = "PLAYING"

                elif game_state in ["PLAYING", "PAUSED", "GAME_OVER"]:
                    if event.key == pygame.K_ESCAPE:
                        if selected_tower_to_place:
                            selected_tower_to_place = None
                        elif player_bf and player_bf.selected_tower:
                            player_bf.selected_tower = None
                        else:
                            # Return to Main Menu
                            game_state = "MENU"

                    elif event.key == pygame.K_SPACE:
                        if game_state == "PLAYING":
                            game_state = "PAUSED"
                        elif game_state == "PAUSED":
                            game_state = "PLAYING"

                    elif event.key == pygame.K_r:
                        if game_state == "GAME_OVER":
                            player_bf, opponent_bf, ai_controller = init_match()
                            game_state = "PLAYING"
                            winner = None
                            selected_tower_to_place = None

                    # Hotkeys 1-4 for Towers
                    elif game_state == "PLAYING" and player_bf:
                        tower_list = list(TOWER_TYPES.keys())
                        if event.key == pygame.K_1 and len(tower_list) >= 1:
                            selected_tower_to_place = tower_list[0]
                            sound_mgr.play("select")
                        elif event.key == pygame.K_2 and len(tower_list) >= 2:
                            selected_tower_to_place = tower_list[1]
                            sound_mgr.play("select")
                        elif event.key == pygame.K_3 and len(tower_list) >= 3:
                            selected_tower_to_place = tower_list[2]
                            sound_mgr.play("select")
                        elif event.key == pygame.K_4 and len(tower_list) >= 4:
                            selected_tower_to_place = tower_list[3]
                            sound_mgr.play("select")

                        # Hotkeys Q-I for Bloon Rushes
                        bloon_hotkeys = {
                            pygame.K_q: "Red",
                            pygame.K_w: "Blue",
                            pygame.K_e: "Green",
                            pygame.K_r: "Yellow",
                            pygame.K_t: "Pink",
                            pygame.K_y: "Black",
                            pygame.K_u: "Ceramic",
                            pygame.K_i: "MOAB",
                        }
                        if event.key in bloon_hotkeys:
                            b_type = bloon_hotkeys[event.key]
                            spec = BLOON_TYPES[b_type]
                            if player_bf.cash >= spec["send_cost"]:
                                player_bf.cash -= spec["send_cost"]
                                player_bf.eco = max(20.0, player_bf.eco + spec["eco_delta"])
                                opponent_bf.queue_rush_bloon(b_type)
                                sound_mgr.play("rush")

            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 3:  # Right Click cancels
                    selected_tower_to_place = None
                    if player_bf:
                        player_bf.selected_tower = None
                    continue

                if event.button == 1:  # Left Click
                    # 1. Main Menu Interaction
                    if game_state == "MENU":
                        if main_menu.show_how_to_play:
                            main_menu.show_how_to_play = False
                            sound_mgr.play("click")
                            continue

                        if main_menu.play_btn.is_hovered:
                            sound_mgr.play("click")
                            player_bf, opponent_bf, ai_controller = init_match()
                            game_state = "PLAYING"
                        elif main_menu.how_btn.is_hovered:
                            sound_mgr.play("click")
                            main_menu.show_how_to_play = True
                        elif main_menu.quit_btn.is_hovered:
                            running = False
                        continue

                    # 2. Game Over Modal Click to restart
                    if game_state == "GAME_OVER":
                        player_bf, opponent_bf, ai_controller = init_match()
                        game_state = "PLAYING"
                        winner = None
                        selected_tower_to_place = None
                        continue

                    # 3. Check Tower Build Buttons
                    clicked_ui = False
                    for btn, t_key, cost in ui_mgr.tower_buttons:
                        if btn.is_hovered:
                            if player_bf.cash >= cost:
                                selected_tower_to_place = t_key
                                player_bf.selected_tower = None
                                sound_mgr.play("select")
                            clicked_ui = True
                            break

                    # 4. Check Bloon Rush Buttons
                    if not clicked_ui:
                        for btn, r_key, send_cost in ui_mgr.rush_buttons:
                            if btn.is_hovered:
                                if player_bf.cash >= send_cost:
                                    spec = BLOON_TYPES[r_key]
                                    player_bf.cash -= send_cost
                                    player_bf.eco = max(20.0, player_bf.eco + spec["eco_delta"])
                                    opponent_bf.queue_rush_bloon(r_key)
                                    sound_mgr.play("rush")
                                clicked_ui = True
                                break

                    # 5. Check Upgrade & Sell Buttons
                    if not clicked_ui and player_bf and player_bf.selected_tower:
                        sel_t = player_bf.selected_tower
                        if ui_mgr.upgrade_btn.is_hovered:
                            up_spec = sel_t.get_next_upgrade()
                            if up_spec and player_bf.cash >= up_spec["cost"]:
                                player_bf.cash -= up_spec["cost"]
                                sel_t.apply_upgrade()
                            clicked_ui = True
                        elif ui_mgr.sell_btn.is_hovered:
                            refund = int(sel_t.spec["cost"] * 0.7)
                            player_bf.cash += refund
                            if sel_t in player_bf.towers:
                                player_bf.towers.remove(sel_t)
                            player_bf.selected_tower = None
                            sound_mgr.play("sell")
                            clicked_ui = True

                    # 6. Clicking in Battlefield Area
                    if not clicked_ui and player_bf:
                        mx, my = mouse_pos
                        if selected_tower_to_place:
                            placed = player_bf.place_tower(selected_tower_to_place, mx, my)
                            if placed:
                                selected_tower_to_place = None
                                player_bf.selected_tower = placed
                        else:
                            selected_any = False
                            for t in player_bf.towers:
                                if (t.x - mx) ** 2 + (t.y - my) ** 2 <= 22 ** 2:
                                    player_bf.selected_tower = t
                                    sound_mgr.play("select")
                                    selected_any = True
                                    break
                            if not selected_any:
                                player_bf.selected_tower = None

        # ----------------- GAME UPDATE -----------------
        if game_state == "PLAYING" and player_bf and opponent_bf:
            player_bf.update(dt)
            opponent_bf.update(dt)
            ai_controller.update(dt)

            if player_bf.lives <= 0:
                game_state = "GAME_OVER"
                winner = "Opponent"
                sound_mgr.play("game_over")
            elif opponent_bf.lives <= 0:
                game_state = "GAME_OVER"
                winner = "Player"
                sound_mgr.play("win")

        # ----------------- RENDERING -----------------
        if game_state == "MENU":
            main_menu.draw(screen, ui_mgr.fonts)

        elif player_bf and opponent_bf:
            screen.fill(COLOR_BG)

            # Draw battlefields with desert terrain and track
            player_bf.draw(screen, ui_mgr.font_body)
            opponent_bf.draw(screen, ui_mgr.font_body)

            # Placement preview
            if selected_tower_to_place and game_state == "PLAYING":
                mx, my = mouse_pos
                spec = TOWER_TYPES[selected_tower_to_place]
                trange = spec["range"]
                valid = player_bf.can_place_tower(mx, my)

                preview_surf = pygame.Surface((trange * 2, trange * 2), pygame.SRCALPHA)
                circle_color = (46, 204, 113, 80) if valid else (231, 76, 60, 80)
                pygame.draw.circle(preview_surf, circle_color, (trange, trange), trange)
                pygame.draw.circle(preview_surf, (255, 255, 255, 140), (trange, trange), trange, 2)
                screen.blit(preview_surf, (mx - trange, my - trange))

                # Ghost tower icon
                ghost_color = spec["color"] if valid else (200, 50, 50)
                pygame.draw.circle(screen, ghost_color, (mx, my), 15)
                pygame.draw.circle(screen, (255, 255, 255), (mx, my), 15, 2)

            # Draw HUD
            ui_mgr.draw_hud(screen, player_bf, opponent_bf, selected_tower_to_place)

            if game_state == "GAME_OVER":
                ui_mgr.draw_game_over(screen, winner)
            elif game_state == "PAUSED":
                pause_surf = ui_mgr.font_large.render("PAUSED — Press SPACE to Resume", True, (255, 215, 0))
                screen.blit(pause_surf, ((SCREEN_WIDTH - pause_surf.get_width()) // 2, SCREEN_HEIGHT // 2))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
