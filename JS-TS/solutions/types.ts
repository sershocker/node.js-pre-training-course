interface Todo {
  id: number; //unique identifier
  title: string; //short title
  description?: string; //detailed text
  status: TodoStatus; //current status
  readonly createdAt: Date; // creation timestamp
}

type NewTodo = Omit<Todo, "id" | "createdAt">;

enum TodoStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export { Todo, TodoStatus, NewTodo };
