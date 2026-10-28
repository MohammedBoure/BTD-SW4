"""
AI Opponent Controller for Bloons TD Battles
Simulates intelligent opponent decisions: building defense, upgrading, and sending rushes.
"""

import random
from config import TOWER_TYPES, BLOON_TYPES

class AIController:
    def __init__(self, ai_battlefield, player_battlefield):
        self.ai_bf = ai_battlefield
        self.player_bf = player_battlefield
        self.decision_timer = 0.0
        self.rush_timer = 0.0

        # Pre-calculated tactical tower spots along the right battlefield track
        self.candidate_spots = [
            (ai_battlefield.origin[0] + 80, ai_battlefield.origin[1] + 150),
            (ai_battlefield.origin[0] + 200, ai_battlefield.origin[1] + 160),
            (ai_battlefield.origin[0] + 320, ai_battlefield.origin[1] + 160),
            (ai_battlefield.origin[0] + 430, ai_battlefield.origin[1] + 160),
            (ai_battlefield.origin[0] + 320, ai_battlefield.origin[1] + 290),
            (ai_battlefield.origin[0] + 420, ai_battlefield.origin[1] + 290),
            (ai_battlefield.origin[0] + 170, ai_battlefield.origin[1] + 300),
            (ai_battlefield.origin[0] + 170, ai_battlefield.origin[1] + 410),
            (ai_battlefield.origin[0] + 300, ai_battlefield.origin[1] + 410),
            (ai_battlefield.origin[0] + 400, ai_battlefield.origin[1] + 410),
        ]
        random.shuffle(self.candidate_spots)

    def update(self, dt):
        self.decision_timer += dt
        self.rush_timer += dt

        # 1. Building & Upgrading Defense (every 1.0 second)
        if self.decision_timer >= 1.0:
            self.decision_timer = 0.0
            self._evaluate_defense()

        # 2. Sending Rushes to Player (every 1.5 - 3.0 seconds)
        rush_interval = 2.0
        if self.rush_timer >= rush_interval:
            self.rush_timer = 0.0
            self._evaluate_offense()

    def _evaluate_defense(self):
        # Count towers
        num_towers = len(self.ai_bf.towers)

        # Check if we should upgrade existing towers
        upgradeable_towers = [t for t in self.ai_bf.towers if t.can_upgrade()]
        if upgradeable_towers and (num_towers >= 2 or self.ai_bf.cash > 1000):
            target_tower = random.choice(upgradeable_towers)
            up_spec = target_tower.get_next_upgrade()
            if up_spec and self.ai_bf.cash >= up_spec["cost"]:
                self.ai_bf.cash -= up_spec["cost"]
                target_tower.apply_upgrade()
                return

        # Otherwise place new towers
        if num_towers < len(self.candidate_spots):
            # Select tower type based on cash and match time
            tower_choice = "DartMonkey"
            time_sec = self.ai_bf.match_time

            if time_sec > 120 and self.ai_bf.cash >= 2600:
                tower_choice = "SuperMonkey"
            elif time_sec > 60 and self.ai_bf.cash >= 650:
                tower_choice = random.choice(["BombTower", "TackShooter"])
            elif self.ai_bf.cash >= 360 and num_towers >= 1:
                tower_choice = "TackShooter"
            elif self.ai_bf.cash >= 200:
                tower_choice = "DartMonkey"
            else:
                return

            cost = TOWER_TYPES[tower_choice]["cost"]
            if self.ai_bf.cash >= cost:
                # Find available spot
                for spot in self.candidate_spots:
                    if self.ai_bf.can_place_tower(spot[0], spot[1]):
                        self.ai_bf.place_tower(tower_choice, spot[0], spot[1])
                        break

    def _evaluate_offense(self):
        # AI decides what bloon to send to the player
        # In Bloons TD Battles, sending bloons builds eco!
        if self.ai_bf.cash < 40:
            return

        time_sec = self.ai_bf.match_time
        available_rushes = []

        if time_sec > 160 and self.ai_bf.cash >= 1200:
            # MOAB rush chance!
            if random.random() < 0.35:
                available_rushes = ["MOAB"]
        if not available_rushes:
            if time_sec > 100:
                candidates = ["Pink", "Black", "Ceramic"]
            elif time_sec > 50:
                candidates = ["Green", "Yellow", "Pink"]
            elif time_sec > 25:
                candidates = ["Blue", "Green", "Yellow"]
            else:
                candidates = ["Red", "Blue"]

            # Filter candidates AI can afford
            available_rushes = [c for c in candidates if self.ai_bf.cash >= BLOON_TYPES[c]["send_cost"]]

        if available_rushes:
            chosen = random.choice(available_rushes)
            send_cost = BLOON_TYPES[chosen]["send_cost"]
            eco_delta = BLOON_TYPES[chosen]["eco_delta"]

            self.ai_bf.cash -= send_cost
            self.ai_bf.eco = max(20.0, self.ai_bf.eco + eco_delta)
            # Queue to player's track
            self.player_bf.queue_rush_bloon(chosen)
