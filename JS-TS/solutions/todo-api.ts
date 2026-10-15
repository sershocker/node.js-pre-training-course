import { InMemoryRepository } from "./repository";
import { addTodo, getTodo, updateTodo, removeTodo } from "./todo-crud";
import { createTodo } from "./todo-factory";
import { Todo, NewTodo } from "./types";

class TodoNotFoundError extends Error {
  constructor(id: number) {
    super(`Todo with id ${id} not found`);
    this.name = "TodoNotFoundError";
  }
}

export class TodoApi {
  //private repo = new InMemoryRepository<Todo>();
  private repo: Todo[] = [];

  private static async delay(): Promise<void> {
    const ms = Math.floor(Math.random() * 300 + 300);
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async getAll(): Promise<Todo[]> {
    await TodoApi.delay();
    return [...this.repo];
  }

  async add(newTodo: NewTodo): Promise<Todo> {
    await TodoApi.delay();
    const todo = createTodo(newTodo);
    this.repo = addTodo(this.repo, todo);
    return todo;
  }

  async update(id: number, update: Partial<Omit<Todo, "id" | "createdAt">>): Promise<Todo> {
    await TodoApi.delay();
    try {
      this.repo = updateTodo(this.repo, id, update);
      const index = this.repo.findIndex((item) => item.id === id);
      return this.repo[index];
    } catch {
      throw new TodoNotFoundError(id);
    }
  }

  async remove(id: number): Promise<void> {
    await TodoApi.delay();
    try {
      this.repo = removeTodo(this.repo, id);
    } catch {
      throw new TodoNotFoundError(id);
    }
  }
}
