#!/bin/bash

# DreamSync 启动脚本 (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║     DreamSync - 梦境联网平台          ║"
echo "║     在梦境中相遇，在现实中相识        ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "选择打开方式："
echo ""
echo "1. 打开首页 (index.html)"
echo "2. 打开应用 (app.html)"
echo "3. 启动完整服务器"
echo "4. 退出"
echo ""

read -p "请选择 (1-4): " choice

case $choice in
    1)
        echo "正在打开首页..."
        open index.html
        echo "首页已在浏览器中打开！"
        ;;
    2)
        echo "正在打开应用..."
        open app.html
        echo "应用已在浏览器中打开！"
        ;;
    3)
        echo "启动完整服务器..."
        echo ""
        echo "1. 安装依赖..."
        npm install
        cd client
        npm install
        cd ..
        echo ""
        echo "2. 初始化数据库..."
        npm run init-db
        echo ""
        echo "3. 启动后端服务器 (端口 3001)..."
        npm run dev &
        echo ""
        echo "4. 启动前端应用 (端口 3000)..."
        sleep 3
        npm run client
        echo ""
        echo "服务器已启动！"
        echo "前端: http://localhost:3000"
        echo "后端: http://localhost:3001"
        ;;
    4)
        echo "再见！"
        exit 0
        ;;
    *)
        echo "无效选择，请重试"
        ;;
esac
