const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../utils/database');

// 创建梦境联机房间
const createRoom = async (roomData) => {
  const {
    hostId,
    name,
    description,
    theme,
    maxParticipants = 5,
    isPrivate = false,
    password,
    scheduledAt
  } = roomData;
  
  const id = uuidv4();
  
  await run(`
    INSERT INTO dream_rooms 
    (id, host_id, name, description, theme, max_participants, is_private, password, scheduled_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, hostId, name, description, theme, maxParticipants, isPrivate ? 1 : 0, password, scheduledAt]);
  
  // 主持人自动加入
  await run(`
    INSERT INTO room_participants (room_id, user_id, is_ready)
    VALUES (?, ?, 1)
  `, [id, hostId]);
  
  return { id, ...roomData };
};

// 获取房间列表
const getRooms = async (options = {}) => {
  const { isActive = true, limit = 20 } = options;
  
  const rooms = await all(`
    SELECT r.*, u.username as host_name,
           COUNT(rp.id) as participant_count
    FROM dream_rooms r
    JOIN users u ON r.host_id = u.id
    LEFT JOIN room_participants rp ON r.id = rp.room_id AND rp.left_at IS NULL
    WHERE r.is_active = ? AND r.is_private = 0
    GROUP BY r.id
    ORDER BY r.created_at DESC
    LIMIT ?
  `, [isActive ? 1 : 0, limit]);
  
  return rooms;
};

// 获取房间详情
const getRoomById = async (roomId) => {
  const room = await get(`
    SELECT r.*, u.username as host_name
    FROM dream_rooms r
    JOIN users u ON r.host_id = u.id
    WHERE r.id = ?
  `, [roomId]);
  
  if (!room) return null;
  
  // 获取参与者
  const participants = await all(`
    SELECT rp.*, u.username, u.avatar
    FROM room_participants rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.room_id = ? AND rp.left_at IS NULL
    ORDER BY rp.joined_at
  `, [roomId]);
  
  return { ...room, participants };
};

// 加入房间
const joinRoom = async (roomId, userId, password = null) => {
  const room = await getRoomById(roomId);
  
  if (!room) {
    throw new Error('房间不存在');
  }
  
  if (!room.is_active) {
    throw new Error('房间已关闭');
  }
  
  if (room.is_private && room.password !== password) {
    throw new Error('房间密码错误');
  }
  
  if (room.participants.length >= room.max_participants) {
    throw new Error('房间已满');
  }
  
  // 检查是否已在房间
  const existing = await get(`
    SELECT id FROM room_participants
    WHERE room_id = ? AND user_id = ? AND left_at IS NULL
  `, [roomId, userId]);
  
  if (existing) {
    throw new Error('您已在房间中');
  }
  
  await run(`
    INSERT INTO room_participants (room_id, user_id)
    VALUES (?, ?)
  `, [roomId, userId]);
  
  return getRoomById(roomId);
};

// 离开房间
const leaveRoom = async (roomId, userId) => {
  await run(`
    UPDATE room_participants
    SET left_at = CURRENT_TIMESTAMP
    WHERE room_id = ? AND user_id = ? AND left_at IS NULL
  `, [roomId, userId]);
  
  // 如果主持人离开，关闭房间
  const room = await get(`SELECT host_id FROM dream_rooms WHERE id = ?`, [roomId]);
  if (room && room.host_id === userId) {
    await run(`
      UPDATE dream_rooms
      SET is_active = 0, ended_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [roomId]);
  }
};

// 设置准备状态
const setReady = async (roomId, userId, isReady = true) => {
  await run(`
    UPDATE room_participants
    SET is_ready = ?
    WHERE room_id = ? AND user_id = ? AND left_at IS NULL
  `, [isReady ? 1 : 0, roomId, userId]);
};

// 分享梦境到房间
const shareDreamToRoom = async (roomId, userId, dreamId) => {
  await run(`
    UPDATE room_participants
    SET dream_shared = 1
    WHERE room_id = ? AND user_id = ?
  `, [roomId, userId]);
};

// 开始联机
const startDreamSync = async (roomId) => {
  await run(`
    UPDATE dream_rooms
    SET started_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [roomId]);
};

// 结束联机
const endDreamSync = async (roomId) => {
  await run(`
    UPDATE dream_rooms
    SET is_active = 0, ended_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [roomId]);
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  joinRoom,
  leaveRoom,
  setReady,
  shareDreamToRoom,
  startDreamSync,
  endDreamSync
};
