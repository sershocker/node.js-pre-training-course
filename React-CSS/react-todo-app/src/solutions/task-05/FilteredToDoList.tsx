import React, { useState } from "react";
import { Todo } from "../../types";
import { CompleteToDoList } from "../task-04/CompleteToDoList";

/**
 * Task 5: FilteredToDoList Component
 *
 * Theory: Derived State and Computed Values
 *
 * In React, you often need to compute values based on your state. These are called "derived state"
 * or "computed values" and should be calculated during render rather than stored in state.
 *
 * Why Use Derived State:
 * 1. Avoids state synchronization issues
 * 2. Reduces complexity by having a single source of truth
 * 3. Automatically updates when source data changes
 * 4. Prevents stale state bugs
 *
 * Common Derived State Patterns:
 *
 * Filtering:
 * - const activeTodos = todos.filter(todo => !todo.completed)
 * - const completedTodos = todos.filter(todo => todo.completed)
 *
 * Searching:
 * - const filteredTodos = todos.filter(todo =>
 *     todo.title.toLowerCase().includes(searchTerm.toLowerCase())
 *   )
 *
 * Sorting:
 * - const sortedTodos = [...todos].sort((a, b) => a.title.localeCompare(b.title))
 *
 * Aggregations:
 * - const completedCount = todos.filter(todo => todo.completed).length
 * - const totalCount = todos.length
 *
 * Multiple Filters:
 * - Use multiple filter conditions or combine them
 * - Consider using useMemo for expensive computations
 *
 * Key Concepts:
 * - Calculate derived values during render
 * - Don't store computed values in state
 * - Use useMemo for expensive calculations
 * - Keep state minimal and derive the rest
 */
export const FilteredToDoList: React.FC = () => {
  // TODO: Implement the FilteredToDoList component
  //
  // Requirements:
  // 1. Display a list of todos with add functionality
  // 2. Add filter buttons: "All", "Active", "Completed"
  // 3. Filter todos based on selected filter
  // 4. Use derived state for filtered results
  // 5. Add complete functionality for todos
  //
  // Example implementation:
  // const [todos, setTodos] = useState<Todo[]>([]);
  // const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  //
  // const filteredTodos = todos.filter(todo => {
  //   if (filter === 'active') return !todo.completed;
  //   if (filter === 'completed') return todo.completed;
  //   return true; // 'all' case
  // });
  const [inputValue, setInputValue] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const addClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    setTodos([...todos, { id: Date.now(), title: inputValue, completed: false }]);
    setInputValue("");
  };

  const completeClick = (id: number) => {
    setTodos(todos.map((obj) => (obj.id === id ? { ...obj, completed: !obj.completed } : obj)));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "end", alignItems: "start", gap: "2px" }}>
        <button
          onClick={() => {
            setFilter("all");
          }}
        >
          all
        </button>
        <button
          onClick={() => {
            setFilter("active");
          }}
        >
          active
        </button>
        <button
          onClick={() => {
            setFilter("completed");
          }}
        >
          completed
        </button>
      </div>
      <form onSubmit={addClick}>
        <input
          placeholder="add todo"
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        ></input>
        <button type="submit">add</button>
      </form>
      {filteredTodos.length === 0 ? (
        <div>Array is empty</div>
      ) : (
        <ul style={{ listStyleType: '""' }}>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <span style={{ color: todo.completed ? "green" : "red" }}>{todo.title}</span>
              {" - "}
              <button onClick={() => completeClick(todo.id)}>{todo.completed ? "completed" : "complete"}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
