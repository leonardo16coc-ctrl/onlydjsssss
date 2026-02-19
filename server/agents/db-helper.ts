/**
 * Database helper for Agent System
 * Provides simple query interface for agents
 */

import mysql from 'mysql2/promise';

let connectionPool: mysql.Pool | null = null;

/**
 * Get or create database connection pool
 */
function getPool(): mysql.Pool {
  if (!connectionPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    connectionPool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  
  return connectionPool;
}

/**
 * Execute a SQL query
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

/**
 * Execute a SQL query and return the first row
 */
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Close the database connection pool
 */
export async function closePool(): Promise<void> {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}

/**
 * Database helper object
 */
export const db = {
  query,
  queryOne,
  close: closePool
};
