import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./lib/sb/database.types";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient<Database>;
      safeGetSession: () => Promise<
        { session: Session | null; user: User | null }
      >;
      session: Session | null;
      user: User | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
