const { v4: uuidv4 } = require('uuid');
const natural = require('natural');
const compromise = require('compromise');
const { run, get, all } = require('../utils/database');

// 简单的文本向量化（用于相似度计算）
const vectorizeText = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // 创建词频向量
  const vector = {};
  tokens.forEach(token => {
    vector[token] = (vector[token] || 0) + 1;
  });
  
  return JSON.stringify(vector);
};

// 计算余弦相似度
const cosineSimilarity = (vec1, vec2) => {
  const v1 = JSON.parse(vec1);
  const v2 = JSON.parse(vec2);
  
  const allKeys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  allKeys.forEach(key => {
    const a = v1[key] || 0;
    const b = v2[key] || 0;
    dotProduct += a * b;
    norm1 += a * a;
    norm2 += b * b;
  });
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2) || 1);
};

// 分析梦境内容
const analyzeDream = async (dreamId, content) => {
  const doc = compromise(content);
  
  // 提取关键词
  const nouns = doc.nouns().out('array');
  const verbs = doc.verbs().out('array');
  const adjectives = doc.adjectives().out('array');
  
  // 提取人物
  const people = doc.people().out('array');
  
  // 提取地点
  const places = doc.places().out('array');
  
  // 简单情绪分析
  const positiveWords = ['开心', '快乐', '美好', '温暖', '爱', '自由', '飞翔', '成功'];
  const negativeWords = ['害怕', '恐惧', '噩梦', '逃跑', '坠落', '被困', '死亡', '失去'];
  
  let sentimentScore = 0;
  const contentLower = content.toLowerCase();
  
  positiveWords.forEach(word => {
    if (contentLower.includes(word)) sentimentScore += 1;
  });
  
  negativeWords.forEach(word => {
    if (contentLower.includes(word)) sentimentScore -= 1;
  });
  
  // 识别梦境主题
  const themes = [];
  if (contentLower.includes('飞') || contentLower.includes('飞翔')) themes.push('飞翔');
  if (contentLower.includes('追') || contentLower.includes('逃跑')) themes.push('追逐');
  if (contentLower.includes('水') || contentLower.includes('海')) themes.push('水');
  if (contentLower.includes('坠落') || contentLower.includes('掉')) themes.push('坠落');
  if (contentLower.includes('考试') || contentLower.includes('学校')) themes.push('考试/学校');
  if (contentLower.includes('牙齿') || contentLower.includes('掉牙')) themes.push('掉牙');
  if (contentLower.includes('裸') || contentLower.includes('没穿')) themes.push(' naked_in_public');
  if (contentLower.includes('死') || contentLower.includes('去世')) themes.push('死亡');
  
  // 识别符号
  const symbols = [...new Set([...nouns, ...people, ...places])].slice(0, 10);
  
  // 生成解读
  let interpretation = '';
  if (themes.includes('飞翔')) {
    interpretation += '飞翔通常代表自由、解脱或渴望超越现状。';
  }
  if (themes.includes('追逐')) {
    interpretation += '被追逐可能反映现实中的压力或逃避某些问题。';
  }
  if (themes.includes('水')) {
    interpretation += '水象征情绪和潜意识，水的状态反映情绪状态。';
  }
  if (themes.includes('坠落')) {
    interpretation += '坠落感常与失控感、不安全感或对失败的恐惧相关。';
  }
  
  if (!interpretation) {
    interpretation = '这个梦境反映了您潜意识中的某些思绪。建议关注近期生活中的重要事件和情绪变化。';
  }
  
  // 保存分析结果
  await run(`
    INSERT OR REPLACE INTO dream_analysis 
    (dream_id, themes, symbols, interpretation, sentiment_score, keywords)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    dreamId,
    JSON.stringify(themes),
    JSON.stringify(symbols),
    interpretation,
    sentimentScore,
    JSON.stringify([...nouns, ...verbs].slice(0, 20))
  ]);
  
  return {
    themes,
    symbols,
    interpretation,
    sentimentScore,
    keywords: [...nouns, ...verbs].slice(0, 20)
  };
};

// 创建梦境
const createDream = async (dreamData) => {
  const {
    userId,
    title,
    content,
    dreamType = 'normal',
    clarity = 5,
    emotion,
    sleepQuality,
    sleepDuration,
    bedTime,
    wakeTime,
    isShared = false,
    isAnonymous = true,
    tags = []
  } = dreamData;
  
  const id = uuidv4();
  const contentVector = vectorizeText(content);
  
  // 简单情绪评分
  const emotionScores = {
    '愉悦': 0.8, '兴奋': 0.9, '平静': 0.5, '焦虑': -0.6,
    '恐惧': -0.8, '悲伤': -0.7, '愤怒': -0.7, '困惑': -0.3,
    '惊奇': 0.6, '浪漫': 0.7, '神秘': 0.4
  };
  const emotionScore = emotionScores[emotion] || 0;
  
  await run(`
    INSERT INTO dreams 
    (id, user_id, title, content, content_vector, dream_type, clarity, emotion, emotion_score, 
     sleep_quality, sleep_duration, bed_time, wake_time, is_shared, is_anonymous)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, userId, title, content, contentVector, dreamType, clarity, emotion, emotionScore,
      sleepQuality, sleepDuration, bedTime, wakeTime, isShared ? 1 : 0, isAnonymous ? 1 : 0]);
  
  // 添加标签
  for (const tag of tags) {
    await run(`
      INSERT INTO dream_tags (dream_id, tag, tag_type)
      VALUES (?, ?, ?)
    `, [id, tag.name, tag.type || 'symbol']);
  }
  
  // 自动分析梦境
  const analysis = await analyzeDream(id, content);
  
  // 查找相似梦境
  await findSimilarDreams(id, contentVector);
  
  return { id, ...dreamData, analysis };
};

