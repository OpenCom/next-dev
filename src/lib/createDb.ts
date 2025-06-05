import fs from 'fs';
import path from 'path';
import { executeTransaction } from './db';

export function createDatabase(databaseName: string) {
    const query = `CREATE DATABASE IF NOT EXISTS ${databaseName}; USE ${databaseName};`;
  
    // import DB.sql and DB.mockdata.sql
    const dbSql = fs.readFileSync(path.join(__dirname, 'DB.sql'), 'utf8');
    const mockdataSql = fs.readFileSync(path.join(__dirname, 'DB.mockdata.sql'), 'utf8');

    const queries = [
        { query: query },
        { query: dbSql },
        { query: mockdataSql }
    ];
  
    return executeTransaction(queries);
}