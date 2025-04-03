#!/bin/bash

# 进入项目目录
cd "$(dirname "$0")"

# 检查是否有PID文件
if [ -f "./mysql-mcp.pid" ]; then
    PID=$(cat ./mysql-mcp.pid)
    
    # 检查进程是否存在
    if ps -p $PID > /dev/null; then
        echo "正在停止MySQL MCP服务，进程ID: $PID"
        kill $PID
        sleep 2
        
        # 再次检查进程是否已停止
        if ps -p $PID > /dev/null; then
            echo "服务没有立即响应，尝试强制终止..."
            kill -9 $PID
            sleep 1
        fi
        
        # 最终检查
        if ps -p $PID > /dev/null; then
            echo "无法停止服务，请手动终止进程: kill -9 $PID"
            exit 1
        else
            echo "MySQL MCP服务已成功停止"
            rm -f ./mysql-mcp.pid
        fi
    else
        echo "MySQL MCP服务已不在运行"
        rm -f ./mysql-mcp.pid
    fi
else
    # 尝试根据进程名查找
    PID=$(pgrep -f "node src/index.js" || echo "")
    if [ -n "$PID" ]; then
        echo "找到MySQL MCP服务进程ID: $PID，正在停止..."
        kill $PID
        sleep 2
        
        # 检查是否已停止
        if ps -p $PID > /dev/null; then
            echo "服务没有立即响应，尝试强制终止..."
            kill -9 $PID
            sleep 1
            echo "MySQL MCP服务已停止"
        else
            echo "MySQL MCP服务已成功停止"
        fi
    else
        echo "未找到运行中的MySQL MCP服务"
    fi
fi 