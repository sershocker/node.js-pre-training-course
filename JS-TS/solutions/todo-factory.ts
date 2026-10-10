import { Todo, NewTodo, TodoStatus } from "./types";

let nextId = 1;

export function createTodo(input: NewTodo): Todo {
  if (input === null || input === undefined) throw new TypeError("Input cannot be null or undefined");

  const validCheck: any = input;

  if (!("title" in validCheck)) {
    throw new Error("status must be identified");
  }

  if (validCheck.title === null || validCheck.title === undefined) throw new Error("title must be identified");
  //if (validCheck.status === null || validCheck.status === undefined) throw new Error("status must be identified");

  const result: Todo = {
    id: nextId,
    title: input.title,
    description: input.description,
    status: input.status ? input.status : TodoStatus.PENDING,
    createdAt: new Date(),
  };

  nextId++;
  return result;
}
