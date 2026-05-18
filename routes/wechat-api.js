/**
 * DreamSync 微信登录 API 集成
 * 
 * 使用说明：
 * 1. 在微信开放平台申请网站应用
 * 2. 获取 AppID 和 AppSecret
 * 3. 设置授权回调域名
 * 4. 填写下方配置
 * 5. 重启服务器
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// ==================== 配置 ====================
const WECHAT_CONFIG = {
  // 从环境变量读取（优先级最高）
  appId: process.env.WECHAT_APPID || '',
  appSecret: process.env.WECHAT_APPSECRET || '',
  enabled: process.env.WECHAT_ENABLED === 'true',
  
  // 或者直接填写（不推荐，安全风险）
  // appId: 'wx1234567890abcdef',
  // appSecret: '1234567890abcdef1234567890abcdef',
  // enabled: true,
};

// 内存存储（生产环境用数据库）
const sessions = new Map();
const users = new Map();

// 回调域名（优先用环境变量，否则用请求的 host）
const CALLBACK_BASE = process.env.WECHAT_REDIRECT_DOMAIN 
  ? `https://${process.env.WECHAT_REDIRECT_DOMAIN}` 
  : null;

// ==================== 工具函数 ====================

/**
 * 生成 JWT Token
 */
function generateToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    openid: user.openid,
    nickname: user.nickname,
    avatar: user.avatar,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天
  })).toString('base64url');
  
  const secret = process.env.JWT_SECRET || 'dreamsync-secret-key';
  const signature = crypto.createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

/**
 * 验证 JWT Token
 */
function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const secret = process.env.JWT_SECRET || 'dreamsync-secret-key';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null; // 已过期
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * HTTP GET 请求
 */
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 用 code 换 access_token
 */
async function getAccessToken(code) {
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;
  const result = await httpGet(url);
  
  if (result.errcode) {
    throw new Error(`[${result.errcode}] ${result.errmsg}`);
  }
  
  return result;
}

/**
 * 用 access_token 获取用户信息
 */
async function getUserInfo(accessToken, openid) {
  const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
  const result = await httpGet(url);
  
  if (result.errcode) {
    throw new Error(`[${result.errcode}] ${result.errmsg}`);
  }
  
  return result;
}

// ==================== API 路由 ====================

/**
 * 1. 获取登录二维码
 * GET /api/wechat/qrcode
 */
router.get('/qrcode', (req, res) => {
  try {
    // 生成会话 ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    const state = crypto.randomBytes(8).toString('hex');

    // 保存会话（5分钟过期）
    sessions.set(sessionId, {
      state,
      createdAt: Date.now(),
      status: 'pending', // pending | scanned | confirmed | expired
    });

    // 5分钟后自动清理
    setTimeout(() => {
      const session = sessions.get(sessionId);
      if (session && session.status === 'pending') {
        session.status = 'expired';
      }
    }, 5 * 60 * 1000);

    if (WECHAT_CONFIG.enabled && WECHAT_CONFIG.appId) {
      // 真实微信登录
      const redirectUri = encodeURIComponent(
        `${CALLBACK_BASE || `${req.protocol}://${req.get('host')}`}/api/wechat/callback`
      );
      const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_CONFIG.appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

      res.json({
        success: true,
        sessionId,
        qrUrl,
        mode: 'real',
        message: '请使用微信扫描二维码登录',
      });
    } else {
      // 模拟模式
      res.json({
        success: true,
        sessionId,
        qrUrl: null,
        mode: 'simulated',
        message: '微信登录未配置，使用模拟模式。点击"模拟扫码"按钮测试。',
      });
    }
  } catch (error) {
    console.error('获取二维码失败:', error);
    res.status(500).json({
      success: false,
      error: '获取二维码失败',
      details: error.message,
    });
  }
});

/**
 * 2. 轮询登录状态
 * GET /api/wechat/status/:sessionId
 */
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: '会话不存在或已过期',
    });
  }

  // 检查是否过期
  if (Date.now() - session.createdAt > 5 * 60 * 1000) {
    session.status = 'expired';
  }

  res.json({
    success: true,
    status: session.status,
    user: session.user || null,
    token: session.token || null,
  });
});

