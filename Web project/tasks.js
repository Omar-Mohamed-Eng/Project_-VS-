// js/tasks.js

async function loadTasks() {
  try {
    const tasks = await apiGet("/api/tasks");

    const container = document.getElementById("tasks-container");
    container.innerHTML = ""; // فضّي القديم

    tasks.forEach((task) => {
      const div = document.createElement("div");
      div.className = "task-card";
      div.innerHTML = `
        <h3>${task.title}</h3>
        <p>Status: ${task.status}</p>
        <p>Priority: ${task.priority}</p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    alert("Error loading tasks");
  }
}

document.addEventListener("DOMContentLoaded", loadTasks);
