import mysql from "mysql2/promise";

const PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'opencom_pdm',
  port: PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Custom error type for database errors
export class DatabaseError extends Error {
  status: number;
  originalError?: any;

  constructor(message: string, status: number = 500, originalError?: any) {
    super(message);
    this.name = "DatabaseError";
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Executes a SQL query with optional parameters
 * @param query SQL query string
 * @param params Array of parameters to be used in the query
 * @returns Promise that resolves to the query result
 * @throws DatabaseError on query failure
 */
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  let connection;
  
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    return rows as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw new DatabaseError(
      "Database operation failed", 
      500, 
      error
    );
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Executes a transaction with multiple queries
 * @param queries Array of {query, params} objects to execute in transaction
 * @returns Promise that resolves when transaction completes
 * @throws DatabaseError on transaction failure
 */
export async function executeTransaction(
  queries: Array<{ query: string; params?: any[] }>
): Promise<any[]> {
  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.query(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Transaction error:", error);
    throw new DatabaseError(
      "Transaction failed", 
      500, 
      error
    );
  } finally {
    if (connection) connection.release();
  }
}


// Helper function to safely execute queries
export async function queryDatabase<T>(sql: string, params: any[] = []): Promise<T[]> {
  let connection: mysql.PoolConnection | null = null;
  try {
      connection = await pool.getConnection();
      const [results] = await connection.execute(sql, params);
      // Type assertion needed here as execute can return different result types
      return results as T[];
  } catch (error) {
      console.error("Database query error:", error);
      // Re-throw or handle as needed
      throw new Error("Failed to execute database query.");
  } finally {
      if (connection) {
          connection.release(); // Always release the connection
      }
  }
}


export default pool;