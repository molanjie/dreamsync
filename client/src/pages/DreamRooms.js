import React, { useState, useContext, useEffect } from 'react';
import { Plus, Radio, Users, Lock, Unlock, Play, Mic, MicOff, MessageSquare } from 'lucide-react';
import { ThemeContext, SocketContext } from '../App';

export default function DreamRooms() {
  const { darkMode } = useContext(ThemeContext);
  const socket = useContext(SocketContext);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);

  const rooms = [
    {
      id: 1,
      name: '清醒梦探索室',
      description: '一起练习清醒梦技巧，分享控梦经验',
      host: '梦境导师',
      participants: 3,
      maxParticipants: 5,
      theme: 'lucid',
      isPrivate: false,
    },
    {
      id: 2,
      name: '噩梦疗愈空间',
      description: '安全的分享噩梦，互相支持和解读',
      host: '心理倾听者',
      participants: 2,
      maxParticipants: 4,
      theme: 'healing',
      isPrivate: false,
    },
    {
      id: 3,
      name: '星空梦境同步',
      description: '今晚一起梦见星空，设置共同意图',
      host: '星空漫步者',
      participants: 4,
      maxParticipants: 6,
      theme: 'stars',
      isPrivate: true,
    },
  ];

  const joinRoom = (roomId) => {
    setActiveRoom(roomId);
    setIsInRoom(true);
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = () => {
    if (socket && activeRoom) {
      socket.emit('leave-room', activeRoom);
    }
    setActiveRoom(null);
    setIsInRoom(false);
    setMessages([]);
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && activeRoom) {
      socket.emit('send-message', { roomId: activeRoom, message: newMessage });
      setMessages([...messages, { type: 'me', content: newMessage }]);
      setNewMessage('');
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        setMessages(prev => [...prev, { type: 'other', content: data.message, sender: data.socketId }]);
      });

      socket.on('user-joined', (data) => {
        setMessages(prev => [...prev, { type: 'system', content: '有人加入了房间' }]);
      });

      socket.on('user-left', (data) => {
        setMessages(prev => [...prev, { type: 'system', content: '有人离开了房间' }]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
        socket.off('user-joined');
        socket.off('user-left');
      }
    };
  }, [socket]);

  if (isInRoom) {
    return (
      <div className="h-full flex flex-col">
        {/* 房间头部 */}
        <div className={`p-6 border-b ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {rooms.find(r => r.id === activeRoom)?.name}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {rooms.find(r => r.id === activeRoom)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl transition-colors ${
                  isMuted 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button
                onClick={leaveRoom}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                离开房间
              </button>
            </div>
          </div>
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === 'me' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'
                }`}
              >
                {msg.type === 'system' ? (
                  <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {msg.content}
                  </span>
                ) : (
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.type === 'me'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : darkMode 
                        ? 'bg-slate-800 text-slate-200'
                        : 'bg-slate-100 text-slate-800'
                  }`}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div className={`p-4 border-t ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'}`}>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="发送消息..."
              className={`flex-1 px-4 py-3 rounded-xl border outline-none transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            梦境联机
          </h1>
          <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            与他人一起探索梦境，创造共同的梦境体验
          </p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          <span>创建房间</span>
        </button>
      </div>

      {/* 房间列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/30' 
                : 'bg-white/50 border-slate-200 hover:border-indigo-400/30'
            }`}
            onClick={() => joinRoom(room.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                room.theme === 'lucid' ? 'bg-yellow-500/20 text-yellow-400' :
                room.theme === 'healing' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-indigo-500/20 text-indigo-400'
              }`}>
                <Radio className="w-6 h-6" />
              </div>
              {room.isPrivate ? (
                <Lock className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              ) : (
                <Unlock className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              )}
            </div>

            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {room.name}
            </h3>
            <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {room.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className={`w-4 h-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {room.participants}/{room.maxParticipants}
                </span>
              </div>
              <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                主持人: {room.host}
              </span>
            </div>

            <button className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
              <Play className="w-4 h-4" />
              <span>加入房间</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
