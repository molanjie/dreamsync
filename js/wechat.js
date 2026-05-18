// DreamSync 微信扫码登录

class WeChatLogin {
    constructor() {
        this.qrCode = null;
        this.pollingInterval = null;
        this.expireTime = 300; // 5分钟过期
    }

    // 生成微信登录二维码
    generateQRCode(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 生成唯一的登录会话ID
        const sessionId = this.generateSessionId();
        localStorage.setItem('dreamsync-wechat-session', sessionId);

        // 创建二维码数据（模拟微信登录URL）
        const qrData = `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_APPID&redirect_uri=${encodeURIComponent(window.location.origin + '/wechat-callback')}&response_type=code&scope=snsapi_login&state=${sessionId}#wechat_redirect`;

        // 使用 QRCode.js 生成二维码
        container.innerHTML = '';
        
        // 如果没有引入 QRCode.js，使用简单的 SVG 二维码
        if (typeof QRCode === 'undefined') {
            this.createSimpleQR(container, qrData);
        } else {
            new QRCode(container, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }

        // 开始轮询检查登录状态
        this.startPolling(sessionId);

        // 显示过期倒计时
        this.showExpireCountdown();

        return sessionId;
    }

    // 创建简单的二维码（备用方案）
    createSimpleQR(container, data) {
        // 使用 API 生成二维码图片
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
        
        container.innerHTML = `
            <div class="flex flex-col items-center">
                <img src="${qrUrl}" alt="微信登录二维码" class="w-48 h-48 rounded-lg shadow-lg">
                <p class="mt-4 text-sm text-slate-400">请使用微信扫一扫登录</p>
                <div id="qr-countdown" class="mt-2 text-xs text-slate-500"></div>
            </div>
        `;
    }

    // 生成会话ID
    generateSessionId() {
        return 'wx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // 开始轮询检查登录状态
    startPolling(sessionId) {
        // 清除之前的轮询
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        let attempts = 0;
        const maxAttempts = 60; // 5分钟 (5秒 * 60)

        this.pollingInterval = setInterval(() => {
            attempts++;
            
            // 检查是否超时
            if (attempts >= maxAttempts) {
                this.stopPolling();
                this.onExpire();
                return;
            }

            // 模拟检查登录状态
            this.checkLoginStatus(sessionId);
        }, 5000); // 每5秒检查一次
    }

    // 停止轮询
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // 检查登录状态（模拟）
    async checkLoginStatus(sessionId) {
        // 实际项目中，这里应该调用后端API检查登录状态
        // 模拟：检查 localStorage 中是否有登录标记
        const loginResult = localStorage.getItem('dreamsync-wechat-login-result');
        
        if (loginResult) {
            const data = JSON.parse(loginResult);
            if (data.sessionId === sessionId && data.success) {
                this.stopPolling();
                this.onSuccess(data.userInfo);
                localStorage.removeItem('dreamsync-wechat-login-result');
            }
        }
    }

    // 显示过期倒计时
    showExpireCountdown() {
        let remaining = this.expireTime;
        const countdownEl = document.getElementById('qr-countdown');
        
        const updateCountdown = () => {
            if (!countdownEl) return;
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            countdownEl.textContent = `二维码 ${minutes}:${seconds.toString().padStart(2, '0')} 后过期`;
            
            if (remaining <= 0) {
                countdownEl.textContent = '二维码已过期，请刷新';
                countdownEl.classList.add('text-red-400');
                return;
            }
            
            remaining--;
            setTimeout(updateCountdown, 1000);
        };
        
        updateCountdown();
    }

    // 登录成功回调
    onSuccess(userInfo) {
        // 创建或更新用户
        const result = window.auth.register(
            userInfo.nickname || '微信用户',
            `wechat_${userInfo.openid}@dreamsync.local`,
            'wechat_' + Math.random().toString(36).substr(2, 10)
        );

        if (result.success) {
            // 自动登录
            window.auth.login(
                `wechat_${userInfo.openid}@dreamsync.local`,
                'wechat_' + Math.random().toString(36).substr(2, 10)
            );
        }

        // 触发事件
        const event = new CustomEvent('wechatLoginSuccess', { detail: userInfo });
        window.dispatchEvent(event);

        // 显示成功消息
        this.showToast('✅ 微信登录成功！');
    }

    // 二维码过期回调
    onExpire() {
        const event = new CustomEvent('wechatLoginExpire');
        window.dispatchEvent(event);
        
        this.showToast('⏰ 二维码已过期，请刷新重试');
    }

    // 刷新二维码
    refreshQRCode(containerId) {
        this.stopPolling();
        this.generateQRCode(containerId);
    }

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-500 text-white rounded-full text-sm z-50 animate-fade shadow-lg';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// 创建全局实例
window.wechatLogin = new WeChatLogin();
