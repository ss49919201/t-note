import { drizzle } from "drizzle-orm/d1";
import { Miniflare } from "miniflare";
import * as schema from "./d1/schema";
import * as fs from 'fs';
import * as path from 'path';

const createTablesFromSchema = async (d1Database: any) => {
  // Load all Drizzle-generated migration files in order
  const migrationDir = path.join(__dirname, 'd1/migrations');
  
  if (!fs.existsSync(migrationDir)) {
    throw new Error(`Migration directory not found at ${migrationDir}. Please run 'npx drizzle-kit generate' first.`);
  }

  // Get all SQL migration files sorted by name (which includes timestamp)
  const migrationFiles = fs.readdirSync(migrationDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Drizzle uses sequential naming, so alphabetical sort works

  if (migrationFiles.length === 0) {
    throw new Error(`No migration files found in ${migrationDir}. Please run 'npx drizzle-kit generate' first.`);
  }

  // Apply all migration files in order
  for (const migrationFile of migrationFiles) {
    const migrationPath = path.join(migrationDir, migrationFile);
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    
    // Parse migration file - handle the --> statement-breakpoint format
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt.replace(/;$/, '')); // Remove trailing semicolon

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await d1Database.prepare(statement).run();
        } catch (error: any) {
          // Ignore table/index already exists errors in test environment
          if (!error.message?.includes('already exists') && 
              !error.message?.includes('duplicate column name')) {
            console.error(`Error executing migration ${migrationFile}:`, statement);
            throw error;
          }
        }
      }
    }
  }
};

// Create test database utility
export async function createTestDb() {
  const mf = new Miniflare({
    script: "",
    modules: true,
    d1Databases: ["db"],
  });

  const d1Database = await mf.getD1Database("db");
  const db = drizzle(d1Database, { schema });

  // Create tables from Drizzle-generated migration - no more manual DDL!
  await createTablesFromSchema(d1Database);

  return { db, mf };
}

// Clean all tables
export async function cleanupTables(db: ReturnType<typeof drizzle>) {
  try {
    await db.delete(schema.topic_tags_view);
    await db.delete(schema.posts_view);
    await db.delete(schema.topics_view);
    await db.delete(schema.post_events);
    await db.delete(schema.topic_events);
    await db.delete(schema.tags);
    await db.delete(schema.users);
  } catch (error) {
    // Ignore errors if tables don't exist yet
  }
}