const STORAGE_KEY = "todo-list-items";
const THEME_STORAGE_KEY = "todo-list-theme";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const remainingCount = document.querySelector("#remaining-count");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll("[data-filter]");
const colorSchemePreference = window.matchMedia("(prefers-color-scheme: dark)");
let currentFilter = "all";

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

function loadThemePreference() {
  try {
    const preference = localStorage.getItem(THEME_STORAGE_KEY);
    return preference === "light" || preference === "dark" ? preference : null;
  } catch (error) {
    console.error("\u7121\u6cd5\u8b80\u53D6\u4E3B\u984C\u504F\u597D\uff1a", error);
    return null;
  }
}

let themePreference = loadThemePreference();

function isDarkMode() {
  return themePreference ? themePreference === "dark" : colorSchemePreference.matches;
}

function updateThemeButton() {
  const darkMode = isDarkMode();
  themeToggle.textContent = darkMode
    ? "\u2600\uFE0F \u6DFA\u8272\u6A21\u5F0F"
    : "\u{1F319} \u6DF1\u8272\u6A21\u5F0F";
  themeToggle.setAttribute("aria-pressed", String(darkMode));
}

function applyThemePreference() {
  if (themePreference) {
    document.documentElement.dataset.theme = themePreference;
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  updateThemeButton();
}

themeToggle.addEventListener("click", () => {
  themePreference = isDarkMode() ? "light" : "dark";
  document.documentElement.dataset.theme = themePreference;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  } catch (error) {
    console.error("\u7121\u6cd5\u5132\u5B58\u4E3B\u984C\u504F\u597D\uff1a", error);
    alert("\u7121\u6cd5\u5132\u5B58\u4E3B\u984C\u504F\u597D\uff0c\u91CD\u65B0\u958B\u555F\u9801\u9762\u5F8C\u53EF\u80FD\u6703\u6062\u5FA9\u7CFB\u7D71\u8A2D\u5B9A\u3002");
  }

  updateThemeButton();
});

colorSchemePreference.addEventListener("change", () => {
  if (!themePreference) {
    updateThemeButton();
  }
});

applyThemePreference();

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

function renderTodos(filterNotice = null) {
  list.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") {
      return !todo.completed;
    }

    if (currentFilter === "completed") {
      return todo.completed;
    }

    return true;
  });

  for (const todo of visibleTodos) {
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

      const matchesCurrentFilter = currentFilter === "all"
        || (currentFilter === "active" && !todo.completed)
        || (currentFilter === "completed" && todo.completed);
      const filterNotice = matchesCurrentFilter
        ? null
        : `\u300C${todo.text}\u300D\u5DF2\u6A19\u8A18\u70BA${todo.completed ? "\u5DF2\u5B8C\u6210" : "\u672A\u5B8C\u6210"}\uFF0C\u56E0\u6B64\u5F9E\u300C${currentFilter === "completed" ? "\u5DF2\u5B8C\u6210" : "\u672A\u5B8C\u6210"}\u300D\u7BE9\u9078\u4E2D\u96B1\u85CF\uFF0C\u4E26\u672A\u522A\u9664\uFF1B\u5207\u63DB\u81F3\u300C\u5168\u90E8\u300D\u6216\u76F8\u95DC\u7BE9\u9078\u5373\u53EF\u67E5\u770B\u3002`;
      renderTodos(filterNotice);
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

  if (visibleTodos.length > 0 && !filterNotice) {
    emptyMessage.hidden = true;
  } else {
    const emptyMessages = {
      all: "\u9084\u6C92\u6709\u4EFB\u4F55\u5F85\u8FA6\u4E8B\u9805,\u65B0\u589E\u4E00\u500B\u5427!",
      active: "\u6C92\u6709\u672A\u5B8C\u6210\u7684\u5F85\u8FA6\u4E8B\u9805\u3002",
      completed: "\u6C92\u6709\u5DF2\u5B8C\u6210\u7684\u5F85\u8FA6\u4E8B\u9805\u3002",
    };
    emptyMessage.textContent = filterNotice || emptyMessages[currentFilter];
    emptyMessage.hidden = false;
  }
}

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    for (const filterButton of filterButtons) {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    }

    renderTodos();
  });
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
