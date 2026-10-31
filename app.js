const STORAGE_KEY = "todo-list-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const remainingCount = document.querySelector("#remaining-count");

function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (savedTodos === null) {
    return [];
  }

  try {
    const todos = JSON.parse(savedTodos);
    return Array.isArray(todos) ? todos : [];
  } catch (error) {
    console.error("\u7121\u6cd5\u8b80\u53d6\u5df2\u5132\u5b58\u7684\u5f85\u8fa6\u4e8b\u9805\uff1a", error);
    return [];
  }
}

let todos = loadTodos();

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch (error) {
    console.error("\u7121\u6cd5\u5132\u5b58\u5f85\u8fa6\u4e8b\u9805\uff1a", error);
    alert("\u7121\u6cd5\u5132\u5b58\u5f85\u8fa6\u4e8b\u9805\uff0c\u8acb\u78ba\u8a8d\u700f\u89bd\u5668\u5141\u8a31\u4f7f\u7528\u672c\u6a5f\u5132\u5b58\u7a7a\u9593\u3002");
    return false;
  }
}

function renderTodos() {
  list.replaceChildren();

  for (const todo of todos) {
    const item = document.createElement("li");
    item.className = "todo-item";
    if (todo.completed) {
      item.classList.add("is-completed");
    }

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `\u6a19\u8a18\u300c${todo.text}\u300d\u70ba${todo.completed ? "\u672a\u5b8c\u6210" : "\u5df2\u5b8c\u6210"}`);
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "\u522a\u9664";
    deleteButton.setAttribute("aria-label", `\u522a\u9664\u300c${todo.text}\u300d`);
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `\u672a\u5b8c\u6210:${remaining} \u9805`;
  emptyMessage.hidden = todos.length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  todos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
    completed: false,
  });
  saveTodos();
  renderTodos();
  input.value = "";
  input.focus();
});

renderTodos();
