/**
 * DreamSync 微信开放平台配置
 *
 * 使用说明：
 * 1. 访问 https://open.weixin.qq.com 注册开放平台账号
 * 2. 创建"网站应用"，获取 AppID 和 AppSecret
 * 3. 设置授权回调域名（如：yourdomain.com）
 * 4. 将 AppID 和 AppSecret 填入下方配置
 * 5. 重启服务器
 */

module.exports = {
  // 微信开放平台 AppID（必填）
  appId: process.env.WECHAT_APPID || 'YOUR_WECHAT_APPID',

  // 微信开放平台 AppSecret（必填）
  appSecret: process.env.WECHAT_APPSECRET || 'YOUR_WECHAT_APPSECRET',

  // 授权回调域名（必填，需与微信开放平台设置一致）
  // 注意：只填写域名，不带 http:// 和路径
  // 例如：dreamsync.example.com 或 localhost（开发环境）
  redirectDomain: process.env.WECHAT_REDIRECT_DOMAIN || 'localhost:9999',

  // 是否启用微信登录（开发时可设为 false，使用模拟登录）
  enabled: process.env.WECHAT_ENABLED === 'true' || false,

  // 登录方式
  // 'qrconnect' - 网站应用扫码登录（需要企业资质）
  // 'snsapi_base' - 公众号静默授权（需要公众号）
  // 'snsapi_userinfo' - 公众号授权获取用户信息（需要公众号）
  loginType: 'qrconnect',

  // 二维码显示方式
  qrCodeStyle: {
    width: 300,
    height: 300,
    autoColor: true,
    colorDark: '#000000',
    colorLight: '#ffffff',
  },

  // 登录状态保持时间（秒）
  tokenExpiresIn: 7 * 24 * 60 * 60, // 7天

  // 请求超时时间（毫秒）
  requestTimeout: 10000,
};