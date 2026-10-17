import { filterArray, mapArray } from "./array-helpers";
import { getTodo } from "./todo-crud";
export class InMemoryRepository<T extends { id: number }> {
  // private storage
  private items: T[] = [];

  add(entity: T): T {
    if (entity === null || entity === undefined) {
      throw new TypeError("Entity cannot be null or undefined");
    }
    for (let item of this.items) {
      if (item.id === entity.id) {
        throw new Error(`Object with id = ${entity.id} is already exist`);
      }
    }
    this.items.push(entity);
    return entity;
  }

  update(id: number, patch: Partial<T>): T {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`Object with id = ${id} not found`);
    this.items = mapArray(this.items, (item) => (item.id === id ? { ...item, ...patch } : item));

    return this.items[index];
  }

  remove(id: number): void {
    let isIdFound = false;
    for (let item of this.items) {
      if (item.id === id) {
        isIdFound = true;
      }
    }
    if (!isIdFound) throw new Error(`Object with id = ${id} not found`);
    this.items = filterArray(this.items, (item) => item.id !== id);
  }

  findById(id: number): T | undefined {
    for (const item of this.items) {
      if (item.id === id) return item;
    }
    return undefined;
  }

  findAll(): T[] {
    return [...this.items];
  }
}
