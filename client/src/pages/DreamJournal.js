import React, { useState, useContext, useRef } from 'react';
import { Mic, MicOff, Save, Tag, Moon, Sparkles, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { ThemeContext } from '../App';

export default function DreamJournal() {
  const { darkMode } = useContext(ThemeContext);
  const [isRecording, setIsRecording] = useState(false);
  const [dreamContent, setDreamContent] = useState('');
  const [dreamType, setDreamType] = useState('normal');
  const [clarity, setClarity] = useState(5);
  const [emotion, setEmotion] = useState('平静');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const dreamTypes = [
    { id: 'normal', label: '普通梦', icon: Moon, color: 'from-slate-500 to-slate-600' },
    { id: 'lucid', label: '清醒梦', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
    { id: 'nightmare', label: '噩梦', icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
    { id: 'recurring', label: '重复梦', icon: RefreshCw, color: 'from-purple-500 to-indigo-500' },
    { id: 'prophetic', label: '预知梦', icon: Eye, color: 'from-emerald-500 to-teal-500' },
  ];

  const emotions = ['愉悦', '兴奋', '平静', '焦虑', '恐惧', '悲伤', '愤怒', '困惑', '惊奇', '浪漫', '神秘'];

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // 这里应该实现实际的语音识别
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        梦境日记
      </h1>

      {/* 梦境类型选择 */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          梦境类型
        </label>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {dreamTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setDreamType(type.id)}
              className={`p-4 rounded-xl border transition-all ${
                dreamType === type.id
                  ? `bg-gradient-to-br ${type.color} text-white border-transparent`
                  : darkMode 
                    ? 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    : 'bg-white/50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <type.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 梦境内容输入 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            梦境内容
          </label>
          <button
            onClick={toggleRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : darkMode 
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="text-sm">{isRecording ? '停止录音' : '语音输入'}</span>
          </button>
        </div>
        <textarea
          value={dreamContent}
          onChange={(e) => setDreamContent(e.target.value)}
          placeholder="描述你的梦境...尽可能详细地记录梦中的人物、地点、情节和感受"
          rows={8}
          className={`w-full px-4 py-3 rounded-xl border outline-none resize-none transition-colors ${
            darkMode 
              ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600 focus:border-indigo-500'
              : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
          }`}
        />
      </div>

      {/* 清晰度和情绪 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            梦境清晰度: {clarity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={clarity}
            onChange={(e) => setClarity(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          />
          <div className="flex justify-between text-xs mt-1 text-slate-500">
            <span>模糊</span>
            <span>清晰</span>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            主要情绪
          </label>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emo) => (
              <button
                key={emo}
                onClick={() => setEmotion(emo)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  emotion === emo
                    ? 'bg-indigo-500 text-white'
                    : darkMode 
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 标签 */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          标签
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                darkMode 
                  ? 'bg-indigo-500/20 text-indigo-300' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="添加标签（如：飞翔、水、家人）"
            className={`flex-1 px-4 py-2 rounded-lg border outline-none transition-colors ${
              darkMode 
                ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-600 focus:border-indigo-500'
                : 'bg-white/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
          <button
            onClick={addTag}
            className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex space-x-4">
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2">
          <Save className="w-5 h-5" />
          <span>保存梦境</span>
        </button>
        <button className={`px-6 py-3 rounded-xl border font-medium transition-colors ${
          darkMode 
            ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
            : 'border-slate-300 text-slate-600 hover:bg-slate-100'
        }`}>
          存为草稿
        </button>
      </div>
    </div>
  );
}
