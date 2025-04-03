import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from 'mysql2/promise';
import { executeQuery } from './mysql-service.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

// 创建MySQL连接池
export const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 中间件
app.use(cors());
app.use(express.json());

// 定义SQL查询模板
const SQL_TEMPLATES = {
  TABLE_SCHEMA: `
    SELECT 
      COLUMN_NAME, 
      COLUMN_TYPE, 
      IS_NULLABLE, 
      COLUMN_KEY, 
      COLUMN_DEFAULT, 
      EXTRA, 
      COLUMN_COMMENT
    FROM 
      INFORMATION_SCHEMA.COLUMNS 
    WHERE 
      TABLE_SCHEMA = ? AND TABLE_NAME = ?
    ORDER BY 
      ORDINAL_POSITION
  `,
  ALL_TABLES: `
    SELECT 
      TABLE_NAME, 
      TABLE_TYPE, 
      ENGINE, 
      TABLE_ROWS,
      CREATE_TIME, 
      TABLE_COMMENT
    FROM 
      INFORMATION_SCHEMA.TABLES
    WHERE 
      TABLE_SCHEMA = ?
    ORDER BY 
      TABLE_NAME
  `
};

// 错误处理中间件
const errorHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error('操作错误:', error);
    res.status(500).json({ error: error.message });
  }
};

// MCP工具定义
const tools = [
  {
    name: 'mysql_query',
    description: '执行MySQL查询语句并返回结果',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL查询语句'
        },
        params: {
          type: 'array',
          description: '查询参数',
          items: {
            type: 'string'
          }
        }
      },
      required: ['query']
    }
  },
  {
    name: 'mysql_schema',
    description: '获取数据库表结构信息',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: '表名，如果不提供则返回所有表'
        }
      }
    }
  },
  {
    name: 'mysql_ddl',
    description: '获取表的DDL语句',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: '表名'
        }
      },
      required: ['table']
    }
  }
];

// MCP 清单端点
app.get('/manifest.json', (req, res) => {
  res.json({
    schema_version: 'v1',
    name_for_human: 'MySQL MCP服务器',
    name_for_model: 'mysql_mcp_server',
    description_for_human: '连接到本地MySQL数据库的工具',
    description_for_model: '这个工具允许你连接到本地MySQL数据库，执行查询，获取表结构等',
    auth: {
      type: 'none'
    },
    api: {
      type: 'openapi',
      url: `http://localhost:${PORT}/openapi.yaml`
    },
    logo_url: 'https://www.mysql.com/common/logos/mysql-logo.svg',
    contact_email: 'support@example.com',
    legal_info_url: 'https://example.com/legal'
  });
});

// OpenAPI 规范端点
app.get('/openapi.yaml', (req, res) => {
  res.type('text/yaml').send(`
openapi: 3.0.0
info:
  title: MySQL MCP API
  description: 用于与MySQL数据库交互的API
  version: 1.0.0
servers:
  - url: http://localhost:${PORT}
paths:
  /api/mysql/query:
    post:
      operationId: mysql_query
      summary: 执行MySQL查询
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - query
              properties:
                query:
                  type: string
                  description: SQL查询语句
                params:
                  type: array
                  description: 查询参数
                  items:
                    type: string
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: object
  /api/mysql/schema:
    get:
      operationId: mysql_schema
      summary: 获取数据库表结构
      parameters:
        - name: table
          in: query
          description: 表名
          required: false
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
  /api/mysql/ddl:
    get:
      operationId: mysql_ddl
      summary: 获取表的DDL
      parameters:
        - name: table
          in: query
          description: 表名
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
`);
});

// API路由
app.post('/api/mysql/query', errorHandler(async (req, res) => {
  const { query, params = [] } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: '缺少查询语句' });
  }
  
  const result = await executeQuery(query, params);
  res.json({ result });
}));

app.get('/api/mysql/schema', errorHandler(async (req, res) => {
  const { table } = req.query;
  
  if (table) {
    // 获取特定表结构
    const [result] = await pool.query(
      SQL_TEMPLATES.TABLE_SCHEMA,
      [process.env.DB_NAME || '', table]
    );
    res.json({ schema: result });
  } else {
    // 获取所有表信息
    const [result] = await pool.query(
      SQL_TEMPLATES.ALL_TABLES,
      [process.env.DB_NAME || '']
    );
    res.json({ tables: result });
  }
}));

app.get('/api/mysql/ddl', errorHandler(async (req, res) => {
  const { table } = req.query;
  
  if (!table) {
    return res.status(400).json({ error: '缺少表名参数' });
  }
  
  const query = `SHOW CREATE TABLE ${table}`;
  const [result] = await pool.query(query);
  
  if (result && result.length > 0) {
    res.json({ ddl: result[0]['Create Table'] });
  } else {
    res.status(404).json({ error: '表不存在' });
  }
}));

// 启动服务器
app.listen(PORT, () => {
  console.log(`MySQL MCP服务器运行在 http://localhost:${PORT}`);
  console.log(`清单: http://localhost:${PORT}/manifest.json`);
  console.log(`OpenAPI: http://localhost:${PORT}/openapi.yaml`);
});