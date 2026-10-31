const STORAGE_KEY = "todo-list-items";
const THEME_STORAGE_KEY = "todo-list-theme";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyMessage = document.querySelector("#empty-message");
const remainingCount = document.querySelector("#remaining-count");
const clearCompletedButton = document.querySelector("#clear-completed-button");
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
    console.error("無法讀取已儲存的待辦事項：", error);
    return [];
  }
}

let todos = loadTodos();

function loadThemePreference() {
  try {
    const preference = localStorage.getItem(THEME_STORAGE_KEY);
    return preference === "light" || preference === "dark" ? preference : null;
  } catch (error) {
    console.error("無法讀取主題偏好：", error);
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
    ? "☀️ 淺色模式"
    : "🌙 深色模式";
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
    console.error("無法儲存主題偏好：", error);
    alert("無法儲存主題偏好，重新開啟頁面後可能會恢復系統設定。");
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
    console.error("無法儲存待辦事項：", error);
    alert("無法儲存待辦事項，請確認瀏覽器允許使用本機儲存空間。");
    return false;
  }
}

function getFilterLabel(filterName) {
  if (filterName === "active") {
    return "未完成";
  }

  if (filterName === "completed") {
    return "已完成";
  }

  return "全部";
}

function renderTodos(filterNotice = null) {
  list.replaceChildren();

  clearCompletedButton.disabled = !todos.some((todo) => todo.completed);

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
    checkbox.setAttribute("aria-label", `標記「${todo.text}」為${todo.completed ? "未完成" : "已完成"}`);
    checkbox.addEventListener("change", () => {
      const nextCompleted = checkbox.checked;
      todo.completed = nextCompleted;
      saveTodos();

      const matchesCurrentFilter = currentFilter === "all"
        || (currentFilter === "active" && !nextCompleted)
        || (currentFilter === "completed" && nextCompleted);

      if (matchesCurrentFilter) {
        renderTodos();
        return;
      }

      const currentFilterLabel = getFilterLabel(currentFilter);
      const nextFilterLabel = nextCompleted ? "已完成" : "未完成";
      const nextFilterNotice = `「${todo.text}」已標記為${nextFilterLabel}，因此從「${currentFilterLabel}」篩選中隱藏，並未刪除；切換至「全部」或相關篩選即可查看。`;
      renderTodos(nextFilterNotice);
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除「${todo.text}」`);
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((itemTodo) => itemTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    list.append(item);
  }

  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成:${remaining} 項`;

  if (filterNotice) {
    emptyMessage.textContent = filterNotice;
    emptyMessage.hidden = false;
    return;
  }

  if (visibleTodos.length > 0) {
    emptyMessage.hidden = true;
    return;
  }

  const emptyMessages = {
    all: "還沒有任何待辦事項，新增一個吧!",
    active: "沒有未完成的待辦事項。",
    completed: "沒有已完成的待辦事項。",
  };

  emptyMessage.textContent = emptyMessages[currentFilter];
  emptyMessage.hidden = false;
}

clearCompletedButton.addEventListener("click", () => {
  const completedTodosExist = todos.some((todo) => todo.completed);

  if (!completedTodosExist || !window.confirm("確定要清除所有已完成的待辦事項嗎？此操作無法復原。")) {
    return;
  }

  const previousTodos = todos;
  todos = todos.filter((todo) => !todo.completed);

  if (!saveTodos()) {
    todos = previousTodos;
    return;
  }

  renderTodos();
});

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
