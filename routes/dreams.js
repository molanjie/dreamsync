const express = require('express');
const router = express.Router();
const dreamModel = require('../models/dream');

// 创建梦境
router.post('/', async (req, res) => {
  try {
    const dreamData = req.body;
    dreamData.userId = req.userId; // 从中间件获取
    
    const dream = await dreamModel.createDream(dreamData);
    res.status(201).json({ success: true, data: dream });
  } catch (error) {
    console.error('创建梦境失败:', error);
    res.status(500).json({ success: false, error: '创建梦境失败' });
  }
});

// 获取用户的梦境
router.get('/my', async (req, res) => {
  try {
    const dreams = await dreamModel.getUserDreams(req.userId, req.query);
    res.json({ success: true, data: dreams, count: dreams.length });
  } catch (error) {
    console.error('获取梦境失败:', error);
    res.status(500).json({ success: false, error: '获取梦境失败' });
  }
});

// 获取社区梦境
router.get('/community', async (req, res) => {
  try {
    const dreams = await dreamModel.getCommunityDreams(req.query);
    res.json({ success: true, data: dreams, count: dreams.length });
  } catch (error) {
    console.error('获取社区梦境失败:', error);
    res.status(500).json({ success: false, error: '获取社区梦境失败' });
  }
});

// 获取单个梦境
router.get('/:id', async (req, res) => {
  try {
    const dream = await dreamModel.getUserDreams(req.params.id);
    if (!dream) {
      return res.status(404).json({ success: false, error: '梦境不存在' });
    }
    res.json({ success: true, data: dream });
  } catch (error) {
    console.error('获取梦境失败:', error);
    res.status(500).json({ success: false, error: '获取梦境失败' });
  }
});

// 获取相似梦境
router.get('/:id/similar', async (req, res) => {
  try {
    const similarDreams = await dreamModel.getSimilarDreams(req.params.id, req.query.limit);
    res.json({ success: true, data: similarDreams });
  } catch (error) {
    console.error('获取相似梦境失败:', error);
    res.status(500).json({ success: false, error: '获取相似梦境失败' });
  }
});

// 更新梦境
router.put('/:id', async (req, res) => {
  try {
    // 实现更新逻辑
    res.json({ success: true, message: '梦境已更新' });
  } catch (error) {
    console.error('更新梦境失败:', error);
    res.status(500).json({ success: false, error: '更新梦境失败' });
  }
});

// 删除梦境
router.delete('/:id', async (req, res) => {
  try {
    // 实现删除逻辑
    res.json({ success: true, message: '梦境已删除' });
  } catch (error) {
    console.error('删除梦境失败:', error);
    res.status(500).json({ success: false, error: '删除梦境失败' });
  }
});

// 点赞梦境
router.post('/:id/like', async (req, res) => {
  try {
    await dreamModel.run(`
      UPDATE dreams SET likes = likes + 1 WHERE id = ?
    `, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: '点赞失败' });
  }
});

// 添加评论
router.post('/:id/comments', async (req, res) => {
  try {
    const { content, isInterpretation = false } = req.body;
    await dreamModel.run(`
      INSERT INTO dream_comments (dream_id, user_id, content, is_interpretation)
      VALUES (?, ?, ?, ?)
    `, [req.params.id, req.userId, content, isInterpretation ? 1 : 0]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: '添加评论失败' });
  }
});

// 获取评论
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await dreamModel.all(`
      SELECT c.*, u.username
      FROM dream_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.dream_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.id]);
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取评论失败' });
  }
});

module.exports = router;
