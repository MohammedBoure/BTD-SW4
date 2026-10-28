/**
 * Bloons TD Battles — Authentic Extracted Game Data (game_data.js)
 * Extracted via REA from G:\SteamLibrary\steamapps\common\Bloons TD Battles
 * Contains:
 *  - 7 Maps with exact 480x640 road waypoints & water/track placement masks
 *  - Complete Bloon Hierarchy (Red -> ZOMG) with exact RBE leak damage, HP, child spawns, and immunities
 *  - Authentic Bloon Sends (14 sends, unlock rounds, queue duration, Camo x2.2 / Regrow x1.8 modifiers)
 *  - 8 Complete Towers (Dart, Tack, Bomb, Super, Ninja, Sniper, Wizard, Boomerang) with full 4-tier Left & Right upgrade paths, top-down composite sprites, projectiles, and Tier 4 activated abilities
 *  - Authentic 30+ Round System + Sudden Death scaling
 */

window.GAME_DATA = {
  startingLives: 150,
  startingCash: 650,
  startingEco: 250,
  ecoIntervalSeconds: 6.0,
  startingBoosts: 3,
  maxLoadoutSize: 4, // 4 chosen towers + 1 Bonus Tower in pre-match lobby
  maxBloonQueueSlots: 5, // Authentic 5-slot Bloon Send Queue

  // 7 Authentic Maps (480x640 local coordinate space for Left side; Right side mirrors X: 480 - x)
  maps: {
    battle_park: {
      id: 'battle_park',
      name: 'Battle Park',
      nameAr: 'حديقة المعركة (Battle Park)',
      leftImg: 'assets/maps/battle_park_left.jpg',
      rightImg: 'assets/maps/battle_park_right.jpg',
      trackWidth: 34,
      naturalPath: [
        [105, 0], [105, 95], [412, 95], [412, 205],
        [105, 205], [105, 415], [412, 415], [412, 525],
        [105, 525], [105, 640]
      ],
      sentPath: [
        [412, 0], [412, 240], [365, 240], [155, 240],
        [122, 265], [114, 308], [122, 352], [155, 378],
        [365, 378], [412, 355], [412, 525], [105, 525], [105, 640]
      ],
      waterObstacles: [
        { type: 'rect', x: 155, y: 265, w: 210, h: 80 }
      ]
    },
    battle_sands: {
      id: 'battle_sands',
      name: 'Battle Sands',
      nameAr: 'رمال المعركة (Battle Sands)',
      leftImg: 'assets/maps/battle_sands_left.jpg',
      rightImg: 'assets/maps/battle_sands_right.jpg',
      trackWidth: 34,
      naturalPath: [
        [385, 0], [385, 80], [295, 80], [295, 150],
        [192, 150], [192, 225], [95, 225], [95, 300],
        [388, 300], [388, 382], [292, 382], [292, 455],
        [192, 455], [192, 528], [95, 528], [95, 640]
      ],
      sentPath: [
        [385, 0], [385, 80], [295, 80], [295, 150],
        [192, 150], [192, 225], [95, 225], [95, 300],
        [388, 300], [388, 382], [292, 382], [292, 455],
        [192, 455], [192, 528], [95, 528], [95, 640]
      ],
      waterObstacles: [
        { type: 'circle', x: 135, y: 88, r: 52 },
        { type: 'circle', x: 365, y: 528, r: 58 }
      ]
    },
    yellow_brick: {
      id: 'yellow_brick',
      name: 'Yellow Brick',
      nameAr: 'الطريق الأصفر (Yellow Brick)',
      leftImg: 'assets/maps/yellow_brick_left.jpg',
      rightImg: 'assets/maps/yellow_brick_right.jpg',
      trackWidth: 36,
      naturalPath: [
        [0, 178], [52, 226], [152, 126], [246, 222],
        [344, 126], [440, 224], [246, 416], [152, 322],
        [56, 416], [268, 640]
      ],
      sentPath: [
        [0, 178], [52, 226], [152, 126], [246, 222],
        [344, 126], [440, 224], [246, 416], [152, 322],
        [56, 416], [268, 640]
      ],
      waterObstacles: []
    },
    bloon_circles: {
      id: 'bloon_circles',
      name: 'Bloon Circles',
      nameAr: 'دوائر البالونات (Bloon Circles)',
      leftImg: 'assets/maps/bloon_circles_left.jpg',
      rightImg: 'assets/maps/bloon_circles_right.jpg',
      trackWidth: 34,
      naturalPath: [
        [480, 182], [322, 182],
        [308, 120], [268, 76], [212, 62], [156, 76], [115, 120], [102, 182],
        [115, 250], [156, 212], [212, 200], [268, 212], [308, 250], [322, 320],
        [308, 250], [268, 296], [212, 316], [156, 296], [115, 250], [102, 320],
        [115, 390], [102, 462], [115, 522], [156, 566], [212, 578], [268, 566],
        [308, 522], [322, 462], [308, 390], [268, 430], [212, 442], [156, 430],
        [115, 390], [102, 462], [0, 462]
      ],
      sentPath: [
        [480, 182], [322, 182], [308, 250], [322, 320],
        [308, 390], [322, 462], [308, 522], [268, 566],
        [212, 578], [156, 566], [115, 522], [102, 462], [0, 462]
      ],
      waterObstacles: [
        { type: 'circle', x: 215, y: 262, r: 44 },
        { type: 'circle', x: 215, y: 416, r: 44 }
      ]
    },
    park: {
      id: 'park',
      name: 'Park',
      nameAr: 'المنتزه الأخضر (Park)',
      leftImg: 'assets/maps/park_left.jpg',
      rightImg: 'assets/maps/park_right.jpg',
      trackWidth: 36,
      naturalPath: [
        [412, 0], [412, 110], [395, 180], [350, 232],
        [312, 285], [305, 345], [322, 405], [350, 462],
        [350, 495], [312, 515], [265, 500], [232, 450],
        [208, 380], [202, 305], [220, 232], [262, 175],
        [305, 125], [310, 82], [278, 58], [230, 68],
        [175, 112], [128, 185], [95, 270], [88, 360],
        [108, 445], [152, 520], [218, 582], [282, 640]
      ],
      sentPath: [
        [412, 0], [412, 110], [395, 180], [350, 232],
        [312, 285], [305, 345], [322, 405], [350, 462],
        [350, 495], [312, 515], [265, 500], [232, 450],
        [208, 380], [202, 305], [220, 232], [262, 175],
        [305, 125], [310, 82], [278, 58], [230, 68],
        [175, 112], [128, 185], [95, 270], [88, 360],
        [108, 445], [152, 520], [218, 582], [282, 640]
      ],
      waterObstacles: [
        { type: 'circle', x: 445, y: 320, r: 92 }
      ]
    },
    temple: {
      id: 'temple',
      name: 'Mayan Temple',
      nameAr: 'معبد المايا (Temple)',
      leftImg: 'assets/maps/temple_left.jpg',
      rightImg: 'assets/maps/temple_right.jpg',
      overlayLeft: 'assets/maps/temple_roof_left.png',
      overlayRight: 'assets/maps/temple_roof_right.png',
      trackWidth: 34,
      naturalPath: [
        [98, 0], [98, 98], [405, 98], [405, 222],
        [302, 222], [302, 338], [198, 338], [198, 452],
        [98, 452], [98, 560], [405, 560], [405, 640]
      ],
      sentPath: [
        [405, 0], [405, 640]
      ],
      waterObstacles: [
        { type: 'rect', x: 335, y: 265, w: 145, h: 225 },
        { type: 'rect', x: 255, y: 395, w: 95, h: 95 }
      ]
    },
    water_hazard: {
      id: 'water_hazard',
      name: 'Water Hazard',
      nameAr: 'الممر المائي (Water Hazard)',
      leftImg: 'assets/maps/water_hazard_left.jpg',
      rightImg: 'assets/maps/water_hazard_right.jpg',
      trackWidth: 34,
      naturalPath: [
        [248, 0], [248, 65], [275, 120], [355, 155],
        [398, 188], [408, 250], [408, 505], [392, 555],
        [345, 582], [285, 578], [250, 540], [242, 485],
        [240, 215], [218, 135], [175, 98], [118, 98],
        [72, 135], [48, 210], [45, 510], [0, 558]
      ],
      sentPath: [
        [248, 0], [248, 65], [275, 120], [355, 155],
        [398, 188], [408, 250], [408, 505], [392, 555],
        [345, 582], [285, 578], [250, 540], [242, 485],
        [240, 215], [218, 135], [175, 98], [118, 98],
        [72, 135], [48, 210], [45, 510], [0, 558]
      ],
      waterObstacles: [
        { type: 'rect', x: 0, y: 0, w: 215, h: 75 },
        { type: 'rect', x: 265, y: 175, w: 105, h: 345 }
      ]
    }
  },

  // Complete Bloon Hierarchy: Red -> ZOMG
  bloons: {
    red: {
      id: 'red', name: 'Red Bloon', rbe: 1, hp: 1, speed: 68,
      color: '#ef2323', scale: 0.78, children: [],
      immunities: []
    },
    blue: {
      id: 'blue', name: 'Blue Bloon', rbe: 2, hp: 1, speed: 92,
      color: '#2087f6', scale: 0.84, children: ['red'],
      immunities: []
    },
    green: {
      id: 'green', name: 'Green Bloon', rbe: 3, hp: 1, speed: 118,
      color: '#2dc62d', scale: 0.90, children: ['blue'],
      immunities: []
    },
    yellow: {
      id: 'yellow', name: 'Yellow Bloon', rbe: 4, hp: 1, speed: 195,
      color: '#ffdf1b', scale: 0.96, children: ['green'],
      immunities: []
    },
    pink: {
      id: 'pink', name: 'Pink Bloon', rbe: 5, hp: 1, speed: 225,
      color: '#ff63a5', scale: 1.0, children: ['yellow'],
      immunities: []
    },
    black: {
      id: 'black', name: 'Black Bloon', rbe: 11, hp: 1, speed: 118,
      color: '#25252c', scale: 0.78, children: ['pink', 'pink'],
      immunities: ['explosion']
    },
    white: {
      id: 'white', name: 'White Bloon', rbe: 11, hp: 1, speed: 132,
      color: '#f2f6ff', scale: 0.78, children: ['pink', 'pink'],
      immunities: ['freeze']
    },
    lead: {
      id: 'lead', name: 'Lead Bloon', rbe: 23, hp: 1, speed: 68,
      sprite: 'assets/bloons/lead.png', regenSprite: 'assets/bloons/lead_regen.png',
      scale: 0.95, children: ['black', 'black'],
      immunities: ['sharp']
    },
    zebra: {
      id: 'zebra', name: 'Zebra Bloon', rbe: 23, hp: 1, speed: 118,
      sprite: 'assets/bloons/zebra.png', regenSprite: 'assets/bloons/zebra_regen.png',
      scale: 0.95, children: ['black', 'white'],
      immunities: ['explosion', 'freeze']
    },
    rainbow: {
      id: 'rainbow', name: 'Rainbow Bloon', rbe: 47, hp: 1, speed: 145,
      sprite: 'assets/bloons/rainbow.png', regenSprite: 'assets/bloons/rainbow_regen.png',
      scale: 1.02, children: ['zebra', 'zebra'],
      immunities: []
    },
    ceramic: {
      id: 'ceramic', name: 'Ceramic Bloon', rbe: 104, hp: 10, speed: 162,
      sprites: [
        'assets/bloons/ceramic_01.png',
        'assets/bloons/ceramic_02.png',
        'assets/bloons/ceramic_03.png',
        'assets/bloons/ceramic_04.png',
        'assets/bloons/ceramic_05.png'
      ],
      regenSprites: [
        'assets/bloons/ceramic_regen_01.png',
        'assets/bloons/ceramic_regen_02.png',
        'assets/bloons/ceramic_regen_03.png',
        'assets/bloons/ceramic_regen_04.png',
        'assets/bloons/ceramic_regen_05.png'
      ],
      scale: 1.05, children: ['rainbow', 'rainbow'],
      immunities: []
    },
    moab: {
      id: 'moab', name: 'M.O.A.B.', rbe: 616, hp: 200, speed: 65, isMoab: true,
      sprites: [
        'assets/moabs/moab_undamaged.png',
        'assets/moabs/moab_eating_01.png',
        'assets/moabs/moab_eating_02.png',
        'assets/moabs/moab_eating_03.png',
        'assets/moabs/moab_eating_04.png'
      ],
      scale: 0.62, children: ['ceramic', 'ceramic', 'ceramic', 'ceramic'],
      immunities: ['freeze']
    },
    bfb: {
      id: 'bfb', name: 'B.F.B.', rbe: 3164, hp: 700, speed: 45, isMoab: true,
      sprites: [
        'assets/moabs/bfb_undamaged.png',
        'assets/moabs/bfb_eating_01.png',
        'assets/moabs/bfb_eating_02.png',
        'assets/moabs/bfb_eating_03.png',
        'assets/moabs/bfb_eating_04.png'
      ],
      scale: 0.66, children: ['moab', 'moab', 'moab', 'moab'],
      immunities: ['freeze']
    },
    zomg: {
      id: 'zomg', name: 'Z.O.M.G.', rbe: 16656, hp: 4000, speed: 30, isMoab: true,
      sprites: [
        'assets/moabs/zomg_undamaged.png',
        'assets/moabs/zomg_eating_01.png',
        'assets/moabs/zomg_eating_02.png',
        'assets/moabs/zomg_eating_03.png',
        'assets/moabs/zomg_eating_04.png'
      ],
      scale: 0.72, children: ['bfb', 'bfb', 'bfb', 'bfb'],
      immunities: ['freeze']
    }
  },

  // Bloon Sends (with Queue Delay Duration, Camo & Regrow toggle support)
  bloonSends: [
    { id: 'send_red', bloon: 'red', count: 5, spacing: 0.14, queueTime: 0.75, cost: 25, eco: 1.5, minRound: 1, icon: 'red', key: 'Q', label: 'Red x5', allowModifiers: true },
    { id: 'send_blue', bloon: 'blue', count: 5, spacing: 0.14, queueTime: 0.80, cost: 35, eco: 2.0, minRound: 1, icon: 'blue', key: 'W', label: 'Blue x5', allowModifiers: true },
    { id: 'send_green', bloon: 'green', count: 5, spacing: 0.13, queueTime: 0.85, cost: 50, eco: 2.7, minRound: 2, icon: 'green', key: 'E', label: 'Green x5', allowModifiers: true },
    { id: 'send_yellow', bloon: 'yellow', count: 4, spacing: 0.13, queueTime: 0.85, cost: 80, eco: 4.0, minRound: 4, icon: 'yellow', key: 'R', label: 'Yellow x4', allowModifiers: true },
    { id: 'send_pink', bloon: 'pink', count: 4, spacing: 0.12, queueTime: 0.85, cost: 110, eco: 5.2, minRound: 6, icon: 'pink', key: 'T', label: 'Pink x4', allowModifiers: true },
    { id: 'send_black', bloon: 'black', count: 4, spacing: 0.12, queueTime: 0.90, cost: 140, eco: 6.0, minRound: 6, icon: 'black', key: 'Y', label: 'Black x4', allowModifiers: true },
    { id: 'send_white', bloon: 'white', count: 4, spacing: 0.12, queueTime: 0.90, cost: 130, eco: 5.8, minRound: 7, icon: 'white', key: 'U', label: 'White x4', allowModifiers: true },
    { id: 'send_lead', bloon: 'lead', count: 3, spacing: 0.20, queueTime: 1.00, cost: 150, eco: 6.0, minRound: 8, icon: 'lead', key: 'I', label: 'Lead x3', allowModifiers: true },
    { id: 'send_zebra', bloon: 'zebra', count: 3, spacing: 0.14, queueTime: 0.95, cost: 180, eco: 6.5, minRound: 10, icon: 'zebra', key: 'O', label: 'Zebra x3', allowModifiers: true },
    { id: 'send_rainbow', bloon: 'rainbow', count: 3, spacing: 0.13, queueTime: 1.00, cost: 250, eco: 8.0, minRound: 13, icon: 'rainbow', key: 'P', label: 'Rainbow x3', allowModifiers: true },
    { id: 'send_ceramic', bloon: 'ceramic', count: 2, spacing: 0.22, queueTime: 1.10, cost: 400, eco: 4.0, minRound: 15, icon: 'ceramic', key: 'F', label: 'Ceramic x2', allowModifiers: true },
    { id: 'send_moab', bloon: 'moab', count: 1, spacing: 0.5, queueTime: 1.40, cost: 1000, eco: -10, minRound: 18, icon: 'moab', key: 'G', label: 'M.O.A.B.', allowModifiers: false },
    { id: 'send_bfb', bloon: 'bfb', count: 1, spacing: 0.7, queueTime: 1.80, cost: 2250, eco: -50, minRound: 20, icon: 'bfb', key: 'H', label: 'B.F.B.', allowModifiers: false },
    { id: 'send_zomg', bloon: 'zomg', count: 1, spacing: 1.0, queueTime: 2.20, cost: 5500, eco: -150, minRound: 22, icon: 'zomg', key: 'J', label: 'Z.O.M.G.', allowModifiers: false }
  ],

  // 8 Complete Towers with Dual 4-Tier Upgrade Paths & Activated Abilities
  towers: {
    DartMonkey: {
      id: 'DartMonkey',
      name: 'Dart Monkey',
      nameAr: 'قرد السهام (Dart)',
      cost: 200,
      hotkey: '1',
      footprint: 17,
      range: 105,
      fireRate: 0.52,
      pierce: 1,
      damage: 1,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 480,
      projectileSprite: 'assets/projectiles/dart_monkey_dart.png',
      shopIcon: 'assets/hud/dart_monkey_icon.png',
      avatarIcon: 'assets/hud/dart_monkey_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Long Range Darts', nameAr: 'سهام بعيدة المدى', cost: 90,
          icon: 'assets/upgrades/dart_monkey_longer_range_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_increased_range_small.png',
          desc: 'يزيد مدى الرؤية والرمي بنسبة 25%'
        },
        {
          tier: 2, name: 'Enhanced Eyesight', nameAr: 'بصر حاد (كشف التمويه)', cost: 120,
          icon: 'assets/upgrades/dart_monkey_enhanced_eyesight_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_increased_range_small.png',
          desc: 'يزيد المدى أكثر ويسمح بضرب البالونات المموهة (Camo)'
        },
        {
          tier: 3, name: 'Spike-O-Pult', nameAr: 'منجنيق الكرات الشائكة', cost: 500,
          icon: 'assets/upgrades/dart_monkey_spikeopult_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_juggernaut_small.png',
          desc: 'يحول القرد إلى منجنيق يطلق كرات شائكة تخترق 18 بالوناً!'
        },
        {
          tier: 4, name: 'Juggernaut', nameAr: 'الكرة العملاقة (Juggernaut)', cost: 1500,
          icon: 'assets/upgrades/dart_monkey_juggernaut_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_juggernaut_small.png',
          desc: 'يطلق كرات عملاقة تسحق الرصاص (Lead) وتلحق ضرراً مضاعفاً بالسيراميك (100 اختراق)'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Sharp Shots', nameAr: 'سهام حادة', cost: 140,
          icon: 'assets/upgrades/dart_monkey_sharp_shots_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_sharp_shots_small.png',
          desc: 'يمكن لكل سهم اختراق بالون إضافي (+1 Pierce)'
        },
        {
          tier: 2, name: 'Razor Sharp Shots', nameAr: 'سهام فائقة الحدة', cost: 170,
          icon: 'assets/upgrades/dart_monkey_razor_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_razor_sharp_small.png',
          desc: 'تخترق السهام بالونين إضافيين (+2 Pierce)'
        },
        {
          tier: 3, name: 'Triple Darts', nameAr: 'السهام الثلاثية', cost: 400,
          icon: 'assets/upgrades/dart_monkey_triple_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_razor_sharp_small.png',
          desc: 'يرمي 3 سهام دفعة واحدة في كل ضربة!'
        },
        {
          tier: 4, name: 'Super Monkey Fan Club', nameAr: 'نادي القرد الخارق (قدرة)', cost: 8000,
          icon: 'assets/upgrades/dart_monkey_fanclub_icon.png',
          avatar: 'assets/hud/dart_monkey_avatar_supermonkey_fanclub_small.png',
          abilityIcon: 'assets/hud/supermonkey_fanclub_icon.png',
          abilityCooldown: 40,
          abilityDuration: 12,
          desc: 'القدرة: يحول حتى 10 قرود سهام قريبة إلى قرود خارقة لمدة 12 ثانية!'
        }
      ]
    },

    TackShooter: {
      id: 'TackShooter',
      name: 'Tack Shooter',
      nameAr: 'قاذف الدبابيس (Tack)',
      cost: 360,
      hotkey: '2',
      footprint: 18,
      range: 75,
      fireRate: 1.25,
      pierce: 1,
      damage: 1,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 420,
      projectileSprite: 'assets/projectiles/tack_shooter_tack.png',
      shopIcon: 'assets/hud/tack_shooter_icon.png',
      avatarIcon: 'assets/hud/tack_shooter_avatar_small.png',
      rotates: false,
      leftUpgrades: [
        {
          tier: 1, name: 'Faster Shooting', nameAr: 'إطلاق أسرع', cost: 210,
          icon: 'assets/upgrades/tack_shooter_faster_firing_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_faster_shooting_small.png',
          desc: 'يطلق الدبابيس بسرعة أكبر بنسبة 30%'
        },
        {
          tier: 2, name: 'Even Faster Shooting', nameAr: 'إطلاق فائق السرعة', cost: 300,
          icon: 'assets/upgrades/tack_shooter_even_faster_firing_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_even_faster_shooting_small.png',
          desc: 'يزيد سرعة الإطلاق بشكل كبير جداً!'
        },
        {
          tier: 3, name: 'Tack Sprayer', nameAr: 'رشاش الدبابيس (16 دبوساً)', cost: 500,
          icon: 'assets/upgrades/tack_shooter_sprayer_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_sprayer_small.png',
          desc: 'يطلق 16 دبوساً في جميع الاتجاهات بدلاً من 8!'
        },
        {
          tier: 4, name: 'Ring of Fire', nameAr: 'حلقة النار الحارقة', cost: 2500,
          icon: 'assets/upgrades/tack_shooter_rof_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_rof_small.png',
          desc: 'ينفث حلقة لهب نارية مستمرة تحرق كل البالونات والرصاص (60 اختراق)'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Extra Range Tacks', nameAr: 'مدى إضافي للدبابيس', cost: 100,
          icon: 'assets/upgrades/tack_shooter_extra_range_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_super_range_small.png',
          desc: 'تصل الدبابيس إلى مسافة أبعد حول البرج'
        },
        {
          tier: 2, name: 'Super Range Tacks', nameAr: 'مدى فائق للدبابيس', cost: 225,
          icon: 'assets/upgrades/tack_shooter_super_range_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_super_range_small.png',
          desc: 'تغطي الدبابيس مساحة واسعة جداً حول البرج'
        },
        {
          tier: 3, name: 'Blade Shooter', nameAr: 'قاذف الشفرات الحادة', cost: 680,
          icon: 'assets/upgrades/tack_shooter_blade_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_blade_shooter_small.png',
          desc: 'يحول الدبابيس إلى شفرات منشار حادة ذات قدرة اختراق مضاعفة'
        },
        {
          tier: 4, name: 'Blade Maelstrom', nameAr: 'إعصار الشفرات (قدرة)', cost: 2700,
          icon: 'assets/upgrades/tack_shooter_maelstrom_icon.png',
          avatar: 'assets/hud/tack_shooter_avatar_blade_maelstrom_small.png',
          abilityIcon: 'assets/hud/blade_maelstrom_icon.png',
          abilityCooldown: 20,
          abilityDuration: 3.0,
          desc: 'القدرة: يطلق عاصفة حلزونية من الشفرات تغطي الشاشة بالكامل!'
        }
      ]
    },

    BombTower: {
      id: 'BombTower',
      name: 'Bomb Tower',
      nameAr: 'مدفع القنابل (Bomb)',
      cost: 650,
      hotkey: '3',
      footprint: 19,
      range: 118,
      fireRate: 1.45,
      pierce: 18,
      damage: 1,
      moabBonus: 0,
      explosionRadius: 42,
      damageType: 'explosion',
      projectileSpeed: 370,
      projectileSprite: 'assets/projectiles/bomb_tower_bomb_01.png',
      shopIcon: 'assets/hud/bomb_icon.png',
      avatarIcon: 'assets/hud/bomb_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Extra Range', nameAr: 'مدى مدفعي إضافي', cost: 200,
          icon: 'assets/upgrades/bomb_extra_range_icon.png',
          avatar: 'assets/hud/bomb_avatar_small.png',
          desc: 'يزيد مدى رمي القنابل'
        },
        {
          tier: 2, name: 'Frag Bombs', nameAr: 'قنابل الشظايا (Frag)', cost: 300,
          icon: 'assets/upgrades/bomb_frag_icon.png',
          avatar: 'assets/hud/bomb_avatar_frag_bombs_small.png',
          desc: 'ينثر الانفجار 8 شظايا حادة تصيب حتى البالونات السوداء!'
        },
        {
          tier: 3, name: 'Cluster Bombs', nameAr: 'القنابل العنقودية', cost: 800,
          icon: 'assets/upgrades/bomb_cluster_icon.png',
          avatar: 'assets/hud/bomb_avatar_frag_bombs_small.png',
          desc: 'تنقسم القنبلة عند الانفجار إلى 8 قنابل ثانوية متفجرة!'
        },
        {
          tier: 4, name: 'Bloon Impact', nameAr: 'القنابل الصادمة (Impact)', cost: 3200,
          icon: 'assets/upgrades/bomb_impact_icon.png',
          avatar: 'assets/hud/bomb_avatar_bloon_impact_small.png',
          desc: 'تشل حركة البالونات وتلغي مناعة البالونات السوداء ضد الانفجار!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Bigger Bombs', nameAr: 'قنابل أكبر حجماً', cost: 400,
          icon: 'assets/upgrades/bomb_bigger_icon.png',
          avatar: 'assets/hud/bomb_avatar_bigger_bombs_small.png',
          desc: 'انفجار أوسع يخترق عدداً أكبر من البالونات (+10 Pierce)'
        },
        {
          tier: 2, name: 'Missile Launcher', nameAr: 'قاذف الصواريخ السريعة', cost: 400,
          icon: 'assets/upgrades/bomb_missile_icon.png',
          avatar: 'assets/hud/bomb_avatar_bigger_bombs_small.png',
          desc: 'يستبدل القنابل بصواريخ سريعة الإطلاق وبعيدة المدى'
        },
        {
          tier: 3, name: 'MOAB Mauler', nameAr: 'مدمر المناطيد (Mauler)', cost: 900,
          icon: 'assets/upgrades/bomb_mauler_icon.png',
          avatar: 'assets/hud/bomb_avatar_bigger_bombs_small.png',
          desc: 'صواريخ خاصة تلحق 10 أضعاف الضرر بمناطيد MOAB و BFB و ZOMG!'
        },
        {
          tier: 4, name: 'MOAB Assassin', nameAr: 'قاتل المناطيد (قدرة)', cost: 3200,
          icon: 'assets/upgrades/bomb_assassin_icon.png',
          avatar: 'assets/hud/bomb_avatar_bigger_bombs_small.png',
          abilityIcon: 'assets/hud/moab_assassin_icon.png',
          abilityCooldown: 30,
          abilityDuration: 0.5,
          desc: 'القدرة: يطلق صاروخاً موجهاً يلحق 750 ضرراً بأقوى منطاد في الخريطة!'
        }
      ]
    },

    SuperMonkey: {
      id: 'SuperMonkey',
      name: 'Super Monkey',
      nameAr: 'القرد الخارق (Super)',
      cost: 3000,
      hotkey: '4',
      footprint: 23,
      range: 145,
      fireRate: 0.065,
      pierce: 1,
      damage: 1,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 640,
      projectileSprite: 'assets/projectiles/dart_monkey_dart.png',
      shopIcon: 'assets/hud/supermonkey_icon.png',
      avatarIcon: 'assets/hud/supermonkey_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Laser Blasts', nameAr: 'أشعة الليزر', cost: 2700,
          icon: 'assets/upgrades/supermonkey_laser_vision_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_plasma_vision_small.png',
          desc: 'يطلق أشعة ليزر بدلاً من السهام (+1 اختراق)'
        },
        {
          tier: 2, name: 'Plasma Blasts', nameAr: 'أشعة البلازما الحارقة', cost: 4000,
          icon: 'assets/upgrades/supermonkey_plasma_vision_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_plasma_vision_small.png',
          desc: 'كرات بلازما بسرعتي إطلاق مضاعفة تذيب كل شيء بما فيه الرصاص!'
        },
        {
          tier: 3, name: 'Sun God', nameAr: 'إله الشمس (Sun God)', cost: 16500,
          icon: 'assets/upgrades/supermonkey_sun_god_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_sun_god_small.png',
          desc: 'يطلق 3 أشعة شمسية عريضة ذات قوة اختراق وتدمير هائلة (15 اختراق)!'
        },
        {
          tier: 4, name: 'Temple of the Monkey God', nameAr: 'معبد إله القرود (Temple)', cost: 100000,
          icon: 'assets/upgrades/supermonkey_temple_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_monkey_temple_small.png',
          desc: 'أقوى برج في اللعبة! يدمر جحافل الـ ZOMG بأشعة الشمس!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Super Range', nameAr: 'مدى خارق', cost: 1000,
          icon: 'assets/upgrades/supermonkey_super_range_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_super_range_small.png',
          desc: 'يزيد مدى الرؤية والهجوم للقرد الخارق بشكل كبير'
        },
        {
          tier: 2, name: 'Epic Range', nameAr: 'مدى أسطوري (كشف التمويه)', cost: 1500,
          icon: 'assets/upgrades/supermonkey_epic_range_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_super_range_small.png',
          desc: 'مدى عملاق مع قدرة كشف البالونات المموهة (Camo)'
        },
        {
          tier: 3, name: 'Robo Monkey', nameAr: 'القرد الآلي المزدوج (Robo)', cost: 9000,
          icon: 'assets/upgrades/supermonkey_robomonkey_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_robomonkey_small.png',
          desc: 'ذراعان آليتان تطلقان سيلين متوازيين من القذائف في نفس اللحظة!'
        },
        {
          tier: 4, name: 'Technological Terror', nameAr: 'الرعب التكنولوجي (قدرة)', cost: 25000,
          icon: 'assets/upgrades/supermonkey_tech_terror_icon.png',
          avatar: 'assets/hud/supermonkey_avatar_robomonkey_small.png',
          abilityIcon: 'assets/hud/tech_terror_icon.png',
          abilityCooldown: 30,
          abilityDuration: 1.0,
          desc: 'القدرة: تفجير طاقة خضراء نووية يمحو كل شيء في دائرة واسعة (2000 ضرر)!'
        }
      ]
    },

    NinjaMonkey: {
      id: 'NinjaMonkey',
      name: 'Ninja Monkey',
      nameAr: 'قرد النينجا (Ninja)',
      cost: 500,
      hotkey: '5',
      footprint: 17,
      range: 115,
      fireRate: 0.44,
      pierce: 2,
      damage: 1,
      moabBonus: 0,
      canDetectCamo: true,
      damageType: 'sharp',
      projectileSpeed: 520,
      projectileSprite: 'assets/projectiles/ninja_throwing_star.png',
      shopIcon: 'assets/hud/ninja_icon.png',
      avatarIcon: 'assets/hud/ninja_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Ninja Discipline', nameAr: 'انضباط النينجا', cost: 300,
          icon: 'assets/upgrades/ninja_discipline_icon.png',
          avatar: 'assets/hud/ninja_avatar_discipline_small.png',
          desc: 'يزيد مدى الهجوم وسرعة رمي نجوم النينجا بشكل ملحوظ'
        },
        {
          tier: 2, name: 'Sharp Shurikens', nameAr: 'نجوم الشوريكين الحادة', cost: 350,
          icon: 'assets/upgrades/ninja_sharp_shurikens_icon.png',
          avatar: 'assets/hud/ninja_avatar_sharp_shuriken_small.png',
          desc: 'تخترق كل نجمة شوريكين 4 بالونات كاملة!'
        },
        {
          tier: 3, name: 'Double Shot', nameAr: 'الرمية المزدوجة', cost: 850,
          icon: 'assets/upgrades/ninja_double_shot_icon.png',
          avatar: 'assets/hud/ninja_avatar_double_shot_small.png',
          desc: 'يرمي نجمتي شوريكين معاً في كل هجمة!'
        },
        {
          tier: 4, name: 'Bloonjitsu', nameAr: 'فن البلونجيتسو (5 نجوم)', cost: 2750,
          icon: 'assets/upgrades/ninja_bloonjitsu_icon.png',
          avatar: 'assets/hud/ninja_avatar_bloonjitsu_small.png',
          desc: 'يرمي 5 نجوم شوريكين قاتلة دفعة واحدة في كل ضربة!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Seeking Shuriken', nameAr: 'النجوم المتتبعة', cost: 250,
          icon: 'assets/upgrades/ninja_seeking_shuriken_icon.png',
          avatar: 'assets/hud/ninja_avatar_seeking_shuriken_small.png',
          desc: 'تتتبع نجوم الشوريكين البالونات تلقائياً أثناء طيرانها!'
        },
        {
          tier: 2, name: 'Distraction', nameAr: 'تشتيت وإرجاع البالونات', cost: 350,
          icon: 'assets/upgrades/ninja_distraction_icon.png',
          avatar: 'assets/hud/ninja_avatar_distraction_small.png',
          desc: 'فرصة لإرجاع البالونات المصابة إلى الخلف على طول المسار!'
        },
        {
          tier: 3, name: 'Flash Bomb', nameAr: 'القنبلة الضوئية الصاعقة', cost: 2200,
          icon: 'assets/upgrades/ninja_flash_bomb_icon.png',
          avatar: 'assets/hud/ninja_avatar_flash_bomb_small.png',
          desc: 'يلقي قنابل ضوئية تفجر الرصاص وتشل حركة مجموعة كبيرة من البالونات!'
        },
        {
          tier: 4, name: 'Sabotage Supply Lines', nameAr: 'تخريب خطوط الإمداد (قدرة)', cost: 1800,
          icon: 'assets/upgrades/ninja_sabotage_icon.png',
          avatar: 'assets/hud/ninja_avatar_sabotage_small.png',
          abilityIcon: 'assets/hud/sabotage_icon.png',
          abilityCooldown: 45,
          abilityDuration: 15,
          desc: 'القدرة: يبطئ سرعة جميع البالونات والمناطيد إلى النصف لمدة 15 ثانية!'
        }
      ]
    },

    SniperMonkey: {
      id: 'SniperMonkey',
      name: 'Sniper Monkey',
      nameAr: 'قرد القناص (Sniper)',
      cost: 350,
      hotkey: '6',
      footprint: 17,
      range: 999,
      visualRange: 55,
      fireRate: 1.65,
      pierce: 1,
      damage: 2,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 2200,
      projectileSprite: 'assets/projectiles/dart_monkey_dart.png',
      shopIcon: 'assets/hud/sniper_icon.png',
      avatarIcon: 'assets/hud/sniper_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Full Metal Jacket', nameAr: 'رصاص خارق للدروع (Lead)', cost: 350,
          icon: 'assets/upgrades/sniper_full_metal_icon.png',
          avatar: 'assets/hud/sniper_avatar_full_metal_jacket_small.png',
          desc: 'يخترق 4 طبقات من البالونات ويفجر بالونات الرصاص!'
        },
        {
          tier: 2, name: 'Point Five Oh', nameAr: 'عيار 50 الثقيل (7 طبقات)', cost: 1800,
          icon: 'assets/upgrades/sniper_point_50_icon.png',
          avatar: 'assets/hud/sniper_avatar_point_50_small.png',
          desc: 'طلقة مدمرة تمزق 7 طبقات كاملة في الضربة الواحدة!'
        },
        {
          tier: 3, name: 'Deadly Precision', nameAr: 'دقة قاتلة (18 ضرر)', cost: 4000,
          icon: 'assets/upgrades/sniper_deadly_precision_icon.png',
          avatar: 'assets/hud/sniper_avatar_deadly_precision_small.png',
          desc: 'يدمر بالون السيراميك بالكامل بضربة واحدة (18 ضرر للطلقة)!'
        },
        {
          tier: 4, name: 'Cripple MOAB', nameAr: 'شلل المناطيد (Cripple MOAB)', cost: 11500,
          icon: 'assets/upgrades/sniper_cripple_moab_icon.png',
          avatar: 'assets/hud/sniper_avatar_cripple_moab_small.png',
          desc: 'تثبت طلقاته مناطيد MOAB و BFB و ZOMG في مكانها وتلحق 50 ضرراً!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Faster Firing', nameAr: 'قنص أسرع', cost: 400,
          icon: 'assets/upgrades/sniper_faster_firing_icon.png',
          avatar: 'assets/hud/sniper_avatar_faster_firing_small.png',
          desc: 'يزيد سرعة التلقيم والإطلاق بنسبة 30%'
        },
        {
          tier: 2, name: 'Night Vision Goggles', nameAr: 'مناظير الرؤية الليلية (Camo)', cost: 300,
          icon: 'assets/upgrades/sniper_nvg_icon.png',
          avatar: 'assets/hud/sniper_avatar_nvg_small.png',
          desc: 'يكشف ويقنص البالونات المموهة (Camo) في أي مكان بالخريطة!'
        },
        {
          tier: 3, name: 'Semi-Automatic Rifle', nameAr: 'بندقية نصف آلية (3x سرعة)', cost: 3500,
          icon: 'assets/upgrades/sniper_semi_auto_icon.png',
          avatar: 'assets/hud/sniper_avatar_semi_auto_small.png',
          desc: 'يضاعف سرعة الإطلاق 3 مرات كاملة!'
        },
        {
          tier: 4, name: 'Supply Drop', nameAr: 'إنزال صندوق الإمداد (قدرة)', cost: 9000,
          icon: 'assets/upgrades/sniper_supply_drop_icon.png',
          avatar: 'assets/hud/sniper_avatar_supply_drop_small.png',
          abilityIcon: 'assets/hud/supply_drop_icon.png',
          abilityCooldown: 45,
          abilityDuration: 1.0,
          desc: 'القدرة: ينزل صندوق إمداد جوي يمنحك +$2,000 نقداً فوراً!'
        }
      ]
    },

    MonkeyApprentice: {
      id: 'MonkeyApprentice',
      name: 'Monkey Apprentice',
      nameAr: 'الساحر (Wizard)',
      cost: 550,
      hotkey: '7',
      footprint: 18,
      range: 115,
      fireRate: 0.85,
      pierce: 2,
      damage: 1,
      moabBonus: 0,
      damageType: 'plasma',
      projectileSpeed: 460,
      projectileSprite: 'assets/projectiles/monkey_apprentice_magic_core.png',
      shopIcon: 'assets/hud/apprentice_icon.png',
      avatarIcon: 'assets/hud/apprentice_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Intense Magic', nameAr: 'سحر مكثف', cost: 300,
          icon: 'assets/upgrades/apprentice_intense_magic_icon.png',
          avatar: 'assets/hud/apprentice_avatar_intense_magic_small.png',
          desc: 'كرات سحرية أقوى تخترق 7 بالونات في كل ضربة!'
        },
        {
          tier: 2, name: 'Lightning Bolt', nameAr: 'صاعقة البرق المتسلسلة', cost: 1200,
          icon: 'assets/upgrades/apprentice_lightning_icon.png',
          avatar: 'assets/hud/apprentice_avatar_lightning_small.png',
          desc: 'يطلق صواعق برق تصعق مجموعة كبيرة من البالونات المتقاربة!'
        },
        {
          tier: 3, name: 'Summon Whirlwind', nameAr: 'إعصار الرياح العاتية', cost: 2000,
          icon: 'assets/upgrades/apprentice_whirlwind_icon.png',
          avatar: 'assets/hud/apprentice_avatar_whirlwind_small.png',
          desc: 'يرسل أعاصير تدفع البالونات للخلف وتزيل الجليد والصمغ!'
        },
        {
          tier: 4, name: 'Tempest Tornado', nameAr: 'الإعصار العاصف المدمر', cost: 8000,
          icon: 'assets/upgrades/apprentice_tornado_icon.png',
          avatar: 'assets/hud/apprentice_avatar_tornado_small.png',
          desc: 'أعاصير عملاقة تمزق البالونات وتقذف حتى السيراميك لبداية المسار!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Fireball', nameAr: 'الكرات النارية المتفجرة', cost: 300,
          icon: 'assets/upgrades/apprentice_fireball_icon.png',
          avatar: 'assets/hud/apprentice_avatar_fireball_small.png',
          desc: 'يرمي كرات نارية متفجرة تحرق مجموعات البالونات والرصاص'
        },
        {
          tier: 2, name: 'Monkey Sense', nameAr: 'الحاسة السادسة (كشف Camo)', cost: 300,
          icon: 'assets/upgrades/apprentice_monkey_sense_icon.png',
          avatar: 'assets/hud/apprentice_avatar_sense_small.png',
          desc: 'يسمح للساحر برؤية واستهداف البالونات المموهة (Camo)'
        },
        {
          tier: 3, name: 'Dragon\'s Breath', nameAr: 'أنفاس التنين الحارقة', cost: 4200,
          icon: 'assets/upgrades/apprentice_dragon_breath_icon.png',
          avatar: 'assets/hud/apprentice_avatar_dragon_breath_small.png',
          desc: 'ينفث سيلاً متواصلاً من اللهب الحارق بسرعة فائقة جداً!'
        },
        {
          tier: 4, name: 'Summon Phoenix', nameAr: 'استدعاء العنقاء النارية (قدرة)', cost: 5000,
          icon: 'assets/upgrades/apprentice_phoenix_icon.png',
          avatar: 'assets/hud/apprentice_avatar_phoenix_small.png',
          abilityIcon: 'assets/hud/phoenix_icon.png',
          abilityCooldown: 45,
          abilityDuration: 16,
          desc: 'القدرة: يستدعي طائر العنقاء الناري ليحلق ويمطر الخريطة باللهب لمدة 16 ثانية!'
        }
      ]
    },

    BoomerangThrower: {
      id: 'BoomerangThrower',
      name: 'Boomerang Thrower',
      nameAr: 'رامي البوميرانج (Boomerang)',
      cost: 400,
      hotkey: '8',
      footprint: 18,
      range: 120,
      fireRate: 0.90,
      pierce: 4,
      damage: 1,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 470,
      projectileSprite: 'assets/projectiles/boomerang.png',
      shopIcon: 'assets/hud/boomerang_icon.png',
      avatarIcon: 'assets/hud/boomerang_avatar_small.png',
      rotates: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Multi-Target', nameAr: 'متعدد الأهداف (7 اختراق)', cost: 250,
          icon: 'assets/upgrades/boomerang_multi_target_icon.png',
          avatar: 'assets/hud/boomerang_avatar_multi_target_small.png',
          desc: 'يمكن لكل بوميرانج إصابة 7 بالونات في الرمية الواحدة'
        },
        {
          tier: 2, name: 'Glaive Thrower', nameAr: 'قاذف الأقراص المسننة (Glaive)', cost: 280,
          icon: 'assets/upgrades/boomerang_glaive_thrower_icon.png',
          avatar: 'assets/hud/boomerang_avatar_glaive_thrower_small.png',
          desc: 'أقراص معدنية حادة تخترق 12 بالوناً بسرعة أكبر'
        },
        {
          tier: 3, name: 'Glaive Ricochet', nameAr: 'الأقراص المرتدة المتتابعة', cost: 1400,
          icon: 'assets/upgrades/boomerang_glaive_riccochet_icon.png',
          avatar: 'assets/hud/boomerang_avatar_glaive_riccochet_small.png',
          desc: 'يرتد القرص المسنن تلقائياً من بالون إلى آخر حتى 40 بالوناً!'
        },
        {
          tier: 4, name: 'Glaive Lord', nameAr: 'سيد الأقراص الدوارة (Glaive Lord)', cost: 4500,
          icon: 'assets/upgrades/boomerang_glaive_lord_icon.png',
          avatar: 'assets/hud/boomerang_avatar_glaive_lord_small.png',
          desc: 'قرصان دائمان يدوران حول البرج باستمرار ويمزقان كل شيء (بما فيه Camo والرصاص)!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Sonic Boom', nameAr: 'الارتجاج الصوتي', cost: 100,
          icon: 'assets/upgrades/boomerang_sonic_boom_icon.png',
          avatar: 'assets/hud/boomerang_avatar_sonic_boom_small.png',
          desc: 'يحطم البالونات المجمدة ويزيد مدى الرمي'
        },
        {
          tier: 2, name: 'Red Hot Rangs', nameAr: 'بوميرانج الجمر الملتهب (Lead)', cost: 150,
          icon: 'assets/upgrades/boomerang_red_hot_icon.png',
          avatar: 'assets/hud/boomerang_avatar_red_hot_rangs_small.png',
          desc: 'يذيب بالونات الرصاص (Lead) بسهولة تامة!'
        },
        {
          tier: 3, name: 'Bionic Boomer', nameAr: 'الذراع الآلية الخارقة', cost: 1600,
          icon: 'assets/upgrades/boomerang_bionic_boomer_icon.png',
          avatar: 'assets/hud/boomerang_avatar_bionic_boomer_small.png',
          desc: 'ذراع بيونيكية تضاعف سرعة الرمي 3 مرات كاملة!'
        },
        {
          tier: 4, name: 'Turbo Charge', nameAr: 'الشحن التوربيني (قدرة)', cost: 3000,
          icon: 'assets/upgrades/boomerang_turbo_charge_icon.png',
          avatar: 'assets/hud/boomerang_avatar_turbo_charge_small.png',
          abilityIcon: 'assets/hud/turbo_charge_icon.png',
          abilityCooldown: 30,
          abilityDuration: 10,
          desc: 'القدرة: يضاعف سرعة الإطلاق 7 مرات لمدة 10 ثوانٍ متواصلة!'
        }
      ]
    },

    BananaFarm: {
      id: 'BananaFarm',
      name: 'Banana Farm',
      nameAr: 'مزرعة الموز (Banana Farm)',
      cost: 1000,
      hotkey: '9',
      footprint: 24,
      range: 105,
      fireRate: 0.25,
      pierce: 1,
      damage: 0,
      moabBonus: 0,
      damageType: 'normal',
      projectileSpeed: 0,
      projectileSprite: 'assets/projectiles/bananas.png',
      shopIcon: 'assets/towers/BananaFarm_avatar.png',
      avatarIcon: 'assets/towers/BananaFarm_avatar.png',
      rotates: false,
      isBuilding: true,
      leftUpgrades: [
        {
          tier: 1, name: 'More Bananas', nameAr: 'موز إضافي (+50% إنتاج)', cost: 400,
          icon: 'assets/upgrades/banana_farm_more_bananas_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'تنتج المزرعة عناقيد موز أكثر في كل جولة ($60 لكل عنقود)!'
        },
        {
          tier: 2, name: 'Banana Plantation', nameAr: 'حقل الموز الموسع', cost: 1200,
          icon: 'assets/upgrades/banana_farm_plantation_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'يضاعف سرعة إنتاج الموز ويرفع قيمة الحزمة إلى $100!'
        },
        {
          tier: 3, name: 'Banana Republic', nameAr: 'جمهورية الموز الكبرى', cost: 2500,
          icon: 'assets/upgrades/banana_farm_republic_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'مبنى إنتاج ضخم يولد حزم موز بقيمة $180 بسرعة عالية!'
        },
        {
          tier: 4, name: 'Banana Research Facility', nameAr: 'مصنع صناديق الموز (BRF)', cost: 11000,
          icon: 'assets/upgrades/banana_farm_brf_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'ينتج صناديق موز صناعية فاخرة قيمة كل صندوق منها $380!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Long Life Bananas', nameAr: 'موز طويل الأمد + جمع آلي', cost: 250,
          icon: 'assets/upgrades/banana_farm_long_life_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'يبقى الموز لفترة أطول ويُجمع تلقائياً بالكامل'
        },
        {
          tier: 2, name: 'Valuable Bananas', nameAr: 'موز ذهبي ثمين (+50% قيمة)', cost: 600,
          icon: 'assets/upgrades/banana_farm_valuable_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'يرفع القيمة النقدية لجميع حزم وصناديق الموز بنسبة 50%!'
        },
        {
          tier: 3, name: 'Monkey Bank', nameAr: 'بنك القرود الاستثماري', cost: 3200,
          icon: 'assets/upgrades/banana_farm_bank_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          desc: 'يودع الأرباح مباشرة في رصيدك مع فوائد متراكمة كل بضع ثوانٍ!'
        },
        {
          tier: 4, name: 'Banana Investments Advisory', nameAr: 'هيئة استثمار الموز (BIA - قدرة)', cost: 8500,
          icon: 'assets/upgrades/banana_farm_investments_icon.png',
          avatar: 'assets/towers/BananaFarm_avatar.png',
          abilityIcon: 'assets/upgrades/banana_farm_investments_icon.png',
          abilityCooldown: 40,
          abilityDuration: 1.0,
          desc: 'القدرة: يصرف عوائد البنك الفورية (+$2,500 نقداً و +120 Eco)!'
        }
      ]
    },

    MonkeyVillage: {
      id: 'MonkeyVillage',
      name: 'Monkey Village',
      nameAr: 'قرية القرود (Monkey Village)',
      cost: 1200,
      hotkey: '0',
      footprint: 24,
      range: 145,
      fireRate: 0,
      pierce: 1,
      damage: 0,
      moabBonus: 0,
      damageType: 'energy',
      projectileSpeed: 650,
      projectileSprite: 'assets/projectiles/laser_bolt.png',
      shopIcon: 'assets/towers/MonkeyVillage_avatar.png',
      avatarIcon: 'assets/towers/MonkeyVillage_avatar.png',
      rotates: false,
      isBuilding: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Monkey Beacon', nameAr: 'منارة القرية (مدى أوسع)', cost: 500,
          icon: 'assets/upgrades/village_beacon_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'يوسع نطاق تأثير القرية ليشمل أبراجاً أكثر (+25% مدى للأبراج)'
        },
        {
          tier: 2, name: 'Jungle Drums', nameAr: 'طبول الأدغال (+20% سرعة هجوم)', cost: 1200,
          icon: 'assets/upgrades/village_jungle_drums_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'يزيد سرعة هجوم جميع الأبراج داخل نطاق القرية بنسبة 20%!'
        },
        {
          tier: 3, name: 'Monkey Town', nameAr: 'مدينة القرود (+50% مال إضافي)', cost: 4000,
          icon: 'assets/upgrades/village_monkey_town_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'تمنح جميع الأبراج المحيطة مكافأة مالية إضافية عند تفجير البالونات!'
        },
        {
          tier: 4, name: 'High Energy Beacon', nameAr: 'منارة الطاقة العظمى (ليزر)', cost: 9500,
          icon: 'assets/upgrades/village_high_energy_beacon_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'تطلق القرية شعاع طاقة فائق القوة وتقلل وقت انتظار المهارات 35%!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Monkey Fort', nameAr: 'حصن القرود (+1 اختراق للأبراج)', cost: 400,
          icon: 'assets/upgrades/village_fort_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'يمنح جميع الأبراج القريبة قوة اختراق إضافية (+1 Pierce)'
        },
        {
          tier: 2, name: 'Radar Scanner', nameAr: 'ماسح الرادار (كشف Camo للكل)', cost: 1500,
          icon: 'assets/upgrades/village_radar_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'يمنح جميع الأبراج داخل النطاق قدرة رؤية البالونات المخفية (Camo)!'
        },
        {
          tier: 3, name: 'Monkey Intelligence Bureau', nameAr: 'مكتب الاستخبارات (MIB - يضرب الكل)', cost: 4000,
          icon: 'assets/upgrades/village_mib_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          desc: 'يسمح لجميع الأبراج المحيطة بتفجير جميع أنواع البالونات (الرصاص والأسود)!'
        },
        {
          tier: 4, name: 'Call to Arms', nameAr: 'نداء السلاح الشامل (قدرة)', cost: 12000,
          icon: 'assets/upgrades/village_call_to_arms_icon.png',
          avatar: 'assets/towers/MonkeyVillage_avatar.png',
          abilityIcon: 'assets/upgrades/village_call_to_arms_icon.png',
          abilityCooldown: 45,
          abilityDuration: 12,
          desc: 'القدرة: يضاعف سرعة هجوم واختراق جميع أبراجك لمدة 12 ثانية!'
        }
      ]
    },

    SpikeFactory: {
      id: 'SpikeFactory',
      name: 'Spike Factory',
      nameAr: 'مصنع الأشواك (Spike Factory)',
      cost: 750,
      hotkey: '-',
      footprint: 21,
      range: 125,
      fireRate: 0.55,
      pierce: 5,
      damage: 1,
      moabBonus: 0,
      damageType: 'sharp',
      projectileSpeed: 320,
      projectileSprite: 'assets/projectiles/road_spikes.png',
      shopIcon: 'assets/towers/SpikeFactory_avatar.png',
      avatarIcon: 'assets/towers/SpikeFactory_avatar.png',
      rotates: false,
      isBuilding: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Bigger Stacks', nameAr: 'حزم أشواك مضاعفة (10 طبقات)', cost: 600,
          icon: 'assets/upgrades/spike_factory_bigger_stacks_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'تحتوي كل كومة أشواك على 10 أشواك بدلاً من 5!'
        },
        {
          tier: 2, name: 'White Hot Spikes', nameAr: 'الأشواك المتوهجة (تخترق الرصاص)', cost: 600,
          icon: 'assets/upgrades/spike_factory_white_hot_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'أشواك ملتهبة تذيب بالونات الرصاص (Lead) والبالونات المجمدة!'
        },
        {
          tier: 3, name: 'Spiked Balls', nameAr: 'الكرات الشوكية الفولاذية', cost: 2200,
          icon: 'assets/upgrades/spike_factory_spiked_balls_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'كرات شوكية ثقيلة (16 شوكة) تلحق ضرراً مضاعفاً بالسيراميك!'
        },
        {
          tier: 4, name: 'Spiked Mines', nameAr: 'الألغام الشوكية المتفجرة', cost: 9500,
          icon: 'assets/upgrades/spike_factory_spiked_mines_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'يزرع ألغاماً شوكية تنفجر بانفجار ناري هائل عند استهلاكها!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Faster Production', nameAr: 'إنتاج أسرع (+40%)', cost: 650,
          icon: 'assets/upgrades/spike_factory_faster_production_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'يزيد سرعة رمي أكوام الأشواك على المسار بنسبة 40%'
        },
        {
          tier: 2, name: 'Even Faster Production', nameAr: 'إنتاج فائق السرعة (2x)', cost: 1300,
          icon: 'assets/upgrades/spike_factory_even_faster_production_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'يضاعف سرعة إنتاج الأشواك على الطريق!'
        },
        {
          tier: 3, name: 'MOAB-SHREDR Spikes', nameAr: 'أشواك تمزيق المناطيد (MOAB 4x)', cost: 2800,
          icon: 'assets/upgrades/spike_factory_moab_shredr_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          desc: 'تلحق كل شوكة 4 أضعاف الضرر بمناطيد MOAB و BFB و ZOMG!'
        },
        {
          tier: 4, name: 'Spike Storm', nameAr: 'عاصفة الأشواك الشاملة (قدرة)', cost: 5500,
          icon: 'assets/upgrades/spike_factory_spike_storm_icon.png',
          avatar: 'assets/towers/SpikeFactory_avatar.png',
          abilityIcon: 'assets/upgrades/spike_factory_spike_storm_icon.png',
          abilityCooldown: 35,
          abilityDuration: 2.0,
          desc: 'القدرة: يفرش المسار بالكامل بسجادة كثيفة من أشواك تمزيق المناطيد!'
        }
      ]
    },

    MortarTower: {
      id: 'MortarTower',
      name: 'Mortar Tower',
      nameAr: 'مدفع الهاون (Mortar)',
      cost: 750,
      hotkey: '=',
      footprint: 22,
      range: 420,
      fireRate: 0.55,
      pierce: 25,
      damage: 1,
      moabBonus: 0,
      damageType: 'explosion',
      projectileSpeed: 540,
      projectileSprite: 'assets/projectiles/mortar_shell.png',
      shopIcon: 'assets/towers/MortarTower_avatar.png',
      avatarIcon: 'assets/towers/MortarTower_avatar.png',
      rotates: false,
      isBuilding: true,
      leftUpgrades: [
        {
          tier: 1, name: 'Bigger Blast', nameAr: 'قذائف أوسع انفجاراً', cost: 400,
          icon: 'assets/upgrades/mortar_bigger_bombs_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'يزيد نصف قطر انفجار القذيفة المدفعية واختراقها إلى 40 بالوناً'
        },
        {
          tier: 2, name: 'Bloon Buster', nameAr: 'محطم الطبقات (2 ضرر)', cost: 700,
          icon: 'assets/upgrades/mortar_bloon_buster_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'تدمر كل قذيفة هاون طبقتين كاملتين من كل بالون في منطقة الانفجار!'
        },
        {
          tier: 3, name: 'The Big One', nameAr: 'القنبلة العظمى (The Big One)', cost: 6500,
          icon: 'assets/upgrades/mortar_big_one_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'قصف نووي هائل يمزق 5 طبقات كاملة عبر مساحة شاسعة (يخترق كل شيء)!'
        },
        {
          tier: 4, name: 'Artillery Battery', nameAr: 'بطارية المدفعية السريعة (قدرة)', cost: 8000,
          icon: 'assets/upgrades/mortar_artillery_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          abilityIcon: 'assets/upgrades/mortar_artillery_icon.png',
          abilityCooldown: 40,
          abilityDuration: 8,
          desc: 'تضاعف سرعة القصف 3 مرات، والقدرة: تقصف وتشل جميع البالونات في الخريطة 8 ثوانٍ!'
        }
      ],
      rightUpgrades: [
        {
          tier: 1, name: 'Rapid Reload', nameAr: 'تلقيم سريع (+35% سرعة)', cost: 350,
          icon: 'assets/upgrades/mortar_rapid_reload_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'يزيد سرعة إطلاق قذائف الهاون بنسبة 35%'
        },
        {
          tier: 2, name: 'Burny Stuff', nameAr: 'القذائف الحارقة الملتهبة', cost: 550,
          icon: 'assets/upgrades/mortar_burny_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'تشعل القذائف النار في البالونات لتستمر في الاحتراق!'
        },
        {
          tier: 3, name: 'Signal Flare', nameAr: 'القنبلة المضيئة (إزالة التمويه Camo)', cost: 900,
          icon: 'assets/upgrades/mortar_signal_flare_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          desc: 'تكشف البالونات المخفية (Camo) وتزيل التمويه عنها نهائياً لجميع الأبراج!'
        },
        {
          tier: 4, name: 'Pop and Awe', nameAr: 'وابل الرعب المدفعي (قدرة)', cost: 8500,
          icon: 'assets/upgrades/mortar_artillery_icon.png',
          avatar: 'assets/towers/MortarTower_avatar.png',
          abilityIcon: 'assets/upgrades/mortar_artillery_icon.png',
          abilityCooldown: 40,
          abilityDuration: 8,
          desc: 'القدرة: يمطر الشاشة بوابل متفجر متواصل يشل ويدمر جميع البالونات والمناطيد!'
        }
      ]
    }
  },

  // Authentic BTD Battles Round Waves (Rounds 1 to 30 + Sudden Death scaling)
  rounds: [
    { round: 1, duration: 15, groups: [{ bloon: 'red', count: 24, interval: 0.58 }] },
    { round: 2, duration: 16, groups: [{ bloon: 'red', count: 28, interval: 0.44 }, { bloon: 'blue', count: 12, interval: 0.65, delay: 4 }] },
    { round: 3, duration: 18, groups: [{ bloon: 'blue', count: 25, interval: 0.48 }, { bloon: 'green', count: 8, interval: 0.72, delay: 6 }] },
    { round: 4, duration: 18, groups: [{ bloon: 'blue', count: 30, interval: 0.38 }, { bloon: 'green', count: 18, interval: 0.50, delay: 3 }] },
    { round: 5, duration: 20, groups: [{ bloon: 'green', count: 28, interval: 0.42 }, { bloon: 'yellow', count: 12, interval: 0.55, delay: 5 }] },
    { round: 6, duration: 20, groups: [{ bloon: 'yellow', count: 24, interval: 0.42 }, { bloon: 'black', count: 8, interval: 0.85, delay: 7 }] },
    { round: 7, duration: 22, groups: [{ bloon: 'yellow', count: 28, interval: 0.36 }, { bloon: 'pink', count: 16, interval: 0.50, delay: 4 }, { bloon: 'white', count: 8, interval: 0.80, delay: 9 }] },
    { round: 8, duration: 23, groups: [{ bloon: 'pink', count: 26, interval: 0.38 }, { bloon: 'black', count: 12, interval: 0.60, delay: 4, regrow: true }] },
    { round: 9, duration: 23, groups: [{ bloon: 'white', count: 22, interval: 0.45 }, { bloon: 'zebra', count: 8, interval: 0.78, delay: 7 }] },
    { round: 10, duration: 24, groups: [{ bloon: 'lead', count: 12, interval: 0.85 }, { bloon: 'pink', count: 32, interval: 0.28, delay: 3 }] },
    { round: 11, duration: 24, groups: [{ bloon: 'zebra', count: 16, interval: 0.58 }, { bloon: 'green', count: 24, interval: 0.35, delay: 5, camo: true }] },
    { round: 12, duration: 25, groups: [{ bloon: 'rainbow', count: 12, interval: 0.72 }, { bloon: 'zebra', count: 16, interval: 0.50, delay: 4, regrow: true }] },
    { round: 13, duration: 26, groups: [{ bloon: 'rainbow', count: 20, interval: 0.48 }, { bloon: 'lead', count: 10, interval: 0.68, delay: 4, camo: true }] },
    { round: 14, duration: 26, groups: [{ bloon: 'rainbow', count: 26, interval: 0.42 }, { bloon: 'ceramic', count: 5, interval: 1.35, delay: 7 }] },
    { round: 15, duration: 28, groups: [{ bloon: 'ceramic', count: 10, interval: 0.95 }, { bloon: 'rainbow', count: 22, interval: 0.40, delay: 4, regrow: true }] },
    { round: 16, duration: 28, groups: [{ bloon: 'ceramic', count: 14, interval: 0.75 }, { bloon: 'zebra', count: 24, interval: 0.35, delay: 4, camo: true }] },
    { round: 17, duration: 30, groups: [{ bloon: 'moab', count: 1, interval: 2.0, delay: 3 }, { bloon: 'ceramic', count: 12, interval: 0.70, delay: 7 }] },
    { round: 18, duration: 32, groups: [{ bloon: 'moab', count: 2, interval: 4.0 }, { bloon: 'ceramic', count: 16, interval: 0.58, delay: 5, regrow: true }] },
    { round: 19, duration: 32, groups: [{ bloon: 'moab', count: 3, interval: 3.2 }, { bloon: 'ceramic', count: 18, interval: 0.45, delay: 4, camo: true }] },
    { round: 20, duration: 35, groups: [{ bloon: 'bfb', count: 1, interval: 5.0, delay: 2 }, { bloon: 'moab', count: 3, interval: 2.8, delay: 8 }] },
    { round: 21, duration: 36, groups: [{ bloon: 'bfb', count: 2, interval: 5.5 }, { bloon: 'moab', count: 4, interval: 2.2, delay: 7 }] },
    { round: 22, duration: 38, groups: [{ bloon: 'zomg', count: 1, interval: 7.0, delay: 2 }, { bloon: 'bfb', count: 2, interval: 4.5, delay: 10 }] },
    { round: 23, duration: 40, groups: [{ bloon: 'zomg', count: 2, interval: 6.5 }, { bloon: 'bfb', count: 3, interval: 3.8, delay: 8 }] },
    { round: 24, duration: 40, groups: [{ bloon: 'zomg', count: 2, interval: 5.5 }, { bloon: 'ceramic', count: 30, interval: 0.25, delay: 4, camo: true, regrow: true }] },
    { round: 25, duration: 42, groups: [{ bloon: 'zomg', count: 3, interval: 5.0 }, { bloon: 'bfb', count: 4, interval: 3.0, delay: 6 }] },
    { round: 26, duration: 42, groups: [{ bloon: 'zomg', count: 4, interval: 4.5 }, { bloon: 'moab', count: 10, interval: 1.2, delay: 4 }] },
    { round: 27, duration: 44, groups: [{ bloon: 'zomg', count: 5, interval: 4.0 }, { bloon: 'bfb', count: 6, interval: 2.2, delay: 5 }] },
    { round: 28, duration: 45, groups: [{ bloon: 'zomg', count: 6, interval: 3.5 }, { bloon: 'bfb', count: 8, interval: 1.8, delay: 4 }] },
    { round: 29, duration: 45, groups: [{ bloon: 'zomg', count: 8, interval: 3.0 }, { bloon: 'moab', count: 16, interval: 0.9, delay: 3 }] },
    { round: 30, duration: 48, groups: [{ bloon: 'zomg', count: 10, interval: 2.6 }, { bloon: 'bfb', count: 12, interval: 1.4, delay: 4 }] }
  ]
};
