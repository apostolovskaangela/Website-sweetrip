import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import schemaSQL from './schema.sql';
import seedDataSQL from './seed-data.sql';

const DB_NAME = 'mda_app.db';

/**
 * Initialize SQLite database for React Native
 * This handles creating tables and seeding initial data
 */
export class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize the database
   * Run this once when the app starts
   */
  async initialize(): Promise<void> {
    try {
      // Open or create database
      this.db = await SQLite.openDatabaseAsync(DB_NAME);

      // Create tables
      await this.createTables();

      // Seed initial data (only if tables are empty)
      await this.seedDatabase();

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Create database tables from schema
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const statements = schemaSQL.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await this.db.execAsync(statement);
      }
    }

    console.log('Tables created successfully');
  }

  /**
   * Seed database with initial data
   */
  private async seedDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Check if data already exists
      const result = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM roles');
      if (result && (result as any).count > 0) {
        console.log('Database already seeded');
        return;
      }

      // Execute seed statements
      const statements = seedDataSQL.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await this.db.execAsync(statement);
        }
      }

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      // Don't throw - database might have existing data
    }
  }

  /**
   * Get database connection
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      'model_has_permissions',
      'model_has_roles',
      'role_has_permissions',
      'trip_stops',
      'trips',
      'vehicles',
      'users',
      'permissions',
      'roles',
    ];

    for (const table of tables) {
      await this.db.execAsync(`DELETE FROM ${table}`);
    }

    console.log('All data cleared');
  }

  /**
   * Reset database (drop and recreate)
   */
  async reset(): Promise<void> {
    await this.close();

    try {
      const path = `${FileSystem.documentDirectory}${DB_NAME}`;
      await FileSystem.deleteAsync(path, { idempotent: true });
      console.log('Database file deleted');
    } catch (error) {
      console.error('Error deleting database file:', error);
    }

    await this.initialize();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

/**
 * Initialize database hook for React applications
 * Usage in App.tsx or root component:
 *
 * import { useEffect } from 'react';
 * import { databaseService } from './sqlite/init';
 *
 * export default function App() {
 *   useEffect(() => {
 *     databaseService.initialize().catch(console.error);
 *   }, []);
 *
 *   return (...);
 * }
 */
