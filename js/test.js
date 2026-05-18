// DreamSync 测试脚本 - 验证三种登录方式

console.log('🌙 DreamSync 登录系统测试');
console.log('========================');

// 测试 1: 注册功能
function testRegister() {
    console.log('\n📋 测试 1: 用户注册');
    
    const testUser = {
        username: '测试用户' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'test123456'
    };
    
    console.log('注册信息:', testUser);
    
    if (typeof window.auth !== 'undefined') {
        const result = window.auth.register(testUser.username, testUser.email, testUser.password);
        console.log('注册结果:', result);
        return result.success;
    } else {
        console.log('❌ auth 对象未加载');
        return false;
    }
}

// 测试 2: 登录功能
function testLogin(email, password) {
    console.log('\n🔐 测试 2: 用户登录');
    
    if (typeof window.auth !== 'undefined') {
        const result = window.auth.login(email, password);
        console.log('登录结果:', result);
        return result.success;
    } else {
        console.log('❌ auth 对象未加载');
        return false;
    }
}

// 测试 3: 微信登录界面
function testWeChatLogin() {
    console.log('\n💬 测试 3: 微信扫码登录');
    
    const wechatTab = document.getElementById('wechat-tab');
    if (wechatTab) {
        console.log('✅ 微信登录标签页存在');
        
        const qrContainer = document.getElementById('wechat-qr');
        if (qrContainer) {
            console.log('✅ 二维码容器存在');
            
            // 检查是否有二维码
            if (qrContainer.querySelector('img') || qrContainer.querySelector('canvas')) {
                console.log('✅ 二维码已生成');
                return true;
            } else {
                console.log('⚠️ 二维码尚未生成，需要切换到微信标签页');
                return false;
            }
        } else {
            console.log('❌ 二维码容器不存在');
            return false;
        }
    } else {
        console.log('❌ 微信登录标签页不存在');
        return false;
    }
}

// 测试 4: 检查登录状态
function testAuthState() {
    console.log('\n👤 测试 4: 登录状态检查');
    
    if (typeof window.auth !== 'undefined') {
        const isLoggedIn = window.auth.isLoggedIn();
        const user = window.auth.getUser();
        
        console.log('登录状态:', isLoggedIn ? '已登录' : '未登录');
        console.log('当前用户:', user);
        
        return isLoggedIn;
    } else {
        console.log('❌ auth 对象未加载');
        return false;
    }
}

// 运行所有测试
function runAllTests() {
    console.log('\n🚀 开始运行测试...\n');
    
    const results = {
        register: false,
        login: false,
        wechat: false,
        state: false
    };
    
    // 测试注册
    results.register = testRegister();
    
    // 测试登录（使用刚注册的用户）
    if (results.register) {
        // 这里需要实际的邮箱密码
        console.log('\n⚠️ 请手动输入注册的邮箱和密码进行登录测试');
    }
    
    // 测试微信登录界面
    results.wechat = testWeChatLogin();
    
    // 测试登录状态
    results.state = testAuthState();
    
    // 输出结果
    console.log('\n========================');
    console.log('📊 测试结果汇总');
    console.log('========================');
    console.log('注册功能:', results.register ? '✅ 通过' : '❌ 失败');
    console.log('微信登录:', results.wechat ? '✅ 通过' : '❌ 失败');
    console.log('登录状态:', results.state ? '✅ 已登录' : '⚠️ 未登录');
    console.log('\n💡 提示: 在登录页面手动测试邮箱密码登录');
}

// 页面加载完成后自动测试
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 1000);
});

// 导出测试函数供手动调用
window.testDreamSync = {
    register: testRegister,
    login: testLogin,
    wechat: testWeChatLogin,
    state: testAuthState,
    all: runAllTests
};
