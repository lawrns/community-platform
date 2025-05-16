/**
 * Supabase Utility Functions
 * Provides helper functions for interacting with Supabase
 */
import { supabase, supabaseAdmin } from '../config/supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Generic database query interface
 */
export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  status: number;
}

/**
 * Executes a query with error handling
 * @param queryFn - Function that performs the actual database query 
 * @returns Query result with data, error, and status
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<QueryResult<T>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      return {
        data: null,
        error,
        status: error.code === '23505' ? 409 : 400,
      };
    }
    
    return {
      data,
      error: null,
      status: 200,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
      status: 500,
    };
  }
}

/**
 * Generic function to fetch a record by ID from any table
 * @param table - Table name
 * @param id - Record ID
 * @returns Query result with the record or error
 */
export async function getById<T>(table: string, id: string): Promise<QueryResult<T>> {
  return executeQuery<T>(async () => {
    const result = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    return result;
  });
}

/**
 * Generic function to fetch multiple records from any table
 * @param table - Table name
 * @param options - Query options (limit, offset, ordering)
 * @returns Query result with records or error
 */
export async function getMany<T>(
  table: string, 
  options: { 
    limit?: number; 
    offset?: number; 
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}
): Promise<QueryResult<T[]>> {
  const { 
    limit = 10, 
    offset = 0, 
    orderBy = 'created_at', 
    orderDirection = 'desc',
    filters = {}
  } = options;

  let query = supabase
    .from(table)
    .select('*')
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1);
  
  // Apply any filters
  Object.entries(filters).forEach(([column, value]) => {
    if (Array.isArray(value)) {
      query = query.in(column, value);
    } else {
      query = query.eq(column, value);
    }
  });

  return executeQuery<T[]>(async () => {
    const result = await query;
    return result;
  });
}

/**
 * Generic function to insert a record into any table
 * @param table - Table name
 * @param data - Record data to insert
 * @returns Query result with the inserted record or error
 */
export async function create<T>(table: string, data: Partial<T>): Promise<QueryResult<T>> {
  return executeQuery<T>(async () => {
    const result = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    return result;
  });
}

/**
 * Generic function to update a record in any table
 * @param table - Table name
 * @param id - Record ID
 * @param data - Record data to update
 * @returns Query result with the updated record or error
 */
export async function update<T>(
  table: string, 
  id: string, 
  data: Partial<T>
): Promise<QueryResult<T>> {
  return executeQuery<T>(async () => {
    const result = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    return result;
  });
}

/**
 * Generic function to delete a record from any table
 * @param table - Table name
 * @param id - Record ID
 * @returns Query result with success status or error
 */
export async function remove<T>(table: string, id: string): Promise<QueryResult<T>> {
  return executeQuery<T>(async () => {
    const result = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select()
      .single();
    return result;
  });
}

/**
 * Function to perform a raw query (for advanced cases)
 * Note: Requires service role key with elevated permissions
 * @param query - SQL query string
 * @param params - Query parameters
 * @returns Query result with data or error
 */
export async function rawQuery<T>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  return executeQuery<T>(async () => {
    const result = await supabaseAdmin.rpc('exec_sql', { query, params });
    return result;
  });
}

/**
 * Function to perform a full-text search on a table
 * Note: Requires appropriate text search indexes in Supabase
 * @param table - Table name
 * @param column - Column to search
 * @param query - Search query
 * @param options - Query options (limit, offset)
 * @returns Query result with matching records or error
 */
export async function textSearch<T>(
  table: string,
  column: string,
  query: string,
  options: { limit?: number; offset?: number } = {}
): Promise<QueryResult<T[]>> {
  const { limit = 10, offset = 0 } = options;
  
  return executeQuery<T[]>(async () => {
    const result = await supabase
      .from(table)
      .select('*')
      .textSearch(column, query)
      .range(offset, offset + limit - 1);
    return result;
  });
}