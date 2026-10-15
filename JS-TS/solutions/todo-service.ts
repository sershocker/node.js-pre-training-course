import { TodoApi } from "./todo-api";
import { createTodo } from "./todo-factory";
import { NewTodo, Todo, TodoStatus } from "./types";

export class TodoService {
  constructor(private readonly api: TodoApi) {}

  async create(title: string, description = ""): Promise<Todo> {
    return await this.api.add({ title, description });
  }

  async toggleStatus(id: number): Promise<Todo> {
    const todoElem = (await this.api.getAll()).find((item) => item.id === id);
    if (!todoElem) throw new Error(`Object with id = ${id} not found`);
    const todoStatus = todoElem.status === TodoStatus.COMPLETED;

    if (todoStatus) {
      return await this.api.update(id, { status: TodoStatus.PENDING });
    } else {
      return await this.api.update(id, { status: TodoStatus.COMPLETED });
    }
  }

  async search(keyword: string): Promise<Todo[]> {
    const answer: Todo[] = [];
    const word = keyword.toLowerCase();
    const items = await this.api.getAll();
    for (const item of items) {
      if (item.title.toLowerCase().includes(word)) {
        answer.push(item);
        continue;
      }
      if (item.description) {
        if (item.description.toLowerCase().includes(word)) {
          answer.push(item);
        }
      }
    }
    return answer;
  }
}
