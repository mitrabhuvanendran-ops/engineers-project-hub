import { supabase, isSupabaseConfigured } from './supabase';
import { DEFAULT_FAQS, DEFAULT_ERROR_CODES } from '../constants/faqAndErrors';
import { requestLogger } from './requestLogger';

/**
 * Fetch FAQs from SQL database with local fallback
 */
export async function getFaqs() {
  const start = performance.now();
  if (!isSupabaseConfigured || !supabase) {
    return { data: DEFAULT_FAQS, source: 'local_sql_seed' };
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('created_at', { ascending: true });

    const duration = performance.now() - start;
    requestLogger.log({
      method: 'SELECT',
      url: 'supabase:public.faqs',
      status: error ? 500 : 200,
      durationMs: duration,
      source: 'Supabase PostgreSQL',
      error
    });

    if (error || !data || data.length === 0) {
      return { data: DEFAULT_FAQS, source: 'fallback_seed' };
    }

    return { data, source: 'supabase_postgres' };
  } catch (err) {
    return { data: DEFAULT_FAQS, source: 'fallback_seed' };
  }
}

/**
 * Fetch Error Codes from SQL database with local fallback
 */
export async function getErrorCodes() {
  const start = performance.now();
  if (!isSupabaseConfigured || !supabase) {
    return { data: DEFAULT_ERROR_CODES, source: 'local_sql_seed' };
  }

  try {
    const { data, error } = await supabase
      .from('error_codes')
      .select('*')
      .order('code', { ascending: true });

    const duration = performance.now() - start;
    requestLogger.log({
      method: 'SELECT',
      url: 'supabase:public.error_codes',
      status: error ? 500 : 200,
      durationMs: duration,
      source: 'Supabase PostgreSQL',
      error
    });

    if (error || !data || data.length === 0) {
      return { data: DEFAULT_ERROR_CODES, source: 'fallback_seed' };
    }

    return { data, source: 'supabase_postgres' };
  } catch (err) {
    return { data: DEFAULT_ERROR_CODES, source: 'fallback_seed' };
  }
}

/**
 * Submit Support Ticket to SQL database
 */
export async function submitSupportTicket({ userEmail, subject, description, errorCode, userId }) {
  const start = performance.now();
  const ticketPayload = {
    user_email: userEmail.trim(),
    subject: subject.trim(),
    description: description.trim(),
    error_code: errorCode ? parseInt(errorCode, 10) : null,
    user_id: userId || null,
    status: 'Open'
  };

  if (!isSupabaseConfigured || !supabase) {
    // Local persistence
    const localTicket = {
      id: 'ticket-' + Date.now(),
      ...ticketPayload,
      created_at: new Date().toISOString()
    };
    try {
      const stored = JSON.parse(localStorage.getItem('hub_support_tickets') || '[]');
      stored.unshift(localTicket);
      localStorage.setItem('hub_support_tickets', JSON.stringify(stored));
    } catch (e) {
      // Ignore quota
    }
    return { success: true, data: localTicket, source: 'local_storage' };
  }

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([ticketPayload])
      .select()
      .single();

    const duration = performance.now() - start;
    requestLogger.log({
      method: 'INSERT',
      url: 'supabase:public.support_tickets',
      status: error ? 500 : 201,
      durationMs: duration,
      source: 'Supabase PostgreSQL',
      error
    });

    if (error) throw error;
    return { success: true, data, source: 'supabase_postgres' };
  } catch (err) {
    console.error('Error saving support ticket to SQL:', err);
    // Fallback save to local storage so user doesn't lose ticket
    const localTicket = {
      id: 'ticket-' + Date.now(),
      ...ticketPayload,
      created_at: new Date().toISOString()
    };
    const stored = JSON.parse(localStorage.getItem('hub_support_tickets') || '[]');
    stored.unshift(localTicket);
    localStorage.setItem('hub_support_tickets', JSON.stringify(stored));
    return { success: true, data: localTicket, source: 'fallback_local' };
  }
}

/**
 * Fetch Support Tickets for user or current browser
 */
export async function getSupportTickets(userId = null) {
  if (!isSupabaseConfigured || !supabase) {
    try {
      return JSON.parse(localStorage.getItem('hub_support_tickets') || '[]');
    } catch (e) {
      return [];
    }
  }

  try {
    let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem('hub_support_tickets') || '[]');
    } catch (e) {
      return [];
    }
  }
}
