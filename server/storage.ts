import { desc, eq, sql } from "drizzle-orm";
import {
  type InsertUser,
  type InsertWebPurchase,
  type User,
  type WebPurchase,
  webPurchases,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  upsertWebPurchase(purchase: InsertWebPurchase): Promise<WebPurchase>;
  listWebPurchasesByEmail(email: string): Promise<WebPurchase[]>;
  listAllWebPurchases(limit?: number): Promise<WebPurchase[]>;
}

export class MemStorage implements IStorage {
  // Users remain in-memory (existing behavior; not part of LATAM scope).
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Web purchases are persisted to PostgreSQL via Drizzle. The unique
  // index on (app_user_id, product_id) gives us idempotency: repeated
  // RevenueCat webhook deliveries collapse to one row, and the
  // event_timestamp_ms guard prevents out-of-order events from
  // overwriting newer state. RevenueCat remains the source of truth for
  // entitlements; this table is purely for support visibility.
  async upsertWebPurchase(p: InsertWebPurchase): Promise<WebPurchase> {
    const incomingTs = p.eventTimestampMs ?? null;
    const [row] = await db
      .insert(webPurchases)
      .values(p)
      .onConflictDoUpdate({
        target: [webPurchases.appUserId, webPurchases.productId],
        set: {
          email: sql`excluded.email`,
          plan: sql`excluded.plan`,
          status: sql`excluded.status`,
          processor: sql`excluded.processor`,
          country: sql`excluded.country`,
          eventTimestampMs: sql`excluded.event_timestamp_ms`,
          raw: sql`excluded.raw`,
          updatedAt: sql`now()`,
        },
        // Skip the update entirely when an older event arrives after a
        // newer one (RevenueCat retries can deliver out of order).
        setWhere: incomingTs
          ? sql`${webPurchases.eventTimestampMs} IS NULL OR ${webPurchases.eventTimestampMs} <= ${incomingTs}`
          : undefined,
      })
      .returning();
    return row;
  }

  async listWebPurchasesByEmail(email: string): Promise<WebPurchase[]> {
    const lower = email.trim().toLowerCase();
    return db
      .select()
      .from(webPurchases)
      .where(eq(sql`lower(${webPurchases.email})`, lower));
  }

  async listAllWebPurchases(limit = 100): Promise<WebPurchase[]> {
    return db
      .select()
      .from(webPurchases)
      .orderBy(desc(webPurchases.updatedAt))
      .limit(limit);
  }
}

export const storage = new MemStorage();
