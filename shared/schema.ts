import { sql } from "drizzle-orm";
import {
  bigint,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Web purchases recorded from RevenueCat webhooks for the LATAM web
// checkout (Pix / OXXO / cards). RevenueCat remains the source of truth
// for entitlements; this table is for support visibility only.
export const webPurchases = pgTable(
  "web_purchases",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    appUserId: text("app_user_id").notNull(),
    productId: text("product_id").notNull(),
    plan: text("plan").notNull(),
    status: text("status").notNull(),
    processor: text("processor"),
    country: text("country"),
    eventTimestampMs: bigint("event_timestamp_ms", { mode: "number" }),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  },
  (table) => ({
    appUserProductUnique: uniqueIndex("web_purchases_app_user_product_uniq").on(
      table.appUserId,
      table.productId,
    ),
  }),
);

export type WebPurchase = typeof webPurchases.$inferSelect;
export type InsertWebPurchase = typeof webPurchases.$inferInsert;
