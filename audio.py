"""
Audio Manager for Bloons TD Battles — Loads Authentic Game Audio
"""

import os
import random
import pygame

class SoundManager:
    _instance = None

    def __init__(self):
        self.enabled = False
        self.sounds = {}
        try:
            if not pygame.mixer.get_init():
                pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
            self.enabled = True
            self._load_authentic_sounds()
        except Exception as e:
            print(f"[SoundManager] Audio init warning: {e}")

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = SoundManager()
        return cls._instance

    def _load_authentic_sounds(self):
        base_dir = os.path.join(os.path.dirname(__file__), "assets", "audio")
        if not os.path.exists(base_dir):
            return

        sound_map = {
            "pop1": "pop1.wav",
            "pop2": "pop2.wav",
            "pop3": "pop3.wav",
            "pop4": "pop4.wav",
            "place": "tower_place.wav",
            "select": "tower_select.wav",
            "upgrade": "upgrade.wav",
            "sell": "sell_tower.wav",
            "explosion": "explosion_small.wav",
            "click": "button_click.wav",
            "buy": "buy.wav",
            "rush": "bloon_boost.wav",
            "win": "game_win.wav",
            "game_over": "game_over.wav",
            "ceramic_hit": "ceramic_bloon_hit.wav",
            "metal_hit": "metal_bloon_hit.wav",
            "moab_destroy": "moab_destroyed_short.wav",
            "moab_damage": "moab_damage_quieter.wav",
            "new_round": "newRound.wav"
        }

        for key, fname in sound_map.items():
            path = os.path.join(base_dir, fname)
            if os.path.exists(path):
                try:
                    snd = pygame.mixer.Sound(path)
                    snd.set_volume(0.65)
                    self.sounds[key] = snd
                except Exception as err:
                    print(f"Error loading {path}: {err}")

    def play(self, sound_name):
        if not self.enabled:
            return

        if sound_name == "pop":
            # Cycle among original pops
            p_keys = ["pop1", "pop2", "pop3", "pop4"]
            chosen = random.choice([k for k in p_keys if k in self.sounds] or ["pop1"])
            if chosen in self.sounds:
                self.sounds[chosen].play()
            return

        if sound_name in self.sounds:
            try:
                self.sounds[sound_name].play()
            except Exception:
                pass
