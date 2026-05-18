# 微信开放平台接入指南

## 一、前置条件

1. **企业资质**：微信开放平台网站应用需要企业认证（个人无法申请）
2. **已备案域名**：需要 ICP 备案的域名
3. **服务器**：需要公网可访问的服务器

## 二、申请流程

### 1. 注册开放平台账号
- 访问：https://open.weixin.qq.com
- 注册账号并完成企业认证（需营业执照）
- 认证费用：300 元/年

### 2. 创建网站应用
- 进入「管理中心」→「网站应用」→「创建网站应用」
- 填写应用信息：
  - 应用名称：DreamSync 梦境平台
  - 应用简介：记录梦境、AI分析、梦境社交
  - 应用官网：https://your-domain.com
- 提交审核（约 1-3 个工作日）

### 3. 获取凭证
审核通过后，在应用详情页获取：
- **AppID**：wx开头的字符串
- **AppSecret**：32位字符串（注意保密！）

### 4. 配置授权回调域
- 在应用详情页，找到「开发信息」
- 设置「授权回调域」：`your-domain.com`（不带 https://）

## 三、接入代码

### 方式一：扫码登录（网站应用）

```javascript
// 前端：生成登录二维码
const appId = 'wx1234567890abcdef';
const redirectUri = encodeURIComponent('https://your-domain.com/api/wechat/callback');
const state = 'random_state_string';

const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

// 将 qrUrl 转成二维码图片显示
```

### 方式二：公众号授权（移动端）

```javascript
// 前端：跳转授权页面
const appId = 'wx1234567890abcdef';
const redirectUri = encodeURIComponent('https://your-domain.com/api/wechat/callback');

const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;

window.location.href = authUrl;
```

## 四、后端实现

### 1. 用 code 换 access_token

```javascript
// GET https://api.weixin.qq.com/sns/oauth2/access_token
// ?appid=APPID
// &secret=SECRET
// &code=CODE
// &grant_type=authorization_code

// 返回：
{
  "access_token": "ACCESS_TOKEN",
  "expires_in": 7200,
  "refresh_token": "REFRESH_TOKEN",
  "openid": "OPENID",
  "scope": "snsapi_login"
}
```

### 2. 获取用户信息

```javascript
// GET https://api.weixin.qq.com/sns/userinfo
// ?access_token=ACCESS_TOKEN
// &openid=OPENID

// 返回：
{
  "openid": "OPENID",
  "nickname": "张三",
  "sex": 1,
  "province": "广东",
  "city": "深圳",
  "country": "中国",
  "headimgurl": "https://...",
  "privilege": [],
  "unionid": "UNIONID"
}
```

## 五、安全注意事项

1. **AppSecret 绝对不能泄露**，不要放在前端代码
2. **state 参数**必须验证，防止 CSRF 攻击
3. **access_token 有效期 2 小时**，需用 refresh_token 刷新
4. **回调域名必须与配置一致**，否则会报错

## 六、测试账号

开发阶段可以使用微信公众平台测试号：
- 访问：https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
- 扫码登录后获取测试号的 appID 和 appsecret
- 测试号无需企业认证，可用于开发调试

## 七、当前项目配置

DreamSync 已集成微信登录 API：

```bash
# 启动服务器时设置环境变量
WECHAT_APPID=你的AppID \
WECHAT_APPSECRET=你的AppSecret \
WECHAT_ENABLED=true \
node server-wechat.js
```

或者创建 `.env` 文件：
```
WECHAT_APPID=wx1234567890abcdef
WECHAT_APPSECRET=你的32位密钥
WECHAT_ENABLED=true
```

## 八、API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/wechat/qrcode` | GET | 获取登录二维码 URL |
| `/api/wechat/status/:id` | GET | 轮询登录状态 |
| `/api/wechat/callback` | GET | OAuth 回调地址 |
| `/api/wechat/simulate` | POST | 模拟登录（开发测试用） |

## 九、前端集成

```javascript
// 1. 获取二维码
const res = await fetch('/api/wechat/qrcode');
const data = await res.json();

// 2. 显示二维码
if (data.qrUrl) {
  // 用 QRCode.js 生成二维码图片
  new QRCode(container, data.qrUrl);
}

// 3. 轮询状态
setInterval(async () => {
  const status = await fetch(`/api/wechat/status/${data.sessionId}`);
  const result = await status.json();
  
  if (result.status === 'confirmed') {
    // 登录成功，保存 token
    localStorage.setItem('token', result.token);
    window.location.href = '/app.html';
  }
}, 2000);
```

## 十、常见错误

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 40001 | AppSecret 错误 | 检查 AppSecret 是否正确 |
| 40029 | code 无效 | code 只能使用一次，需重新授权 |
| 40163 | code 已使用 | code 已被使用，需重新授权 |
| 40125 | appsecret 不正确 | 检查是否填写正确 |
| 10003 | redirect_uri 域名与配置不一致 | 检查回调域名配置 |

---

**注意**：当前服务器运行在**模拟模式**，点击「模拟扫码登录」即可测试流程。

要启用真实微信登录，请：
1. 申请微信开放平台账号
2. 创建网站应用并获取 AppID/AppSecret
3. 设置环境变量 `WECHAT_ENABLED=true`
4. 重启服务器
