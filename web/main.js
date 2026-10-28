/**
 * Bloons TD Battles — Main Application Controller (main.js)
 * Connects:
 *  - Main Menu (3 Modes: 1v1 vs AI, 1v1 Online with Friend, & 8-Player Battle Royale Arena)
 *  - Authentic Pre-Match Queue & Tower Loadout Screen (7 Authentic Maps, 12 Towers & Buildings including Banana Farm, Monkey Village, Spike Factory, Mortar Tower)
 *  - Authentic In-Battle HUD (Bottom Dock, Banana Collection on Hover/Touch, Camo & Regrow Modifiers, Floating Powers & Abilities)
 *  - Mobile Camera Zoom Mode ("🔍 خريطتي" 480x640 / "⚔️ الاثنين" 968x640 / "👁️ الخصم" / "🌐 الكل (8)" 4x2 Mega Grid)
 */

const BOT_NAMES_AR = [
  'قرد الصاعقة 🤖',
  'سيد الموز 🤖',
  'نينجا الظلام 🤖',
  'قائد الهاون 🤖',
  'امبراطور المعبد 🤖',
  'صائد الزبلين 🤖',
  'حارس القرية 🤖'
];

class GameApp {
  constructor() {
    this.mode = 'ai'; // 'ai' | 'friend' | 'royale_local' | 'royale_online'
    this.isRoyale = false;
    this.role = 'host'; // 'host' | 'guest'
    this.myPlayerId = 'local_p1';
    this.selectedMapId = 'battle_park';
    this.ws = null;
    this.roomCode = null;
    this.myName = 'أنت';
    this.opponentName = 'الآلة (AI)';

    // Pre-Match Loadout (4 chosen towers out of 12 + 1 bonus tower)
    this.chosenLoadout = ['DartMonkey', 'WizardMonkey', 'BananaFarm', 'SuperMonkey'];
    this.activeMatchLoadout = [];
    this.isReadyInLobby = false;

    // 8-Player Battle Royale Lobby & Match State
    this.localRoyalePlayers = [];
    this.royaleParticipants = []; // [{ id, name, isMe, isBot, field, ai, eliminated, elimRank }]
    this.royaleTargetId = 'auto'; // 'auto' or participant.id
    this.royaleViewedId = null;   // participant.id currently shown in opponent panel
    this.eliminationCounter = 0;

    // Camera Mode ('split' = 968x640, 'mine' = 480x640, 'enemy' = 480x640, 'grid' = 968x640 4x2 8-Player Grid)
    this.cameraMode = window.innerWidth <= 850 ? 'mine' : 'split';

    // Camo & Regrow Send Modifiers
    this.sendCamoMod = false;
    this.sendRegrowMod = false;

    // Authentic 5-Slot Bloon Send Queue
    this.bloonSendQueue = [];

    // Battle state
    this.running = false;
    this.gameOver = false;
    this.playerField = null;
    this.opponentField = null;
    this.aiController = null;

    this.currentRound = 1;
    this.roundTimer = 0;
    this.ecoTimer = 0;
    this.syncTimer = 0;

    // Placement & Touch Dragging
    this.placingTowerType = null;
    this.pointerCanvasPos = { x: 240, y: 320, insideLeft: true };
    this.selectedTowerId = null;
    this.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    this.canvas = document.getElementById('battle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.lastFrameTime = performance.now();
  }

  async init() {
    window.SFX.preload();

    const barFill = document.getElementById('loading-bar-fill');
    const barPct = document.getElementById('loading-percent');

    await window.ASSETS.loadAll((progress) => {
      const pct = Math.round(progress * 100);
      barFill.style.width = `${pct}%`;
      barPct.textContent = `${pct}%`;
    });

    this.bindMenuEvents();
    this.bindLoadoutScreenEvents();
    this.bindBattleUIEvents();
    this.buildBloonSendUI();
    this.applyCameraMode(this.cameraMode);

    this.showScreen('menu-screen');
    requestAnimationFrame((t) => this.loop(t));
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  }

  toggleFullscreen() {
    window.SFX.play('button_click');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  bindMenuEvents() {
    const btnMute = document.getElementById('btn-mute');
    btnMute.addEventListener('click', () => {
      const on = window.SFX.toggleMute();
      btnMute.textContent = on ? '🔊 الصوت: مفعل' : '🔇 الصوت: صامت';
      window.SFX.play('button_click');
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => this.toggleFullscreen());

    // Mode 1: Singleplayer 1v1 vs AI
    document.getElementById('card-singleplayer').addEventListener('click', () => {
      window.SFX.play('button_click');
      this.mode = 'ai';
      this.isRoyale = false;
      this.role = 'host';
      this.myName = 'أنت';
      this.opponentName = 'الآلة (AI)';
      this.isReadyInLobby = false;
      this.openLoadoutScreen();
    });

    // Mode 2: 1v1 Play with Friend Online
    document.getElementById('card-multiplayer').addEventListener('click', () => {
      window.SFX.play('button_click');
      this.mode = 'friend';
      this.isRoyale = false;
      document.getElementById('modal-room-title').textContent = 'الاتصال بغرفة اللعب مع صديق (1 ضد 1)';
      document.getElementById('create-panel-title').textContent = 'إنشاء غرفة 1 ضد 1 (المشرف)';
      document.getElementById('btn-create-room').textContent = 'إنشاء غرفة 1 ضد 1 وتوليد الكود';
      document.getElementById('royale-instant-banner').classList.add('hidden');
      document.getElementById('friend-modal').classList.remove('hidden');
      this.connectWebSocket();
      this.refreshOpenRooms();
    });

    // Mode 3: 8-Player Battle Royale Arena
    document.getElementById('card-royale').addEventListener('click', () => {
      window.SFX.play('button_click');
      this.mode = 'royale_online';
      this.isRoyale = true;
      document.getElementById('modal-room-title').textContent = '👑 ساحة المعركة الجماعية (حتى 8 لاعبين)';
      document.getElementById('create-panel-title').textContent = 'إنشاء غرفة جماعية أونلاين (حتى 8 لاعبين + آليين)';
      document.getElementById('btn-create-room').textContent = '👑 إنشاء غرفة 8 لاعبين وتوليد الكود';
      document.getElementById('royale-instant-banner').classList.remove('hidden');
      document.getElementById('friend-modal').classList.remove('hidden');
      this.connectWebSocket();
      this.refreshOpenRooms();
    });

    // Instant Offline/Local 8-Player Royale Button
    document.getElementById('btn-start-instant-royale').addEventListener('click', () => {
      window.SFX.play('button_click');
      this.mode = 'royale_local';
      this.isRoyale = true;
      this.role = 'host';
      this.myName = document.getElementById('input-player-name').value.trim() || 'أنت';
      this.initLocalRoyaleLobby(8);
      this.openLoadoutScreen();
    });

    document.getElementById('btn-close-friend-modal').addEventListener('click', () => {
      window.SFX.play('soft_click');
      document.getElementById('friend-modal').classList.add('hidden');
    });

    document.getElementById('btn-create-room').addEventListener('click', () => {
      window.SFX.play('button_click');
      this.myName = document.getElementById('input-player-name').value.trim() || 'المشرف';
      this.sendNet({
        type: 'create_room',
        mapId: this.selectedMapId,
        playerName: this.myName,
        maxPlayers: this.isRoyale ? 8 : 2,
        isRoyale: this.isRoyale
      });
    });

    document.getElementById('btn-join-room').addEventListener('click', () => {
      window.SFX.play('button_click');
      const code = document.getElementById('input-room-code').value.trim().toUpperCase();
      if (!code) {
        document.getElementById('lobby-error-msg').textContent = 'يرجى إدخال كود الغرفة أولاً!';
        return;
      }
      this.myName = document.getElementById('input-player-name').value.trim() || 'اللاعب';
      this.sendNet({
        type: 'join_room',
        code,
        playerName: this.myName
      });
    });

    document.getElementById('btn-refresh-rooms').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.refreshOpenRooms();
    });
  }

  initLocalRoyaleLobby(totalPlayers = 8) {
    this.localRoyalePlayers = [
      { id: 'local_p1', name: this.myName, isBot: false, ready: true }
    ];
    for (let i = 1; i < totalPlayers; i++) {
      this.localRoyalePlayers.push({
        id: `bot_${i}`,
        name: BOT_NAMES_AR[(i - 1) % BOT_NAMES_AR.length],
        isBot: true,
        ready: true
      });
    }
  }

  // --------------------------------------------------------------------------
  // PRE-MATCH QUEUE & TOWER LOADOUT SCREEN (1v1 & 8-PLAYER ROYALE)
  // --------------------------------------------------------------------------
  bindLoadoutScreenEvents() {
    document.getElementById('btn-back-from-loadout').addEventListener('click', () => {
      window.SFX.play('soft_click');
      if (this.mode === 'friend' || this.mode === 'royale_online') {
        this.sendNet({ type: 'leave_room' });
      }
      this.showScreen('menu-screen');
    });

    document.getElementById('btn-random-loadout').addEventListener('click', () => {
      window.SFX.play('soft_click');
      const allIds = Object.keys(window.GAME_DATA.towers);
      const shuffled = [...allIds].sort(() => Math.random() - 0.5);
      this.chosenLoadout = shuffled.slice(0, 4);
      this.renderLoadoutTowers();
    });

    // 8-Player Bot Management in Lobby
    document.getElementById('btn-add-bot').addEventListener('click', () => {
      window.SFX.play('soft_click');
      if (this.mode === 'royale_local') {
        if (this.localRoyalePlayers.length < 8) {
          const idx = this.localRoyalePlayers.length;
          this.localRoyalePlayers.push({
            id: `bot_${Date.now()}_${idx}`,
            name: BOT_NAMES_AR[(idx - 1) % BOT_NAMES_AR.length],
            isBot: true,
            ready: true
          });
          this.renderRoyaleLobbySlots(this.localRoyalePlayers);
        }
      } else if (this.mode === 'royale_online' && this.role === 'host') {
        this.sendNet({ type: 'add_bot' });
      }
    });

    document.getElementById('btn-fill-bots').addEventListener('click', () => {
      window.SFX.play('soft_click');
      if (this.mode === 'royale_local') {
        while (this.localRoyalePlayers.length < 8) {
          const idx = this.localRoyalePlayers.length;
          this.localRoyalePlayers.push({
            id: `bot_${Date.now()}_${idx}`,
            name: BOT_NAMES_AR[(idx - 1) % BOT_NAMES_AR.length],
            isBot: true,
            ready: true
          });
        }
        this.renderRoyaleLobbySlots(this.localRoyalePlayers);
      } else if (this.mode === 'royale_online' && this.role === 'host') {
        for (let i = 0; i < 7; i++) {
          this.sendNet({ type: 'add_bot' });
        }
      }
    });

    document.getElementById('btn-remove-bot').addEventListener('click', () => {
      window.SFX.play('soft_click');
      if (this.mode === 'royale_local') {
        const lastBotIdx = this.localRoyalePlayers.map(p => p.isBot).lastIndexOf(true);
        if (lastBotIdx !== -1 && this.localRoyalePlayers.length > 2) {
          this.localRoyalePlayers.splice(lastBotIdx, 1);
          this.renderRoyaleLobbySlots(this.localRoyalePlayers);
        }
      } else if (this.mode === 'royale_online' && this.role === 'host') {
        this.sendNet({ type: 'remove_bot' });
      }
    });

    document.getElementById('btn-ready-battle').addEventListener('click', () => {
      if (this.chosenLoadout.length === 0) return;
      window.SFX.play('playerReady');

      const allIds = Object.keys(window.GAME_DATA.towers);
      const rem = allIds.filter(id => !this.chosenLoadout.includes(id));
      const bonus = rem.length > 0 ? rem[Math.floor(Math.random() * rem.length)] : null;

      if (this.mode === 'ai') {
        this.startMatch('ai', this.selectedMapId, 'أنت', 'الآلة (AI)', this.chosenLoadout, bonus);
      } else if (this.mode === 'royale_local') {
        if (this.localRoyalePlayers.length < 2) {
          this.initLocalRoyaleLobby(8);
        }
        this.startRoyaleMatch('royale_local', this.selectedMapId, 'local_p1', this.localRoyalePlayers, this.chosenLoadout, bonus);
      } else {
        this.isReadyInLobby = true;
        const btn = document.getElementById('btn-ready-battle');
        btn.textContent = '⏳ بانتظار استعداد بقية اللاعبين...';
        btn.classList.add('waiting-other');
        this.sendNet({
          type: 'player_ready',
          loadout: this.chosenLoadout
        });
      }
    });
  }

  openLoadoutScreen() {
    document.getElementById('friend-modal').classList.add('hidden');
    this.showScreen('loadout-screen');

    const codePill = document.getElementById('lobby-room-code-pill');
    const readyBtn = document.getElementById('btn-ready-battle');
    const banner1v1 = document.getElementById('vs-1v1-banner');
    const royalePanel = document.getElementById('royale-lobby-panel');
    const botControls = document.getElementById('royale-bot-controls');

    readyBtn.classList.remove('waiting-other');
    readyBtn.textContent = this.isRoyale
      ? '👑 جاهز — ابدأ معركة الساحة الجماعية! (BATTLE!)'
      : '⚔️ جاهز — ابدأ المعركة! (BATTLE!)';

    if (this.isRoyale) {
      banner1v1.classList.add('hidden');
      royalePanel.classList.remove('hidden');
      botControls.classList.toggle('hidden', this.role !== 'host');
      if (this.mode === 'royale_local') {
        codePill.classList.add('hidden');
        this.renderRoyaleLobbySlots(this.localRoyalePlayers);
      } else {
        codePill.classList.remove('hidden');
        document.getElementById('lobby-code-val').textContent = this.roomCode || '----';
      }
    } else {
      banner1v1.classList.remove('hidden');
      royalePanel.classList.add('hidden');
      if (this.mode === 'ai') {
        codePill.classList.add('hidden');
        document.getElementById('lobby-p1-name').textContent = 'أنت (المشرف)';
        document.getElementById('lobby-p1-status').textContent = 'اختر الخريطة والأبراج';
        document.getElementById('lobby-p1-status').className = 'vs-p-status';
        document.getElementById('lobby-p2-name').textContent = 'الآلة (AI)';
        document.getElementById('lobby-p2-status').textContent = 'جاهز للمعركة ✔';
        document.getElementById('lobby-p2-status').className = 'vs-p-status ready';
        document.getElementById('host-map-hint').textContent = '(اختر خريطة المعركة)';
      } else {
        codePill.classList.remove('hidden');
        document.getElementById('lobby-code-val').textContent = this.roomCode || '----';
        document.getElementById('host-map-hint').textContent = this.role === 'host'
          ? '(أنت المشرف: يمكنك تغيير الخريطة)'
          : '(المشرف يختار الخريطة)';
      }
    }

    this.renderLoadoutMaps();
    this.renderLoadoutTowers();
  }

  renderRoyaleLobbySlots(playersList = []) {
    const container = document.getElementById('royale-lobby-slots');
    const countEl = document.getElementById('royale-player-count');
    if (!container) return;

    countEl.textContent = playersList.length;
    container.innerHTML = '';

    for (let i = 0; i < 8; i++) {
      const p = playersList[i];
      const pill = document.createElement('div');
      if (p) {
        pill.className = 'royale-slot-pill ' + (p.isBot ? 'filled-bot' : 'filled-human');
        const statusTxt = p.isBot ? '🤖 آلي جاهز ✔' : (p.ready ? '✔ جاهز' : 'يختار...');
        pill.innerHTML = `
          <div class="royale-slot-name">#${i + 1} ${p.name}</div>
          <div class="royale-slot-tag">${statusTxt}</div>
        `;
      } else {
        pill.className = 'royale-slot-pill empty-royale-slot';
        pill.innerHTML = `
          <div class="royale-slot-name">#${i + 1} مقعد متاح</div>
          <div class="royale-slot-tag">بانتظار لاعب أو آلي...</div>
        `;
      }
      container.appendChild(pill);
    }
  }

  renderLoadoutMaps() {
    const carousel = document.getElementById('lobby-maps-carousel');
    carousel.innerHTML = '';

    const canSelectMap = this.mode === 'ai' || this.mode === 'royale_local' || this.role === 'host';
    const curMap = window.GAME_DATA.maps[this.selectedMapId] || window.GAME_DATA.maps.battle_park;
    document.getElementById('selected-map-title').textContent = curMap.nameAr;

    for (const m of Object.values(window.GAME_DATA.maps)) {
      const card = document.createElement('div');
      card.className = 'lobby-map-card'
        + (m.id === this.selectedMapId ? ' selected' : '')
        + (!canSelectMap ? ' disabled-map' : '');
      card.innerHTML = `
        <img src="${m.leftImg}" alt="${m.name}" />
        <div class="lobby-map-card-name">${m.name}</div>
      `;
      if (canSelectMap) {
        card.addEventListener('click', () => {
          window.SFX.play('soft_click');
          this.selectedMapId = m.id;
          if ((this.mode === 'friend' || this.mode === 'royale_online') && this.role === 'host') {
            this.sendNet({ type: 'change_map', mapId: m.id });
          }
          this.renderLoadoutMaps();
        });
      }
      carousel.appendChild(card);
    }
  }

  renderLoadoutTowers() {
    const slotsContainer = document.getElementById('chosen-towers-slots');
    const rosterContainer = document.getElementById('all-towers-roster');
    document.getElementById('loadout-count-num').textContent = this.chosenLoadout.length;

    // 4 Chosen Slots
    slotsContainer.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const tId = this.chosenLoadout[i];
      const slot = document.createElement('div');
      if (tId && window.GAME_DATA.towers[tId]) {
        const def = window.GAME_DATA.towers[tId];
        slot.className = 'chosen-slot-card';
        slot.innerHTML = `
          <img src="${def.shopIcon}" alt="${def.name}" />
          <span>$${def.cost}</span>
        `;
        slot.addEventListener('click', () => {
          if (this.chosenLoadout.length > 1) {
            window.SFX.play('soft_click');
            this.chosenLoadout.splice(i, 1);
            this.renderLoadoutTowers();
          }
        });
      } else {
        slot.className = 'chosen-slot-card empty-slot';
        slot.textContent = 'فارغ';
      }
      slotsContainer.appendChild(slot);
    }

    // All 12 Towers & Buildings Roster
    rosterContainer.innerHTML = '';
    for (const def of Object.values(window.GAME_DATA.towers)) {
      const isPicked = this.chosenLoadout.includes(def.id);
      const card = document.createElement('div');
      card.className = 'roster-tower-card' + (isPicked ? ' picked' : '');
      card.innerHTML = `
        <img src="${def.shopIcon}" alt="${def.name}" />
        <div class="roster-tower-name">${def.nameAr}</div>
        <div class="roster-tower-cost">$${def.cost}</div>
      `;
      card.addEventListener('click', () => {
        window.SFX.play('soft_click');
        if (isPicked) {
          if (this.chosenLoadout.length > 1) {
            this.chosenLoadout = this.chosenLoadout.filter(id => id !== def.id);
          }
        } else {
          if (this.chosenLoadout.length < 4) {
            this.chosenLoadout.push(def.id);
          } else {
            this.chosenLoadout[3] = def.id;
          }
        }
        this.renderLoadoutTowers();
      });
      rosterContainer.appendChild(card);
    }
  }

