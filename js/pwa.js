/**
 * DreamSync PWA 管理器
 * 处理 Service Worker 注册、安装提示、离线状态
 */

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        // 注册 Service Worker
        this.registerServiceWorker();
        
        // 监听安装提示
        this.listenInstallPrompt();
        
        // 监听网络状态
        this.listenNetworkStatus();
        
        // 监听 SW 更新
        this.listenSWUpdate();
    }

    // 注册 Service Worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('[PWA] Service Worker not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('[PWA] Service Worker registered:', registration.scope);
            
            // 检查更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
        }
    }

    // 监听安装提示
    listenInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.deferredPrompt = event;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed');
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showToast('🎉 DreamSync 已安装到桌面！', 'success');
        });
    }

    // 监听网络状态
    listenNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('✅ 网络已恢复', 'success');
            this.syncData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('⚠️ 网络已断开，进入离线模式', 'error');
        });
    }

    // 监听 SW 更新
    listenSWUpdate() {
        if (!('serviceWorker' in navigator)) return;
        
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }

    // 显示安装按钮
    showInstallButton() {
        const btn = document.getElementById('install-btn');
        if (btn) {
            btn.classList.remove('hidden');
        } else {
            // 创建安装按钮
            const installBtn = document.createElement('button');
            installBtn.id = 'install-btn';
            installBtn.innerHTML = '📱 安装应用';
            installBtn.className = 'fixed bottom-20 right-4 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium shadow-lg z-50 hover:bg-indigo-600 transition';
            installBtn.onclick = () => this.installApp();
            document.body.appendChild(installBtn);
        }
    }

    // 隐藏安装按钮
    hideInstallButton() {
        const btn = document.getElementById('install-btn');
        if (btn) btn.remove();
    }

    // 安装应用
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log('[PWA] Install outcome:', outcome);
        this.deferredPrompt = null;
    }

    // 显示更新通知
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-3';
        notification.innerHTML = `
            <span>🔄 有新版本可用</span>
            <button onclick="window.location.reload()" class="bg-white text-indigo-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
                立即更新
            </button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 10000);
    }

    // 同步数据
    async syncData() {
        if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-dreams');
            console.log('[PWA] Background sync registered');
        } catch (error) {
            console.error('[PWA] Background sync failed:', error);
        }
    }

    // 请求推送通知权限
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('[PWA] Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // 发送本地通知
    async sendLocalNotification(title, body, options = {}) {
        const hasPermission = await this.requestNotificationPermission();
        
        if (!hasPermission) return;
        
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification(title, {
            body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text y=".9em" font-size="80">🌙</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><text y=".9em" font-size="80">🌙</text></svg>',
            vibrate: [100, 50, 100],
            ...options
        });
    }

    // 设置睡前提醒
    async setDreamReminder(time) {
        const hasPermission = await this.requestNotificationPermission();
        
        if (!hasPermission) {
            this.showToast('请允许通知权限以设置提醒', 'error');
            return;
        }
        
        // 计算下次提醒时间
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const reminder = new Date();
        reminder.setHours(hours, minutes, 0, 0);
        
        if (reminder <= now) {
            reminder.setDate(reminder.getDate() + 1);
        }
        
        const delay = reminder.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendLocalNotification(
                'DreamSync 睡前提醒',
                '该记录今天的梦境了！🌙',
                { tag: 'dream-reminder' }
            );
        }, delay);
        
        this.showToast(`⏰ 提醒已设置：${time}`, 'success');
    }

    // Toast 通知
    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        let toast = document.querySelector('.pwa-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'pwa-toast fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm z-50 transition-all duration-300 opacity-0 pointer-events-none';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.className = `pwa-toast fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-white text-sm z-50 transition-all duration-300 ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }

    // 获取网络状态
    getNetworkStatus() {
        return {
            online: this.isOnline,
            type: navigator.connection ? navigator.connection.effectiveType : 'unknown',
            downlink: navigator.connection ? navigator.connection.downlink : null
        };
    }
}

// 全局 PWA 实例
window.pwa = new PWAManager();
