import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid format (not placeholder)
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

// Fallback dummy client if not configured so imports don't crash
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Test the active connection to Supabase
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase credentials not configured or incomplete in .env'
    };
  }

  try {
    const { data, error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, it's connected to Supabase but schema is missing
      if (error.code === '42P01') {
        return {
          connected: true,
          schemaMissing: true,
          message: 'Connected to Supabase! However, database tables have not been created yet. Run the schema.sql in your Supabase SQL editor.'
        };
      }
      return {
        connected: false,
        message: `Database error: ${error.message}`
      };
    }
    return {
      connected: true,
      schemaMissing: false,
      message: 'Successfully connected to Supabase database!'
    };
  } catch (err) {
    return {
      connected: false,
      message: `Connection failed: ${err.message}`
    };
  }
}
