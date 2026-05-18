#!/usr/bin/env node

/**
 * DreamSync - Cloudflare Tunnel 自动配置脚本
 * 
 * 使用方法:
 * 1. 获取 Cloudflare API Token: https://dash.cloudflare.com/profile/api-tokens
 * 2. 运行: node cloudflare-api-setup.js YOUR_API_TOKEN YOUR_ACCOUNT_ID
 */

const https = require('https');

// 配置信息
const CONFIG = {
    domain: 'molanjie.dpdns.org',
    tunnelName: 'dreamsync',
    localUrl: 'http://localhost:9999',
    apiBase: 'https://api.cloudflare.com/client/v4'
};

// API 请求函数
function makeRequest(method, path, data, token) {
    return new Promise((resolve, reject) => {
        const url = new URL(CONFIG.apiBase + path);
        
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 主函数
async function setup(apiToken, accountId) {
    try {
        console.log('🌙 DreamSync - Cloudflare Tunnel 配置\n');
        console.log('📋 配置信息:');
        console.log(`  域名: ${CONFIG.domain}`);
        console.log(`  隧道名: ${CONFIG.tunnelName}`);
        console.log(`  本地地址: ${CONFIG.localUrl}\n`);

        // 步骤 1: 创建隧道
        console.log('⏳ [1/3] 创建隧道...');
        const tunnelRes = await makeRequest('POST', `/accounts/${accountId}/cfd_tunnel`, {
            name: CONFIG.tunnelName,
            tunnel_type: 'cfd_tunnel'
        }, apiToken);

        if (!tunnelRes.success) {
            throw new Error(`创建隧道失败: ${tunnelRes.errors?.[0]?.message || '未知错误'}`);
        }

        const tunnelId = tunnelRes.result.id;
        const tunnelToken = tunnelRes.result.token;
        console.log(`✅ 隧道已创建: ${tunnelId}`);
        console.log(`📌 Token: ${tunnelToken}\n`);

        // 步骤 2: 获取域名 Zone ID
        console.log('⏳ [2/3] 获取域名信息...');
        const zonesRes = await makeRequest('GET', '/zones?name=' + CONFIG.domain, null, apiToken);
        
        if (!zonesRes.success || zonesRes.result.length === 0) {
            throw new Error('找不到域名，请确保已在 Cloudflare 添加该域名');
        }

        const zoneId = zonesRes.result[0].id;
        console.log(`✅ 域名 Zone ID: ${zoneId}\n`);

        // 步骤 3: 创建 DNS 记录
        console.log('⏳ [3/3] 配置 DNS 记录...');
        const dnsRes = await makeRequest('POST', `/zones/${zoneId}/dns_records`, {
            type: 'CNAME',
            name: CONFIG.domain,
            content: `${tunnelId}.cfargotunnel.com`,
            ttl: 1,
            proxied: true
        }, apiToken);

        if (!dnsRes.success) {
            console.log('⚠️ DNS 记录可能已存在或配置失败');
        } else {
            console.log(`✅ DNS 记录已创建\n`);
        }

        // 步骤 4: 配置隧道路由
        console.log('⏳ 配置隧道路由...');
        const routeRes = await makeRequest('PUT', `/accounts/${accountId}/cfd_tunnel/${tunnelId}/routes`, {
            routes: [{
                pattern: CONFIG.domain,
                zone_name: CONFIG.domain
            }]
        }, apiToken);

        if (routeRes.success) {
            console.log('✅ 隧道路由已配置\n');
        }

        // 输出配置命令
        console.log('==========================================');
        console.log('✅ 配置完成！\n');
        console.log('📌 请在本地运行以下命令启动隧道:\n');
        console.log(`cloudflared tunnel run --token ${tunnelToken} ${CONFIG.tunnelName}\n`);
        console.log('或者使用我们的启动脚本:\n');
        console.log('node start-tunnel.js\n');
        console.log('==========================================');

        // 保存配置
        const fs = require('fs');
        fs.writeFileSync('tunnel-config.json', JSON.stringify({
            tunnelId,
            tunnelToken,
            tunnelName: CONFIG.tunnelName,
            domain: CONFIG.domain,
            zoneId,
            createdAt: new Date().toISOString()
        }, null, 2));

        console.log('\n💾 配置已保存到 tunnel-config.json');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
}

// 检查参数
if (process.argv.length < 4) {
    console.log('使用方法:');
    console.log('  node cloudflare-api-setup.js <API_TOKEN> <ACCOUNT_ID>\n');
    console.log('获取 API Token: https://dash.cloudflare.com/profile/api-tokens');
    console.log('获取 Account ID: https://dash.cloudflare.com/\n');
    process.exit(1);
}

const apiToken = process.argv[2];
const accountId = process.argv[3];

setup(apiToken, accountId);
