// Cloudflare Tunnel 自动配置脚本
// 在 Cloudflare Zero Trust 页面的浏览器控制台运行此脚本

console.log('🌙 DreamSync - Cloudflare Tunnel 自动配置');
console.log('==========================================\n');

// 步骤 1: 检查是否在正确的页面
if (!window.location.href.includes('one.dash.cloudflare.com')) {
    console.error('❌ 请先打开 https://one.dash.cloudflare.com/networks/tunnels');
    console.log('然后在控制台运行此脚本');
} else {
    console.log('✅ 页面正确\n');
    
    // 步骤 2: 查找创建隧道按钮
    console.log('📍 正在查找"创建隧道"按钮...');
    
    // 方法1: 查找按钮文本
    const buttons = Array.from(document.querySelectorAll('button'));
    const createButton = buttons.find(btn => 
        btn.textContent.includes('创建隧道') || 
        btn.textContent.includes('Create') ||
        btn.textContent.includes('tunnel')
    );
    
    if (createButton) {
        console.log('✅ 找到创建按钮，点击中...');
        createButton.click();
        
        // 等待弹窗出现
        setTimeout(() => {
            console.log('⏳ 等待弹窗加载...');
            
            // 步骤 3: 选择 Cloudflared
            setTimeout(() => {
                const cloudflaredOption = Array.from(document.querySelectorAll('*')).find(el =>
                    el.textContent.includes('Cloudflared')
                );
                
                if (cloudflaredOption) {
                    console.log('✅ 找到 Cloudflared 选项，点击中...');
                    cloudflaredOption.click();
                    
                    // 步骤 4: 输入隧道名称
                    setTimeout(() => {
                        const inputs = document.querySelectorAll('input[type="text"]');
                        if (inputs.length > 0) {
                            console.log('✅ 找到输入框，输入隧道名称...');
                            inputs[0].value = 'dreamsync';
                            inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                            inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
                            
                            // 步骤 5: 点击保存
                            setTimeout(() => {
                                const saveButtons = Array.from(document.querySelectorAll('button'));
                                const saveButton = saveButtons.find(btn =>
                                    btn.textContent.includes('保存') ||
                                    btn.textContent.includes('Save') ||
                                    btn.textContent.includes('创建')
                                );
                                
                                if (saveButton) {
                                    console.log('✅ 点击保存按钮...');
                                    saveButton.click();
                                    
                                    console.log('\n⏳ 隧道创建中，请稍候...');
                                    console.log('📋 创建完成后，你会看到一个 token 命令');
                                    console.log('📌 复制整个命令，粘贴到终端运行');
                                } else {
                                    console.log('❌ 找不到保存按钮');
                                }
                            }, 500);
                        } else {
                            console.log('❌ 找不到输入框');
                        }
                    }, 500);
                } else {
                    console.log('❌ 找不到 Cloudflared 选项');
                }
            }, 1000);
        }, 500);
    } else {
        console.log('❌ 找不到创建按钮');
        console.log('💡 请手动点击"创建隧道"按钮');
    }
}

console.log('\n==========================================');
console.log('💡 如果自动化失败，请手动操作：');
console.log('1. 点击"创建隧道"');
console.log('2. 选择"Cloudflared"');
console.log('3. 输入名称：dreamsync');
console.log('4. 点击"保存隧道"');
console.log('5. 复制显示的 token 命令');
console.log('==========================================');
