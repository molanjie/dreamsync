// DreamSync 静态文件服务器 + 微信登录 API
// 支持从 .env 文件读取配置

// 加载环境变量（必须在最前面）
require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 9999;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源
app.use(express.static(path.join(__dirname)));

// 微信登录 API 路由
const wechatRouter = require('./routes/wechat-api');
app.use('/api/wechat', wechatRouter);

// 微信配置（供其他 API 使用）
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APPID || '',
  appSecret: process.env.WECHAT_APPSECRET || '',
  enabled: process.env.WECHAT_ENABLED === 'true',
};

// ==================== 其他 API ====================

// ==================== 其他 API ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', wechat: WECHAT_CONFIG.enabled ? 'enabled' : 'disabled (simulated)' });
});

// 用户信息
app.post('/api/auth/profile', (req, res) => {
  const { token, nickname, avatar } = req.body;
  if (!token) return res.status(401).json({ success: false, error: '未登录' });
  
  try {
    const [,,sig] = token.split('.');
    const expected = crypto.createHmac('sha256', 'ds-secret').update(token.split('.').slice(0,2).join('.')).digest('base64url');
    if (sig !== expected) return res.status(401).json({ success: false, error: 'token无效' });
    
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    const user = users.get(payload.openid) || { id: payload.userId, nickname: payload.nickname };
    res.json({ success: true, user: { ...user, token } });
  } catch { res.status(401).json({ success: false, error: '解析失败' }); }
});

// ==================== 静态文件 + 加载动画 ====================

const SPLASH_INJECT = `<script>
(function(){
  var s=document.createElement('style');
  s.textContent='#ds-splash{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;background:#0f172a;transition:opacity .5s,visibility .5s}#ds-splash.hide{opacity:0;visibility:hidden}#ds-splash .logo{font-size:64px;animation:dspin 2s cubic-bezier(.4,0,.2,1) infinite}@keyframes dspin{0%{transform:rotateY(0) scale(1)}50%{transform:rotateY(180deg) scale(1.2)}100%{transform:rotateY(360deg) scale(1)}}#ds-splash .bar{width:120px;height:3px;border-radius:2px;background:rgba(99,102,241,.2);margin-top:24px;overflow:hidden}#ds-splash .bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899);animation:dload 1.2s ease forwards}@keyframes dload{from{width:0}to{width:100%}}';
  document.head.appendChild(s);
  var d=document.createElement('div');d.id='ds-splash';
  d.innerHTML='<div class="logo">🌙</div><div class="bar"><div class="bar-fill"></div></div>';
  document.body?document.body.appendChild(d):document.addEventListener("DOMContentLoaded",function(){document.body.appendChild(d)});
  window.addEventListener('load',function(){setTimeout(function(){var e=document.getElementById('ds-splash');if(e)e.classList.add('hide');setTimeout(function(){e&&e.remove()},600)},300)});
})();
</script>`;

app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.match(/\.html$/)) {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf8');
      if (!html.includes('ds-splash')) {
        html = html.replace('</head>', SPLASH_INJECT + '</head>');
      }
      return res.type('html').send(html);
    }
  }
  next();
});

// 404
app.use((req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/node_modules') && !req.path.startsWith('/socket.io')) {
    return res.sendFile(path.join(__dirname, '404.html'));
  }
  res.status(404).json({ error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌙 DreamSync v2.0 - 微信登录版`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n📋 微信登录配置:`);
  console.log(`   状态: ${WECHAT_CONFIG.enabled && WECHAT_CONFIG.appId ? '✅ 已配置' : '⚠️ 模拟模式（未配置）'}`);
  console.log(`   API:  GET /api/wechat/qrcode     → 获取二维码`);
  console.log(`         GET /api/wechat/status/:id → 轮询状态`);
  console.log(`         POST /api/wechat/simulate  → 模拟登录`);
  console.log(`         GET /api/wechat/callback   → OAuth回调`);
  console.log(`\n   真实接入需设置环境变量:`);
  console.log(`   WECHAT_APPID=你的AppID`);
  console.log(`   WECHAT_APPSECRET=你的AppSecret`);
  console.log(`   WECHAT_ENABLED=true\n`);
});