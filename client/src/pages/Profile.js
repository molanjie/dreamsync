import React, { useState, useContext } from 'react';
import { Settings, Moon, Bell, Shield, LogOut, Edit2, Camera } from 'lucide-react';
import { ThemeContext } from '../App';

export default function Profile() {
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('profile');

  const userStats = {
    totalDreams: 156,
    lucidDreams: 34,
    streakDays: 23,
    resonanceCount: 89,
    favoriteTheme: '飞翔',
    avgClarity: 7.2,
  };

  const dreamCalendar = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hasDream: Math.random() > 0.3,
    intensity: Math.floor(Math.random() * 4) + 1,
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 头部 */}
      <div className={`p-6 rounded-2xl border mb-8 ${
        darkMode 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-white/50 border-slate-200'
      }`}>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl">
              🌙
            </div>
            <button className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'
            }`}>
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              星空漫步者
            </h1>
            <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              在梦境中寻找答案的旅人
            </p>
            <div className="flex items-center space-x-4">
              <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                加入于 2024年1月
              </span>
              <button className={`flex items-center space-x-1 text-sm ${
                darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
              }`}>
                <Edit2 className="w-3 h-3" />
                <span>编辑资料</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'profile', label: '个人档案', icon: Moon },
          { id: 'settings', label: '设置', icon: Settings },
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

      {activeTab === 'profile' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: '总梦境', value: userStats.totalDreams },
              { label: '清醒梦', value: userStats.lucidDreams },
              { label: '连续记录', value: `${userStats.streakDays}天` },
              { label: '梦境共鸣', value: userStats.resonanceCount },
              { label: '最爱主题', value: userStats.favoriteTheme },
              { label: '平均清晰度', value: `${userStats.avgClarity}/10` },
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white/50 border-slate-200'
                }`}
              >
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* 梦境日历 */}
          <div className={`p-6 rounded-2xl border ${
            darkMode 
              ? 'bg-slate-900/50 border-slate-800' 
              : 'bg-white/50 border-slate-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              本月梦境记录
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className={`text-center text-xs py-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
              {dreamCalendar.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    day.hasDream
                      ? day.intensity >= 3
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                        : day.intensity >= 2
                        ? 'bg-indigo-500/50 text-white'
                        : 'bg-indigo-500/20 text-indigo-400'
                      : darkMode 
                        ? 'bg-slate-800 text-slate-600'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'settings' && (
        <div className={`p-6 rounded-2xl border ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-800' 
            : 'bg-white/50 border-slate-200'
        }`}>
          <div className="space-y-4">
            <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-3">
                <Bell className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>通知提醒</p>
                  <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>接收梦境共鸣和联机邀请</p>
                </div>
              </div>
              <div className="w-12 h-6 rounded-full bg-indigo-500 relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div>
              </div>
            </div>

            <div className={`flex items-center justify-between py-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center space-x-3">
                <Shield className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>隐私设置</p>
                  <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>管理梦境分享权限</p>
                </div>
              </div>
              <button className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                管理
              </button>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
