const express = require('express');
const router = express.Router();
const roomModel = require('../models/room');

// 获取房间列表
router.get('/', async (req, res) => {
  try {
    const rooms = await roomModel.getRooms(req.query);
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error('获取房间列表失败:', error);
    res.status(500).json({ success: false, error: '获取房间列表失败' });
  }
});

// 创建房间
router.post('/', async (req, res) => {
  try {
    const roomData = { ...req.body, hostId: req.userId };
    const room = await roomModel.createRoom(roomData);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    console.error('创建房间失败:', error);
    res.status(500).json({ success: false, error: '创建房间失败' });
  }
});

// 获取房间详情
router.get('/:id', async (req, res) => {
  try {
    const room = await roomModel.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: '房间不存在' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('获取房间详情失败:', error);
    res.status(500).json({ success: false, error: '获取房间详情失败' });
  }
});

// 加入房间
router.post('/:id/join', async (req, res) => {
  try {
    const { password } = req.body;
    const room = await roomModel.joinRoom(req.params.id, req.userId, password);
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('加入房间失败:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 离开房间
router.post('/:id/leave', async (req, res) => {
  try {
    await roomModel.leaveRoom(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('离开房间失败:', error);
    res.status(500).json({ success: false, error: '离开房间失败' });
  }
});

// 设置准备状态
router.post('/:id/ready', async (req, res) => {
  try {
    const { isReady } = req.body;
    await roomModel.setReady(req.params.id, req.userId, isReady);
    res.json({ success: true });
  } catch (error) {
    console.error('设置准备状态失败:', error);
    res.status(500).json({ success: false, error: '设置准备状态失败' });
  }
});

// 开始联机
router.post('/:id/start', async (req, res) => {
  try {
    await roomModel.startDreamSync(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('开始联机失败:', error);
    res.status(500).json({ success: false, error: '开始联机失败' });
  }
});

// 结束联机
router.post('/:id/end', async (req, res) => {
  try {
    await roomModel.endDreamSync(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('结束联机失败:', error);
    res.status(500).json({ success: false, error: '结束联机失败' });
  }
});

module.exports = router;
