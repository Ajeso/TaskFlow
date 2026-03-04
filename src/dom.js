import "./styles.css";
import { Todo, TodoApp } from "./index.js";
import { isToday, isFuture, format, parseISO } from "date-fns";

const app = new TodoApp();
let activeProject = app.projects[0];
let activeFilter = "all";

const addTodoBtn = document.querySelector(".btn-add");
const dialog = document.querySelector("dialog");
const saveBtn = document.getElementById("saveTodo");
const closeBtn = document.getElementById("closeDialog");
const cancelBtn = document.getElementById("cancelDialog");
const errorMsg = document.getElementById("titleError");
const addProjectBtn = document.querySelector(".sidebar-add-project");
const projectList = document.getElementById("projectList");
const filterChips = document.querySelectorAll(".filter-chip");
const viewAll = document.getElementById("viewAll");
const viewToday = document.getElementById("viewToday");
const viewUpcoming = document.getElementById("viewUpcoming");

function renderSideBar() {
  projectList.innerHTML = "";

  for (const project of app.projects) {
    const projectItem = document.createElement("div");
    projectItem.classList.add("sidebar-item");
    projectItem.textContent = project.name;

    if (project === activeProject) {
      projectItem.classList.add("active");
    }

    projectItem.addEventListener("click", () => {
      const allItems = document.querySelectorAll("#projectList .sidebar-item");
      for (const item of allItems) {
        item.classList.remove("active");
      }

      projectItem.classList.add("active");

      activeProject = project;
      activeFilter = "all";

      for (const chip of filterChips) {
        chip.classList.remove("active");
      }
      filterChips[0].classList.add("active");

      renderTodos();
    });

    projectList.appendChild(projectItem);
  }
}

function renderTodos() {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  let todosToShow = [];

  if (activeFilter === "all") {
    todosToShow = activeProject.todos;
  } else if (activeFilter === "active") {
    for (const todo of activeProject.todos) {
      if (todo.complete === false) {
        todosToShow.push(todo);
      }
    }
  } else if (activeFilter === "completed") {
    for (const todo of activeProject.todos) {
      if (todo.complete === true) {
        todosToShow.push(todo);
      }
    }
  } else if (activeFilter === "today") {
    for (const todo of activeProject.todos) {
      if (todo.dueDate && isToday(parseISO(todo.dueDate))) {
        todosToShow.push(todo);
      }
    }
  } else if (activeFilter === "high") {
    for (const todo of activeProject.todos) {
      if (todo.priority === "high") {
        todosToShow.push(todo);
      }
    }
  }

  if (todosToShow.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No todos here!";
    empty.style.color = "#78716c";
    empty.style.padding = "20px 0";
    todoList.appendChild(empty);
    return;
  }

  for (const todo of todosToShow) {
    const card = buildTodoCard(todo);
    todoList.appendChild(card);
  }
}

function buildTodoCard(todo) {
  const todoCard = document.createElement("div");
  todoCard.classList.add("todo-card");

  if (todo.complete === true) {
    todoCard.classList.add("completed");
  }

  let formattedDate = "No date";
  if (todo.dueDate) {
    formattedDate = format(parseISO(todo.dueDate), "MMM d, yyyy");
  }

  todoCard.innerHTML = `
    <div class="priority-bar p-${todo.priority}"></div>
    <div class="todo-checkbox ${todo.complete ? "checked" : ""}"></div>
    <div class="todo-content">
      <div class="todo-title" style="${todo.complete ? "text-decoration:line-through" : ""}">${todo.title}</div>
      <div class="todo-desc">${todo.description || ""}</div>
      <div class="todo-meta">
        <span class="meta-tag">📅 ${formattedDate}</span>
        <span class="priority-badge badge-${todo.priority}">${todo.priority}</span>
      </div>
    </div>
    <div class="todo-actions">
      <div class="action-btn edit">✏️</div>
      <div class="action-btn delete">🗑</div>
    </div>
  `;

  const checkbox = todoCard.querySelector(".todo-checkbox");
  checkbox.addEventListener("click", () => {
    app.toggleComplete(todo.id);
    app.saveToStorage();
    renderTodos();
  });

  const deleteBtn = todoCard.querySelector(".delete");
  deleteBtn.addEventListener("click", () => {
    const result = app.getTodoById(todo.id);
    if (result) {
      result.project.removeTodo(todo.id);
      app.saveToStorage();
      renderTodos();
    }
  });

  const editBtn = todoCard.querySelector(".edit");
  editBtn.addEventListener("click", () => {
    document.getElementById("todoTitle").value = todo.title;
    document.getElementById("todoDescription").value = todo.description || "";
    document.getElementById("todoDueDate").value = todo.dueDate || "";
    document.getElementById("todoPriority").value = todo.priority;
    document.getElementById("todoNotes").value = todo.notes || "";
    errorMsg.classList.remove("visible");
    dialog.showModal();

    saveBtn.onclick = () => {
      const updatedTitle = document.getElementById("todoTitle").value;

      if (updatedTitle.trim() === "") {
        errorMsg.classList.add("visible");
        return;
      }

      errorMsg.classList.remove("visible");

      app.editTodo(todo.id, {
        title: updatedTitle,
        description: document.getElementById("todoDescription").value,
        dueDate: document.getElementById("todoDueDate").value,
        priority: document.getElementById("todoPriority").value,
        notes: document.getElementById("todoNotes").value,
      });

      app.saveToStorage();
      dialog.close();
      renderTodos();
    };
  });

  return todoCard;
}

