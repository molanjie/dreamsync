const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const dreamRoutes = require('./routes/dreams');
const roomRoutes = require('./routes/rooms');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 9999;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT 验证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.userId = authHeader.substring(7);
    next();
  } else {
    res.status(401).json({ success: false, error: '未认证' });
  }
};

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/dreams', authMiddleware, dreamRoutes);
app.use('/api/rooms', authMiddleware, roomRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'dreamsync', timestamp: new Date().toISOString() });
});

// 静态文件服务 + 注入加载动画
const SPLASH_INJECT = `
<script>
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

// 静态文件注入
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

// 静态资源
app.use(express.static(path.join(__dirname)));

// 404 处理
app.use((req, res, next) => {
  if (req.accepts('html') && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '404.html'));
  }
  res.status(404).json({ error: 'Not found' });
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { socketId: socket.id });
  });
  
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', { socketId: socket.id });
  });
  
  socket.on('send-message', (data) => {
    const { roomId, message, type = 'chat' } = data;
    socket.to(roomId).emit('receive-message', {
      socketId: socket.id, message, type,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('ready-change', (data) => {
    const { roomId, isReady } = data;
    socket.to(roomId).emit('user-ready-change', { socketId: socket.id, isReady });
  });
  
  socket.on('start-dream-sync', (roomId) => {
    socket.to(roomId).emit('dream-sync-started', { startedAt: new Date().toISOString() });
  });
  
  socket.on('share-dream', (data) => {
    const { roomId, dream } = data;
    socket.to(roomId).emit('dream-shared', { socketId: socket.id, dream });
  });
  
  socket.on('meditation-sync', (data) => {
    const { roomId, action, timestamp } = data;
    socket.to(roomId).emit('meditation-action', { action, timestamp, syncTime: Date.now() });
  });
  
  socket.on('disconnect', () => {
    console.log('用户断开:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌙 DreamSync 服务器运行在 http://localhost:${PORT}`);
  console.log(`🔮 API: http://localhost:${PORT}/api/health`);
  console.log(`✨ Socket.io 已启用`);
});

module.exports = { app, server, io };
