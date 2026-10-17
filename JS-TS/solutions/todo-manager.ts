import { TodoService } from "./todo-service";
import { TodoApi } from "./todo-api";
import { Todo } from "./types";

export class ToDoManager {
  private service = new TodoService(new TodoApi());

  async init(): Promise<void> {
    await this.service.create("Check engine");
    await this.service.create("Wash the car", "Wash the car outside and inside");
    await this.service.create("Fuel the tank", "Fuel 15 liters");
  }

  async add(title: string, description = ""): Promise<void> {
    await this.service.create(title, description);
  }

  async complete(id: number): Promise<void> {
    await this.service.toggleStatus(id);
  }

  async list(): Promise<Todo[]> {
    return await this.service.search("");
  }
}