viewAll.addEventListener("click", () => {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  let allTodos = [];
  for (const project of app.projects) {
    for (const todo of project.todos) {
      allTodos.push(todo);
    }
  }

  if (allTodos.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No todos here!";
    empty.style.color = "#78716c";
    empty.style.padding = "20px 0";
    todoList.appendChild(empty);
    return;
  }

  for (const todo of allTodos) {
    todoList.appendChild(buildTodoCard(todo));
  }
});

viewToday.addEventListener("click", () => {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  let todayTodos = [];
  for (const project of app.projects) {
    for (const todo of project.todos) {
      if (todo.dueDate && isToday(parseISO(todo.dueDate))) {
        todayTodos.push(todo);
      }
    }
  }

  if (todayTodos.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No todos due today!";
    empty.style.color = "#78716c";
    empty.style.padding = "20px 0";
    todoList.appendChild(empty);
    return;
  }

  for (const todo of todayTodos) {
    todoList.appendChild(buildTodoCard(todo));
  }
});

viewUpcoming.addEventListener("click", () => {
  const todoList = document.querySelector(".todo-list");
  todoList.innerHTML = "";

  let upcomingTodos = [];
  for (const project of app.projects) {
    for (const todo of project.todos) {
      if (todo.dueDate && isFuture(parseISO(todo.dueDate))) {
        upcomingTodos.push(todo);
      }
    }
  }

  if (upcomingTodos.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No upcoming todos!";
    empty.style.color = "#78716c";
    empty.style.padding = "20px 0";
    todoList.appendChild(empty);
    return;
  }

  for (const todo of upcomingTodos) {
    todoList.appendChild(buildTodoCard(todo));
  }
});

for (const chip of filterChips) {
  chip.addEventListener("click", () => {
    // remove active style from all chips
    for (const c of filterChips) {
      c.classList.remove("active");
    }

    chip.classList.add("active");

    const text = chip.textContent.trim();

    if (text === "All") {
      activeFilter = "all";
    } else if (text === "Active") {
      activeFilter = "active";
    } else if (text === "Completed") {
      activeFilter = "completed";
    } else if (text.includes("High Priority")) {
      activeFilter = "high";
    }

    renderTodos();
  });
}

addTodoBtn.addEventListener("click", () => {
  document.getElementById("todoTitle").value = "";
  document.getElementById("todoDescription").value = "";
  document.getElementById("todoDueDate").value = "";
  document.getElementById("todoNotes").value = "";
  errorMsg.classList.remove("visible");
  saveBtn.onclick = null;
  dialog.showModal();
});

saveBtn.addEventListener("click", () => {
  if (saveBtn.onclick) return;

  const title = document.getElementById("todoTitle").value;

  if (title.trim() === "") {
    errorMsg.classList.add("visible");
    return;
  }

  errorMsg.classList.remove("visible");

  const description = document.getElementById("todoDescription").value;
  const dueDate = document.getElementById("todoDueDate").value;
  const priority = document.getElementById("todoPriority").value;
  const notes = document.getElementById("todoNotes").value;

  const todo = new Todo(title, description, dueDate, priority, notes);
  activeProject.addTodo(todo);
  app.saveToStorage();
  dialog.close();
  renderTodos();
});

closeBtn.addEventListener("click", () => dialog.close());
cancelBtn.addEventListener("click", () => dialog.close());

addProjectBtn.addEventListener("click", () => {
  const name = prompt("Enter a project name:");

  if (name && name.trim() !== "") {
    const newProject = app.addProject(name.trim());
    app.saveToStorage();
    activeProject = newProject;
    renderSideBar();
    renderTodos();
  }
});

function init() {
  renderSideBar();
  renderTodos();
}

init();
