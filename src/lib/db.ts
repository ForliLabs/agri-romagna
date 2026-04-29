/**
 * @module db
 * @description Generic in-memory key-value store with async CRUD interface.
 *
 * Used as an ephemeral data layer for demo data, computed caches, and
 * feature-specific seed data. Each store instance operates independently
 * in-memory, keyed by record `id`.
 *
 * For persistent data, use the Prisma-backed {@link module:data-layer | data-layer}.
 *
 * @example
 * ```ts
 * const store = new InMemoryStore<{ id: string; name: string }>();
 * store.seed([{ id: "1", name: "Test" }]);
 * const item = await store.findById("1");
 * ```
 */

export type DbRecord = object;

/**
 * A generic in-memory CRUD store backed by a `Map<string, T>`.
 *
 * All methods are async to match the Prisma client interface, enabling
 * future migration to a real database without API changes.
 *
 * @typeParam T - The record type, must have a string `id` property.
 */
export class InMemoryStore<T extends DbRecord & { id: string }> {
  private data: Map<string, T> = new Map();

  /** Returns all records in insertion order. */
  async findAll(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  /** Finds a record by its unique `id`, or `undefined` if not found. */
  async findById(id: string): Promise<T | undefined> {
    return this.data.get(id);
  }

  /** Inserts or overwrites a record. Returns the stored item. */
  async create(item: T): Promise<T> {
    this.data.set(item.id, item);
    return item;
  }

  /** Merges partial updates into an existing record. Returns `undefined` if not found. */
  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const existing = this.data.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates } as T;
    this.data.set(id, updated);
    return updated;
  }

  /** Deletes a record by ID. Returns `true` if the record existed. */
  async delete(id: string): Promise<boolean> {
    return this.data.delete(id);
  }

  /** Returns all records matching a predicate function. */
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    return Array.from(this.data.values()).filter(predicate);
  }

  /** Returns the total number of stored records. */
  async count(): Promise<number> {
    return this.data.size;
  }

  /** Bulk-loads records into the store. Typically called at module initialization. */
  seed(items: T[]): void {
    items.forEach((item) => this.data.set(item.id, item));
  }
}
