// DreamSync 静态文件服务器（无数据库依赖）
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 9999;

// 静态资源
app.use(express.static(path.join(__dirname)));

// 加载动画注入
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

// HTML 注入中间件
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
  console.log(`\n🌙 DreamSync v2.0 运行在 http://localhost:${PORT}`);
  console.log(`\n  📄 首页      http://localhost:${PORT}/index.html`);
  console.log(`  📝 登录      http://localhost:${PORT}/login.html`);
  console.log(`  📱 主应用    http://localhost:${PORT}/app.html`);
  console.log(`  🤖 AI 分析   http://localhost:${PORT}/analysis.html`);
  console.log(`  📊 数据报告  http://localhost:${PORT}/stats.html`);
  console.log(`  📖 梦境详情  http://localhost:${PORT}/dream.html`);
  console.log(`  🚀 新手引导  http://localhost:${PORT}/onboarding.html`);
  console.log(`  ⚙️ 设置      http://localhost:${PORT}/settings.html`);
  console.log(`  🚫 404       http://localhost:${PORT}/404.html\n`);
});
