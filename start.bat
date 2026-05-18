@echo off
REM DreamSync 启动脚本 (Windows)

echo.
echo ╔════════════════════════════════════════╗
echo ║     DreamSync - 梦境联网平台          ║
echo ║     在梦境中相遇，在现实中相识        ║
echo ╚════════════════════════════════════════╝
echo.

echo 选择打开方式：
echo.
echo 1. 打开首页 (index.html)
echo 2. 打开应用 (app.html)
echo 3. 启动完整服务器
echo 4. 退出
echo.

set /p choice="请选择 (1-4): "

if "%choice%"=="1" (
    echo 正在打开首页...
    start index.html
    echo 首页已在浏览器中打开！
) else if "%choice%"=="2" (
    echo 正在打开应用...
    start app.html
    echo 应用已在浏览器中打开！
) else if "%choice%"=="3" (
    echo 启动完整服务器...
    echo.
    echo 1. 安装依赖...
    call npm install
    cd client
    call npm install
    cd ..
    echo.
    echo 2. 初始化数据库...
    call npm run init-db
    echo.
    echo 3. 启动后端服务器 (端口 3001)...
    start cmd /k npm run dev
    echo.
    echo 4. 启动前端应用 (端口 3000)...
    timeout /t 3
    start cmd /k npm run client
    echo.
    echo 服务器已启动！
    echo 前端: http://localhost:3000
    echo 后端: http://localhost:3001
) else if "%choice%"=="4" (
    echo 再见！
    exit /b 0
) else (
    echo 无效选择，请重试
    pause
    goto start
)

pause