  // --------------------------------------------------------------------------
  // WEBSOCKET MULTIPLAYER CLIENT (1v1 & 8-PLAYER BATTLE ROYALE)
  // --------------------------------------------------------------------------
  connectWebSocket() {
    const badge = document.getElementById('server-status-badge');
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = location.host || 'localhost:3000';
    this.ws = new WebSocket(`${proto}//${host}`);

    this.ws.onopen = () => {
      badge.textContent = 'متصل بالسيرفر المباشر ●';
      badge.style.background = '#20bf6b';
    };

    this.ws.onclose = () => {
      badge.textContent = 'انقطع الاتصال بالسيرفر (شغل server.js)';
      badge.style.background = '#eb3b5a';
    };

    this.ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        this.handleNetworkMessage(msg);
      } catch (e) {}
    };
  }

  sendNet(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  async refreshOpenRooms() {
    const container = document.getElementById('open-rooms-list');
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (!data.rooms || data.rooms.length === 0) {
        container.innerHTML = '<div class="empty-rooms">لا توجد غرف مفتوحة حالياً — أنشئ غرفة جديدة!</div>';
        return;
      }
      container.innerHTML = '';
      for (const r of data.rooms) {
        const mapName = window.GAME_DATA.maps[r.mapId]?.name || r.mapId;
        const modeTag = r.isRoyale ? `👑 ساحة (${r.playerCount}/${r.maxPlayers})` : `⚔️ 1v1 (${r.playerCount}/2)`;
        const row = document.createElement('div');
        row.className = 'room-row-item';
        row.innerHTML = `
          <span><strong>${r.code}</strong> — ${r.hostName} [${modeTag} - ${mapName}]</span>
          <button data-code="${r.code}">انضمام</button>
        `;
        row.querySelector('button').addEventListener('click', () => {
          document.getElementById('input-room-code').value = r.code;
          document.getElementById('btn-join-room').click();
        });
        container.appendChild(row);
      }
    } catch (e) {
      container.innerHTML = '<div class="empty-rooms">تعذر جلب الغرف (تأكد من تشغيل السيرفر)</div>';
    }
  }

  findParticipant(playerId) {
    return this.royaleParticipants.find(p => p.id === playerId) || null;
  }

  handleNetworkMessage(msg) {
    switch (msg.type) {
      case 'room_created': {
        this.roomCode = msg.code;
        this.role = 'host';
        this.myPlayerId = msg.playerId || 'p_1';
        this.isRoyale = Boolean(msg.isRoyale);
        this.mode = this.isRoyale ? 'royale_online' : 'friend';
        this.selectedMapId = msg.mapId || 'battle_park';
        this.openLoadoutScreen();
        break;
      }

      case 'room_error': {
        document.getElementById('lobby-error-msg').textContent = msg.message || 'خطأ في الغرفة';
        break;
      }

      case 'lobby_state': {
        this.roomCode = msg.code;
        this.role = msg.role || this.role;
        this.myPlayerId = msg.myPlayerId || this.myPlayerId;
        this.isRoyale = Boolean(msg.isRoyale);
        this.mode = this.isRoyale ? 'royale_online' : 'friend';
        this.selectedMapId = msg.mapId || this.selectedMapId;
        this.openLoadoutScreen();

        if (this.isRoyale && Array.isArray(msg.players)) {
          this.renderRoyaleLobbySlots(msg.players);
        } else {
          document.getElementById('lobby-p1-name').textContent = `${msg.hostName} (المشرف)`;
          document.getElementById('lobby-p1-status').textContent = msg.hostReady ? 'جاهز للمعركة ✔' : 'يختار الأبراج...';
          document.getElementById('lobby-p1-status').className = 'vs-p-status' + (msg.hostReady ? ' ready' : '');

          document.getElementById('lobby-p2-name').textContent = msg.guestName;
          document.getElementById('lobby-p2-status').textContent = !msg.hasGuest
            ? 'بانتظار الانضمام...'
            : (msg.guestReady ? 'جاهز للمعركة ✔' : 'يختار الأبراج...');
          document.getElementById('lobby-p2-status').className = 'vs-p-status' + (msg.guestReady ? ' ready' : '');
        }
        break;
      }

      case 'match_start': {
        window.SFX.play('playerFound');
        if (msg.isRoyale && Array.isArray(msg.players) && msg.players.length > 2) {
          this.startRoyaleMatch(
            'royale_online',
            msg.mapId,
            msg.myPlayerId || this.myPlayerId,
            msg.players,
            msg.loadout || this.chosenLoadout,
            msg.bonusTower
          );
        } else {
          this.isRoyale = false;
          this.startMatch(
            'friend',
            msg.mapId,
            msg.myName,
            msg.opponentName,
            msg.loadout || this.chosenLoadout,
            msg.bonusTower
          );
        }
        break;
      }

      case 'place_tower': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (!targetField) return;
        const rx = 480 - msg.x;
        const ry = msg.y;
        targetField.placeTower(msg.towerType, rx, ry, msg.towerId);
        break;
      }

      case 'upgrade_tower': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (!targetField) return;
        targetField.upgradeTower(msg.towerId, msg.pathSide);
        break;
      }

      case 'sell_tower': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (!targetField) return;
        targetField.sellTower(msg.towerId);
        break;
      }

      case 'change_target': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (!targetField) return;
        const t = targetField.towers.find(tw => tw.id === msg.towerId);
        if (t) t.targetMode = msg.targetMode;
        break;
      }

      case 'use_ability': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (!targetField) return;
        targetField.activateAbility(msg.towerId);
        break;
      }

      case 'send_bloon': {
        if (this.isRoyale) {
          // If targeted at a specific player or at us
          const destId = msg.targetPlayerId || this.myPlayerId;
          const destParticipant = this.findParticipant(destId);
          if (destParticipant && !destParticipant.eliminated) {
            destParticipant.field.queueBloonGroup(msg.bloon, msg.count, msg.spacing, true, {
              boosted: Boolean(msg.boosted),
              camo: Boolean(msg.camo),
              regrow: Boolean(msg.regrow)
            });
          }
        } else if (this.playerField) {
          this.playerField.queueBloonGroup(msg.bloon, msg.count, msg.spacing, true, {
            boosted: Boolean(msg.boosted),
            camo: Boolean(msg.camo),
            regrow: Boolean(msg.regrow)
          });
        }
        break;
      }

      case 'tower_boost': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (targetField) targetField.activateTowerBoost();
        break;
      }

      case 'bloon_boost': {
        const targetField = this.isRoyale
          ? this.findParticipant(msg.senderId)?.field
          : this.opponentField;
        if (targetField) targetField.activateBloonBoost();
        break;
      }

      case 'state_sync': {
        if (this.isRoyale) {
          const p = this.findParticipant(msg.senderId);
          if (p && typeof msg.lives === 'number') {
            p.field.lives = msg.lives;
          }
        } else if (this.opponentField && typeof msg.lives === 'number') {
          this.opponentField.lives = msg.lives;
        }
        break;
      }

      case 'player_eliminated': {
        if (this.isRoyale) {
          const p = this.findParticipant(msg.playerId);
          if (p && !p.eliminated) {
            p.field.lives = 0;
            this.handleParticipantElimination(p);
          }
        }
        break;
      }

      case 'game_over': {
        if (!this.isRoyale && !this.gameOver) {
          this.endMatch(true, 'لقد نفدت حياة خصمك بالكامل!');
        }
        break;
      }

      case 'opponent_left': {
        if (!this.isRoyale && this.running && !this.gameOver) {
          this.endMatch(true, 'انسحب الخصم من المعركة!');
        }
        break;
      }
    }
  }

  // --------------------------------------------------------------------------
  // IN-GAME SHOP, BLOON SENDS, & MOBILE CAMERA / TOUCH / BANANA COLLECTION
  // --------------------------------------------------------------------------
  buildMatchShopUI() {
    const list = document.getElementById('tower-shop-list');
    list.innerHTML = '';

    this.activeMatchLoadout.forEach((tId, idx) => {
      const t = window.GAME_DATA.towers[tId];
      if (!t) return;
      const isBonus = idx === 4;
      const card = document.createElement('div');
      card.className = 'shop-tower-card';
      card.dataset.type = t.id;
      if (isBonus) card.style.borderColor = '#fed330';

      card.innerHTML = `
        <span class="shop-hotkey">${idx + 1}</span>
        <img src="${t.shopIcon}" alt="${t.name}" />
        <div class="shop-tower-cost">$${t.cost}</div>
      `;

      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        window.SFX.play('soft_click');
        if (this.placingTowerType === t.id) {
          this.setPlacingTower(null);
        } else {
          if (this.cameraMode === 'enemy' || this.cameraMode === 'grid') {
            this.applyCameraMode(window.innerWidth <= 850 ? 'mine' : 'split');
          }
          this.setPlacingTower(t.id);
        }
      });

      list.appendChild(card);
    });
  }

  buildBloonSendUI() {
    const list = document.getElementById('bloon-send-list');
    list.innerHTML = '';

    for (const s of window.GAME_DATA.bloonSends) {
      const btn = document.createElement('div');
      btn.className = 'bloon-send-btn';
      btn.dataset.sendId = s.id;

      let iconHtml = '';
      if (['lead', 'zebra', 'rainbow', 'moab', 'bfb', 'zomg'].includes(s.icon)) {
        iconHtml = `<img src="assets/bloons/${s.icon}.png" alt="${s.label}" />`;
      } else if (s.icon === 'ceramic') {
        iconHtml = `<img src="assets/bloons/ceramic_01.png" alt="Ceramic" />`;
      } else {
        iconHtml = `<img data-tinted="${s.icon}" alt="${s.label}" />`;
      }

      const ecoClass = s.eco >= 0 ? 'send-eco' : 'send-eco negative';
      const ecoSign = s.eco >= 0 ? `+${s.eco}` : `${s.eco}`;

      btn.innerHTML = `
        <span class="send-key">${s.key}</span>
        ${iconHtml}
        <div class="send-cost" data-base-cost="${s.cost}">$${s.cost}</div>
        <div class="${ecoClass}">${ecoSign}</div>
      `;

      const tintedImg = btn.querySelector('[data-tinted]');
      if (tintedImg) {
        const c = window.ASSETS.tintedBloons[s.icon];
        if (c) tintedImg.src = c.toDataURL();
      }

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.triggerBloonSend(s);
      });

      list.appendChild(btn);
    }
  }

  applyCameraMode(mode) {
    this.cameraMode = mode;
    document.getElementById('btn-cam-mine').classList.toggle('active', mode === 'mine');
    document.getElementById('btn-cam-split').classList.toggle('active', mode === 'split');
    document.getElementById('btn-cam-enemy').classList.toggle('active', mode === 'enemy');
    const gridBtn = document.getElementById('btn-cam-grid');
    if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');

    if (mode === 'split' || mode === 'grid') {
      this.canvas.width = 968;
      this.canvas.height = 640;
      this.canvas.style.aspectRatio = '968 / 640';
    } else {
      // Full 480x640 single battlefield zoom (2x larger on phones!)
      this.canvas.width = 480;
      this.canvas.height = 640;
      this.canvas.style.aspectRatio = '480 / 640';
    }
  }

  bindBattleUIEvents() {
    // Camera Switcher Buttons
    document.getElementById('btn-cam-mine').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.applyCameraMode('mine');
    });
    document.getElementById('btn-cam-split').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.applyCameraMode('split');
    });
    document.getElementById('btn-cam-enemy').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.applyCameraMode('enemy');
    });
    document.getElementById('btn-cam-grid').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.applyCameraMode('grid');
    });
    document.getElementById('btn-battle-fullscreen').addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // 8-Player Royale Auto-Target Button
    document.getElementById('btn-target-auto').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.royaleTargetId = 'auto';
      this.renderRoyaleArenaStrip();
    });

    // Bottom Dock Tabs (for Mobile Single-Tray Switching)
    const tabTowers = document.getElementById('tab-dock-towers');
    const tabBloons = document.getElementById('tab-dock-bloons');
    const trayTowers = document.getElementById('tray-towers');
    const trayBloons = document.getElementById('tray-bloons');

    tabTowers.addEventListener('click', () => {
      window.SFX.play('soft_click');
      tabTowers.classList.add('active');
      tabBloons.classList.remove('active');
      trayTowers.classList.add('active-tray');
      trayBloons.classList.remove('active-tray');
    });

    tabBloons.addEventListener('click', () => {
      window.SFX.play('soft_click');
      tabBloons.classList.add('active');
      tabTowers.classList.remove('active');
      trayBloons.classList.add('active-tray');
      trayTowers.classList.remove('active-tray');
    });

    // Camo & Regrow Modifier Toggles
    const btnCamo = document.getElementById('btn-toggle-camo');
    const btnRegrow = document.getElementById('btn-toggle-regrow');

    btnCamo.addEventListener('click', () => {
      if (this.currentRound < 12) return;
      window.SFX.play('soft_click');
      this.sendCamoMod = !this.sendCamoMod;
      btnCamo.classList.toggle('active', this.sendCamoMod);
      this.updateBloonSendCostsUI();
    });

    btnRegrow.addEventListener('click', () => {
      if (this.currentRound < 8) return;
      window.SFX.play('soft_click');
      this.sendRegrowMod = !this.sendRegrowMod;
      btnRegrow.classList.toggle('active', this.sendRegrowMod);
      this.updateBloonSendCostsUI();
    });

    // Mobile Floating Placement Confirm & Cancel Buttons
    document.getElementById('btn-confirm-place').addEventListener('click', () => {
      if (!this.placingTowerType) return;
      const { x, y } = this.pointerCanvasPos;
      this.tryPlacePlayerTower(this.placingTowerType, Math.round(x), Math.round(y));
    });

    document.getElementById('btn-cancel-place').addEventListener('click', () => {
      window.SFX.play('soft_click');
      this.setPlacingTower(null);
    });

    // Canvas Pointer & Touch Drag Handling
    const updateCanvasCoords = (clientX, clientY, isTouch = false) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      let cx = (clientX - rect.left) * scaleX;
      let cy = (clientY - rect.top) * scaleY;

      if (isTouch && this.placingTowerType) {
        cy -= 28;
      }

      if (this.cameraMode === 'enemy' || this.cameraMode === 'grid') {
        this.pointerCanvasPos = { x: cx, y: cy, insideLeft: false };
      } else {
        this.pointerCanvasPos = {
          x: Math.max(12, Math.min(468, cx)),
          y: Math.max(12, Math.min(628, cy)),
          insideLeft: cx >= 0 && cx <= 480 && cy >= 0 && cy <= 640
        };
      }
    };

    this.canvas.addEventListener('pointermove', (e) => {
      updateCanvasCoords(e.clientX, e.clientY, e.pointerType === 'touch');
      // Collect Banana Farm bananas/crates on pointer hover or touch drag!
      if (this.running && !this.gameOver && this.playerField && this.pointerCanvasPos.insideLeft) {
        const gained = this.playerField.collectBananasNear(this.pointerCanvasPos.x, this.pointerCanvasPos.y, 70);
        if (gained > 0) {
          this.showDeltaBadge('cash-delta-float', 'pill-left-cash', `+$${gained} 🍌`, true);
        }
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      const isTouch = e.pointerType === 'touch';
      updateCanvasCoords(e.clientX, e.clientY, isTouch);
      if (!this.running || this.gameOver || !this.playerField) return;

      // If in 8-Player 4x2 Mega Grid View, clicking a cell selects/targets or zooms that player!
      if (this.cameraMode === 'grid' && this.isRoyale) {
        const col = Math.floor(this.pointerCanvasPos.x / 242);
        const row = Math.floor(this.pointerCanvasPos.y / 320);
        const idx = row * 4 + col;
        const p = this.royaleParticipants[idx];
        if (p) {
          window.SFX.play('soft_click');
          if (p.isMe) {
            this.applyCameraMode('mine');
          } else if (!p.eliminated) {
            this.royaleTargetId = p.id;
            this.setRoyaleViewedOpponent(p.id);
            this.applyCameraMode('split');
          }
        }
        return;
      }

      const { x, y, insideLeft } = this.pointerCanvasPos;
      if (!insideLeft) {
        this.selectTower(null);
        return;
      }

      // First check if tapping/clicking on a dropped Banana Bunch or Crate!
      const gainedBanana = this.playerField.collectBananasNear(x, y, 74);
      if (gainedBanana > 0) {
        this.showDeltaBadge('cash-delta-float', 'pill-left-cash', `+$${gainedBanana} 🍌`, true);
      }

      if (this.placingTowerType) {
        if (!isTouch) {
          this.tryPlacePlayerTower(this.placingTowerType, Math.round(x), Math.round(y));
        }
        return;
      }

      const clicked = this.playerField.towers.find(t => Math.hypot(t.x - x, t.y - y) <= t.def.footprint + 14);
      if (clicked) {
        window.SFX.play('tower_select');
        this.selectTower(clicked.id);
      } else {
        this.selectTower(null);
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.setPlacingTower(null);
      this.selectTower(null);
    });

    // Inspector Upgrade Left & Right
    document.getElementById('btn-upgrade-left').addEventListener('click', () => {
      if (!this.selectedTowerId || !this.playerField) return;
      if (this.playerField.upgradeTower(this.selectedTowerId, 'left')) {
        if (this.mode === 'friend' || this.mode === 'royale_online') {
          this.sendNet({ type: 'upgrade_tower', towerId: this.selectedTowerId, pathSide: 'left' });
        }
        this.updateInspectorUI();
      }
    });

    document.getElementById('btn-upgrade-right').addEventListener('click', () => {
      if (!this.selectedTowerId || !this.playerField) return;
      if (this.playerField.upgradeTower(this.selectedTowerId, 'right')) {
        if (this.mode === 'friend' || this.mode === 'royale_online') {
          this.sendNet({ type: 'upgrade_tower', towerId: this.selectedTowerId, pathSide: 'right' });
        }
        this.updateInspectorUI();
      }
    });

    document.getElementById('btn-target-mode').addEventListener('click', () => {
      if (!this.selectedTowerId || !this.playerField) return;
      const t = this.playerField.towers.find(tw => tw.id === this.selectedTowerId);
      if (!t || t.def.nonAttacking || t.def.isSpactory) return;
      const modes = ['First', 'Last', 'Close', 'Strong'];
      t.targetMode = modes[(modes.indexOf(t.targetMode) + 1) % modes.length];
      window.SFX.play('soft_click');
      if (this.mode === 'friend' || this.mode === 'royale_online') {
        this.sendNet({ type: 'change_target', towerId: t.id, targetMode: t.targetMode });
      }
      this.updateInspectorUI();
    });

    document.getElementById('btn-sell-tower').addEventListener('click', () => {
      if (!this.selectedTowerId || !this.playerField) return;
      const sold = this.playerField.sellTower(this.selectedTowerId);
      if (sold) {
        if (this.mode === 'friend' || this.mode === 'royale_online') {
          this.sendNet({ type: 'sell_tower', towerId: sold.id });
        }
        this.selectTower(null);
      }
    });

    document.getElementById('btn-close-inspector').addEventListener('click', () => {
      this.selectTower(null);
    });

    document.getElementById('btn-tower-boost').addEventListener('click', () => {
      if (this.playerField && this.playerField.activateTowerBoost()) {
        if (this.mode === 'friend' || this.mode === 'royale_online') {
          this.sendNet({ type: 'tower_boost' });
        }
      }
    });

    document.getElementById('btn-bloon-boost').addEventListener('click', () => {
      if (this.playerField && this.playerField.activateBloonBoost()) {
        if (this.mode === 'friend' || this.mode === 'royale_online') {
          this.sendNet({ type: 'bloon_boost' });
        }
      }
    });

    document.getElementById('btn-exit-match').addEventListener('click', () => {
      this.leaveMatchToMenu();
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
      this.leaveMatchToMenu();
    });

    document.getElementById('btn-play-again').addEventListener('click', () => {
      document.getElementById('gameover-modal').classList.add('hidden');
      this.running = false;
      this.gameOver = false;
      this.openLoadoutScreen();
    });

    // Keyboard Hotkeys
    window.addEventListener('keydown', (e) => {
      if (!this.running || this.gameOver) return;
      const key = e.key.toUpperCase();

      if (key === 'ESCAPE') {
        this.setPlacingTower(null);
        this.selectTower(null);
        return;
      }

      const num = parseInt(key, 10);
      if (num >= 1 && num <= this.activeMatchLoadout.length) {
        const tId = this.activeMatchLoadout[num - 1];
        this.setPlacingTower(this.placingTowerType === tId ? null : tId);
        return;
      }

      if (this.selectedTowerId) {
        if (e.key === ',' || key === 'Z') {
          document.getElementById('btn-upgrade-left').click();
          return;
        }
        if (e.key === '.' || key === 'X') {
          document.getElementById('btn-upgrade-right').click();
          return;
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          document.getElementById('btn-sell-tower').click();
          return;
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-tower-boost').click();
        return;
      }
      if (key === 'B') {
        document.getElementById('btn-bloon-boost').click();
        return;
      }

      const sendDef = window.GAME_DATA.bloonSends.find(s => s.key === key);
      if (sendDef) {
        this.triggerBloonSend(sendDef);
      }
    });
  }

  getModifiedSendCost(sendDef) {
    if (!sendDef.allowModifiers) return sendDef.cost;
    const camoMult = (this.sendCamoMod && this.currentRound >= 12) ? 2.2 : 1.0;
    const regrowMult = (this.sendRegrowMod && this.currentRound >= 8) ? 1.8 : 1.0;
    return Math.round(sendDef.cost * camoMult * regrowMult);
  }

  updateBloonSendCostsUI() {
    document.querySelectorAll('.bloon-send-btn').forEach(btn => {
      const def = window.GAME_DATA.bloonSends.find(s => s.id === btn.dataset.sendId);
      if (!def) return;
      const costEl = btn.querySelector('.send-cost');
      if (costEl) {
        costEl.textContent = `$${this.getModifiedSendCost(def)}`;
      }
    });
  }

  setPlacingTower(typeId) {
    if (typeId && this.playerField) {
      const def = window.GAME_DATA.towers[typeId];
      if (this.playerField.cash < def.cost) {
        this.placingTowerType = null;
        document.getElementById('placement-confirm-bar').classList.add('hidden');
        return;
      }
    }
    this.placingTowerType = typeId;
    if (typeId) {
      this.selectTower(null);
      if (!this.playerField.canPlaceTower(typeId, this.pointerCanvasPos.x, this.pointerCanvasPos.y)) {
        this.pointerCanvasPos = { x: 240, y: 310, insideLeft: true };
      }
      document.getElementById('placement-confirm-bar').classList.remove('hidden');
    } else {
      document.getElementById('placement-confirm-bar').classList.add('hidden');
    }

    document.querySelectorAll('.shop-tower-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.type === this.placingTowerType);
    });
  }

  tryPlacePlayerTower(typeId, x, y) {
    if (!this.playerField) return;
    const def = window.GAME_DATA.towers[typeId];
    if (!def || this.playerField.cash < def.cost) return;

    if (!this.playerField.canPlaceTower(typeId, x, y)) {
      return;
    }

    this.playerField.cash -= def.cost;
    const placed = this.playerField.placeTower(typeId, x, y);
    if (placed) {
      this.setPlacingTower(null);
      this.selectTower(placed.id);

      if (this.mode === 'friend' || this.mode === 'royale_online') {
        this.sendNet({
          type: 'place_tower',
          towerId: placed.id,
          towerType: typeId,
          x,
          y
        });
      }
    }
  }

  selectTower(towerId) {
    this.selectedTowerId = towerId;
    const inspector = document.getElementById('upgrade-inspector');
    if (!towerId) {
      inspector.classList.add('hidden');
      return;
    }
    inspector.classList.remove('hidden');
    this.updateInspectorUI();
  }

  updateInspectorUI() {
    if (!this.selectedTowerId || !this.playerField) return;
    const t = this.playerField.towers.find(tw => tw.id === this.selectedTowerId);
    if (!t) {
      this.selectTower(null);
      return;
    }

    document.getElementById('inspector-avatar').src = t.getAvatarUrl();
    document.getElementById('inspector-name').textContent = t.def.nameAr;

    const statLabel = document.getElementById('inspector-stat-label');
    const statVal = document.getElementById('inspector-pops-val');
    if (t.def.isFarm) {
      if (statLabel) statLabel.textContent = '🍌 الدخل';
      statVal.textContent = `$${t.cashGenerated.toLocaleString()}`;
    } else {
      if (statLabel) statLabel.textContent = 'Pops';
      statVal.textContent = t.popCount.toLocaleString();
    }

    const targetBtn = document.getElementById('btn-target-mode');
    if (t.def.isFarm) {
      targetBtn.textContent = t.isBank ? `🏦 الرصيد: $${Math.floor(t.bankBalance)}` : '🍌 إنتاج الموز';
    } else if (t.def.isSpactory) {
      targetBtn.textContent = '📌 نشر على المسار';
    } else if (t.def.isVillage && !t.hasHighEnergyBeacon) {
      targetBtn.textContent = '📡 دعم الأبراج المحيطة';
    } else {
      const targetLabels = {
        First: 'First (الأول)',
        Last: 'Last (الأخير)',
        Close: 'Close (الأقرب)',
        Strong: 'Strong (الأقوى)'
      };
      targetBtn.textContent = targetLabels[t.targetMode] || t.targetMode;
    }

    document.getElementById('sell-value-num').textContent = t.getSellValue();

    this.renderUpgradeSlot('left', t, t.leftTier, t.getLeftUpgradeInfo());
    this.renderUpgradeSlot('right', t, t.rightTier, t.getRightUpgradeInfo());
  }

  renderUpgradeSlot(side, tower, currentTier, nextInfo) {
    const slot = document.getElementById(`btn-upgrade-${side}`);
    const pipsEl = document.getElementById(`pips-${side}`);
    const imgEl = document.getElementById(`img-upgrade-${side}`);
    const titleEl = document.getElementById(`title-upgrade-${side}`);
    const descEl = document.getElementById(`desc-upgrade-${side}`);
    const costEl = document.getElementById(`cost-upgrade-${side}`);

    pipsEl.innerHTML = '';
    for (let i = 1; i <= 4; i++) {
      const dot = document.createElement('span');
      dot.className = 'pip-dot' + (i <= currentTier ? ' filled' : '');
      pipsEl.appendChild(dot);
    }

    slot.classList.remove('locked', 'maxed', 'unaffordable');

    if (currentTier >= 4) {
      slot.classList.add('maxed');
      const lastU = side === 'left' ? tower.def.leftUpgrades[3] : tower.def.rightUpgrades[3];
      imgEl.src = lastU.icon;
      titleEl.textContent = `${lastU.nameAr} (MAX)`;
      descEl.textContent = 'تم الوصول إلى المستوى الأقصى (Tier 4)';
      costEl.textContent = 'MAX';
      return;
    }

    if (!nextInfo) {
      slot.classList.add('locked');
      titleEl.textContent = 'المسار مغلق';
      descEl.textContent = 'تم تطوير المسار الآخر للدرجة 3+';
      costEl.textContent = '🔒';
      return;
    }

    imgEl.src = nextInfo.icon;
    titleEl.textContent = nextInfo.nameAr;
    descEl.textContent = nextInfo.desc;
    costEl.textContent = `$${nextInfo.cost}`;

    if (this.playerField && this.playerField.cash < nextInfo.cost) {
      slot.classList.add('unaffordable');
    }
  }

  showDeltaBadge(elementId, pillId, text, isPositive = true) {
    const el = document.getElementById(elementId);
    const pill = document.getElementById(pillId);
    if (el) {
      el.textContent = text;
      el.style.color = isPositive ? '#38e54d' : '#ff6b81';
      el.classList.remove('hidden');
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
      clearTimeout(el._hideTimeout);
      el._hideTimeout = setTimeout(() => el.classList.add('hidden'), 850);
    }
    if (pill) {
      const cls = isPositive ? 'pulse-green' : 'pulse-red';
      pill.classList.add(cls);
      clearTimeout(pill._pulseTimeout);
      pill._pulseTimeout = setTimeout(() => pill.classList.remove(cls), 260);
    }
  }

  getBloonIconSrc(iconName) {
    if (['lead', 'zebra', 'rainbow', 'moab', 'bfb', 'zomg'].includes(iconName)) {
      return `assets/bloons/${iconName}.png`;
    }
    if (iconName === 'ceramic') {
      return 'assets/bloons/ceramic_01.png';
    }
    const c = window.ASSETS.tintedBloons[iconName];
    return c ? c.toDataURL() : 'assets/bloons/stock_bloon.png';
  }

  resolveRoyaleTargetParticipant() {
    if (!this.isRoyale) return null;
    const livingOpponents = this.royaleParticipants.filter(p => !p.isMe && !p.eliminated && p.field.lives > 0);
    if (livingOpponents.length === 0) return null;

    if (this.royaleTargetId && this.royaleTargetId !== 'auto') {
      const explicit = livingOpponents.find(p => p.id === this.royaleTargetId);
      if (explicit) return explicit;
    }

    // Auto target: pick living opponent with highest lives
    livingOpponents.sort((a, b) => b.field.lives - a.field.lives);
    return livingOpponents[0];
  }

  triggerBloonSend(sendDef) {
    if (!this.running || this.gameOver || !this.playerField || !this.opponentField) return;
    if (this.currentRound < sendDef.minRound) return;

    if (this.bloonSendQueue.length >= (window.GAME_DATA.maxBloonQueueSlots || 5)) {
      window.SFX.play('soft_click', 40, 0.5);
      return;
    }

    const finalCost = this.getModifiedSendCost(sendDef);
    if (this.playerField.cash < finalCost) return;

    const isCamo = Boolean(sendDef.allowModifiers && this.sendCamoMod && this.currentRound >= 12);
    const isRegrow = Boolean(sendDef.allowModifiers && this.sendRegrowMod && this.currentRound >= 8);

    this.playerField.cash -= finalCost;
    this.playerField.eco = Math.max(100, +(this.playerField.eco + sendDef.eco).toFixed(1));
    window.SFX.play('buy', 40, 0.75);

    this.showDeltaBadge('cash-delta-float', 'pill-left-cash', `-$${finalCost}`, false);
    const ecoSign = sendDef.eco >= 0 ? `+${sendDef.eco} Eco` : `${sendDef.eco} Eco`;
    this.showDeltaBadge('eco-delta-float', 'pill-left-eco', ecoSign, sendDef.eco >= 0);

    const layer = document.getElementById('floating-popups-layer');
    const btnEl = document.querySelector(`.bloon-send-btn[data-send-id="${sendDef.id}"]`);
    if (layer && btnEl) {
      const pop = document.createElement('div');
      pop.className = 'floating-eco-popup' + (sendDef.eco < 0 ? ' neg' : '');
      pop.textContent = `${ecoSign} (-$${finalCost})`;
      const rect = btnEl.getBoundingClientRect();
      const parentRect = layer.getBoundingClientRect();
      pop.style.left = `${Math.max(50, Math.min(parentRect.width - 60, rect.left - parentRect.left + rect.width / 2))}px`;
      pop.style.bottom = `12px`;
      layer.appendChild(pop);
      setTimeout(() => pop.remove(), 1050);
    }

    const totalWait = sendDef.queueTime || Math.max(0.65, sendDef.count * sendDef.spacing);
    this.bloonSendQueue.push({
      sendDef,
      iconSrc: this.getBloonIconSrc(sendDef.icon),
      totalTime: totalWait,
      remainingTime: totalWait,
      camo: isCamo,
      regrow: isRegrow
    });
    this.renderBloonSendQueueUI();
  }

  updateBloonSendQueue(dt) {
    if (this.bloonSendQueue.length === 0) return;

    const current = this.bloonSendQueue[0];
    current.remainingTime -= dt;

    if (current.remainingTime <= 0) {
      this.bloonSendQueue.shift();
      const s = current.sendDef;
      const boosted = this.playerField.bloonBoostTimer > 0;

      if (this.isRoyale) {
        const targetP = this.resolveRoyaleTargetParticipant();
        if (targetP) {
          targetP.field.queueBloonGroup(s.bloon, s.count, s.spacing, true, {
            boosted,
            camo: current.camo,
            regrow: current.regrow
          });
          if (this.mode === 'royale_online') {
            this.sendNet({
              type: 'send_bloon',
              targetPlayerId: targetP.id,
              bloon: s.bloon,
              count: s.count,
              spacing: s.spacing,
              boosted,
              camo: current.camo,
              regrow: current.regrow
            });
          }
        }
      } else {
        this.opponentField.queueBloonGroup(s.bloon, s.count, s.spacing, true, {
          boosted,
          camo: current.camo,
          regrow: current.regrow
        });

        if (this.mode === 'friend') {
          this.sendNet({
            type: 'send_bloon',
            bloon: s.bloon,
            count: s.count,
            spacing: s.spacing,
            boosted,
            camo: current.camo,
            regrow: current.regrow
          });
        }
      }
    }

    this.renderBloonSendQueueUI();
  }

  renderBloonSendQueueUI() {
    const bar = document.getElementById('bloon-send-queue-bar');
    const slotsEl = document.getElementById('bloon-queue-slots');
    if (!bar || !slotsEl) return;

    if (this.bloonSendQueue.length === 0) {
      bar.classList.add('hidden');
      slotsEl.innerHTML = '';
      return;
    }

    bar.classList.remove('hidden');
    slotsEl.innerHTML = '';

    this.bloonSendQueue.forEach((item, idx) => {
      const slot = document.createElement('div');
      slot.className = 'queue-slot-item' + (idx === 0 ? ' active-sending' : '');
      const pct = idx === 0
        ? Math.max(0, Math.min(100, ((item.totalTime - item.remainingTime) / item.totalTime) * 100))
        : 0;
      slot.innerHTML = `
        <div class="queue-slot-progress" style="width: ${pct}%;"></div>
        <img src="${item.iconSrc}" alt="${item.sendDef.label}" />
      `;
      slotsEl.appendChild(slot);
    });
  }

  // --------------------------------------------------------------------------
  // MATCH INITIALIZATION (1v1 & 8-PLAYER BATTLE ROYALE)
  // --------------------------------------------------------------------------
  startMatch(mode, mapId, myName, opponentName, loadout, bonusTower) {
    this.mode = mode;
    this.isRoyale = false;
    this.selectedMapId = mapId || 'battle_park';
    this.myName = myName || 'أنت';
    this.opponentName = opponentName || 'الخصم';

    this.activeMatchLoadout = [...(loadout || this.chosenLoadout)];
    if (bonusTower && !this.activeMatchLoadout.includes(bonusTower)) {
      this.activeMatchLoadout.push(bonusTower);
    }

    const mapDef = window.GAME_DATA.maps[this.selectedMapId] || window.GAME_DATA.maps.battle_park;
    this.playerField = new window.Battlefield('left', mapDef, true);
    this.opponentField = new window.Battlefield('right', mapDef, false);
    this.royaleParticipants = [];

    this.aiController = mode === 'ai'
      ? new window.AIOpponent(this.opponentField, this.playerField, Object.keys(window.GAME_DATA.towers))
      : null;

    document.getElementById('royale-arena-strip').classList.add('hidden');
    document.getElementById('royale-alive-badge').classList.add('hidden');
    document.getElementById('btn-cam-grid').classList.add('hidden');
    document.getElementById('gameover-standings').classList.add('hidden');

    this.resetCommonMatchState();
  }

  startRoyaleMatch(mode, mapId, myPlayerId, playersList, loadout, bonusTower) {
    this.mode = mode;
    this.isRoyale = true;
    this.selectedMapId = mapId || 'battle_park';
    this.myPlayerId = myPlayerId || 'local_p1';

    this.activeMatchLoadout = [...(loadout || this.chosenLoadout)];
    if (bonusTower && !this.activeMatchLoadout.includes(bonusTower)) {
      this.activeMatchLoadout.push(bonusTower);
    }

    const mapDef = window.GAME_DATA.maps[this.selectedMapId] || window.GAME_DATA.maps.battle_park;
    const allTowerIds = Object.keys(window.GAME_DATA.towers);

    this.royaleParticipants = [];
    this.eliminationCounter = 0;

    playersList.forEach((p, idx) => {
      const isMe = p.id === this.myPlayerId || (!p.isBot && idx === 0 && mode === 'royale_local');
      const field = new window.Battlefield(isMe ? 'left' : 'right', mapDef, isMe);
      const participant = {
        id: p.id,
        name: p.name,
        isMe,
        isBot: Boolean(p.isBot),
        field,
        ai: null,
        eliminated: false,
        elimOrder: 0
      };
      this.royaleParticipants.push(participant);
    });

    // Attach AI controllers for all bot participants
    this.royaleParticipants.forEach((participant) => {
      if (participant.isBot) {
        participant.ai = new window.AIOpponent(
          participant.field,
          () => {
            const aliveTargets = this.royaleParticipants.filter(other => other.id !== participant.id && !other.eliminated && other.field.lives > 0);
            if (aliveTargets.length === 0) return null;
            return aliveTargets[Math.floor(Math.random() * aliveTargets.length)].field;
          },
          allTowerIds
        );
      }
    });

    const meP = this.royaleParticipants.find(p => p.isMe) || this.royaleParticipants[0];
    this.playerField = meP.field;
    this.myName = meP.name;

    const firstOpponent = this.royaleParticipants.find(p => !p.isMe) || meP;
    this.royaleTargetId = 'auto';
    this.setRoyaleViewedOpponent(firstOpponent.id);

    document.getElementById('royale-arena-strip').classList.remove('hidden');
    document.getElementById('royale-alive-badge').classList.remove('hidden');
    document.getElementById('btn-cam-grid').classList.remove('hidden');
    this.renderRoyaleArenaStrip();

    this.resetCommonMatchState();
  }

  setRoyaleViewedOpponent(participantId) {
    const p = this.findParticipant(participantId);
    if (!p || p.isMe) return;
    this.royaleViewedId = p.id;
    this.opponentField = p.field;
    this.opponentName = p.name;
    document.getElementById('hud-right-name').textContent = p.name;
    this.renderRoyaleArenaStrip();
  }

  renderRoyaleArenaStrip() {
    if (!this.isRoyale) return;
    const bar = document.getElementById('royale-players-bar');
    const autoBtn = document.getElementById('btn-target-auto');
    if (!bar) return;

    const resolvedTarget = this.resolveRoyaleTargetParticipant();
    if (autoBtn) {
      autoBtn.classList.toggle('active', this.royaleTargetId === 'auto');
    }

    const aliveCount = this.royaleParticipants.filter(p => !p.eliminated).length;
    document.getElementById('hud-alive-count').textContent = `${aliveCount}/${this.royaleParticipants.length}`;

    bar.innerHTML = '';
    for (const p of this.royaleParticipants) {
      const isTarget = resolvedTarget && resolvedTarget.id === p.id;
      const isViewing = this.royaleViewedId === p.id;

      const chip = document.createElement('div');
      chip.className = 'royale-player-chip'
        + (p.isMe ? ' is-me' : '')
        + (isTarget ? ' is-target' : '')
        + (isViewing ? ' is-viewing' : '')
        + (p.eliminated ? ' is-eliminated' : '');

      const prefix = p.isMe ? '🛡️' : (isTarget ? '🎯' : (p.isBot ? '🤖' : '👤'));
      const livesTxt = p.eliminated ? '💀 0' : `❤️ ${Math.max(0, p.field.lives)}`;

      chip.innerHTML = `
        <span class="chip-name">${prefix} ${p.name}</span>
        <span class="chip-lives">${livesTxt}</span>
        ${!p.isMe && !p.eliminated ? '<button class="chip-spy-btn" title="مراقبة خريطته">👁️</button>' : ''}
      `;

      if (!p.isMe && !p.eliminated) {
        chip.addEventListener('click', (e) => {
          window.SFX.play('soft_click');
          if (e.target.classList.contains('chip-spy-btn')) {
            this.setRoyaleViewedOpponent(p.id);
            if (this.cameraMode === 'mine' || this.cameraMode === 'grid') {
              this.applyCameraMode('split');
            }
          } else {
            this.royaleTargetId = p.id;
            this.setRoyaleViewedOpponent(p.id);
          }
        });
      } else if (p.isMe) {
        chip.addEventListener('click', () => {
          window.SFX.play('soft_click');
          this.applyCameraMode('mine');
        });
      }

      bar.appendChild(chip);
    }
  }

  resetCommonMatchState() {
    this.currentRound = 0;
    this.roundTimer = 0.5;
    this.ecoTimer = 0;
    this.syncTimer = 0;
    this.bloonSendQueue = [];
    this.renderBloonSendQueueUI();
    this.sendCamoMod = false;
    this.sendRegrowMod = false;
    document.getElementById('btn-toggle-camo').classList.remove('active');
    document.getElementById('btn-toggle-regrow').classList.remove('active');

    this.running = true;
    this.gameOver = false;
    this.setPlacingTower(null);
    this.selectTower(null);
    this.buildMatchShopUI();
    this.updateBloonSendCostsUI();

    if (window.innerWidth <= 850) {
      this.applyCameraMode('mine');
    } else {
      this.applyCameraMode('split');
    }

    document.getElementById('hud-left-name').textContent = this.myName;
    document.getElementById('hud-right-name').textContent = this.opponentName;
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('elimination-banner').classList.add('hidden');

    this.showScreen('battle-screen');
  }

  leaveMatchToMenu() {
    this.running = false;
    this.gameOver = false;
    if (this.mode === 'friend' || this.mode === 'royale_online') {
      this.sendNet({ type: 'leave_room' });
    }
    document.getElementById('gameover-modal').classList.add('hidden');
    this.showScreen('menu-screen');
  }

  spawnNextNaturalRound() {
    this.currentRound++;
    window.SFX.play('newRound', 200, 0.7);

    const rounds = window.GAME_DATA.rounds;
    const def = rounds[Math.min(this.currentRound - 1, rounds.length - 1)];
    const scaleMult = this.currentRound > rounds.length ? 1 + (this.currentRound - rounds.length) * 0.45 : 1;

    const hpMult = this.currentRound > 25 ? 1 + (this.currentRound - 25) * 0.35 : 1.0;

    this.roundTimer = def.duration;

    if (this.isRoyale) {
      for (const p of this.royaleParticipants) {
        if (p.eliminated) continue;
        p.field.roundMultiplier = hpMult;
        for (const g of def.groups) {
          const count = Math.round(g.count * scaleMult);
          p.field.queueBloonGroup(g.bloon, count, g.interval, false, {
            initialDelay: g.delay || 0,
            camo: Boolean(g.camo),
            regrow: Boolean(g.regrow)
          });
        }
      }
    } else {
      this.playerField.roundMultiplier = hpMult;
      this.opponentField.roundMultiplier = hpMult;
      for (const g of def.groups) {
        const count = Math.round(g.count * scaleMult);
        const opts = {
          initialDelay: g.delay || 0,
          camo: Boolean(g.camo),
          regrow: Boolean(g.regrow)
        };
        this.playerField.queueBloonGroup(g.bloon, count, g.interval, false, opts);
        this.opponentField.queueBloonGroup(g.bloon, count, g.interval, false, opts);
      }
    }
  }

  handleParticipantElimination(p) {
    if (p.eliminated) return;
    p.eliminated = true;
    this.eliminationCounter++;
    p.elimOrder = this.eliminationCounter;
    window.SFX.play('moab_destroy', 120, 0.8);

    // If a rival is eliminated while we are still alive, grant Survival Bounty!
    if (!p.isMe && this.playerField && this.playerField.lives > 0) {
      this.playerField.cash += 400;
      this.playerField.eco += 40;
      this.showDeltaBadge('cash-delta-float', 'pill-left-cash', '+$400 مكافأة', true);
      this.showDeltaBadge('eco-delta-float', 'pill-left-eco', '+40 Eco', true);

      const banner = document.getElementById('elimination-banner');
      if (banner) {
        banner.textContent = `💀 تم إقصاء ${p.name}! مكافأة الصمود: +$400 و +40 Eco`;
        banner.classList.remove('hidden');
        banner.style.animation = 'none';
        void banner.offsetWidth;
        banner.style.animation = '';
        clearTimeout(banner._hideTimer);
        banner._hideTimer = setTimeout(() => banner.classList.add('hidden'), 2400);
      }
    }

    // Switch viewed opponent if the current one was eliminated
    if (this.royaleViewedId === p.id) {
      const nextAlive = this.royaleParticipants.find(other => !other.isMe && !other.eliminated);
      if (nextAlive) {
        this.setRoyaleViewedOpponent(nextAlive.id);
      }
    }

    this.renderRoyaleArenaStrip();
  }

  endMatch(playerWon, reasonText) {
    if (this.gameOver) return;
    this.gameOver = true;
    window.SFX.play(playerWon ? 'game_win' : 'game_over');

    const titleEl = document.getElementById('gameover-title');
    const subEl = document.getElementById('gameover-subtitle');
    const standingsEl = document.getElementById('gameover-standings');

    if (playerWon) {
      titleEl.textContent = this.isRoyale ? '👑 بطل الساحة الجماعية (#1)! 🏆' : 'انتصار ساحق! 🏆';
      titleEl.style.color = '#26de81';
    } else {
      titleEl.textContent = 'انتهت المعركة بالهزيمة! 💥';
      titleEl.style.color = '#ff5e57';
    }
    subEl.textContent = reasonText;

    if (this.isRoyale && standingsEl) {
      standingsEl.classList.remove('hidden');
      const ranked = [...this.royaleParticipants].sort((a, b) => {
        if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
        if (!a.eliminated && !b.eliminated) return b.field.lives - a.field.lives;
        return b.elimOrder - a.elimOrder;
      });
      standingsEl.innerHTML = ranked.map((p, idx) => `
        <div class="standing-row ${p.isMe ? 'me' : ''}">
          <span>#${idx + 1} — ${p.name}</span>
          <span>${p.eliminated ? '💀 مقصى' : `❤️ ${p.field.lives} حياة`}</span>
        </div>
      `).join('');
    } else if (standingsEl) {
      standingsEl.classList.add('hidden');
    }

    document.getElementById('gameover-modal').classList.remove('hidden');
  }

  updateHUD() {
    if (!this.playerField || !this.opponentField) return;

    const pLives = this.playerField.lives;
    const oLives = this.opponentField.lives;

    document.getElementById('hud-left-lives').textContent = pLives;
    document.getElementById('hud-left-cash').textContent = Math.floor(this.playerField.cash);
    document.getElementById('hud-left-eco').textContent = Math.floor(this.playerField.eco);
    document.getElementById('hud-right-lives').textContent = oLives;
    document.getElementById('hud-round-num').textContent = this.currentRound;

    const totalLives = Math.max(1, pLives + oLives);
    const leftPct = Math.max(5, Math.min(95, (pLives / totalLives) * 100));
    document.getElementById('damage-bar-left').style.width = `${leftPct}%`;
    document.getElementById('damage-bar-right').style.width = `${100 - leftPct}%`;

    const ecoPct = Math.min(100, (this.ecoTimer / window.GAME_DATA.ecoIntervalSeconds) * 100);
    document.getElementById('eco-timer-fill').style.width = `${ecoPct}%`;

    document.getElementById('count-tower-boost').textContent = this.playerField.towerBoosts;
    document.getElementById('count-bloon-boost').textContent = this.playerField.bloonBoosts;

    document.getElementById('btn-toggle-camo').classList.toggle('locked-mod', this.currentRound < 12);
    document.getElementById('btn-toggle-regrow').classList.toggle('locked-mod', this.currentRound < 8);

    document.querySelectorAll('.shop-tower-card').forEach(card => {
      const def = window.GAME_DATA.towers[card.dataset.type];
      if (def) card.classList.toggle('unaffordable', this.playerField.cash < def.cost);
    });

    document.querySelectorAll('.bloon-send-btn').forEach(btn => {
      const def = window.GAME_DATA.bloonSends.find(s => s.id === btn.dataset.sendId);
      if (!def) return;
      const modCost = this.getModifiedSendCost(def);
      btn.classList.toggle('locked', this.currentRound < def.minRound);
      btn.classList.toggle('unaffordable', this.playerField.cash < modCost);
    });

    this.syncAbilitiesBar();

    if (this.selectedTowerId) {
      const t = this.playerField.towers.find(tw => tw.id === this.selectedTowerId);
      if (t) {
        const statVal = document.getElementById('inspector-pops-val');
        statVal.textContent = t.def.isFarm
          ? `$${t.cashGenerated.toLocaleString()}`
          : t.popCount.toLocaleString();
        const leftSlot = document.getElementById('btn-upgrade-left');
        const rightSlot = document.getElementById('btn-upgrade-right');
        const lInfo = t.getLeftUpgradeInfo();
        const rInfo = t.getRightUpgradeInfo();
        if (lInfo) leftSlot.classList.toggle('unaffordable', this.playerField.cash < lInfo.cost);
        if (rInfo) rightSlot.classList.toggle('unaffordable', this.playerField.cash < rInfo.cost);
      }
    }
  }

  syncAbilitiesBar() {
    const bar = document.getElementById('active-abilities-bar');
    const abilityTowers = this.playerField.towers.filter(t => Boolean(t.abilityIcon));

    if (bar.children.length !== abilityTowers.length) {
      bar.innerHTML = '';
      for (const t of abilityTowers) {
        const btn = document.createElement('div');
        btn.className = 'ability-btn';
        btn.dataset.towerId = t.id;
        btn.innerHTML = `
          <img src="${t.abilityIcon}" alt="Ability" />
          <div class="ability-cooldown-mask hidden"></div>
        `;
        btn.addEventListener('click', () => {
          if (this.playerField.activateAbility(t.id)) {
            if (this.mode === 'friend' || this.mode === 'royale_online') {
              this.sendNet({ type: 'use_ability', towerId: t.id });
            }
          }
        });
        bar.appendChild(btn);
      }
    }

    for (const btn of bar.children) {
      const t = this.playerField.towers.find(tw => tw.id === btn.dataset.towerId);
      const mask = btn.querySelector('.ability-cooldown-mask');
      if (t && t.abilityCooldown > 0) {
        mask.classList.remove('hidden');
        mask.textContent = `${Math.ceil(t.abilityCooldown)}s`;
      } else if (mask) {
        mask.classList.add('hidden');
      }
    }
  }

  loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    if (this.running && !this.gameOver && this.playerField && this.opponentField) {
      this.roundTimer -= dt;
      if (this.roundTimer <= 0) {
        this.spawnNextNaturalRound();
      }

      this.ecoTimer += dt;
      if (this.ecoTimer >= window.GAME_DATA.ecoIntervalSeconds) {
        this.ecoTimer -= window.GAME_DATA.ecoIntervalSeconds;
        if (this.isRoyale) {
          for (const p of this.royaleParticipants) {
            if (!p.eliminated) p.field.cash += p.field.eco;
          }
        } else {
          this.playerField.cash += this.playerField.eco;
          this.opponentField.cash += this.opponentField.eco;
        }
        this.showDeltaBadge('cash-delta-float', 'pill-left-cash', `+$${Math.floor(this.playerField.eco)}`, true);
      }

      this.updateBloonSendQueue(dt);

      if (this.isRoyale) {
        for (const p of this.royaleParticipants) {
          if (p.eliminated) continue;
          if (p.isBot && p.ai) {
            p.ai.update(dt, this.currentRound);
          }
          p.field.update(dt);

          if (p.field.lives <= 0 && !p.eliminated) {
            this.handleParticipantElimination(p);
          }
        }

        this.syncTimer += dt;
        if (this.syncTimer >= 0.45) {
          this.syncTimer = 0;
          if (this.mode === 'royale_online') {
            this.sendNet({ type: 'state_sync', lives: this.playerField.lives });
          }
          this.renderRoyaleArenaStrip();
        }

        // Check Royale Victory / Defeat conditions
        if (this.playerField.lives <= 0) {
          if (this.mode === 'royale_online') {
            this.sendNet({ type: 'game_over' });
          }
          const aliveRemain = this.royaleParticipants.filter(p => !p.isMe && !p.eliminated).length;
          this.endMatch(false, `تم إقصاؤك في المركز #${aliveRemain + 1} من أصل ${this.royaleParticipants.length} لاعبين!`);
        } else {
          const aliveOpponents = this.royaleParticipants.filter(p => !p.isMe && !p.eliminated);
          if (aliveOpponents.length === 0) {
            this.endMatch(true, `صمدت حتى النهاية وهزمت جميع الـ ${this.royaleParticipants.length - 1} خصوم في الساحة!`);
          }
        }
      } else {
        if (this.mode === 'ai' && this.aiController) {
          this.aiController.update(dt, this.currentRound);
        } else if (this.mode === 'friend') {
          this.syncTimer += dt;
          if (this.syncTimer >= 0.5) {
            this.syncTimer = 0;
            this.sendNet({ type: 'state_sync', lives: this.playerField.lives });
          }
        }

        this.playerField.update(dt);
        this.opponentField.update(dt);

        if (this.playerField.lives <= 0) {
          if (this.mode === 'friend') {
            this.sendNet({ type: 'game_over' });
          }
          this.endMatch(false, 'لقد اخترقت البالونات دفاعاتك بالكامل!');
        } else if (this.opponentField.lives <= 0 && this.mode === 'ai') {
          this.endMatch(true, 'لقد دمرت دفاعات الآلة (AI) بالكامل!');
        }
      }

      this.renderBattleCanvas();
      this.updateHUD();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  renderBattleCanvas() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let preview = null;
    if (this.placingTowerType && this.pointerCanvasPos.insideLeft) {
      const px = Math.round(this.pointerCanvasPos.x);
      const py = Math.round(this.pointerCanvasPos.y);
      preview = {
        typeId: this.placingTowerType,
        x: px,
        y: py,
        valid: this.playerField.canPlaceTower(this.placingTowerType, px, py)
      };
    }

    if (this.cameraMode === 'mine') {
      this.playerField.draw(ctx, this.selectedTowerId, preview);
      return;
    }

    if (this.cameraMode === 'enemy') {
      this.opponentField.draw(ctx, null, null);
      return;
    }

    if (this.cameraMode === 'grid' && this.isRoyale) {
      this.renderRoyaleGridCanvas(ctx);
      return;
    }

    // Split-Screen View (968 x 640)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 480, 640);
    ctx.clip();
    this.playerField.draw(ctx, this.selectedTowerId, preview);
    ctx.restore();

    const stripImg = window.ASSETS.get('assets/hud/centre_strip_bg.png');
    if (stripImg) {
      ctx.drawImage(stripImg, 478, 0, 12, 640);
    } else {
      ctx.fillStyle = '#4a3219';
      ctx.fillRect(480, 0, 8, 640);
    }

    ctx.save();
    ctx.translate(488, 0);
    ctx.beginPath();
    ctx.rect(0, 0, 480, 640);
    ctx.clip();
    this.opponentField.draw(ctx, null, null);
    ctx.restore();
  }

  renderRoyaleGridCanvas(ctx) {
    // 4 columns x 2 rows = 8 live battlefields on 968x640 canvas (each cell 242x320)
    const cellW = 242;
    const cellH = 320;
    const resolvedTarget = this.resolveRoyaleTargetParticipant();

    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const cx = col * cellW;
      const cy = row * cellH;
      const p = this.royaleParticipants[i];

      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, cellW, cellH);
      ctx.clip();
      ctx.translate(cx, cy);

      if (p) {
        ctx.save();
        ctx.scale(cellW / 480, cellH / 640);
        p.field.draw(ctx, p.isMe ? this.selectedTowerId : null, null);
        ctx.restore();

        if (p.eliminated) {
          ctx.fillStyle = 'rgba(15, 5, 10, 0.72)';
          ctx.fillRect(0, 0, cellW, cellH);
          ctx.fillStyle = '#ff5e57';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('💀 تم الإقصاء', cellW / 2, cellH / 2);
        }

        // Top overlay header inside cell
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, cellW, 26);
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = p.isMe ? '#38b6ff' : '#ffffff';
        const tag = p.isMe ? '🛡️ ' : (resolvedTarget && resolvedTarget.id === p.id ? '🎯 ' : '');
        ctx.fillText(`${tag}${p.name}`, 6, 17);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff6b81';
        ctx.fillText(`❤️ ${Math.max(0, p.field.lives)}`, cellW - 6, 17);
      } else {
        ctx.fillStyle = '#0b1422';
        ctx.fillRect(0, 0, cellW, cellH);
      }

      // Cell border
      ctx.strokeStyle = p && p.isMe
        ? '#26de81'
        : (p && resolvedTarget && resolvedTarget.id === p.id ? '#ff5e57' : '#355c8a');
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, cellW - 3, cellH - 3);
      ctx.restore();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.APP = new GameApp();
  window.APP.init();
});
