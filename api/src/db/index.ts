import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// 数据库文件放在 api/data 目录
const DB_DIR = join(__dirname, '..', '..', 'data');
const DB_PATH = join(DB_DIR, 'memory.db');

mkdirSync(DB_DIR, { recursive: true });
mkdirSync(join(__dirname, '..', '..', 'uploads'), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化表
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

console.log('[DB] SQLite 已就绪:', DB_PATH);
