import React, { useState, useContext } from 'react';
import { Heart, MessageCircle, Share2, Sparkles, Users, Filter } from 'lucide-react';
import { ThemeContext } from '../App';

export default function DreamCommunity() {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('explore');
  const [filter, setFilter] = useState('all');

  const communityDreams = [
    {
      id: 1,
      author: '星空漫步者',
      avatar: '🌙',
      title: '在彩虹瀑布中游泳',
      content: '我梦见自己站在一道巨大的彩虹瀑布前，水流是温暖的，每滴水珠都闪烁着不同的颜色。当我跳入水中时，感觉自己在融化，与水融为一体...',
      type: 'lucid',
      likes: 128,
      comments: 23,
      tags: ['水', '彩虹', '飞翔'],
      resonance: 8,
    },
    {
      id: 2,
      author: '梦境旅人',
      avatar: '✨',
      title: '时间倒流的图书馆',
      content: '我发现了一座古老的图书馆，每本书打开后，我都能进入书中的世界。更神奇的是，当我合上书本，时间会倒流回我打开书的那一刻...',
      type: 'normal',
      likes: 89,
      comments: 15,
      tags: ['时间', '书', '魔法'],
      resonance: 5,
    },
    {
      id: 3,
      author: '梦游者',
      avatar: '🌌',
      title: '与已故祖母的对话',
      content: '在梦中，祖母坐在她最喜欢的摇椅上，告诉我不要担心，她在另一个世界过得很好。我们聊了很久，直到晨光把我唤醒...',
      type: 'prophetic',
      likes: 256,
      comments: 45,
      tags: ['家人', '告别', '温暖'],
      resonance: 12,
    },
  ];

  const filters = [
    { id: 'all', label: '全部' },
    { id: 'lucid', label: '清醒梦' },
    { id: 'recurring', label: '重复梦' },
    { id: 'resonance', label: '高共鸣' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          梦境社区
        </h1>
        <div className="flex items-center space-x-2">
          <Filter className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-2 rounded-lg border outline-none ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-700 text-white'
                : 'bg-white/50 border-slate-200 text-slate-900'
            }`}
          >
            {filters.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'explore', label: '探索', icon: Sparkles },
          { id: 'resonance', label: '梦境共鸣', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : darkMode 
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 梦境列表 */}
      <div className="space-y-6">
        {communityDreams.map((dream) => (
          <div
            key={dream.id}
            className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/30' 
                : 'bg-white/50 border-slate-200 hover:border-indigo-400/30'
            }`}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl">
                  {dream.avatar}
                </div>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {dream.author}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    2小时前
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  dream.type === 'lucid' 
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : dream.type === 'prophetic'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {dream.type === 'lucid' ? '清醒梦' : dream.type === 'prophetic' ? '预知梦' : '普通梦'}
                </span>
                {dream.resonance > 5 && (
                  <span className="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-400 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {dream.resonance} 共鸣
                  </span>
                )}
              </div>
            </div>

            {/* 内容 */}
            <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {dream.title}
            </h3>
            <p className={`mb-4 line-clamp-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {dream.content}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {dream.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-xs ${
                    darkMode 
                      ? 'bg-slate-800 text-slate-400' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 操作 */}
            <div className="flex items-center space-x-6">
              <button className={`flex items-center space-x-2 transition-colors ${
                darkMode ? 'text-slate-400 hover:text-pink-400' : 'text-slate-500 hover:text-pink-500'
              }`}>
                <Heart className="w-5 h-5" />
                <span className="text-sm">{dream.likes}</span>
              </button>
              <button className={`flex items-center space-x-2 transition-colors ${
                darkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'
              }`}>
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{dream.comments}</span>
              </button>
              <button className={`flex items-center space-x-2 transition-colors ${
                darkMode ? 'text-slate-400 hover:text-purple-400' : 'text-slate-500 hover:text-purple-500'
              }`}>
                <Share2 className="w-5 h-5" />
                <span className="text-sm">分享</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
