@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🌙 DreamSync 微信开放平台配置向导
echo ================================
echo.

:: 检查是否存在 .env 文件
if exist .env (
    echo ✅ 发现现有 .env 文件
) else (
    echo ⚠️  未找到 .env 文件，将创建新文件
    copy .env.example .env >nul
)

echo.
echo 请输入微信开放平台配置信息：
echo (如果暂时没有，直接回车跳过，将使用模拟模式)
echo.

:: 读取 AppID
set /p APPID_INPUT="AppID (wx开头): "
if defined APPID_INPUT (
    :: 更新 .env 文件中的 WECHAT_APPID
    powershell -Command "(gc .env) -replace '^WECHAT_APPID=.*', 'WECHAT_APPID=!APPID_INPUT!' | Out-File -encoding UTF8 .env"
)

:: 读取 AppSecret
set /p SECRET_INPUT="AppSecret (32位): "
if defined SECRET_INPUT (
    powershell -Command "(gc .env) -replace '^WECHAT_APPSECRET=.*', 'WECHAT_APPSECRET=!SECRET_INPUT!' | Out-File -encoding UTF8 .env"
)

:: 是否启用
set /p ENABLE_INPUT="是否启用微信登录? (y/n): "
if /i "!ENABLE_INPUT!"=="y" (
    powershell -Command "(gc .env) -replace '^WECHAT_ENABLED=.*', 'WECHAT_ENABLED=true' | Out-File -encoding UTF8 .env"
    echo.
    echo ✅ 微信登录已启用
) else (
    powershell -Command "(gc .env) -replace '^WECHAT_ENABLED=.*', 'WECHAT_ENABLED=false' | Out-File -encoding UTF8 .env"
    echo.
    echo ⚠️  微信登录未启用，将使用模拟模式
)

echo.
echo 📋 配置已保存到 .env 文件
echo.
echo 现在可以启动服务器：
echo   node server-wechat.js
echo.

pause
