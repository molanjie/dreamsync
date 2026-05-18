// 获取 Cloudflare Account ID 的脚本
// 在 Cloudflare 主页 (https://dash.cloudflare.com/) 的浏览器控制台运行

console.log('🔍 正在获取 Account ID...\n');

// 方法1: 从 URL 获取
const urlMatch = window.location.href.match(/dash\.cloudflare\.com\/([a-f0-9]+)/);
if (urlMatch) {
    console.log('✅ Account ID: ' + urlMatch[1]);
} else {
    console.log('❌ 无法从 URL 获取');
}

// 方法2: 从页面元素获取
const accountIdElements = document.querySelectorAll('[data-account-id], [data-testid*="account"]');
accountIdElements.forEach(el => {
    if (el.textContent.match(/[a-f0-9]{32}/)) {
        console.log('✅ 找到 Account ID: ' + el.textContent.match(/[a-f0-9]{32}/)[0]);
    }
});

// 方法3: 从 localStorage 获取
const stored = localStorage.getItem('cf_account_id');
if (stored) {
    console.log('✅ Account ID: ' + stored);
}

console.log('\n💡 如果上面没有显示，请手动查找:');
console.log('1. 打开 https://dash.cloudflare.com/');
console.log('2. 右下角找到 "Account ID"');
console.log('3. 复制 32 位的十六进制字符串');
