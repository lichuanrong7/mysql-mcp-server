import { pool } from './index.js';

/**
 * 执行MySQL查询
 * @param {string} query SQL查询语句
 * @param {Array} params 查询参数
 * @returns {Promise<Object>} 查询结果
 */
export async function executeQuery(query, params = []) {
  try {
    // 检查查询类型
    const queryType = getQueryType(query);
    
    // 执行查询
    const [results, fields] = await pool.query(query, params);
    
    return {
      type: queryType,
      affectedRows: results.affectedRows,
      insertId: results.insertId,
      data: Array.isArray(results) ? results : [],
      fields: fields ? getFieldInfo(fields) : [],
      message: results.message || ''
    };
  } catch (error) {
    console.error('MySQL查询错误:', error);
    throw error;
  }
}

/**
 * 获取查询类型
 * @param {string} query SQL查询语句
 * @returns {string} 查询类型
 */
function getQueryType(query) {
  const trimmedQuery = query.trim().toUpperCase();
  
  // 使用Map优化多重if判断
  const queryTypes = new Map([
    ['SELECT', 'SELECT'],
    ['INSERT', 'INSERT'],
    ['UPDATE', 'UPDATE'],
    ['DELETE', 'DELETE'],
    ['CREATE', 'CREATE'],
    ['ALTER', 'ALTER'],
    ['DROP', 'DROP'],
    ['SHOW', 'SHOW'],
    ['DESCRIBE', 'DESCRIBE'],
    ['DESC', 'DESCRIBE'],
    ['EXPLAIN', 'EXPLAIN']
  ]);
  
  // 遍历所有可能的查询类型前缀
  for (const [prefix, type] of queryTypes.entries()) {
    if (trimmedQuery.startsWith(prefix)) {
      return type;
    }
  }
  
  return 'UNKNOWN';
}

/**
 * 获取字段信息
 * @param {Array} fields 字段元数据
 * @returns {Array} 处理后的字段信息
 */
function getFieldInfo(fields) {
  if (!fields || !Array.isArray(fields)) return [];
  
  // 使用对象解构简化代码
  return fields.map(({ name, type, length, table, db }) => ({
    name,
    type,
    length,
    table,
    db
  }));
}
