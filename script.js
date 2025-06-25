let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let dragSourceIndex = null;

function applyTheme() {
  const isDark = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark", isDark);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "light" : "dark");
  applyTheme();
}

applyTheme();

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const textInput = document.getElementById("taskText");
  const timeInput = document.getElementById("taskTime");
  const text = textInput.value.trim();
  const time = timeInput.value;

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    time,
    done: false
  });

  textInput.value = "";
  timeInput.value = "";
  saveTasks();
  renderTasks();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  task.done = !task.done;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const newText = prompt("Editar tarefa:");
  if (newText !== null && newText.trim() !== "") {
    const task = tasks.find(t => t.id === id);
    task.text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

function filterTasks(type) {
  currentFilter = type;
  document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filters button[onclick="filterTasks('${type}')"]`).classList.add('active');
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  const search = document.getElementById("searchInput").value.toLowerCase();
  list.innerHTML = "";

  let filtered = tasks;
  if (currentFilter === "pending") filtered = tasks.filter(t => !t.done);
  else if (currentFilter === "done") filtered = tasks.filter(t => t.done);

  if (search) {
    filtered = filtered.filter(t => t.text.toLowerCase().includes(search));
  }

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.done ? "completed" : ""}`;
    li.setAttribute("draggable", true);

    li.addEventListener("dragstart", () => dragSourceIndex = index);
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", () => {
      if (dragSourceIndex !== null) {
        const draggedTask = filtered[dragSourceIndex];
        const targetTask = task;

        const realSourceIndex = tasks.findIndex(t => t.id === draggedTask.id);
        const realTargetIndex = tasks.findIndex(t => t.id === targetTask.id);

        tasks.splice(realSourceIndex, 1);
        tasks.splice(realTargetIndex, 0, draggedTask);

        saveTasks();
        renderTasks();
      }
    });

    li.innerHTML = `
      <input type="checkbox" onchange="toggleDone(${task.id})" ${task.done ? "checked" : ""}>
      <div class="task-info">
        <span class="task-text">${task.text}</span>
        ${task.time ? `<span class="hora">🕒 ${task.time}</span>` : ""}
      </div>
      <span class="actions">
        <span class="edit" onclick="editTask(${task.id})">✏</span>
        <span onclick="deleteTask(${task.id})">🗑</span>
      </span>
    `;

    list.appendChild(li);
  });
}

renderTasks();
