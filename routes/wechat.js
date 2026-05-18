/**
 * DreamSync 微信登录 API 路由
 *
 * OAuth2.0 流程：
 * 1. 前端请求 /api/wechat/qrcode → 返回二维码 URL
 * 2. 用户扫码授权 → 微信回调 /api/wechat/callback
 * 3. 后端用 code 换取 access_token 和 openid
 * 4. 用 access_token 获取用户信息
 * 5. 创建/登录用户，返回 JWT token
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// 配置（实际部署时填写真实的 appid/secret）
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID || 'YOUR_APPID',
  appSecret: process.env.WECHAT_APPSECRET || 'YOUR_APPSECRET',
  enabled: process.env.WECHAT_ENABLED === 'true',
};

// 模拟数据库（实际项目用真实数据库）
const users = new Map();
const sessions = new Map();

/**
 * 生成微信登录二维码 URL
 * GET /api/wechat/qrcode
 */
router.get('/qrcode', (req, res) => {
  try {
    // 生成唯一会话 ID
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
      if (sessions.has(sessionId)) {
        const session = sessions.get(sessionId);
        if (session.status === 'pending') {
          session.status = 'expired';
        }
      }
    }, 5 * 60 * 1000);

    if (WECHAT_CONFIG.enabled) {
      // 真实微信登录 URL
      const redirectUri = encodeURIComponent(`${req.protocol}://${req.get('host')}/api/wechat/callback`);
      const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_CONFIG.appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

      res.json({
        success: true,
        sessionId,
        qrUrl,
        // 用于前端生成二维码图片
        qrCodeData: qrUrl,
      });
    } else {
      // 模拟模式：返回模拟二维码
      res.json({
        success: true,
        sessionId,
        qrUrl: null,
        simulated: true,
        message: '微信登录未启用，使用模拟登录',
        // 模拟二维码内容（任意唯一标识）
        qrCodeData: `dreamsync://login/${sessionId}`,
      });
    }
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(500).json({ success: false, error: '生成二维码失败' });
  }
});

/**
 * 轮询登录状态
 * GET /api/wechat/status/:sessionId
 */
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: '会话不存在或已过期' });
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
 * 模拟登录确认（仅开发模式）
 * POST /api/wechat/simulate
 */
router.post('/simulate', (req, res) => {
  const { sessionId, nickname, headimgurl } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: '会话不存在' });
  }

  // 模拟微信用户信息
  const mockUser = {
    openid: crypto.randomBytes(16).toString('hex'),
    nickname: nickname || '微信用户',
    headimgurl: headimgurl || 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuGb1XB3uxbrO5d6N0wZFcVA/132',
    sex: 1,
    province: '广东',
    city: '深圳',
    country: '中国',
  };

  // 创建或获取用户
  let user = users.get(mockUser.openid);
  if (!user) {
    user = {
      id: crypto.randomBytes(8).toString('hex'),
      openid: mockUser.openid,
      nickname: mockUser.nickname,
      avatar: mockUser.headimgurl,
      createdAt: new Date().toISOString(),
    };
    users.set(mockUser.openid, user);
  }

  // 更新会话状态
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
 * 微信回调地址
 * GET /api/wechat/callback
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`/login.html?error=no_code`);
  }

  try {
    // 用 code 换取 access_token
    const tokenData = await getAccessToken(code);

    // 用 access_token 获取用户信息
    const userInfo = await getUserInfo(tokenData.access_token, tokenData.openid);

    // 创建或获取用户
    let user = users.get(userInfo.openid);
    if (!user) {
      user = {
        id: crypto.randomBytes(8).toString('hex'),
        openid: userInfo.openid,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
        createdAt: new Date().toISOString(),
      };
      users.set(userInfo.openid, user);
    }

    // 更新对应会话
    for (const [sessionId, session] of sessions) {
      if (session.state === state) {
        session.status = 'confirmed';
        session.user = user;
        session.token = generateToken(user);
        break;
      }
    }

    // 重定向到前端，携带 token
    const token = generateToken(user);
    res.redirect(`/login.html?wechat=success&token=${token}&nickname=${encodeURIComponent(user.nickname)}&avatar=${encodeURIComponent(user.avatar)}`);

  } catch (error) {
    console.error('微信登录失败:', error);
    res.redirect(`/login.html?error=wechat_failed`);
  }
});

/**
 * 获取 access_token
 */
async function getAccessToken(code) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}&code=${code}&grant_type=authorization_code`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errcode) {
            reject(new Error(result.errmsg));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 获取用户信息
 */
async function getUserInfo(accessToken, openid) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errcode) {
            reject(new Error(result.errmsg));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * 生成 JWT Token（简化版）
 */
function generateToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    openid: user.openid,
    nickname: user.nickname,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'dreamsync-secret-key')
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

/**
 * 验证 Token
 */
function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', 'dreamsync-secret-key')
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

module.exports = router;
module.exports.verifyToken = verifyToken;