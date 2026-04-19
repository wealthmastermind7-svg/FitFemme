import {
  type InsertUser,
  type InsertWebPurchase,
  type User,
  type WebPurchase,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  upsertWebPurchase(purchase: InsertWebPurchase): Promise<WebPurchase>;
  listWebPurchasesByEmail(email: string): Promise<WebPurchase[]>;
  listAllWebPurchases(limit?: number): Promise<WebPurchase[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private webPurchases: Map<string, WebPurchase>;

  constructor() {
    this.users = new Map();
    this.webPurchases = new Map();
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

  async upsertWebPurchase(p: InsertWebPurchase): Promise<WebPurchase> {
    // Dedupe key: appUserId + productId. A new event for the same pair
    // overwrites status/timestamps so we always reflect the latest state.
    const dedupeKey = `${p.appUserId}::${p.productId}`;
    const existing = Array.from(this.webPurchases.values()).find(
      (row) => `${row.appUserId}::${row.productId}` === dedupeKey,
    );
    const now = new Date();
    // Idempotency / order safety: if the incoming event is older than
    // what we already have (RevenueCat retries can deliver out of
    // order), keep the newer state. event_timestamp_ms travels in raw.
    if (existing && p.raw && (existing.raw as any)?.event_timestamp_ms) {
      const incomingTs = Number((p.raw as any).event_timestamp_ms ?? 0);
      const existingTs = Number(
        (existing.raw as any).event_timestamp_ms ?? 0,
      );
      if (incomingTs && existingTs && incomingTs < existingTs) {
        return existing;
      }
    }
    if (existing) {
      const updated: WebPurchase = {
        ...existing,
        email: p.email ?? existing.email,
        plan: p.plan ?? existing.plan,
        status: p.status ?? existing.status,
        processor: p.processor ?? existing.processor,
        country: p.country ?? existing.country,
        raw: p.raw ?? existing.raw,
        updatedAt: now,
      };
      this.webPurchases.set(existing.id, updated);
      return updated;
    }
    const id = randomUUID();
    const row: WebPurchase = {
      id,
      email: p.email,
      appUserId: p.appUserId,
      productId: p.productId,
      plan: p.plan,
      status: p.status,
      processor: p.processor ?? null,
      country: p.country ?? null,
      raw: p.raw ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.webPurchases.set(id, row);
    return row;
  }

  async listWebPurchasesByEmail(email: string): Promise<WebPurchase[]> {
    const lower = email.trim().toLowerCase();
    return Array.from(this.webPurchases.values()).filter(
      (row) => row.email.toLowerCase() === lower,
    );
  }

  async listAllWebPurchases(limit = 100): Promise<WebPurchase[]> {
    return Array.from(this.webPurchases.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