/**
 * 3. 模拟扫码确认（开发测试用）
 * POST /api/wechat/simulate
 */
router.post('/simulate', (req, res) => {
  const { sessionId, nickname, avatar } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: '会话不存在',
    });
  }

  // 创建模拟用户
  const openid = crypto.randomBytes(16).toString('hex');
  const user = {
    id: openid.slice(0, 8),
    openid,
    nickname: nickname || '微信用户',
    avatar: avatar || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuGb1XB3uxbrO5d6N0wZFcVA/132',
    source: 'wechat_simulated',
    createdAt: new Date().toISOString(),
  };

  users.set(openid, user);
  session.status = 'confirmed';
  session.user = user;
  session.token = generateToken(user);

  res.json({
    success: true,
    user,
    token: session.token,
  });
});

/**
 * 4. 微信 OAuth 回调
 * GET /api/wechat/callback?code=CODE&state=STATE
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/login.html?error=no_code');
  }

  try {
    if (!WECHAT_CONFIG.enabled || !WECHAT_CONFIG.appId) {
      throw new Error('微信登录未配置');
    }

    // 1. 用 code 换 access_token
    console.log('[微信登录] 用 code 换 access_token...');
    const tokenData = await getAccessToken(code);
    console.log('[微信登录] 获得 access_token:', tokenData.access_token.slice(0, 10) + '...');

    // 2. 用 access_token 获取用户信息
    console.log('[微信登录] 获取用户信息...');
    const userInfo = await getUserInfo(tokenData.access_token, tokenData.openid);
    console.log('[微信登录] 用户信息:', userInfo.nickname);

    // 3. 创建或获取用户
    let user = users.get(userInfo.openid);
    if (!user) {
      user = {
        id: userInfo.openid.slice(0, 8),
        openid: userInfo.openid,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
        province: userInfo.province,
        city: userInfo.city,
        country: userInfo.country,
        source: 'wechat_real',
        createdAt: new Date().toISOString(),
      };
      users.set(userInfo.openid, user);
      console.log('[微信登录] 创建新用户:', user.nickname);
    } else {
      console.log('[微信登录] 用户已存在:', user.nickname);
    }

    // 4. 更新对应会话
    for (const [sessionId, session] of sessions) {
      if (session.state === state) {
        session.status = 'confirmed';
        session.user = user;
        session.token = generateToken(user);
        console.log('[微信登录] 会话已确认:', sessionId);
        break;
      }
    }

    // 5. 生成 token 并重定向
    const token = generateToken(user);
    const redirectUrl = `/login.html?wechat=success&token=${token}&nickname=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`;
    
    console.log('[微信登录] 重定向到:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('[微信登录] 错误:', error.message);
    res.redirect(`/login.html?error=wechat_failed&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * 5. 验证 Token
 * POST /api/wechat/verify
 */
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '未提供 token',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'token 无效或已过期',
    });
  }

  const user = users.get(decoded.openid);
  res.json({
    success: true,
    user: user || decoded,
  });
});

/**
 * 6. 获取用户信息
 * GET /api/wechat/user/:openid
 */
router.get('/user/:openid', (req, res) => {
  const { openid } = req.params;
  const user = users.get(openid);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: '用户不存在',
    });
  }

  res.json({
    success: true,
    user,
  });
});

/**
 * 7. 获取配置状态
 * GET /api/wechat/config
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    enabled: WECHAT_CONFIG.enabled,
    mode: WECHAT_CONFIG.enabled ? 'real' : 'simulated',
    appId: WECHAT_CONFIG.appId ? WECHAT_CONFIG.appId.slice(0, 5) + '...' : 'not set',
    message: WECHAT_CONFIG.enabled 
      ? '✅ 微信登录已启用' 
      : '⚠️ 微信登录未启用，使用模拟模式',
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.generateToken = generateToken;