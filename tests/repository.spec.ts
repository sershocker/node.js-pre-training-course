import { InMemoryRepository } from "../JS-TS/solutions/repository";
import { createTodo } from "../JS-TS/solutions/todo-factory";
import { Todo } from "../JS-TS/solutions/types";

describe("Task 09: Testing repository with Jest", () => {
  let arrayTodo = new InMemoryRepository<Todo>();
  beforeEach(() => {
    arrayTodo = new InMemoryRepository();
  });
  it("add should put new item into array and find it by id", () => {
    const elem = arrayTodo.add(createTodo({ title: "First task", description: "Wash dishes" }));
    const elem2 = arrayTodo.add(createTodo({ title: "Second task", description: "Dry dishes" }));
    const elem3 = arrayTodo.add(createTodo({ title: "Third task", description: "Break dishes" }));
    expect(arrayTodo.findById(elem.id)?.title).toBe("First task");
  });

  it("add shouldn't put new item into array because the same id", () => {
    const elem = arrayTodo.add(createTodo({ title: "First task", description: "Wash dishes" }));
    const elem2 = arrayTodo.add(createTodo({ title: "Second task", description: "Dry dishes" }));

    expect(() => arrayTodo.add(elem)).toThrow();
  });

  it("update should update item by id", () => {
    const elem = arrayTodo.add(createTodo({ title: "First task", description: "Wash dishes" }));
    const elem2 = arrayTodo.add(createTodo({ title: "Second task", description: "Dry dishes" }));
    const elem3 = arrayTodo.add(createTodo({ title: "Third task", description: "Break dishes" }));
    expect(arrayTodo.update(elem2.id, { title: "Final task" })?.title).toBe("Final task");
    expect(arrayTodo.findById(elem2.id)?.title).toBe("Final task");
  });

  it("remove should remove item by id", () => {
    const elem = arrayTodo.add(createTodo({ title: "First task", description: "Wash dishes" }));
    const elem2 = arrayTodo.add(createTodo({ title: "Second task", description: "Dry dishes" }));
    const elem3 = arrayTodo.add(createTodo({ title: "Third task", description: "Break dishes" }));
    const sizeArray = arrayTodo.findAll().length;
    arrayTodo.remove(elem2.id);
    expect(arrayTodo.findAll().length).toBe(sizeArray - 1);
  });

  it("findById should return undefined", () => {
    const elem = arrayTodo.add(createTodo({ title: "First task", description: "Wash dishes" }));
    const elem2 = arrayTodo.add(createTodo({ title: "Second task", description: "Dry dishes" }));
    const elem3 = arrayTodo.add(createTodo({ title: "Third task", description: "Break dishes" }));
    expect(arrayTodo.findById(-1)).toBe(undefined);
  });
});
