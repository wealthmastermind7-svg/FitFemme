import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Startup bootstrap: ensure the LATAM web_purchases table exists in
// fresh deployments without requiring an out-of-band `drizzle-kit
// push`. Idempotent — does nothing on subsequent boots. RevenueCat is
// still the source of truth for entitlements, but the webhook needs
// somewhere to land for support visibility.
let bootstrapPromise: Promise<void> | null = null;
export function ensureWebCheckoutSchema(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS web_purchases (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          email text NOT NULL,
          app_user_id text NOT NULL,
          product_id text NOT NULL,
          plan text NOT NULL,
          status text NOT NULL,
          processor text,
          country text,
          event_timestamp_ms bigint,
          raw jsonb,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS web_purchases_app_user_product_uniq
        ON web_purchases (app_user_id, product_id)
      `);
    })().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}
