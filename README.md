# MySQL MCP服务器

<div align="center">
  <img src="https://www.mysql.com/common/logos/mysql-logo.svg" alt="MySQL Logo" width="180" />
  <h3>MySQL MCP服务</h3>
  <p>为Cursor提供MySQL数据库连接与查询能力的MCP服务</p>
</div>

## 📖 项目介绍

MySQL MCP服务是一个基于Node.js开发的API服务，为Cursor AI提供直接访问MySQL数据库的能力。该服务遵循MCP（Model Control Platform）协议规范，使AI能够通过标准化接口执行SQL查询、获取表结构信息，以及执行数据操作。

## ✨ 功能特性

- **SQL查询执行**：支持执行各种SQL语句（SELECT, INSERT, UPDATE, DELETE等）
- **表结构查询**：获取数据库表的详细结构信息
- **实时数据访问**：为AI提供实时数据库访问能力
- **安全连接**：支持通过环境变量配置数据库连接参数
- **跨域支持**：内置CORS支持，便于前端应用集成
- **标准化响应**：统一的API响应格式，简化集成和使用
- **MCP协议支持**：完整实现MCP协议，方便与Cursor AI集成

## 🔧 技术栈

- **运行环境**：Node.js
- **主要框架**：Express.js
- **数据库驱动**：mysql2
- **环境变量**：dotenv
- **跨域支持**：cors

## 🚀 安装与部署

### 前置条件

- Node.js 14.x 或更高版本
- MySQL数据库可连接
- Git（可选，用于克隆代码）

### 安装步骤

1. **克隆代码仓库**

```bash
git clone https://github.com/lichuanrong7/mysql-mcp-server.git
cd mysql-mcp-server
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建或编辑 `.env` 文件，添加以下配置：

```
# 服务器配置
PORT=3100

# 数据库配置
DB_HOST=你的数据库地址
DB_PORT=3306
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=你的数据库名称
```

4. **启动服务**

```bash
# 开发模式启动
npm run dev

# 生产模式启动
npm start
```

### 使用启动脚本

项目提供了便捷的启动和停止脚本：

- **启动服务**：
  ```bash
  ./start.sh
  ```

- **停止服务**：
  ```bash
  ./stop.sh
  ```

### Docker部署

1. **构建Docker镜像**

```bash
docker build -t mysql-mcp-server .
```

2. **使用Docker Compose启动**

```bash
docker-compose up -d
```

## 📝 API文档

### 主要端点

- **MCP清单**: `/manifest.json`
- **OpenAPI规范**: `/openapi.yaml`
- **SQL查询**: `/api/mysql/query`
- **表结构查询**: `/api/mysql/schema`
- **DDL查询**: `/api/mysql/ddl`

### 示例请求

**执行SQL查询**:
```bash
curl -X POST http://localhost:3100/api/mysql/query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT * FROM users LIMIT 10"}'
```

**获取表结构**:
```bash
curl -X GET http://localhost:3100/api/mysql/schema?table=users
```

## 🔌 在Cursor中使用

1. 打开Cursor编辑器
2. 进入MCP扩展管理界面
3. 添加新的MCP服务
4. 输入服务URL: `http://localhost:3100/manifest.json`
5. 保存并激活服务

MCP服务激活后，你可以在Cursor中使用自然语言操作数据库：
- "查询用户表的前10条记录"
- "获取产品表的结构"
- "统计每个订单状态的订单数量"

## 🔍 故障排除

1. **服务无法启动**
   - 检查端口是否被占用: `lsof -i :3100`
   - 确认Node.js版本是否兼容
   - 检查日志文件: `./logs/mysql-mcp-*.log`

2. **数据库连接失败**
   - 验证数据库连接信息是否正确
   - 确认数据库服务是否在运行
   - 检查网络连接和防火墙设置

3. **API请求失败**
   - 确认服务是否正常运行: `curl http://localhost:3100/manifest.json`
   - 检查请求格式是否正确
   - 查看服务器日志以获取详细错误信息

## 📄 许可证

本项目使用 MIT 许可证 - 详细信息请查看 [LICENSE](LICENSE) 文件

## 👥 贡献指南

欢迎提交问题和贡献代码。请确保遵循以下步骤：

1. Fork该仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request
