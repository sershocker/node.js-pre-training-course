import { filterArray, mapArray, reduceArray } from "./array-helpers";
import { Todo, TodoStatus } from "./types";

export function toggleAll(state: Todo[], completed: boolean): Todo[] {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }
  return mapArray(state, (item) => ({
    ...item,
    status: completed ? TodoStatus.COMPLETED : TodoStatus.PENDING,
  }));
}

export function clearCompleted(state: Todo[]): Todo[] {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }

  return filterArray(state, (item) => item.status !== TodoStatus.COMPLETED);
}

export function countByStatus(state: Todo[], status: TodoStatus): number {
  if (state === null || state === undefined) {
    throw new TypeError("state cannot be null or unfedined");
  }

  return reduceArray(state, (acc, item) => acc + (item.status === status ? 1 : 0), 0);
}
