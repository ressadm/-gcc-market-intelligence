import { createSupabaseBrowser } from './supabase-browser'

// Re-export a singleton browser client for backward compatibility with existing hooks.
// This client automatically includes the user's auth session in requests.
export const supabase = createSupabaseBrowser()
