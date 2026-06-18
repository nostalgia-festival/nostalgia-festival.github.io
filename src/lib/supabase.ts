import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { CONFIG } from './config'

// The Supabase client is only created when both the URL and publishable key are
// present. This lets the site build & run locally (and even on GitHub Pages)
// without credentials — logging simply becomes a no-op in that case.
let client: SupabaseClient | null = null

if (CONFIG.supabaseUrl && CONFIG.supabasePublishableKey) {
  client = createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey, {
    auth: { persistSession: false },
  })
}

export const isSupabaseConfigured = client !== null

export interface TicketClick {
  full_name: string
  num_tickets: number
  calculated_price: number
}

/**
 * Logs a ticket-purchase intent to Supabase right before redirecting the user
 * to the payment service. Resolves to true on success, false otherwise.
 *
 * This intentionally never throws — a logging/network failure must NOT block
 * the user from reaching the payment page.
 */
export async function logTicketClick(data: TicketClick): Promise<boolean> {
  if (!client) {
    console.warn('[supabase] not configured — skipping log', data)
    return false
  }

  try {
    const { error } = await client.from('ticket_clicks').insert({
      full_name: data.full_name,
      num_tickets: data.num_tickets,
      calculated_price: data.calculated_price,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    })

    if (error) {
      console.error('[supabase] insert failed', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[supabase] unexpected error', err)
    return false
  }
}
