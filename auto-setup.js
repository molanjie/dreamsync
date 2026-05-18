// DreamSync - Cloudflare Tunnel 浏览器自动配置脚本
// 在 https://one.dash.cloudflare.com/networks/tunnels 页面的控制台运行

console.log('🌙 DreamSync - Cloudflare Tunnel 自动配置');
console.log('==========================================\n');

// 配置
const CONFIG = {
    tunnelName: 'dreamsync',
    domain: 'molanjie.dpdns.org',
    localUrl: 'http://localhost:9999'
};

// 等待函数
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 查找元素
function findElement(selector, text) {
    const elements = document.querySelectorAll(selector);
    for (let el of elements) {
        if (el.textContent.includes(text)) {
            return el;
        }
    }
    return null;
}

// 主函数
async function autoSetup() {
    try {
        console.log('📍 步骤 1: 查找"创建隧道"按钮...');
        
        // 查找创建按钮
        let createBtn = findElement('button', '创建隧道') || 
                       findElement('button', 'Create') ||
                       document.querySelector('button[type="button"]');
        
        if (!createBtn) {
            console.log('❌ 找不到创建按钮');
            console.log('💡 请手动点击"创建隧道"按钮');
            return;
        }
        
        console.log('✅ 找到按钮，点击中...');
        createBtn.click();
        
        await wait(1000);
        
        console.log('📍 步骤 2: 选择 Cloudflared...');
        
        // 查找 Cloudflared 选项
        let cloudflaredBtn = findElement('button', 'Cloudflared') ||
                            findElement('div', 'Cloudflared');
        
        if (cloudflaredBtn) {
            console.log('✅ 找到 Cloudflared，点击中...');
            cloudflaredBtn.click();
            await wait(500);
        }
        
        console.log('📍 步骤 3: 输入隧道名称...');
        
        // 查找输入框
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs.length > 0) {
            const nameInput = inputs[0];
            nameInput.focus();
            nameInput.value = CONFIG.tunnelName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ 已输入: ${CONFIG.tunnelName}`);
        }
        
        await wait(500);
        
        console.log('📍 步骤 4: 点击保存...');
        
        // 查找保存按钮
        const buttons = document.querySelectorAll('button');
        let saveBtn = null;
        
        for (let btn of buttons) {
            if (btn.textContent.includes('保存') || 
                btn.textContent.includes('Save') ||
                btn.textContent.includes('创建')) {
                if (!btn.textContent.includes('取消')) {
                    saveBtn = btn;
                    break;
                }
            }
        }
        
        if (saveBtn) {
            console.log('✅ 找到保存按钮，点击中...');
            saveBtn.click();
            
            console.log('\n⏳ 隧道创建中，请稍候...');
            await wait(3000);
            
            console.log('✅ 隧道创建完成！\n');
            console.log('==========================================');
            console.log('📌 下一步: 复制 Token 命令\n');
            console.log('你应该看到一个包含以下内容的命令:\n');
            console.log('cloudflared tunnel run --token [TOKEN] dreamsync\n');
            console.log('复制整个命令，粘贴到终端运行\n');
            console.log('==========================================');
            
        } else {
            console.log('❌ 找不到保存按钮');
        }
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
    }
}

// 运行
console.log('⏳ 开始自动配置...\n');
autoSetup();
