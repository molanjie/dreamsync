import React, { useState, useContext } from 'react';
import { Plus, Sparkles, TrendingUp, Users, Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../App';

export default function Dashboard() {
  const { darkMode } = useContext(ThemeContext);
  const [showNewDream, setShowNewDream] = useState(false);

  const stats = [
    { label: '本月梦境', value: 12, icon: Moon, color: 'from-indigo-500 to-purple-500' },
    { label: '清醒梦', value: 3, icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
    { label: '梦境共鸣', value: 8, icon: Users, color: 'from-pink-500 to-rose-500' },
    { label: '连续记录', value: 7, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  ];

  const recentDreams = [
    { id: 1, title: '飞翔在星空之城', type: 'lucid', clarity: 9, date: '2小时前', preview: '我在一座漂浮的城市中飞翔，星星触手可及...' },
    { id: 2, title: '深海探险', type: 'normal', clarity: 7, date: '昨晚', preview: '潜入深海，发现了一座发光的水下宫殿...' },
    { id: 3, title: '时间倒流', type: 'recurring', clarity: 8, date: '前天', preview: '再次梦到这个场景，这次我改变了结局...' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          欢迎回来，梦境行者
        </h1>
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          今晚的梦境会带你去哪里？
        </p>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setShowNewDream(true)}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.02] group ${
            darkMode 
              ? 'border-slate-700 hover:border-indigo-500/50 bg-slate-900/50' 
              : 'border-slate-300 hover:border-indigo-400/50 bg-white/50'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                记录新梦境
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                语音或文字记录你的梦境
              </p>
            </div>
          </div>
        </button>

        <button className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] group ${
          darkMode 
            ? 'border-slate-700 hover:border-purple-500/50 bg-slate-900/50' 
            : 'border-slate-200 hover:border-purple-400/50 bg-white/50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                AI 梦境解析
              </h3>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                探索梦境背后的含义
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl border ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-800' 
                : 'bg-white/50 border-slate-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* 最近梦境 */}
      <div>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          最近梦境
        </h2>
        <div className="space-y-4">
          {recentDreams.map((dream) => (
            <div
              key={dream.id}
              className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${
                darkMode 
                  ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/30' 
                  : 'bg-white/50 border-slate-200 hover:border-indigo-400/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {dream.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      dream.type === 'lucid' 
                        ? 'bg-yellow-500/20 text-yellow-400' 
                        : dream.type === 'recurring'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {dream.type === 'lucid' ? '清醒梦' : dream.type === 'recurring' ? '重复梦' : '普通梦'}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {dream.preview}
                  </p>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{dream.date}</span>
                    <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
                      清晰度: {dream.clarity}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
