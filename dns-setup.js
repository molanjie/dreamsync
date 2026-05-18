// 在 Cloudflare DNS 管理页面运行此脚本
// 打开: https://dash.cloudflare.com/molanjie.dpdns.org/dns/records

console.log('🌙 DreamSync - Cloudflare DNS 自动配置');
console.log('==========================================\n');

// 配置
const CONFIG = {
    domain: 'molanjie.dpdns.org',
    tunnelId: '64b6e2b9-0f87-49e1-a774-a4cc5149ed80', // 从你的 token 中提取
    tunnelCname: '64b6e2b9-0f87-49e1-a774-a4cc5149ed80.cfargotunnel.com'
};

console.log('📋 需要添加的 DNS 记录:\n');
console.log('类型: CNAME');
console.log(`名称: ${CONFIG.domain}`);
console.log(`内容: ${CONFIG.tunnelCname}`);
console.log('代理状态: 已代理 (橙色云)\n');

console.log('==========================================');
console.log('📌 手动操作步骤:\n');
console.log('1. 打开 https://dash.cloudflare.com/');
console.log('2. 选择域名 molanjie.dpdns.org');
console.log('3. 点击 "DNS" 标签');
console.log('4. 点击 "添加记录"');
console.log('5. 选择类型: CNAME');
console.log(`6. 名称: ${CONFIG.domain}`);
console.log(`7. 内容: ${CONFIG.tunnelCname}`);
console.log('8. 代理状态: 已代理 (橙色云)');
console.log('9. 点击 "保存"');
console.log('\n==========================================');
console.log('⏳ DNS 生效需要 5-10 分钟');
console.log('然后访问: https://molanjie.dpdns.org');
