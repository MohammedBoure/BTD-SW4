/**
 * Bloons TD Battles — Separate Multiplayer & Web Server (server.js)
 * Zero-dependency Node.js HTTP static server + RFC 6455 WebSocket server
 * Supports:
 *  - Serving the Web & Mobile game frontend from ./web
 *  - Creating & joining 1v1 Multiplayer Friend Rooms AND 8-Player Battle Royale Arena Rooms
 *  - Pre-Match Lobby Queue: Host selects Map (from 7 maps), adds/removes AI bots (up to 8 players), players select 4 Towers + Ready Up
 *  - Real-time 1v1 & 8-Player Battle actions: tower place/upgrade/sell/ability, targeted bloon sends (with Camo & Regrow), boosts, state sync, eliminations
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const PORT = process.env.PORT || 3000;
const WEB_DIR = path.join(__dirname, 'web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

const ALL_TOWERS = [
  'DartMonkey', 'TackShooter', 'BombTower', 'SuperMonkey',
  'NinjaMonkey', 'SniperMonkey', 'MonkeyApprentice', 'BoomerangThrower',
  'BananaFarm', 'MonkeyVillage', 'SpikeFactory', 'MortarTower'
];

const rooms = new Map();
let NEXT_PLAYER_ID = 1;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (rooms.has(code));
  return code;
}

function encodeWsFrame(dataObj) {
  const payload = Buffer.from(JSON.stringify(dataObj), 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function sendWs(socket, obj) {
  if (!socket || socket.destroyed || !socket.writable) return;
  try {
    socket.write(encodeWsFrame(obj));
  } catch (err) {}
}

function broadcastRoomState(room) {
  const publicPlayers = room.players.map(p => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
    isBot: p.isBot,
    ready: p.ready
  }));
  const guestPlayer = room.players.find(p => !p.isHost);

  for (const p of room.players) {
    if (p.isBot || !p.socket) continue;
    sendWs(p.socket, {
      type: 'lobby_state',
      code: room.code,
      mapId: room.mapId,
      isRoyale: room.isRoyale,
      maxPlayers: room.maxPlayers,
      role: p.isHost ? 'host' : 'guest',
      myPlayerId: p.id,
      hostName: room.hostName,
      guestName: guestPlayer ? guestPlayer.name : 'بانتظار صديق...',
      hasGuest: room.players.length >= 2,
      hostReady: Boolean(room.players[0] && room.players[0].ready),
      guestReady: Boolean(guestPlayer && guestPlayer.ready),
      players: publicPlayers
    });
  }
}

function startRoomMatch(room) {
  room.status = 'playing';
  const pickBonus = (chosen) => {
    const rem = ALL_TOWERS.filter(id => !chosen.includes(id));
    return rem.length > 0 ? rem[Math.floor(Math.random() * rem.length)] : null;
  };

  for (const p of room.players) {
    p.bonusTower = pickBonus(p.loadout);
  }

  const matchPlayers = room.players.map(p => ({
    id: p.id,
    name: p.name,
    isHost: p.isHost,
    isBot: p.isBot,
    loadout: p.loadout,
    bonusTower: p.bonusTower
  }));

  for (const p of room.players) {
    if (p.isBot || !p.socket) continue;
    const other = room.players.find(o => o.id !== p.id) || p;
    sendWs(p.socket, {
      type: 'match_start',
      code: room.code,
      isRoyale: room.isRoyale,
      role: p.isHost ? 'host' : 'guest',
      myPlayerId: p.id,
      mapId: room.mapId,
      myName: p.name,
      opponentName: other.name,
      loadout: p.loadout,
      bonusTower: p.bonusTower,
      players: matchPlayers
    });
  }
}

function createWsParser(socket, onMessage, onClose) {
  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0f;
      const isMasked = (secondByte & 0x80) !== 0;
      let payloadLen = secondByte & 0x7f;
      let offset = 2;

      if (opcode === 0x08) {
        onClose();
        socket.end();
        return;
      }

      if (payloadLen === 126) {
        if (buffer.length < 4) return;
        payloadLen = buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLen === 127) {
        if (buffer.length < 10) return;
        payloadLen = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskLen = isMasked ? 4 : 0;
      if (buffer.length < offset + maskLen + payloadLen) return;

      let mask = null;
      if (isMasked) {
        mask = buffer.subarray(offset, offset + 4);
        offset += 4;
      }

      const payload = Buffer.from(buffer.subarray(offset, offset + payloadLen));
      buffer = buffer.subarray(offset + payloadLen);

      if (isMasked && mask) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i & 3];
        }
      }

      if (opcode === 0x01) {
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          onMessage(msg);
        } catch (e) {}
      } else if (opcode === 0x09) {
        const pong = Buffer.alloc(2);
        pong[0] = 0x8a;
        pong[1] = 0;
        socket.write(pong);
      }
    }
  });

  socket.on('close', onClose);
  socket.on('error', onClose);
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname === '/api/rooms') {
    const openRooms = [];
    for (const [code, room] of rooms.entries()) {
      if (room.status === 'waiting' && room.players.length < room.maxPlayers) {
        openRooms.push({
          code,
          mapId: room.mapId,
          hostName: room.hostName || 'Player 1',
          isRoyale: room.isRoyale,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers
        });
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ rooms: openRooms }));
    return;
  }

  if (pathname === '/') pathname = '/index.html';

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(WEB_DIR, safePath);

  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + pathname);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('upgrade', (req, socket, head) => {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`,
    '\r\n'
  ];
  socket.write(headers.join('\r\n'));

  socket.roomCode = null;
  socket.role = null;
  socket.playerId = 'p_' + (NEXT_PLAYER_ID++);

  const handleDisconnect = () => {
    if (!socket.roomCode) return;
    const room = rooms.get(socket.roomCode);
    if (!room) return;

    if (socket.role === 'host') {
      for (const p of room.players) {
        if (!p.isBot && p.socket && p.socket !== socket) {
          sendWs(p.socket, { type: 'opponent_left', playerId: socket.playerId });
        }
      }
      rooms.delete(socket.roomCode);
    } else {
      room.players = room.players.filter(p => p.id !== socket.playerId);
      if (room.status === 'waiting') {
        broadcastRoomState(room);
      } else {
        for (const p of room.players) {
          if (!p.isBot && p.socket) {
            sendWs(p.socket, {
              type: room.isRoyale ? 'player_eliminated' : 'opponent_left',
              playerId: socket.playerId
            });
          }
        }
      }
    }
    socket.roomCode = null;
  };

  createWsParser(socket, (msg) => {
    if (!msg || typeof msg.type !== 'string') return;

    switch (msg.type) {
      case 'create_room': {
        handleDisconnect();
        const code = generateRoomCode();
        const mapId = msg.mapId || 'battle_park';
        const hostName = (msg.playerName || msg.name || 'المشرف').slice(0, 20);
        const isRoyale = Boolean(msg.isRoyale || (msg.maxPlayers && msg.maxPlayers > 2));
        const maxPlayers = isRoyale ? Math.min(8, Math.max(3, msg.maxPlayers || 8)) : 2;

        const hostEntry = {
          id: socket.playerId,
          name: hostName,
          socket,
          isHost: true,
          isBot: false,
          ready: false,
          loadout: ['DartMonkey', 'NinjaMonkey', 'BananaFarm', 'SuperMonkey']
        };

        const room = {
          code,
          mapId,
          hostName,
          isRoyale,
          maxPlayers,
          players: [hostEntry],
          status: 'waiting'
        };

        rooms.set(code, room);
        socket.roomCode = code;
        socket.role = 'host';
        sendWs(socket, {
          type: 'room_created',
          code,
          mapId,
          hostName,
          isRoyale,
          maxPlayers,
          myPlayerId: socket.playerId
        });
        broadcastRoomState(room);
        break;
      }

      case 'join_room': {
        handleDisconnect();
        const code = String(msg.code || '').trim().toUpperCase();
        const room = rooms.get(code);
        if (!room) {
          sendWs(socket, { type: 'room_error', message: 'كود الغرفة غير موجود!' });
          return;
        }
        if (room.status !== 'waiting' || room.players.length >= room.maxPlayers) {
          sendWs(socket, { type: 'room_error', message: 'هذه الغرفة ممتلئة بالفعل!' });
          return;
        }
        const guestName = (msg.playerName || msg.name || `لاعب ${room.players.length + 1}`).slice(0, 20);
        socket.roomCode = code;
        socket.role = 'guest';

        room.players.push({
          id: socket.playerId,
          name: guestName,
          socket,
          isHost: false,
          isBot: false,
          ready: false,
          loadout: ['DartMonkey', 'NinjaMonkey', 'BananaFarm', 'SuperMonkey']
        });

        broadcastRoomState(room);
        break;
      }

      case 'add_bot': {
        const room = rooms.get(socket.roomCode);
        if (!room || socket.role !== 'host' || room.status !== 'waiting') return;
        if (room.players.length >= room.maxPlayers) return;
        const botNum = room.players.filter(p => p.isBot).length + 1;
        const botLoadouts = [
          ['DartMonkey', 'BananaFarm', 'NinjaMonkey', 'SuperMonkey'],
          ['TackShooter', 'BombTower', 'MonkeyVillage', 'SpikeFactory'],
          ['BoomerangThrower', 'MonkeyApprentice', 'BananaFarm', 'MortarTower'],
          ['SniperMonkey', 'NinjaMonkey', 'MonkeyVillage', 'SuperMonkey']
        ];
        room.players.push({
          id: 'bot_' + (NEXT_PLAYER_ID++),
          name: `🤖 آلي ${botNum}`,
          socket: null,
          isHost: false,
          isBot: true,
          ready: true,
          loadout: botLoadouts[(botNum - 1) % botLoadouts.length]
        });
        broadcastRoomState(room);
        break;
      }

      case 'remove_bot': {
        const room = rooms.get(socket.roomCode);
        if (!room || socket.role !== 'host' || room.status !== 'waiting') return;
        for (let i = room.players.length - 1; i >= 0; i--) {
          if (room.players[i].isBot) {
            room.players.splice(i, 1);
            break;
          }
        }
        broadcastRoomState(room);
        break;
      }

      case 'change_map': {
        const room = rooms.get(socket.roomCode);
        if (room && socket.role === 'host') {
          room.mapId = msg.mapId || 'battle_park';
          for (const p of room.players) {
            if (!p.isBot) p.ready = false;
          }
          broadcastRoomState(room);
        }
        break;
      }

      case 'player_ready': {
        const room = rooms.get(socket.roomCode);
        if (!room) return;
        const loadout = Array.isArray(msg.loadout) && msg.loadout.length > 0
          ? msg.loadout
          : ['DartMonkey', 'NinjaMonkey', 'BananaFarm', 'SuperMonkey'];

        const me = room.players.find(p => p.id === socket.playerId);
        if (me) {
          me.loadout = loadout;
          me.ready = true;
        }

        broadcastRoomState(room);

        const allReady = room.players.length >= 2 && room.players.every(p => p.ready);
        if (allReady) {
          startRoomMatch(room);
        }
        break;
      }

      case 'place_tower':
      case 'upgrade_tower':
      case 'sell_tower':
      case 'change_target':
      case 'use_ability':
      case 'send_bloon':
      case 'tower_boost':
      case 'bloon_boost':
      case 'state_sync':
      case 'player_eliminated':
      case 'game_over': {
        const room = rooms.get(socket.roomCode);
        if (!room) return;
        const payload = { ...msg, senderId: socket.playerId };
        for (const p of room.players) {
          if (p.isBot || !p.socket || p.id === socket.playerId) continue;
          if (msg.targetPlayerId && msg.type === 'send_bloon' && p.id !== msg.targetPlayerId) {
            // Still notify everyone in Royale so spectators/grid view can see incoming bloons!
          }
          sendWs(p.socket, payload);
        }
        break;
      }

      case 'leave_room': {
        handleDisconnect();
        break;
      }
    }
  }, handleDisconnect);
});

function getLocalIps() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIps();
  console.log('============================================================');
  console.log(' Bloons TD Battles — Web, Mobile & 8-Player Royale Server!');
  console.log('============================================================');
  console.log(` -> Local (PC):     http://localhost:${PORT}`);
  for (const ip of ips) {
    console.log(` -> Network (Phone/Friend): http://${ip}:${PORT}`);
  }
  console.log('============================================================');
});
