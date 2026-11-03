import React, { useState } from "react";
import { Todo } from "../../types";

/**
 * Task 4: CompleteToDoList Component
 *
 * Theory: State Updates and Immutability
 *
 * React state updates must be immutable. This means you cannot directly modify the existing state
 * object or array. Instead, you must create a new object/array with the updated values.
 *
 * Why Immutability Matters:
 * 1. React uses reference equality to determine if state has changed
 * 2. Direct mutations don't trigger re-renders
 * 3. It enables time-travel debugging and undo/redo features
 * 4. It makes state changes predictable and traceable
 *
 * Common State Update Patterns:
 *
 * For Arrays:
 * - Adding: [...array, newItem]
 * - Removing: array.filter(item => item.id !== id)
 * - Updating: array.map(item => item.id === id ? {...item, updated: true} : item)
 *
 * For Objects:
 * - Updating: {...object, newProperty: value}
 * - Nested updates: {...object, nested: {...object.nested, updated: true}}
 *
 * Event Handling with Parameters:
 * - Use arrow functions to pass parameters to event handlers
 * - Example: onClick={() => handleClick(id)}
 * - Or use bind: onClick={handleClick.bind(null, id)}
 *
 * Key Concepts:
 * - Always create new objects/arrays when updating state
 * - Use spread operator (...) for shallow copies
 * - Consider using libraries like Immer for complex updates
 * - Think about state structure before implementing
 */
export const CompleteToDoList: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  // TODO: Implement the CompleteToDoList component
  //
  // Requirements:
  // 1. Display a list of todos with add functionality
  // 2. Add a "Complete" button for each todo
  // 3. When clicked, mark the todo as completed
  // 4. Use immutable state updates
  // 5. Show completion status for each todo
  //
  // Example state structure:
  // const [todos, setTodos] = useState<Todo[]>([]);
  //
  // Example update function:
  // const markCompleted = (id: number) => {
  //   setTodos(todos.map(todo =>
  //     todo.id === id ? {...todo, completed: true} : todo
  //   ));
  // };

  const addClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    setTodos([...todos, { id: Date.now(), title: inputValue, completed: false }]);
    setInputValue("");
  };

  const completeClick = (id: number) => {
    setTodos(todos.map((obj) => (obj.id === id ? { ...obj, completed: !obj.completed } : obj)));
  };

  return (
    <div>
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
      {todos.length === 0 ? (
        <div>Array is empty</div>
      ) : (
        <ul style={{ listStyleType: '""' }}>
          {todos.map((todo) => (
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