// 查找相似梦境
const findSimilarDreams = async (dreamId, contentVector) => {
  const allDreams = await all(`
    SELECT id, content_vector FROM dreams 
    WHERE id != ? AND is_shared = 1
  `, [dreamId]);
  
  const similarities = [];
  
  for (const dream of allDreams) {
    if (dream.content_vector) {
      const similarity = cosineSimilarity(contentVector, dream.content_vector);
      if (similarity > 0.3) { // 相似度阈值
        similarities.push({ dreamId: dream.id, similarity });
      }
    }
  }
  
  // 保存相似度最高的前5个
  similarities.sort((a, b) => b.similarity - a.similarity);
  const topSimilar = similarities.slice(0, 5);
  
  for (const sim of topSimilar) {
    await run(`
      INSERT OR IGNORE INTO dream_resonances 
      (dream_id_1, dream_id_2, similarity_score, resonance_type)
      VALUES (?, ?, ?, ?)
    `, [dreamId, sim.dreamId, sim.similarity, 'content']);
  }
  
  // 更新分析表
  await run(`
    UPDATE dream_analysis 
    SET similar_dreams = ? 
    WHERE dream_id = ?
  `, [JSON.stringify(topSimilar.map(s => s.dreamId)), dreamId]);
};

// 获取用户的所有梦境
const getUserDreams = async (userId, options = {}) => {
  const { limit = 50, offset = 0, dreamType, isShared } = options;
  
  let sql = `
    SELECT d.*, 
           GROUP_CONCAT(DISTINCT dt.tag) as tags,
           da.themes, da.sentiment_score, da.interpretation
    FROM dreams d
    LEFT JOIN dream_tags dt ON d.id = dt.dream_id
    LEFT JOIN dream_analysis da ON d.id = da.dream_id
    WHERE d.user_id = ?
  `;
  
  const params = [userId];
  
  if (dreamType) {
    sql += ' AND d.dream_type = ?';
    params.push(dreamType);
  }
  
  if (isShared !== undefined) {
    sql += ' AND d.is_shared = ?';
    params.push(isShared ? 1 : 0);
  }
  
  sql += ` GROUP BY d.id ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const dreams = await all(sql, params);
  
  return dreams.map(d => ({
    ...d,
    tags: d.tags ? d.tags.split(',') : [],
    themes: d.themes ? JSON.parse(d.themes) : [],
    analysis: {
      sentiment_score: d.sentiment_score,
      interpretation: d.interpretation
    }
  }));
};

// 获取社区梦境（公开的）
const getCommunityDreams = async (options = {}) => {
  const { limit = 20, offset = 0, sortBy = 'created_at' } = options;
  
  const dreams = await all(`
    SELECT d.*, u.username, 
           GROUP_CONCAT(DISTINCT dt.tag) as tags,
           da.themes, da.sentiment_score
    FROM dreams d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN dream_tags dt ON d.id = dt.dream_id
    LEFT JOIN dream_analysis da ON d.id = da.dream_id
    WHERE d.is_shared = 1 AND d.is_anonymous = 0
    GROUP BY d.id
    ORDER BY d.${sortBy} DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  return dreams.map(d => ({
    ...d,
    tags: d.tags ? d.tags.split(',') : [],
    themes: d.themes ? JSON.parse(d.themes) : []
  }));
};

// 获取相似梦境
const getSimilarDreams = async (dreamId, limit = 5) => {
  const similar = await all(`
    SELECT d.*, dr.similarity_score, u.username,
           da.themes, da.interpretation
    FROM dream_resonances dr
    JOIN dreams d ON dr.dream_id_2 = d.id
    JOIN users u ON d.user_id = u.id
    LEFT JOIN dream_analysis da ON d.id = da.dream_id
    WHERE dr.dream_id_1 = ? AND d.is_shared = 1
    ORDER BY dr.similarity_score DESC
    LIMIT ?
  `, [dreamId, limit]);
  
  return similar;
};

// 获取梦境统计
const getDreamStats = async (userId) => {
  const stats = await get(`
    SELECT 
      COUNT(*) as total_dreams,
      SUM(CASE WHEN dream_type = 'lucid' THEN 1 ELSE 0 END) as lucid_count,
      SUM(CASE WHEN dream_type = 'nightmare' THEN 1 ELSE 0 END) as nightmare_count,
      SUM(CASE WHEN dream_type = 'recurring' THEN 1 ELSE 0 END) as recurring_count,
      AVG(clarity) as avg_clarity,
      AVG(sleep_quality) as avg_sleep_quality,
      AVG(emotion_score) as avg_emotion,
      MAX(created_at) as last_dream_date
    FROM dreams
    WHERE user_id = ?
  `, [userId]);
  
  // 最近30天的梦境数量
  const recentDreams = await get(`
    SELECT COUNT(*) as count
    FROM dreams
    WHERE user_id = ? AND created_at >= DATE('now', '-30 days')
  `, [userId]);
  
  // 最常见的主题
  const topThemes = await all(`
    SELECT themes, COUNT(*) as count
    FROM dream_analysis da
    JOIN dreams d ON da.dream_id = d.id
    WHERE d.user_id = ?
    GROUP BY themes
    ORDER BY count DESC
    LIMIT 5
  `, [userId]);
  
  return {
    ...stats,
    recent_count: recentDreams.count,
    top_themes: topThemes
  };
};

module.exports = {
  createDream,
  getUserDreams,
  getCommunityDreams,
  getSimilarDreams,
  getDreamStats,
  analyzeDream,
  vectorizeText,
  cosineSimilarity
};
