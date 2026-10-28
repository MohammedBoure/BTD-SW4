"""
Game Configuration and Constants for Bloons TD Battles (Python Recreation)
"""

SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
FPS = 60

# Colors
COLOR_BG = (28, 35, 49)
COLOR_PANEL_BG = (20, 24, 34)
COLOR_PANEL_BORDER = (45, 55, 72)
COLOR_TEXT_LIGHT = (240, 245, 250)
COLOR_TEXT_MUTED = (160, 175, 200)
COLOR_GOLD = (255, 204, 0)
COLOR_GREEN = (46, 204, 113)
COLOR_RED = (231, 76, 60)
COLOR_BLUE = (52, 152, 219)
COLOR_TRACK = (180, 142, 98)
COLOR_TRACK_BORDER = (130, 95, 60)
COLOR_GRASS = (46, 125, 50)
COLOR_GRASS_ACCENT = (56, 142, 60)

# Battlefield bounds
# Left side (Player)
BF_PLAYER = {
    "x": 20,
    "y": 60,
    "w": 530,
    "h": 460
}

# Right side (Opponent / AI)
BF_OPPONENT = {
    "x": 730,
    "y": 60,
    "w": 530,
    "h": 460
}

# Middle divider
DIVIDER_X = 640

# Track paths (relative to battlefield x, y)
# S-curve path through the battlefield
TRACK_WAYPOINTS_LOCAL = [
    (0, 80),
    (140, 80),
    (140, 220),
    (380, 220),
    (380, 100),
    (480, 100),
    (480, 360),
    (240, 360),
    (240, 440),
    (530, 440)
]

# Starting match conditions
STARTING_LIVES = 150
STARTING_CASH = 650
STARTING_ECO = 250
ECO_INTERVAL_SECONDS = 6.0

# Bloon Types and Hierarchies
BLOON_TYPES = {
    "Red": {
        "hp": 1,
        "speed": 1.4,
        "color": (230, 40, 40),
        "radius": 12,
        "reward": 1,
        "send_cost": 20,
        "eco_delta": 1.0,
        "children": [],
        "min_round": 1
    },
    "Blue": {
        "hp": 1,
        "speed": 1.8,
        "color": (40, 120, 240),
        "radius": 14,
        "reward": 2,
        "send_cost": 35,
        "eco_delta": 1.5,
        "children": ["Red"],
        "min_round": 1
    },
    "Green": {
        "hp": 1,
        "speed": 2.2,
        "color": (46, 190, 60),
        "radius": 15,
        "reward": 3,
        "send_cost": 50,
        "eco_delta": 2.0,
        "children": ["Blue"],
        "min_round": 2
    },
    "Yellow": {
        "hp": 1,
        "speed": 3.2,
        "color": (245, 215, 30),
        "radius": 16,
        "reward": 4,
        "send_cost": 75,
        "eco_delta": 2.5,
        "children": ["Green"],
        "min_round": 3
    },
    "Pink": {
        "hp": 1,
        "speed": 3.8,
        "color": (245, 80, 150),
        "radius": 17,
        "reward": 5,
        "send_cost": 100,
        "eco_delta": 3.0,
        "children": ["Yellow"],
        "min_round": 4
    },
    "Black": {
        "hp": 1,
        "speed": 2.2,
        "color": (35, 35, 40),
        "radius": 16,
        "reward": 6,
        "send_cost": 150,
        "eco_delta": 3.5,
        "immune_explosion": True,
        "children": ["Pink", "Pink"],
        "min_round": 6
    },
    "White": {
        "hp": 1,
        "speed": 2.4,
        "color": (230, 235, 245),
        "radius": 16,
        "reward": 6,
        "send_cost": 160,
        "eco_delta": 3.5,
        "children": ["Pink", "Pink"],
        "min_round": 6
    },
    "Ceramic": {
        "hp": 10,
        "speed": 2.6,
        "color": (160, 110, 80),
        "radius": 18,
        "reward": 15,
        "send_cost": 350,
        "eco_delta": 4.0,
        "children": ["Black", "White"],
        "min_round": 8
    },
    "MOAB": {
        "hp": 120,
        "speed": 1.0,
        "color": (0, 160, 220),
        "radius": 28,
        "reward": 60,
        "send_cost": 1200,
        "eco_delta": -15.0,  # Sacrifices eco for a deadly rush
        "is_blimp": True,
        "children": ["Ceramic", "Ceramic", "Ceramic", "Ceramic"],
        "min_round": 12
    }
}

