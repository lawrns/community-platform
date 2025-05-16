/**
 * Database Configuration
 * Sets up and manages database connections with support for both
 * direct PostgreSQL connections and Supabase client
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import env, { config } from './environment';
import { supabase, supabaseAdmin } from './supabase';
import { executeQuery } from '../utils/supabaseUtils';

// Define a compatible query result type
export interface DatabaseQueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

// Determine if we should use Supabase
const useSupabase = !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY;

// Create a connection pool for direct PostgreSQL access
// This is used as a fallback or for operations not supported by Supabase client
const pool = !useSupabase ? new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  // Set max connections based on environment
  max: env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}) : null;

// Log connection events
if (pool) {
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err);
  });
}

/**
 * Get a client from the connection pool
 */
async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Direct PostgreSQL connections are not configured. Using Supabase instead.');
  }
  
  const client = await pool.connect();
  
  // Add query logging in development
  if (env.NODE_ENV === 'development') {
    const originalQuery = client.query;
    // We need to be creative with the type definition to avoid TypeScript errors
    // while still preserving the functionality
    const queryWrapper = function(this: any, ...args: any[]) {
      if (args.length > 0 && typeof args[0] === 'string') {
        console.log('QUERY:', args[0]);
      } else if (args.length > 0 && typeof args[0] === 'object' && args[0].text) {
        console.log('QUERY:', args[0].text);
      }
      // Using any type to bypass strict type checking
      return (originalQuery as any).apply(this, args);
    };
    
    // Use type assertion to avoid TypeScript errors
    client.query = queryWrapper as typeof client.query;
  }
  
  return client;
}

/**
 * Execute a query and return the result
 * Will use Supabase if configured, otherwise falls back to direct PostgreSQL
 */
async function query<T = any>(text: string, params: any[] = []): Promise<DatabaseQueryResult<T>> {
  const start = Date.now();
  
  let result: DatabaseQueryResult<T>;
  
  if (useSupabase) {
    // Use Supabase for the query
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      query: text, 
      params: params 
    });
    
    if (error) throw error;
    result = { rows: data || [], rowCount: data?.length || 0 };
  } else {
    // Use direct PostgreSQL connection
    // Need to use any to bypass the strict type checking
    const pgResult = await (pool!.query as any)(text, params);
    result = { 
      rows: pgResult.rows, 
      rowCount: pgResult.rowCount || 0 
    };
  }
  
  const duration = Date.now() - start;
  
  // Log query performance in development
  if (env.NODE_ENV === 'development') {
    console.log('Executed query', { text, duration, rows: result.rowCount });
  }
  
  return result;
}

/**
 * Execute a query within a transaction
 * Note: For Supabase, this requires PostgreSQL function calls
 */
async function transaction<T>(callback: (client: PoolClient | typeof supabaseAdmin) => Promise<T>): Promise<T> {
  if (useSupabase) {
    // Start a transaction using Supabase RPC
    await supabaseAdmin.rpc('begin_transaction');
    
    try {
      // Execute the callback with the supabase client
      const result = await callback(supabaseAdmin);
      
      // Commit the transaction
      await supabaseAdmin.rpc('commit_transaction');
      
      return result;
    } catch (e) {
      // Rollback on error
      await supabaseAdmin.rpc('rollback_transaction');
      throw e;
    }
  } else {
    // Use direct PostgreSQL connection for transaction
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

/**
 * Initialize database and vector extension (if enabled)
 */
async function initialize() {
  try {
    if (useSupabase) {
      console.log('Using Supabase for database access');
      
      // Check connection by executing a simple query
      const { data, error } = await supabase.from('_metadata').select('version').maybeSingle();
      
      if (error) {
        console.error('Failed to connect to Supabase:', error);
        throw error;
      }
      
      console.log('Connected to Supabase successfully');
    } else {
      const client = await getClient();
      
      try {
        // Check for pgvector extension if vector search is enabled
        if (env.VECTOR_SEARCH_ENABLED) {
          await client.query(`
            CREATE EXTENSION IF NOT EXISTS vector;
          `);
          console.log('Vector extension initialized');
        }
      } finally {
        client.release();
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Shut down database connections
 */
async function close() {
  if (pool) {
    await pool.end();
    console.log('Database connections closed');
  }
}

// Export Supabase client if it's being used
export { supabase, supabaseAdmin, executeQuery };

export default {
  query,
  getClient,
  transaction,
  initialize,
  close,
  supabase: useSupabase ? supabase : null,
  supabaseAdmin: useSupabase ? supabaseAdmin : null,
};