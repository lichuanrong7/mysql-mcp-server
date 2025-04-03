#!/bin/bash

# 进入项目目录
cd "$(dirname "$0")"

# 定义日志目录
LOG_DIR="./logs"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
LOG_FILE="$LOG_DIR/mysql-mcp-$TIMESTAMP.log"
PID_FILE="./mysql-mcp.pid"

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    PID=$(cat $PID_FILE)
    if ps -p $PID > /dev/null; then
        echo "MySQL MCP服务已在运行，PID: $PID"
        echo "如需重启，请先运行 ./stop.sh"
        exit 1
    else
        echo "发现旧的PID文件，但进程不存在，将继续启动新进程"
        rm -f $PID_FILE
    fi
fi

# 确保日志目录存在
mkdir -p $LOG_DIR

# 启动服务
echo "正在启动MySQL MCP服务..."
nohup npm start > $LOG_FILE 2>&1 &
PID=$!

# 将PID写入文件
echo $PID > $PID_FILE

# 稍等片刻，检查服务是否真正启动
sleep 3

# 检查进程是否存在
if ps -p $PID > /dev/null; then
    echo "MySQL MCP服务启动成功！"
    echo "PID: $PID"
    echo "日志文件: $LOG_FILE"
    
    # 检查API是否可访问
    sleep 2
    if curl -s http://localhost:3100/manifest.json > /dev/null; then
        echo "API已可访问: http://localhost:3100"
    else
        echo "警告: API似乎无法访问，请检查日志文件"
    fi
else
    echo "启动失败，请检查日志文件: $LOG_FILE"
    exit 1
fi
