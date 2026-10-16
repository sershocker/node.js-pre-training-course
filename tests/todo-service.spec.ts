import { TodoService } from "../JS-TS/solutions/todo-service";
import { TodoApi } from "../JS-TS/solutions/todo-api";
import { TodoStatus } from "../JS-TS/solutions/types";

describe("Task 09: Testing to-do-service with Jest", () => {
  let service: TodoService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new TodoService(new TodoApi());
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  //jest.setTimeout(10000);

  it("create should add new todo item with title and description", async () => {
    const createdPromise = service.create("My item", "Item with description");
    await jest.runAllTimersAsync();

    const created = await createdPromise;
    expect(created.title).toBe("My item");
    expect(created.description).toBe("Item with description");
  });

  it("toggleStatus should switch todo item from PENDING to COMPLETED", async () => {
    const createdPromiseObj = service.create("My item", "Item with description");
    await jest.runAllTimersAsync();

    const created = await createdPromiseObj;
    expect(created.status).toBe(TodoStatus.PENDING);

    const createdPromise = service.toggleStatus(created.id);
    await jest.runAllTimersAsync();
    const createdStatus = await createdPromise;
    expect(createdStatus.status).toBe(TodoStatus.COMPLETED);
  });

  it("toggleStatus should switch todo item from COMPLETED to PENDING", async () => {
    const createdPromiseObj = service.create("My item", "Item with description");
    await jest.runAllTimersAsync();

    const created = await createdPromiseObj;
    expect(created.status).toBe(TodoStatus.PENDING);

    const createdPromise = service.toggleStatus(created.id);
    await jest.runAllTimersAsync();
    await createdPromise;
    const createdPromise2 = service.toggleStatus(created.id);
    await jest.runAllTimersAsync();
    const createdStatus = await createdPromise2;
    expect(createdStatus.status).toBe(TodoStatus.PENDING);
  });

  it("toggleStatus should throw Error", async () => {
    const createdPromise = service.toggleStatus(10);
    jest.runAllTimersAsync();
    await expect(createdPromise).rejects.toThrow();
  });

  it("search should find todo item by keyword in description", async () => {
    service.create("My item", "My item with description");
    service.create("Your item");
    service.create("His item", "His item with description");
    const keyItemPromice = service.create("Her item", "Her item with special word");
    await jest.runAllTimersAsync();
    const keyItem = await keyItemPromice;

    const createdPromise = service.search("special");
    await jest.runAllTimersAsync();
    const created = await createdPromise;
    expect(created[0].title).toBe((await keyItem).title);
  });

  it("search should find todo item by keyword in title", async () => {
    service.create("My item", "My item with description");
    service.create("Your item");
    const keyItemPromice = service.create("His item", "His item with description");
    service.create("Her item", "Her item with special word");
    await jest.runAllTimersAsync();
    const keyItem = await keyItemPromice;

    const createdPromise = service.search("His");
    await jest.runAllTimersAsync();
    const created = await createdPromise;
    expect(created[0].title).toBe(keyItem.title);
  });
});
