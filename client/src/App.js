import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Moon, Sun, Home, BookOpen, Users, Radio, User, LogOut } from 'lucide-react';
import io from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import DreamJournal from './pages/DreamJournal';
import DreamCommunity from './pages/DreamCommunity';
import DreamRooms from './pages/DreamRooms';
import Profile from './pages/Profile';

export const ThemeContext = createContext();
export const SocketContext = createContext();

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dreamsync-darkmode');
    return saved ? JSON.parse(saved) : true; // 默认暗黑模式
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    localStorage.setItem('dreamsync-darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <SocketContext.Provider value={socket}>
        <div className={`min-h-screen transition-colors duration-500 ${
          darkMode 
            ? 'dark bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950' 
            : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
        }`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </SocketContext.Provider>
    </ThemeContext.Provider>
  );
}

const MainLayout = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/journal', icon: BookOpen, label: '梦境日记' },
    { path: '/community', icon: Users, label: '梦境社区' },
    { path: '/rooms', icon: Radio, label: '梦境联机' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <div className="flex h-screen">
      {/* 侧边导航 */}
      <nav className={`w-20 lg:w-64 flex-shrink-0 border-r ${
        darkMode 
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl' 
          : 'bg-white/80 border-slate-200 backdrop-blur-xl'
      }`}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <span className={`hidden lg:block text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              DreamSync
            </span>
          </div>
        </div>

        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30' 
                  : `${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center lg:justify-start space-x-3 px-4 py-3 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="hidden lg:block font-medium">
              {darkMode ? '浅色模式' : '深色模式'}
            </span>
          </button>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<DreamJournal />} />
          <Route path="/community" element={<DreamCommunity />} />
          <Route path="/rooms" element={<DreamRooms />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full max-w-md p-8 rounded-3xl ${
        darkMode 
          ? 'bg-slate-900/80 border border-slate-800 backdrop-blur-xl' 
          : 'bg-white/80 border border-slate-200 backdrop-blur-xl'
      }`}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            DreamSync
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            在梦境中相遇
          </p>
        </div>

        <form className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="用户名"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          )}
          <input
            type="email"
            placeholder="邮箱"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
          <input
            type="password"
            placeholder="密码"
            className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' 
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
            }`}
          />
          
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            {isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {isLogin ? '还没有账户？' : '已有账户？'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-indigo-500 hover:text-indigo-400 font-medium"
          >
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default App;