# Tower Definitions
TOWER_TYPES = {
    "DartMonkey": {
        "name": "Dart Monkey",
        "cost": 200,
        "range": 100,
        "fire_rate": 0.9,
        "damage": 1,
        "pierce": 1,
        "proj_speed": 9,
        "color": (180, 115, 60),
        "icon_label": "DM",
        "description": "Shoots a single sharp dart at bloons.",
        "upgrades": [
            {
                "name": "Sharp Shots",
                "cost": 140,
                "pierce": 3,
                "range": 115,
                "desc": "+2 Pierce & extra range"
            },
            {
                "name": "Triple Darts",
                "cost": 330,
                "fire_rate": 0.5,
                "extra_projectiles": 2,
                "desc": "Throws 3 darts simultaneously!"
            }
        ]
    },
    "TackShooter": {
        "name": "Tack Shooter",
        "cost": 360,
        "range": 75,
        "fire_rate": 1.1,
        "damage": 1,
        "pierce": 1,
        "proj_speed": 7,
        "color": (210, 80, 60),
        "icon_label": "TS",
        "description": "Shoots 8 tacks in all directions.",
        "is_omni": True,
        "tacks_count": 8,
        "upgrades": [
            {
                "name": "Faster Shooting",
                "cost": 210,
                "fire_rate": 0.65,
                "range": 85,
                "desc": "Shoots tacks much faster!"
            },
            {
                "name": "Blade Shooter",
                "cost": 550,
                "damage": 2,
                "pierce": 3,
                "range": 95,
                "desc": "Fires sharp blades that pop multiple bloons"
            }
        ]
    },
    "BombTower": {
        "name": "Bomb Tower",
        "cost": 650,
        "range": 120,
        "fire_rate": 1.6,
        "damage": 2,
        "pierce": 15,
        "proj_speed": 6,
        "color": (80, 90, 105),
        "icon_label": "BT",
        "is_explosive": True,
        "splash_radius": 45,
        "description": "Fires explosive bombs that damage bloon groups.",
        "upgrades": [
            {
                "name": "Bigger Bombs",
                "cost": 300,
                "splash_radius": 70,
                "damage": 3,
                "desc": "Larger blast radius and more damage"
            },
            {
                "name": "Cluster Bomb",
                "cost": 800,
                "fire_rate": 1.2,
                "has_cluster": True,
                "desc": "Bombs fragment into secondary explosions"
            }
        ]
    },
    "SuperMonkey": {
        "name": "Super Monkey",
        "cost": 2600,
        "range": 150,
        "fire_rate": 0.12,
        "damage": 1,
        "pierce": 2,
        "proj_speed": 13,
        "color": (255, 180, 0),
        "icon_label": "SM",
        "description": "Throws darts at hypersonic speeds!",
        "upgrades": [
            {
                "name": "Laser Blasts",
                "cost": 1500,
                "damage": 2,
                "pierce": 4,
                "range": 170,
                "color": (255, 60, 60),
                "desc": "Fires powerful lasers that pop 2 layers"
            },
            {
                "name": "Plasma Blasts",
                "cost": 3200,
                "fire_rate": 0.08,
                "damage": 3,
                "pierce": 7,
                "range": 190,
                "color": (160, 32, 240),
                "desc": "Hypersonic plasma vaporizes bloons & MOABs!"
            }
        ]
    }
}
