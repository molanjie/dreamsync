#!/bin/bash
# DreamSync 微信登录配置脚本

echo "🌙 DreamSync 微信开放平台配置向导"
echo "================================"
echo ""

# 检查是否存在 .env 文件
if [ -f ".env" ]; then
    echo "✅ 发现现有 .env 文件"
    source .env
else
    echo "⚠️  未找到 .env 文件，将创建新文件"
    cp .env.example .env
fi

echo ""
echo "请输入微信开放平台配置信息："
echo "(如果暂时没有，直接回车跳过，将使用模拟模式)"
echo ""

# 读取 AppID
read -p "AppID (wx开头): " APPID_INPUT
if [ -n "$APPID_INPUT" ]; then
    export WECHAT_APPID="$APPID_INPUT"
    sed -i "s/^WECHAT_APPID=.*/WECHAT_APPID=$APPID_INPUT/" .env 2>/dev/null || \
    sed -i '' "s/^WECHAT_APPID=.*/WECHAT_APPID=$APPID_INPUT/" .env
fi

# 读取 AppSecret
read -p "AppSecret (32位): " SECRET_INPUT
if [ -n "$SECRET_INPUT" ]; then
    export WECHAT_APPSECRET="$SECRET_INPUT"
    sed -i "s/^WECHAT_APPSECRET=.*/WECHAT_APPSECRET=$SECRET_INPUT/" .env 2>/dev/null || \
    sed -i '' "s/^WECHAT_APPSECRET=.*/WECHAT_APPSECRET=$SECRET_INPUT/" .env
fi

# 是否启用
read -p "是否启用微信登录? (y/n): " ENABLE_INPUT
if [ "$ENABLE_INPUT" = "y" ] || [ "$ENABLE_INPUT" = "Y" ]; then
    export WECHAT_ENABLED="true"
    sed -i "s/^WECHAT_ENABLED=.*/WECHAT_ENABLED=true/" .env 2>/dev/null || \
    sed -i '' "s/^WECHAT_ENABLED=.*/WECHAT_ENABLED=true/" .env
    echo ""
    echo "✅ 微信登录已启用"
else
    export WECHAT_ENABLED="false"
    sed -i "s/^WECHAT_ENABLED=.*/WECHAT_ENABLED=false/" .env 2>/dev/null || \
    sed -i '' "s/^WECHAT_ENABLED=.*/WECHAT_ENABLED=false/" .env
    echo ""
    echo "⚠️  微信登录未启用，将使用模拟模式"
fi

echo ""
echo "📋 配置已保存到 .env 文件"
echo ""
echo "现在可以启动服务器："
echo "  node server-wechat.js"
echo ""
