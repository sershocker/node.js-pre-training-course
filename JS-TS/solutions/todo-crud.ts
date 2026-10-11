import { filterArray, mapArray, reduceArray } from "./array-helpers";
import { Todo } from "./types";

export function addTodo(state: Todo[], todo: Todo): Todo[] {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }
  if (todo === null || todo === undefined) {
    throw new TypeError("todo cannot be null or undefined");
  }

  for (const item of state) {
    if (item.id === todo.id) {
      throw new Error(`item with id = ${todo.id} is already exists`);
    }
  }

  return [...state, todo];
}

export function updateTodo(state: Todo[], id: number, update: Partial<Omit<Todo, "id" | "createdAt">>): Todo[] {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }
  const idCheck = state.some((item) => item.id === id);
  if (!idCheck) throw new Error(`state with id=${id} not found`);
  if (update === null || update === undefined) {
    throw new TypeError("update cannot be null or unfedined");
  }

  return mapArray(state, (item) => (item.id === id ? { ...item, ...update } : item));
}

export function removeTodo(state: Todo[], id: number): Todo[] {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }
  const idCheck = state.some((item) => item.id === id);
  if (!idCheck) throw new Error(`state with id=${id} not found`);

  return filterArray(state, (item) => item.id !== id);
}

export function getTodo(state: Todo[], id: number): Todo | undefined {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }

  for (const item of state) {
    if (item.id === id) {
      return item;
    }
  }

  return undefined;
}
