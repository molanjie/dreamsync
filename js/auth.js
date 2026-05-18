/**
 * DreamSync 认证系统
 * 支持本地存储 + 模拟 API
 */

class AuthManager {
    constructor() {
        this.storageKey = 'dreamsync-auth';
        this.sessionKey = 'dreamsync-session';
        this.usersKey = 'dreamsync-users';
        this.init();
    }

    init() {
        // 初始化用户数据库
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([
                {
                    id: 1,
                    username: '星空漫步者',
                    email: 'demo@dreamsync.app',
                    password: this.hashPassword('demo123'),
                    avatar: '🌙',
                    bio: '在梦境中寻找答案的旅人',
                    createdAt: new Date().toISOString(),
                    dreamCount: 12,
                    lucidCount: 3,
                    streak: 7
                }
            ]));
        }
    }

    // 简单哈希（生产环境应使用 bcrypt）
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // 注册
    async register(username, email, password) {
        const users = this.getUsers();
        
        // 检查邮箱是否已存在
        if (users.find(u => u.email === email)) {
            throw new Error('该邮箱已被注册');
        }
        
        // 检查用户名是否已存在
        if (users.find(u => u.username === username)) {
            throw new Error('该用户名已被使用');
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password),
            avatar: this.getRandomAvatar(),
            bio: '梦境探索者',
            createdAt: new Date().toISOString(),
            dreamCount: 0,
            lucidCount: 0,
            streak: 0
        };
        
        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // 自动登录
        this.createSession(newUser);
        
        return { success: true, user: this.sanitizeUser(newUser) };
    }

    // 登录
    async login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('邮箱或密码错误');
        }
        
        if (user.password !== this.hashPassword(password)) {
            throw new Error('邮箱或密码错误');
        }
        
        // 更新最后登录时间
        user.lastLogin = new Date().toISOString();
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // 创建会话
        this.createSession(user);
        
        return { success: true, user: this.sanitizeUser(user) };
    }

    // 微信登录（模拟）
    async wechatLogin() {
        // 模拟微信登录
        const mockUser = {
            id: Date.now(),
            username: '微信用户_' + Math.random().toString(36).substr(2, 6),
            email: `wechat_${Date.now()}@dreamsync.app`,
            password: '',
            avatar: '🌟',
            bio: '通过微信登录的梦境探索者',
            createdAt: new Date().toISOString(),
            dreamCount: 0,
            lucidCount: 0,
            streak: 0,
            loginType: 'wechat'
        };
        
        const users = this.getUsers();
        users.push(mockUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        this.createSession(mockUser);
        
        return { success: true, user: this.sanitizeUser(mockUser) };
    }

    // 创建会话
    createSession(user) {
        const session = {
            userId: user.id,
            token: this.generateToken(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        localStorage.setItem(this.storageKey, JSON.stringify(this.sanitizeUser(user)));
    }

    // 检查登录状态
    isLoggedIn() {
        const session = this.getSession();
        if (!session) return false;
        
        // 检查会话是否过期
        if (new Date(session.expiresAt) < new Date()) {
            this.logout();
            return false;
        }
        
        return true;
    }

    // 获取当前用户
    getUser() {
        const userData = localStorage.getItem(this.storageKey);
        return userData ? JSON.parse(userData) : null;
    }

    // 更新个人资料
    updateProfile(updates) {
        const user = this.getUser();
        if (!user) return;
        
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            Object.assign(users[userIndex], updates);
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            localStorage.setItem(this.storageKey, JSON.stringify(this.sanitizeUser(users[userIndex])));
        }
    }

    // 退出登录
    logout() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.storageKey);
    }

    // 获取所有用户
    getUsers() {
        const users = localStorage.getItem(this.usersKey);
        return users ? JSON.parse(users) : [];
    }

    // 获取会话
    getSession() {
        const session = localStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }

    // 清理用户数据（移除敏感信息）
    sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    // 生成随机 Token
    generateToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // 随机头像
    getRandomAvatar() {
        const avatars = ['🌙', '⭐', '✨', '🌟', '💫', '🌌', '🌠', '🌃', '🌉', '🌁'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    // 重置密码（模拟）
    async resetPassword(email) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            throw new Error('该邮箱未注册');
        }
        
        // 模拟发送重置邮件
        return { success: true, message: `重置链接已发送到 ${email}` };
    }

    // 修改密码
    async changePassword(oldPassword, newPassword) {
        const user = this.getUser();
        if (!user) throw new Error('未登录');
        
        const users = this.getUsers();
        const fullUser = users.find(u => u.id === user.id);
        
        if (!fullUser || fullUser.password !== this.hashPassword(oldPassword)) {
            throw new Error('原密码错误');
        }
        
        fullUser.password = this.hashPassword(newPassword);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        return { success: true };
    }
}

// 全局认证实例
window.auth = new AuthManager();

// 路由守卫 - 检查登录状态
(function() {
    const currentPage = window.location.pathname.split('/').pop();
    const protectedPages = ['app.html'];
    const authPages = ['login.html'];
    
    if (protectedPages.includes(currentPage) && !window.auth.isLoggedIn()) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html?redirect=' + encodeURIComponent(currentPage);
    }
    
    if (authPages.includes(currentPage) && window.auth.isLoggedIn()) {
        // 已登录，跳转到应用
        window.location.href = 'app.html';
    }
})();
