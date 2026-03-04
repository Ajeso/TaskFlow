class Todo {
  constructor(title, description, dueDate, priority, notes) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.notes = notes;
    this.id = crypto.randomUUID();
    this.complete = false;
  }
}

class Project {
  constructor(name) {
    this.name = name;
    this.id = crypto.randomUUID();
    this.todos = [];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  removeTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }
}

class TodoApp {
  constructor() {
    this.projects = [];
    this.loadFromStorage();
    if (this.projects.length === 0) {
      this.addProject("Inbox");
    }
  }

  addProject(name) {
    const newProject = new Project(name);
    this.projects.push(newProject);
    return newProject;
  }

  removeProject(id) {
    this.projects = this.projects.filter((project) => project.id !== id);
  }

  getTodoById(id) {
    for (const project of this.projects) {
      const todo = project.todos.find((t) => t.id === id);
      if (todo) return { project, todo };
    }
    return null;
  }

  toggleComplete(id) {
    const result = this.getTodoById(id);
    if (result) result.todo.complete = !result.todo.complete;
  }

  editTodo(id, updates) {
    const result = this.getTodoById(id);
    if (!result) return null;

    const { todo } = result;
    if (updates.title !== undefined) todo.title = updates.title;
    if (updates.description !== undefined)
      todo.description = updates.description;
    if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate;
    if (updates.priority !== undefined) todo.priority = updates.priority;
    if (updates.notes !== undefined) todo.notes = updates.notes;

    return todo;
  }

  saveToStorage() {
    localStorage.setItem("taskflow-data", JSON.stringify(this.projects));
  }

  loadFromStorage() {
    const data = localStorage.getItem("taskflow-data");
    if (!data) return;

    this.projects = JSON.parse(data).map((projectData) => {
      const project = new Project(projectData.name);
      project.id = projectData.id;
      project.todos = projectData.todos.map((todoData) => {
        const todo = new Todo(
          todoData.title,
          todoData.description,
          todoData.dueDate,
          todoData.priority,
          todoData.notes,
        );
        todo.id = todoData.id;
        todo.complete = todoData.complete;
        return todo;
      });
      return project;
    });
  }
}

export { Todo, Project, TodoApp };
